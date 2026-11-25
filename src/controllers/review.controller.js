
import {
  getAllReviews,
  getFeaturedReviews,
  createReview,
  updateReviewStatus,
  getMyReviews,
} from "../services/review.service.js";

import { sendSuccess } from "../utils/api-response.js";

const getAllReviewsController = async (req, res, next) => {
  try {
    const limit = req.query.limit || 10;
    const result = await getAllReviews(limit);

    return sendSuccess(res, {
      statusCode: 200,
      message: "Reviews fetched successfully.",
      data: result.data.map(serializeReview),
      meta: { total: result.total },
    });
  } catch (error) {
    next(error);
  }
};

const getFeaturedReviewsController = async (req, res, next) => {
  try {
    const limit = req.query.limit || 4;
    const result = await getFeaturedReviews(limit);

    return sendSuccess(res, {
      statusCode: 200,
      message: "Featured reviews fetched successfully.",
      data: result.data.map(serializeReview),
      meta: { total: result.total },
    });
  } catch (error) {
    next(error);
  }
};

const createReviewController = async (req, res, next) => {
  try {
    const review = await createReview(
      req.authUser.email,
      req.body,
    );

    return sendSuccess(res, {
      statusCode: 201,
      message: "Review submitted successfully. It is awaiting admin approval.",
      data: serializeReview(review),
    });
  } catch (error) {
    next(error);
  }
};

const updateReviewStatusController = async (req, res, next) => {
  try {
    const review = await updateReviewStatus(
      req.params.id,
      req.body.status,
    );

    return sendSuccess(res, {
      statusCode: 200,
      message: `Review ${req.body.status} successfully.`,
      data: serializeReview(review),
    });
  } catch (error) {
    next(error);
  }
};

const getMyReviewsController = async (req, res, next) => {
  try {
    const reviews = await getMyReviews(req.authUser.email);

    return sendSuccess(res, {
      statusCode: 200,
      message: "Your reviews fetched successfully.",
      data: reviews,
      meta: {
        total: reviews.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

const serializeReview = (review) => {
  const {
    _id,
    customer,
    equipment,
    booking,
    ...reviewData
  } = review;

  return {
    ...reviewData,
    id: _id.toString(),

    customer: customer
      ? {
          id: customer._id.toString(),
          name: customer.name,
          profileImage: customer.profileImage,
        }
      : null,

    equipment: equipment
      ? {
          id: equipment._id.toString(),
          name: equipment.name,
        }
      : null,

    booking: booking
      ? {
          id: booking._id.toString(),
          startDate: booking.startDate,
          endDate: booking.endDate,
          status: booking.status,
          paymentStatus: booking.paymentStatus,
        }
      : null,
  };
};

export {
  getAllReviewsController,
  getFeaturedReviewsController,
  createReviewController,
  updateReviewStatusController,
  getMyReviewsController,
};
