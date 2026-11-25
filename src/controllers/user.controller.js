
import {
  getAllUsers,
  updateUserRole,
} from "../services/user.service.js";

import { sendSuccess } from "../utils/api-response.js";

const getAllUsersController = async (req, res, next) => {
  try {
    const result = await getAllUsers();

    return sendSuccess(res, {
      statusCode: 200,
      message: "Users fetched successfully.",
      data: result.users,
      meta: {
        total: result.total,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateUserRoleController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (typeof role !== "string") {
      return res.status(400).json({
        success: false,
        message: "A valid role is required.",
      });
    }

    const updatedUser = await updateUserRole(
      id,
      role,
      req.authUser.email,
    );

    return sendSuccess(res, {
      statusCode: 200,
      message: "User role updated successfully.",
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    next(error);
  }
};

export {
  getAllUsersController,
  updateUserRoleController,
};
