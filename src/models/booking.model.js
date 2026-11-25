
import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Customer is required."],
    },

    equipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Equipment",
      required: [true, "Equipment is required."],
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Equipment owner is required."],
    },

    startDate: {
      type: Date,
      required: [true, "Rental start date is required."],
    },

    endDate: {
      type: Date,
      required: [true, "Rental end date is required."],
      validate: {
        validator(value) {
          return !this.startDate || value > this.startDate;
        },
        message: "Rental end date must be after the start date.",
      },
    },

    quantity: {
      type: Number,
      required: [true, "Rental quantity is required."],
      min: [1, "Rental quantity must be at least 1."],
      validate: {
        validator: Number.isInteger,
        message: "Rental quantity must be a whole number.",
      },
    },

    phone: {
      type: String,
      required: [true, "Phone number is required."],
      trim: true,
    },

    deliveryAddress: {
      type: String,
      required: [true, "Delivery address is required."],
      trim: true,
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },

    rentalPrice: {
      type: Number,
      required: [true, "Rental price is required."],
      min: [0, "Rental price cannot be negative."],
    },

    rentalType: {
      type: String,
      required: true,
      enum: ["daily", "weekly", "monthly"],
    },

    totalAmount: {
      type: Number,
      required: [true, "Total amount is required."],
      min: [0, "Total amount cannot be negative."],
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "active", "completed", "cancelled"],
      default: "pending",
    },

    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "failed", "refunded"],
      default: "unpaid",
    },

    stripeCheckoutSessionId: {
      type: String,
    },

    stripePaymentIntentId: {
      type: String,
    },

    paidAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

bookingSchema.index({ customer: 1, createdAt: -1 });
bookingSchema.index({ owner: 1, createdAt: -1 });
bookingSchema.index({ equipment: 1, startDate: 1, endDate: 1 });
bookingSchema.index({ stripeCheckoutSessionId: 1 }, { unique: true, sparse: true });
bookingSchema.index({ stripePaymentIntentId: 1 }, { unique: true, sparse: true });

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
