
import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Customer is required."],
    },

    equipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Equipment",
      required: [true, "Equipment is required."],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

favoriteSchema.index(
  { customer: 1, equipment: 1 },
  { unique: true },
);

favoriteSchema.index({ customer: 1, createdAt: -1 });

const Favorite = mongoose.model("Favorite", favoriteSchema);

export default Favorite;
