
import {
  getMyRentals,
  getOwnerRentals,
  createBooking,
  getBookingPaymentStatus,
  completeOwnerRental,
} from "../services/booking.service.js";

import { sendSuccess } from "../utils/api-response.js";

const getMyRentalsController = async (req, res, next) => {
  try {
    const result = await getMyRentals(
      req.authUser.email,
      req.query,
    );

    return sendSuccess(res, {
      statusCode: 200,
      message: "Your rentals fetched successfully.",
      data: result.data,
      meta: {
        total: result.total,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getOwnerRentalsController = async (req, res, next) => {
  try {
    const result = await getOwnerRentals(
      req.authUser.email,
      req.query,
    );

    return sendSuccess(res, {
      statusCode: 200,
      message: "Owner rentals fetched successfully.",
      data: result.data,
      meta: {
        total: result.total,
      },
    });
  } catch (error) {
    next(error);
  }
};

const completeOwnerRentalController = async (req, res, next) => {
  try {
    const booking = await completeOwnerRental(
      req.authUser.email,
      req.params.id,
    );

    return sendSuccess(res, {
      statusCode: 200,
      message: "Rental marked as completed successfully.",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

const createBookingController = async (req, res, next) => {
  try {
    const result = await createBooking(
      req.authUser.email,
      req.body,
    );

    return sendSuccess(res, {
      statusCode: 201,
      message: "Booking created. Please complete your payment.",
      data: {
        booking: result.booking,
        checkoutUrl: result.checkoutUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};


const getBookingPaymentStatusController = async (req, res, next) => {
  try {
    const result = await getBookingPaymentStatus(
      req.authUser.email,
      req.query.session_id,
    );

    return sendSuccess(res, {
      statusCode: 200,
      message: "Booking payment status fetched successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};


export {
  getMyRentalsController,
  getOwnerRentalsController,
  createBookingController,
  getBookingPaymentStatusController,
  completeOwnerRentalController,
};