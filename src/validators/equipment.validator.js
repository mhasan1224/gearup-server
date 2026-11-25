
const categories = [
  "construction",
  "photography",
  "vehicles",
  "agriculture",
  "electronics",
  "events",
];

const rentalTypes = ["daily", "weekly", "monthly"];

const sortOptions = ["price-asc", "price-desc", "recent"];

const validateEquipmentQuery = (req, res, next) => {
  const {
    search,
    category,
    rentalType,
    minPrice,
    maxPrice,
    availableOnly,
    sortBy,
    limit,
  } = req.query;

  if (search !== undefined && typeof search !== "string") {
    return res.status(400).json({
      success: false,
      message: "Search must be a string.",
    });
  }

  if (category && !categories.includes(category)) {
    return res.status(400).json({
      success: false,
      message: "Invalid equipment category.",
    });
  }

  if (rentalType && !rentalTypes.includes(rentalType)) {
    return res.status(400).json({
      success: false,
      message: "Invalid rental type.",
    });
  }

  if (sortBy && !sortOptions.includes(sortBy)) {
    return res.status(400).json({
      success: false,
      message: "Invalid sorting option.",
    });
  }

  if (
    availableOnly !== undefined &&
    !["true", "false"].includes(availableOnly)
  ) {
    return res.status(400).json({
      success: false,
      message: "availableOnly must be true or false.",
    });
  }

  for (const [field, value] of [
    ["minPrice", minPrice],
    ["maxPrice", maxPrice],
    ["limit", limit],
  ]) {
    if (value !== undefined) {
      const parsedValue = Number(value);

      if (!Number.isFinite(parsedValue) || parsedValue < 0) {
        return res.status(400).json({
          success: false,
          message: `${field} must be a valid non-negative number.`,
        });
      }

      if (
        field === "limit" &&
        (!Number.isInteger(parsedValue) || parsedValue === 0)
      ) {
        return res.status(400).json({
          success: false,
          message: "limit must be a positive integer.",
        });
      }
    }
  }

  if (
    minPrice !== undefined &&
    maxPrice !== undefined &&
    Number(minPrice) > Number(maxPrice)
  ) {
    return res.status(400).json({
      success: false,
      message: "Minimum price cannot exceed maximum price.",
    });
  }

  next();
};

const validateFeaturedLimit = (req, res, next) => {
  const { limit } = req.query;

  if (limit !== undefined) {
    const parsedLimit = Number(limit);

    if (
      !Number.isInteger(parsedLimit) ||
      parsedLimit < 1 ||
      parsedLimit > 12
    ) {
      return res.status(400).json({
        success: false,
        message: "Featured equipment limit must be between 1 and 12.",
      });
    }
  }

  next();
};

const validateCreateEquipment = (req, res, next) => {
  const {
    name,
    description,
    category,
    location,
    rentalPrice,
    rentalType,
    availableQuantity,
    image,
    condition,
    brand,
    model,
    terms,
  } = req.body;

  const requiredFields = {
    name,
    description,
    category,
    location,
    rentalPrice,
    rentalType,
    availableQuantity,
    image,
    condition,
    terms,
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

  const stringFields = [
    "name",
    "description",
    "location",
    "image",
    "condition",
    "terms",
  ];

  for (const field of stringFields) {
    if (typeof req.body[field] !== "string") {
      return res.status(400).json({
        success: false,
        message: `${field} must be a string.`,
      });
    }
  }

  if (name.trim().length > 120) {
    return res.status(400).json({
      success: false,
      message: "Equipment name cannot exceed 120 characters.",
    });
  }

  if (!categories.includes(category)) {
    return res.status(400).json({
      success: false,
      message: "Invalid equipment category.",
    });
  }

  if (!rentalTypes.includes(rentalType)) {
    return res.status(400).json({
      success: false,
      message: "Invalid rental type.",
    });
  }

  if (
    typeof rentalPrice !== "number" ||
    !Number.isFinite(rentalPrice) ||
    rentalPrice < 0
  ) {
    return res.status(400).json({
      success: false,
      message: "Rental price must be a valid non-negative number.",
    });
  }

  if (
    !Number.isInteger(availableQuantity) ||
    availableQuantity < 0
  ) {
    return res.status(400).json({
      success: false,
      message: "Available quantity must be a non-negative integer.",
    });
  }

  for (const field of ["brand", "model"]) {
    if (
      req.body[field] !== undefined &&
      typeof req.body[field] !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: `${field} must be a string.`,
      });
    }
  }

  next();
};

const validateEquipmentStatus = (req, res, next) => {
  const { status } = req.body;

  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Status must be approved or rejected.",
    });
  }

  next();
};

export {
  validateEquipmentQuery,
  validateFeaturedLimit,
  validateCreateEquipment,
  validateEquipmentStatus
};
