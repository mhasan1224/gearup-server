
import {
  getMyFavorites,
  addFavorite,
  removeFavorite,
} from "../services/favorite.service.js";

import { sendSuccess } from "../utils/api-response.js";

const getMyFavoritesController = async (req, res, next) => {
  try {
    const result = await getMyFavorites(req.authUser.email);

    return sendSuccess(res, {
      statusCode: 200,
      message: "Your favorites fetched successfully.",
      data: result.data,
      meta: { total: result.total },
    });
  } catch (error) {
    next(error);
  }
};

const addFavoriteController = async (req, res, next) => {
  try {
    const { equipmentId } = req.body;

    if (typeof equipmentId !== "string" || !equipmentId.trim()) {
      return res.status(400).json({
        success: false,
        message: "Equipment ID is required.",
      });
    }

    const favorite = await addFavorite(
      req.authUser.email,
      equipmentId.trim(),
    );

    return sendSuccess(res, {
      statusCode: 201,
      message: "Equipment added to favorites successfully.",
      data: favorite,
    });
  } catch (error) {
    next(error);
  }
};

const removeFavoriteController = async (req, res, next) => {
  try {
    const result = await removeFavorite(
      req.authUser.email,
      req.params.equipmentId,
    );

    return sendSuccess(res, {
      statusCode: 200,
      message: "Equipment removed from favorites successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export {
  getMyFavoritesController,
  addFavoriteController,
  removeFavoriteController,
};
