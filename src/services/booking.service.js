import mongoose from "mongoose";

import Booking from "../models/booking.model.js";
import Equipment from "../models/equipment.model.js";
import getStripeClient from "../config/stripe.js";
import "../models/user.model.js";

const getMyRentals = async (userEmail, query = {}) => {
  if (!userEmail) {
    const error = new Error("Authenticated user email is required.");
    error.statusCode = 401;
    throw error;
  }

  const usersCollection = mongoose.connection.db.collection("user");

  const user = await usersCollection.findOne(
    { email: userEmail },
    { projection: { _id: 1 } },
  );

  if (!user) {
    const error = new Error("User account not found.");
    error.statusCode = 404;
    throw error;
  }

  const filter = {
    customer: user._id,
  };

  if (query.status) {
    const allowedStatuses = [
      "pending",
      "confirmed",
      "active",
      "completed",
      "cancelled",
    ];

    if (!allowedStatuses.includes(query.status)) {
      const error = new Error("Invalid booking status filter.");
      error.statusCode = 400;
      throw error;
    }

    filter.status = query.status;
  }

  const bookings = await Booking.find(filter)
    .populate("equipment", "name image category location rentalType")
    .sort({ createdAt: -1 })
    .lean();

  return {
    data: bookings,
    total: bookings.length,
  };
};

const getOwnerRentals = async (userEmail, query = {}) => {
  if (!userEmail) {
    const error = new Error("Authenticated user email is required.");
    error.statusCode = 401;
    throw error;
  }

  const usersCollection = mongoose.connection.db.collection("user");

  const user = await usersCollection.findOne(
    { email: userEmail },
    { projection: { _id: 1 } },
  );

  if (!user) {
    const error = new Error("User account not found.");
    error.statusCode = 404;
    throw error;
  }

  const filter = {
    owner: user._id,
  };

  if (query.status) {
    const allowedStatuses = [
      "pending",
      "confirmed",
      "active",
      "completed",
      "cancelled",
    ];

    if (!allowedStatuses.includes(query.status)) {
      const error = new Error("Invalid booking status filter.");
      error.statusCode = 400;
      throw error;
    }

    filter.status = query.status;
  }

  const bookings = await Booking.find(filter)
    .populate("customer", "name email image phone")
    .populate(
      "equipment",
      "name image category location rentalPrice rentalType",
    )
    .sort({ createdAt: -1 })
    .lean();

  return {
    data: bookings,
    total: bookings.length,
  };
};


const completeOwnerRental = async (userEmail, bookingId) => {
  if (!userEmail) {
    const error = new Error("Authenticated user email is required.");
    error.statusCode = 401;
    throw error;
  }

  if (!mongoose.isValidObjectId(bookingId)) {
    const error = new Error("Invalid booking ID.");
    error.statusCode = 400;
    throw error;
  }

  const usersCollection = mongoose.connection.db.collection("user");

  const owner = await usersCollection.findOne(
    { email: userEmail },
    { projection: { _id: 1 } },
  );

  if (!owner) {
    const error = new Error("Owner account not found.");
    error.statusCode = 404;
    throw error;
  }

  const booking = await Booking.findOne({
    _id: bookingId,
    owner: owner._id,
  });

  if (!booking) {
    const error = new Error("Rental booking not found.");
    error.statusCode = 404;
    throw error;
  }

  if (booking.paymentStatus !== "paid") {
    const error = new Error("Only paid bookings can be completed.");
    error.statusCode = 400;
    throw error;
  }

  if (!["confirmed", "active"].includes(booking.status)) {
    const error = new Error(
      "Only confirmed or active bookings can be completed.",
    );
    error.statusCode = 400;
    throw error;
  }

  if (new Date(booking.endDate) > new Date()) {
    const error = new Error(
      "This rental cannot be completed before its end date.",
    );
    error.statusCode = 400;
    throw error;
  }

  booking.status = "completed";
  await booking.save();

  return booking;
};


const createBooking = async (userEmail, payload) => {
  if (!userEmail) {
    const error = new Error("Authenticated user email is required.");
    error.statusCode = 401;
    throw error;
  }

  const {
    equipmentId,
    startDate,
    endDate,
    quantity,
    phone,
    deliveryAddress,
    notes,
  } = payload;

  if (!mongoose.isValidObjectId(equipmentId)) {
    const error = new Error("Invalid equipment ID.");
    error.statusCode = 400;
    throw error;
  }

  const usersCollection = mongoose.connection.db.collection("user");

  const customer = await usersCollection.findOne(
    { email: userEmail },
    { projection: { _id: 1 } },
  );

  if (!customer) {
    const error = new Error("Customer account not found.");
    error.statusCode = 404;
    throw error;
  }

  const equipment = await Equipment.findOne({
    _id: equipmentId,
    status: "approved",
  }).lean();

  if (!equipment) {
    const error = new Error("Equipment not found or not available.");
    error.statusCode = 404;
    throw error;
  }

  if (equipment.owner.toString() === customer._id.toString()) {
    const error = new Error("You cannot book your own equipment.");
    error.statusCode = 403;
    throw error;
  }

  const rentalStartDate = new Date(startDate);
  const rentalEndDate = new Date(endDate);

  if (
    Number.isNaN(rentalStartDate.getTime()) ||
    Number.isNaN(rentalEndDate.getTime()) ||
    rentalEndDate <= rentalStartDate
  ) {
    const error = new Error("Invalid rental date range.");
    error.statusCode = 400;
    throw error;
  }

  if (!Number.isInteger(quantity) || quantity < 1) {
    const error = new Error("Quantity must be a positive integer.");
    error.statusCode = 400;
    throw error;
  }

  const durationInDays = Math.ceil(
    (rentalEndDate.getTime() - rentalStartDate.getTime()) /
      (1000 * 60 * 60 * 24),
  );

  const overlappingBookings = await Booking.find({
    equipment: equipment._id,
    status: { $in: ["pending", "confirmed", "active"] },
    startDate: { $lt: rentalEndDate },
    endDate: { $gt: rentalStartDate },
  })
    .select("quantity")
    .lean();

  const reservedQuantity = overlappingBookings.reduce(
    (total, booking) => total + booking.quantity,
    0,
  );

  const remainingQuantity = equipment.availableQuantity - reservedQuantity;

  if (quantity > remainingQuantity) {
    const error = new Error(
      `Only ${Math.max(remainingQuantity, 0)} unit(s) available for the selected dates.`,
    );
    error.statusCode = 409;
    throw error;
  }

  let dailyRate = equipment.rentalPrice;

  if (equipment.rentalType === "weekly") {
    dailyRate = equipment.rentalPrice / 7;
  } else if (equipment.rentalType === "monthly") {
    dailyRate = equipment.rentalPrice / 30;
  }

  const totalAmount =
    Math.round(dailyRate * durationInDays * quantity * 100) / 100;

  const booking = await Booking.create({
    customer: customer._id,
    equipment: equipment._id,
    owner: equipment.owner,
    startDate: rentalStartDate,
    endDate: rentalEndDate,
    quantity,
    phone: phone.trim(),
    deliveryAddress: deliveryAddress.trim(),
    notes: notes?.trim() || "",
    rentalPrice: equipment.rentalPrice,
    rentalType: equipment.rentalType,
    totalAmount,
  });

  try {
    const stripe = getStripeClient();

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
      allowed_payment_method_types: ["card"],

      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: equipment.name,
              description: `Equipment rental for ${durationInDays} day(s).`,
            },
            unit_amount: Math.round(totalAmount * 100),
          },
          quantity: 1,
        },
      ],

      metadata: {
        bookingId: booking._id.toString(),
        customerId: customer._id.toString(),
        equipmentId: equipment._id.toString(),
      },

      success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/payment/cancel?booking_id=${booking._id}`,
    });

    booking.stripeCheckoutSessionId = checkoutSession.id;
    await booking.save();

    return {
      booking,
      checkoutUrl: checkoutSession.url,
    };
  } catch (error) {
    await Booking.findByIdAndUpdate(booking._id, {
      $set: {
        status: "cancelled",
      },
    });

    throw error;
  }
};

const getBookingPaymentStatus = async (userEmail, sessionId) => {
  if (!userEmail) {
    const error = new Error("Authenticated user email is required.");
    error.statusCode = 401;
    throw error;
  }

  if (!sessionId || typeof sessionId !== "string") {
    const error = new Error("Valid checkout session ID is required.");
    error.statusCode = 400;
    throw error;
  }

  const usersCollection = mongoose.connection.db.collection("user");

  const customer = await usersCollection.findOne(
    { email: userEmail },
    { projection: { _id: 1 } },
  );

  if (!customer) {
    const error = new Error("Customer account not found.");
    error.statusCode = 404;
    throw error;
  }

  const booking = await Booking.findOne({
    customer: customer._id,
    stripeCheckoutSessionId: sessionId,
  })
    .select("status paymentStatus totalAmount paidAt createdAt")
    .populate("equipment", "name image")
    .lean();

  if (!booking) {
    const error = new Error("Booking not found.");
    error.statusCode = 404;
    throw error;
  }

  return booking;
};

export {
  getMyRentals,
  getOwnerRentals,
  createBooking,
  getBookingPaymentStatus,
  completeOwnerRental,
};
