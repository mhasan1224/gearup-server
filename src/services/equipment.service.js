import mongoose from "mongoose";

import Equipment from "../models/equipment.model.js";
import "../models/user.model.js";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getAllEquipment = async (query = {}) => {
  const {
    search,
    category,
    rentalType,
    minPrice,
    maxPrice,
    availableOnly,
    sortBy,
    limit = 12,
  } = query;

  const filter = {
    status: "approved",
  };

  if (search?.trim()) {
    const searchRegex = new RegExp(escapeRegex(search.trim()), "i");

    filter.$or = [{ name: searchRegex }, { location: searchRegex }];
  }

  if (category) {
    filter.category = category;
  }

  if (rentalType) {
    filter.rentalType = rentalType;
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.rentalPrice = {};

    if (minPrice !== undefined) {
      filter.rentalPrice.$gte = Number(minPrice);
    }

    if (maxPrice !== undefined) {
      filter.rentalPrice.$lte = Number(maxPrice);
    }
  }

  if (availableOnly === true || availableOnly === "true") {
    filter.availableQuantity = { $gt: 0 };
  }

  const sortOptions = {
    "price-asc": { rentalPrice: 1 },
    "price-desc": { rentalPrice: -1 },
    recent: { createdAt: -1 },
  };

  const sort = sortOptions[sortBy] || sortOptions.recent;

  const parsedLimit = Math.min(Math.max(Number(limit) || 12, 1), 50);

  const [equipment, total] = await Promise.all([
    Equipment.find(filter)
      .populate("owner", "name image")
      .sort(sort)
      .limit(parsedLimit)
      .lean(),

    Equipment.countDocuments(filter),
  ]);

  return {
    data: equipment,
    total,
  };
};

const getFeaturedEquipment = async (limit = 6) => {
  const parsedLimit = Math.min(Math.max(Number(limit) || 6, 1), 12);

  const equipment = await Equipment.find({
    status: "approved",
    availableQuantity: { $gt: 0 },
  })
    .populate("owner", "name image")
    .sort({ createdAt: -1 })
    .limit(parsedLimit)
    .lean();

  return {
    data: equipment,
    total: equipment.length,
  };
};

const getEquipmentById = async (id) => {
  if (!mongoose.isValidObjectId(id)) {
    const error = new Error("Invalid equipment ID.");
    error.statusCode = 400;
    throw error;
  }

  const equipment = await Equipment.findOne({
    _id: id,
    status: "approved",
  })
    .populate("owner", "name image")
    .lean();

  if (!equipment) {
    const error = new Error("Equipment not found.");
    error.statusCode = 404;
    throw error;
  }

  return equipment;
};

const createEquipment = async (userEmail, payload) => {
  if (!userEmail) {
    const error = new Error("Authenticated user email is required.");
    error.statusCode = 401;
    throw error;
  }

  const user = await mongoose.connection.db
    .collection("user")
    .findOne({ email: userEmail }, { projection: { _id: 1, role: 1 } });

  if (!user) {
    const error = new Error("User account not found.");
    error.statusCode = 404;
    throw error;
  }

  if (user.role !== "owner") {
    const error = new Error("Only equipment owners can list equipment.");
    error.statusCode = 403;
    throw error;
  }

  const equipment = await Equipment.create({
    ...payload,
    owner: user._id,
    status: "pending",
  });

  return equipment.toObject();
};

const updateEquipment = async (userEmail, equipmentId, payload) => {
  if (!mongoose.isValidObjectId(equipmentId)) {
    const error = new Error("Invalid equipment ID.");
    error.statusCode = 400;
    throw error;
  }

  const user = await mongoose.connection.db
    .collection("user")
    .findOne({ email: userEmail }, { projection: { _id: 1 } });

  if (!user) {
    const error = new Error("User account not found.");
    error.statusCode = 404;
    throw error;
  }

  const equipment = await Equipment.findOneAndUpdate(
    {
      _id: equipmentId,
      owner: user._id,
    },
    {
      $set: {
        ...payload,
        status: "pending",
      },
    },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!equipment) {
    const error = new Error(
      "Equipment not found or you do not have permission to update it.",
    );
    error.statusCode = 404;
    throw error;
  }

  return equipment.toObject();
};

const deleteEquipment = async (userEmail, equipmentId) => {
  if (!mongoose.isValidObjectId(equipmentId)) {
    const error = new Error("Invalid equipment ID.");
    error.statusCode = 400;
    throw error;
  }

  const user = await mongoose.connection.db
    .collection("user")
    .findOne({ email: userEmail }, { projection: { _id: 1 } });

  if (!user) {
    const error = new Error("User account not found.");
    error.statusCode = 404;
    throw error;
  }

  const equipment = await Equipment.findOneAndDelete({
    _id: equipmentId,
    owner: user._id,
  });

  if (!equipment) {
    const error = new Error(
      "Equipment not found or you do not have permission to delete it.",
    );
    error.statusCode = 404;
    throw error;
  }

  return equipment.toObject();
};

const getAllAdminEquipment = async (query = {}) => {
  const filter = {};

  if (query.status && ["pending", "approved", "rejected"].includes(query.status)) {
    filter.status = query.status;
  }

  if (query.search?.trim()) {
    const searchRegex = new RegExp(
      escapeRegex(query.search.trim()),
      "i",
    );

    filter.$or = [
      { name: searchRegex },
      { location: searchRegex },
      { category: searchRegex },
    ];
  }

  const [equipment, total] = await Promise.all([
    Equipment.find(filter)
      .populate("owner", "name email image")
      .sort({ createdAt: -1 })
      .lean(),

    Equipment.countDocuments(filter),
  ]);

  return {
    data: equipment,
    total,
  };
};

const updateAdminEquipmentStatus = async (equipmentId, status) => {
  if (!mongoose.Types.ObjectId.isValid(equipmentId)) {
    const error = new Error("Invalid equipment ID.");
    error.statusCode = 400;
    throw error;
  }

  const equipment = await Equipment.findById(equipmentId);

  if (!equipment) {
    const error = new Error("Equipment not found.");
    error.statusCode = 404;
    throw error;
  }

  equipment.status = status;

  await equipment.save();

  return equipment;
};

const updateAdminEquipment = async (equipmentId, payload) => {
  if (!mongoose.isValidObjectId(equipmentId)) {
    const error = new Error("Invalid equipment ID.");
    error.statusCode = 400;
    throw error;
  }

  const equipment = await Equipment.findByIdAndUpdate(
    equipmentId,
    {
      $set: payload,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!equipment) {
    const error = new Error("Equipment not found.");
    error.statusCode = 404;
    throw error;
  }

  return equipment.toObject();
};

const deleteAdminEquipment = async (equipmentId) => {
  if (!mongoose.isValidObjectId(equipmentId)) {
    const error = new Error("Invalid equipment ID.");
    error.statusCode = 400;
    throw error;
  }

  const equipment = await Equipment.findByIdAndDelete(equipmentId);

  if (!equipment) {
    const error = new Error("Equipment not found.");
    error.statusCode = 404;
    throw error;
  }

  return equipment.toObject();
};

const getMyEquipment = async (userEmail, query = {}) => {
  const user = await mongoose.connection.db
    .collection("user")
    .findOne({ email: userEmail }, { projection: { _id: 1 } });

  if (!user) {
    const error = new Error("User account not found.");
    error.statusCode = 404;
    throw error;
  }

  const filter = {
    owner: user._id,
  };

  if (query.status) {
    filter.status = query.status;
  }

  const equipment = await Equipment.find(filter).sort({ createdAt: -1 }).lean();

  return {
    data: equipment,
    total: equipment.length,
  };
};

export {
  getAllEquipment,
  getFeaturedEquipment,
  getEquipmentById,
  createEquipment,
  getMyEquipment,
  updateEquipment,
  deleteEquipment,
  getAllAdminEquipment,
  updateAdminEquipmentStatus,
  updateAdminEquipment,
  deleteAdminEquipment,
};
