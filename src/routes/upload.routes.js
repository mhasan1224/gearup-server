
import { Router } from "express";

import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";
import upload from "../middlewares/upload.middleware.js";

import {
  uploadEquipmentImageController,
} from "../controllers/image-upload.controller.js";

const createUploadRouter = (auth) => {
  const router = Router();

  router.post(
    "/equipment-image",
    authMiddleware(auth),
    roleMiddleware("owner", "admin"),
    upload.single("image"),
    uploadEquipmentImageController,
  );

  return router;
};

export default createUploadRouter;
