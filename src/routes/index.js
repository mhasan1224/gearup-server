import { Router } from "express";

import equipmentRouter from "./equipment.routes.js";
import reviewRouter from "./review.routes.js";
import createUserRouter from "./user.routes.js";
import createBookingRouter from "./booking.routes.js";
import createFavoriteRouter from "./favorite.routes.js";
import createUploadRouter from "./upload.routes.js";
import { getOwnerAnalyticsController } from "../controllers/owner-analytics.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";
import createAdminAnalyticsRouter from "./admin-analytics.routes.js";

const createRootRouter = (auth) => {
  const router = Router();

  router.use("/equipment", equipmentRouter(auth));
  router.use("/reviews", reviewRouter(auth));
  router.use("/users", createUserRouter(auth));
  router.use("/bookings", createBookingRouter(auth));
  router.use("/favorites", createFavoriteRouter(auth));
  router.get(
    "/owner/analytics",
    authMiddleware(auth),
    roleMiddleware("owner"),
    getOwnerAnalyticsController,
  );
  router.use("/admin/analytics", createAdminAnalyticsRouter(auth));
  router.use("/uploads", createUploadRouter(auth));

  return router;
};

export default createRootRouter;
