
import { Router } from "express";

import { getAdminAnalyticsController } from "../controllers/admin-analytics.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";

const createAdminAnalyticsRouter = (auth) => {
  const router = Router();

  router.get(
    "/",
    authMiddleware(auth),
    roleMiddleware("admin"),
    getAdminAnalyticsController,
  );

  return router;
};

export default createAdminAnalyticsRouter;
