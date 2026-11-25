import { Router } from "express";
import mongoose from "mongoose";

import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";

import {
  getAllUsersController,
  updateUserRoleController,
} from "../controllers/user.controller.js";

const createUserRouter = (auth) => {
  const router = Router();

  const usersCollection = () => mongoose.connection.db.collection("user");
  router.get(
    "/",
    authMiddleware(auth),
    roleMiddleware("admin"),
    getAllUsersController,
  );

  router.patch(
    "/:id/role",
    authMiddleware(auth),
    roleMiddleware("admin"),
    updateUserRoleController,
  );

  router.get("/me", authMiddleware(auth), async (req, res) => {
    const user = await usersCollection().findOne(
      { email: req.authUser.email },
      {
        projection: {
          _id: 0,
          name: 1,
          email: 1,
          image: 1,
          role: 1,
          phone: 1,
          address: 1,
          emailVerified: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User profile not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User profile retrieved successfully.",
      data: { user },
    });
  });

  router.patch("/me", authMiddleware(auth), async (req, res) => {
    const allowedFields = ["name", "image", "phone", "address"];
    const updateData = {};

    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request body.",
      });
    }

    for (const field of allowedFields) {
      if (Object.hasOwn(req.body, field)) {
        if (typeof req.body[field] !== "string") {
          return res.status(400).json({
            success: false,
            message: `${field} must be a string.`,
          });
        }

        const value = req.body[field].trim();

        if (!value) {
          return res.status(400).json({
            success: false,
            message: `${field} cannot be empty.`,
          });
        }

        updateData[field] = value;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid profile fields provided.",
      });
    }

    const result = await usersCollection().updateOne(
      { email: req.authUser.email },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      },
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "User profile not found.",
      });
    }

    const updatedUser = await usersCollection().findOne(
      { email: req.authUser.email },
      {
        projection: {
          _id: 0,
          name: 1,
          email: 1,
          image: 1,
          role: 1,
          phone: 1,
          address: 1,
          emailVerified: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    );

    return res.status(200).json({
      success: true,
      message: "User profile updated successfully.",
      data: { user: updatedUser },
    });
  });

  return router;
};

export default createUserRouter;
