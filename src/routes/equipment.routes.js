import { Router } from "express";

import {
  getAllEquipmentController,
  getFeaturedEquipmentController,
  getEquipmentByIdController,
  createEquipmentController,
  getMyEquipmentController,
  updateEquipmentController,
  deleteEquipmentController,
  getAllAdminEquipmentController,
  updateAdminEquipmentStatusController,
  updateAdminEquipmentController,
  deleteAdminEquipmentController,
} from "../controllers/equipment.controller.js";

import {
  validateEquipmentQuery,
  validateFeaturedLimit,
  validateCreateEquipment,
  validateEquipmentStatus,
} from "../validators/equipment.validator.js";

import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";

const createEquipmentRouter = (auth) => {
  const router = Router();

  router.get("/", validateEquipmentQuery, getAllEquipmentController);

  router.get(
    "/featured",
    validateFeaturedLimit,
    getFeaturedEquipmentController,
  );
  router.get(
    "/admin",
    authMiddleware(auth),
    roleMiddleware("admin"),
    getAllAdminEquipmentController,
  );

  router.patch(
    "/admin/:id/status",
    authMiddleware(auth),
    roleMiddleware("admin"),
    validateEquipmentStatus,
    updateAdminEquipmentStatusController,
  );

  router.patch(
    "/admin/:id",
    authMiddleware(auth),
    roleMiddleware("admin"),
    validateCreateEquipment,
    updateAdminEquipmentController,
  );

  router.delete(
  "/admin/:id",
  authMiddleware(auth),
  roleMiddleware("admin"),
  deleteAdminEquipmentController,
);

  router.get(
    "/my-equipment",
    authMiddleware(auth),
    roleMiddleware("owner"),
    getMyEquipmentController,
  );

  router.post(
    "/",
    authMiddleware(auth),
    roleMiddleware("owner"),
    validateCreateEquipment,
    createEquipmentController,
  );

  router.patch(
    "/:id",
    authMiddleware(auth),
    roleMiddleware("owner"),
    validateCreateEquipment,
    updateEquipmentController,
  );

  router.delete(
    "/:id",
    authMiddleware(auth),
    roleMiddleware("owner"),
    deleteEquipmentController,
  );

  router.get("/:id", getEquipmentByIdController);

  return router;
};

export default createEquipmentRouter;
