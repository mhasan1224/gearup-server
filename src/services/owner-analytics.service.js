
import mongoose from "mongoose";

import Equipment from "../models/equipment.model.js";
import Booking from "../models/booking.model.js";

const getOwnerAnalytics = async (userEmail) => {
  if (!userEmail) {
    const error = new Error("Authenticated user email is required.");
    error.statusCode = 401;
    throw error;
  }

  const user = await mongoose.connection.db
    .collection("user")
    .findOne(
      { email: userEmail },
      { projection: { _id: 1 } },
    );

  if (!user) {
    const error = new Error("User account not found.");
    error.statusCode = 404;
    throw error;
  }

  const ownerId = user._id;

  const [
    totalEquipment,
    pendingEquipment,
    approvedEquipment,
    rejectedEquipment,
    completedRentals,
    earningsResult,
    monthlyEarnings,
  ] = await Promise.all([
    Equipment.countDocuments({ owner: ownerId }),

    Equipment.countDocuments({
      owner: ownerId,
      status: "pending",
    }),

    Equipment.countDocuments({
      owner: ownerId,
      status: "approved",
    }),

    Equipment.countDocuments({
      owner: ownerId,
      status: "rejected",
    }),

    Booking.countDocuments({
      owner: ownerId,
      status: "completed",
      paymentStatus: "paid",
    }),

    Booking.aggregate([
      {
        $match: {
          owner: ownerId,
          paymentStatus: "paid",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
        },
      },
    ]),

    Booking.aggregate([
      {
        $match: {
          owner: ownerId,
          paymentStatus: "paid",
          paidAt: { $ne: null },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$paidAt" },
            month: { $month: "$paidAt" },
          },
          earnings: { $sum: "$totalAmount" },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]),
  ]);

  const totalEarnings = earningsResult[0]?.total || 0;

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const currentMonthEarnings =
    monthlyEarnings.find(
      (item) =>
        item._id.year === currentYear &&
        item._id.month === currentMonth,
    )?.earnings || 0;

  return {
    equipment: {
      total: totalEquipment,
      pending: pendingEquipment,
      approved: approvedEquipment,
      rejected: rejectedEquipment,
    },
    rentals: {
      completed: completedRentals,
    },
    earnings: {
      total: totalEarnings,
      monthly: currentMonthEarnings,
      monthlyBreakdown: monthlyEarnings.map((item) => ({
        year: item._id.year,
        month: item._id.month,
        earnings: item.earnings,
      })),
    },
  };
};

export { getOwnerAnalytics };
