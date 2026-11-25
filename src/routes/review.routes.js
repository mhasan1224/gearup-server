
import { Router } from "express";

import {
  getAllReviewsController,
  getFeaturedReviewsController,
  createReviewController,
  updateReviewStatusController,
  getMyReviewsController,
} from "../controllers/review.controller.js";

import {
  validateReviewLimit,
  validateCreateReview,
  validateReviewStatus,
} from "../validators/review.validator.js";

import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";

const createReviewRouter = (auth) => {
  const router = Router();

  // Public: Approved reviews for landing page.
  router.get(
    "/featured",
    validateReviewLimit,
    getFeaturedReviewsController,
  );

  // Customer: Fetch own review statuses.
router.get(
  "/my",
  authMiddleware(auth),
  roleMiddleware("customer"),
  getMyReviewsController,
);

  // Admin: Fetch all reviews for moderation.
  router.get(
    "/",
    authMiddleware(auth),
    roleMiddleware("admin"),
    validateReviewLimit,
    getAllReviewsController,
  );

  // Customer: Submit a review for a completed rental.
  router.post(
    "/",
    authMiddleware(auth),
    roleMiddleware("customer"),
    validateCreateReview,
    createReviewController,
  );

  // Admin: Approve or reject a review.
  router.patch(
    "/:id/status",
    authMiddleware(auth),
    roleMiddleware("admin"),
    validateReviewStatus,
    updateReviewStatusController,
  );

  return router;
};

export default createReviewRouter;
