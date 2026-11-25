
import mongoose from "mongoose";

import User from "../models/user.model.js";
import Equipment from "../models/equipment.model.js";
import Booking from "../models/booking.model.js";

const getAdminAnalytics = async () => {
  const [
    totalUsers,
    totalCustomers,
    totalOwners,
    totalAdmins,
    totalEquipment,
    pendingEquipment,
    approvedEquipment,
    rejectedEquipment,
    totalBookings,
    pendingBookings,
    completedBookings,
    revenueResult,
    monthlyRevenue,
  ] = await Promise.all([
    User.countDocuments(),

    User.countDocuments({ role: "customer" }),
    User.countDocuments({ role: "owner" }),
    User.countDocuments({ role: "admin" }),

    Equipment.countDocuments(),
    Equipment.countDocuments({ status: "pending" }),
    Equipment.countDocuments({ status: "approved" }),
    Equipment.countDocuments({ status: "rejected" }),

    Booking.countDocuments(),
    Booking.countDocuments({ status: "pending" }),
    Booking.countDocuments({ status: "completed" }),

    Booking.aggregate([
      {
        $match: {
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
          revenue: { $sum: "$totalAmount" },
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

  const totalRevenue = revenueResult[0]?.total || 0;

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const currentMonthRevenue =
    monthlyRevenue.find(
      (item) =>
        item._id.year === currentYear &&
        item._id.month === currentMonth,
    )?.revenue || 0;

  return {
    users: {
      total: totalUsers,
      customers: totalCustomers,
      owners: totalOwners,
      admins: totalAdmins,
    },

    equipment: {
      total: totalEquipment,
      pending: pendingEquipment,
      approved: approvedEquipment,
      rejected: rejectedEquipment,
    },

    bookings: {
      total: totalBookings,
      pending: pendingBookings,
      completed: completedBookings,
    },

    revenue: {
      total: totalRevenue,
      monthly: currentMonthRevenue,
      monthlyBreakdown: monthlyRevenue.map((item) => ({
        year: item._id.year,
        month: item._id.month,
        revenue: item.revenue,
      })),
    },
  };
};

export { getAdminAnalytics };
