
import mongoose from "mongoose";

const equipmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Equipment name is required."],
      trim: true,
      maxlength: [120, "Equipment name cannot exceed 120 characters."],
    },

    description: {
      type: String,
      required: [true, "Equipment description is required."],
      trim: true,
    },

    category: {
      type: String,
      required: [true, "Equipment category is required."],
      enum: [
        "construction",
        "photography",
        "vehicles",
        "agriculture",
        "electronics",
        "events",
      ],
    },

    location: {
      type: String,
      required: [true, "Equipment location is required."],
      trim: true,
    },

    rentalPrice: {
      type: Number,
      required: [true, "Rental price is required."],
      min: [0, "Rental price cannot be negative."],
    },

    rentalType: {
      type: String,
      required: [true, "Rental type is required."],
      enum: ["daily", "weekly", "monthly"],
    },

    availableQuantity: {
      type: Number,
      required: [true, "Available quantity is required."],
      min: [0, "Available quantity cannot be negative."],
      validate: {
        validator: Number.isInteger,
        message: "Available quantity must be a whole number.",
      },
    },

    image: {
      type: String,
      required: [true, "Equipment image is required."],
      trim: true,
    },

    condition: {
      type: String,
      required: [true, "Equipment condition is required."],
      trim: true,
    },

    brand: {
      type: String,
      trim: true,
      default: "",
    },

    model: {
      type: String,
      trim: true,
      default: "",
    },

    terms: {
      type: String,
      required: [true, "Rental terms are required."],
      trim: true,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Equipment owner is required."],
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Search and filtering indexes
equipmentSchema.index({
  name: "text",
  description: "text",
});

equipmentSchema.index({
  category: 1,
  status: 1,
  location: 1,
});

equipmentSchema.index({
  rentalPrice: 1,
  rentalType: 1,
});

const Equipment = mongoose.model("Equipment", equipmentSchema);

export default Equipment;
