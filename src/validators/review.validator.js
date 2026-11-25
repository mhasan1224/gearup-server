
const validateReviewLimit = (req, res, next) => {
  const { limit } = req.query;

  if (limit === undefined) {
    return next();
  }

  const parsedLimit = Number(limit);

  if (
    !Number.isInteger(parsedLimit) ||
    parsedLimit < 1 ||
    parsedLimit > 12
  ) {
    return res.status(400).json({
      success: false,
      message: "Review limit must be an integer between 1 and 12.",
    });
  }

  next();
};

const validateCreateReview = (req, res, next) => {
  const { bookingId, rating, comment } = req.body;

  if (
    typeof bookingId !== "string" ||
    !/^[a-f\d]{24}$/i.test(bookingId)
  ) {
    return res.status(400).json({
      success: false,
      message: "A valid booking ID is required.",
    });
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({
      success: false,
      message: "Rating must be an integer between 1 and 5.",
    });
  }

  if (
    typeof comment !== "string" ||
    comment.trim().length < 5 ||
    comment.trim().length > 1000
  ) {
    return res.status(400).json({
      success: false,
      message: "Review comment must contain between 5 and 1000 characters.",
    });
  }

  next();
};

const validateReviewStatus = (req, res, next) => {
  const { status } = req.body;

  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Review status must be approved or rejected.",
    });
  }

  next();
};

export {
  validateReviewLimit,
  validateCreateReview,
  validateReviewStatus,
};
