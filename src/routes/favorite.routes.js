
import { Router } from "express";

import {
  getMyFavoritesController,
  addFavoriteController,
  removeFavoriteController,
} from "../controllers/favorite.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";

const createFavoriteRouter = (auth) => {
  const router = Router();

  router.use(authMiddleware(auth), roleMiddleware("customer"));

  router.get("/", getMyFavoritesController);

  router.post("/", addFavoriteController);

  router.delete("/:equipmentId", removeFavoriteController);

  return router;
};

export default createFavoriteRouter;
