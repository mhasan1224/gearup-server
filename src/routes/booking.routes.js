import { Router } from "express";

import {
  getMyRentalsController,
  getOwnerRentalsController,
  createBookingController,
  getBookingPaymentStatusController,
  completeOwnerRentalController,
} from "../controllers/booking.controller.js";

import { validateCreateBooking } from "../validators/booking.validator.js";

import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";

const createBookingRouter = (auth) => {
  const router = Router();

  router.get(
    "/payment-status",
    authMiddleware(auth),
    roleMiddleware("customer"),
    getBookingPaymentStatusController,
  );

  router.post(
    "/",
    authMiddleware(auth),
    roleMiddleware("customer"),
    validateCreateBooking,
    createBookingController,
  );

  router.get(
    "/my-rentals",
    authMiddleware(auth),
    roleMiddleware("customer"),
    getMyRentalsController,
  );

  router.get(
    "/owner-rentals",
    authMiddleware(auth),
    roleMiddleware("owner"),
    getOwnerRentalsController,
  );

  router.patch(
    "/:id/complete",
    authMiddleware(auth),
    roleMiddleware("owner"),
    completeOwnerRentalController,
  );

  return router;
};

export default createBookingRouter;
