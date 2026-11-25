import mongoose from "mongoose";

import Review from "../models/review.model.js";
import Booking from "../models/booking.model.js";

const getUserByEmail = async (userEmail) => {
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

  return user;
};

const getAllReviews = async (limit = 10) => {
  const parsedLimit = Math.min(Math.max(Number(limit) || 10, 1), 50);

  const [reviews, total] = await Promise.all([
    Review.find()
      .populate("customer", "name profileImage")
      .populate("equipment", "name")
      .populate("booking", "startDate endDate status paymentStatus")
      .sort({ createdAt: -1 })
      .limit(parsedLimit)
      .lean(),

    Review.countDocuments(),
  ]);

  return { data: reviews, total };
};

const getFeaturedReviews = async (limit = 4) => {
  const parsedLimit = Math.min(Math.max(Number(limit) || 4, 1), 12);

  const [reviews, total] = await Promise.all([
    Review.find({ status: "approved" })
      .populate("customer", "name profileImage")
      .populate("equipment", "name")
      .sort({ createdAt: -1 })
      .limit(parsedLimit)
      .lean(),

    Review.countDocuments({ status: "approved" }),
  ]);

  return { data: reviews, total };
};

const createReview = async (userEmail, payload) => {
  const customer = await getUserByEmail(userEmail);

  const { bookingId, rating, comment } = payload;

  if (!mongoose.isValidObjectId(bookingId)) {
    const error = new Error("Invalid booking ID.");
    error.statusCode = 400;
    throw error;
  }

  const booking = await Booking.findOne({
    _id: bookingId,
    customer: customer._id,
    status: "completed",
    paymentStatus: "paid",
  }).lean();

  if (!booking) {
    const error = new Error(
      "You can only review your own completed and paid rentals.",
    );
    error.statusCode = 404;
    throw error;
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    const error = new Error("Rating must be an integer between 1 and 5.");
    error.statusCode = 400;
    throw error;
  }

  if (
    typeof comment !== "string" ||
    comment.trim().length < 5 ||
    comment.trim().length > 1000
  ) {
    const error = new Error(
      "Review comment must contain between 5 and 1000 characters.",
    );
    error.statusCode = 400;
    throw error;
  }

  try {
    const existingReview = await Review.findOne({
      booking: booking._id,
    });

    let review;

    if (existingReview) {
      if (existingReview.status !== "rejected") {
        const error = new Error(
          "You have already submitted a review for this booking.",
        );
        error.statusCode = 409;
        throw error;
      }

      review = await Review.findByIdAndUpdate(
        existingReview._id,
        {
          rating,
          comment: comment.trim(),
          status: "pending",
        },
        {
          new: true,
          runValidators: true,
        },
      );
    } else {
      review = await Review.create({
        booking: booking._id,
        customer: customer._id,
        equipment: booking.equipment,
        rating,
        comment: comment.trim(),
      });
    }

    return await Review.findById(review._id)
      .populate("customer", "name profileImage")
      .populate("equipment", "name")
      .populate("booking", "startDate endDate status paymentStatus")
      .lean();
  } catch (error) {
    if (error.code === 11000) {
      const duplicateError = new Error(
        "You have already submitted a review for this booking.",
      );
      duplicateError.statusCode = 409;
      throw duplicateError;
    }

    throw error;
  }
};

const updateReviewStatus = async (reviewId, status) => {
  if (!mongoose.isValidObjectId(reviewId)) {
    const error = new Error("Invalid review ID.");
    error.statusCode = 400;
    throw error;
  }

  if (!["approved", "rejected"].includes(status)) {
    const error = new Error("Review status must be approved or rejected.");
    error.statusCode = 400;
    throw error;
  }

  const review = await Review.findByIdAndUpdate(
    reviewId,
    { status },
    { new: true, runValidators: true },
  )
    .populate("customer", "name profileImage")
    .populate("equipment", "name")
    .populate("booking", "startDate endDate status paymentStatus")
    .lean();

  if (!review) {
    const error = new Error("Review not found.");
    error.statusCode = 404;
    throw error;
  }

  return review;
};

const getMyReviews = async (userEmail) => {
  const customer = await getUserByEmail(userEmail);

  const reviews = await Review.find({
    customer: customer._id,
  })
    .select("booking status")
    .lean();

  return reviews.map((review) => ({
    bookingId: review.booking.toString(),
    status: review.status,
  }));
};

export {
  getAllReviews,
  getFeaturedReviews,
  createReview,
  updateReviewStatus,
  getMyReviews,
};
