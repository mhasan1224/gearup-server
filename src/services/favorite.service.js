
import mongoose from "mongoose";

import Favorite from "../models/favorite.model.js";
import Equipment from "../models/equipment.model.js";

const getCustomerId = async (userEmail) => {
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

  return user._id;
};

const getMyFavorites = async (userEmail) => {
  const customerId = await getCustomerId(userEmail);

  const favorites = await Favorite.find({
    customer: customerId,
  })
    .populate({
      path: "equipment",
      match: { status: "approved" },
      select:
        "name image category location rentalPrice rentalType availableQuantity condition",
    })
    .sort({ createdAt: -1 })
    .lean();

  const availableFavorites = favorites.filter(
    (favorite) => favorite.equipment !== null,
  );

  return {
    data: availableFavorites,
    total: availableFavorites.length,
  };
};

const addFavorite = async (userEmail, equipmentId) => {
  if (!mongoose.isValidObjectId(equipmentId)) {
    const error = new Error("Invalid equipment ID.");
    error.statusCode = 400;
    throw error;
  }

  const customerId = await getCustomerId(userEmail);

  const equipment = await Equipment.findOne({
    _id: equipmentId,
    status: "approved",
  }).select("_id");

  if (!equipment) {
    const error = new Error("Approved equipment not found.");
    error.statusCode = 404;
    throw error;
  }

  const existingFavorite = await Favorite.findOne({
    customer: customerId,
    equipment: equipment._id,
  });

  if (existingFavorite) {
    const error = new Error("Equipment is already in your favorites.");
    error.statusCode = 409;
    throw error;
  }

  const favorite = await Favorite.create({
    customer: customerId,
    equipment: equipment._id,
  });

  return favorite;
};

const removeFavorite = async (userEmail, equipmentId) => {
  if (!mongoose.isValidObjectId(equipmentId)) {
    const error = new Error("Invalid equipment ID.");
    error.statusCode = 400;
    throw error;
  }

  const customerId = await getCustomerId(userEmail);

  const result = await Favorite.deleteOne({
    customer: customerId,
    equipment: equipmentId,
  });

  if (result.deletedCount === 0) {
    const error = new Error("Favorite equipment not found.");
    error.statusCode = 404;
    throw error;
  }

  return { deleted: true };
};

export {
  getMyFavorites,
  addFavorite,
  removeFavorite,
};
