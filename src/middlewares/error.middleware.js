
const errorMiddleware = (error, req, res, next) => {
  const statusCode = error.statusCode || 500;

  const message = error.message || "Internal Server Error";

  if (process.env.NODE_ENV === "development") {
    console.error(error);
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};

export default errorMiddleware;
