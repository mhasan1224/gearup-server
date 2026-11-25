
import getStripeClient from "../config/stripe.js";
import Booking from "../models/booking.model.js";

const stripeWebhookController = async (req, res) => {
  const signature = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return res.status(400).json({
      success: false,
      message: "Stripe webhook configuration is missing.",
    });
  }

  let event;

  try {
    const stripe = getStripeClient();

    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      webhookSecret,
    );
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: `Webhook signature verification failed: ${error.message}`,
    });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      if (session.payment_status === "paid") {
        const bookingId = session.metadata?.bookingId;

        if (bookingId) {
          await Booking.findOneAndUpdate(
            {
              _id: bookingId,
              stripeCheckoutSessionId: session.id,
              paymentStatus: "unpaid",
              status: "pending",
            },
            {
              $set: {
                paymentStatus: "paid",
                status: "confirmed",
                stripePaymentIntentId: session.payment_intent,
                paidAt: new Date(),
              },
            },
          );
        }
      }
    } else if (event.type === "checkout.session.expired") {
      const session = event.data.object;
      const bookingId = session.metadata?.bookingId;

      if (bookingId) {
        await Booking.findOneAndUpdate(
          {
            _id: bookingId,
            stripeCheckoutSessionId: session.id,
            paymentStatus: "unpaid",
            status: "pending",
          },
          {
            $set: {
              status: "cancelled",
            },
          },
        );
      }
    }

    return res.status(200).json({
      received: true,
    });
  } catch (error) {
    console.error("Stripe webhook processing failed:", error);

    return res.status(500).json({
      success: false,
      message: "Webhook processing failed.",
    });
  }
};

export default stripeWebhookController;
