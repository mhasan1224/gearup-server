
const validateCreateBooking = (req, res, next) => {
  const {
    startDate,
    endDate,
    quantity,
    phone,
    deliveryAddress,
    notes,
  } = req.body;

  const requiredFields = {
    startDate,
    endDate,
    quantity,
    phone,
    deliveryAddress,
  };

  for (const [field, value] of Object.entries(requiredFields)) {
    if (
      value === undefined ||
      value === null ||
      (typeof value === "string" && !value.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: `${field} is required.`,
      });
    }
  }

  if (
    typeof startDate !== "string" ||
    typeof endDate !== "string" ||
    Number.isNaN(Date.parse(startDate)) ||
    Number.isNaN(Date.parse(endDate))
  ) {
    return res.status(400).json({
      success: false,
      message: "Start date and end date must be valid dates.",
    });
  }

  if (new Date(endDate) <= new Date(startDate)) {
    return res.status(400).json({
      success: false,
      message: "End date must be after start date.",
    });
  }

  if (
    !Number.isInteger(quantity) ||
    quantity < 1
  ) {
    return res.status(400).json({
      success: false,
      message: "Quantity must be a positive integer.",
    });
  }

  if (typeof phone !== "string" || phone.trim().length < 7 || phone.trim().length > 20) {
    return res.status(400).json({
      success: false,
      message: "Phone number must be between 7 and 20 characters.",
    });
  }

  if (
    typeof deliveryAddress !== "string" ||
    deliveryAddress.trim().length < 5 ||
    deliveryAddress.trim().length > 500
  ) {
    return res.status(400).json({
      success: false,
      message: "Delivery address must be between 5 and 500 characters.",
    });
  }

  if (
    notes !== undefined &&
    (typeof notes !== "string" || notes.trim().length > 1000)
  ) {
    return res.status(400).json({
      success: false,
      message: "Notes must be a string with at most 1000 characters.",
    });
  }

  next();
};

export { validateCreateBooking };
