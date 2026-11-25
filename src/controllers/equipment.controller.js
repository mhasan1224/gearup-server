import {
  getAllEquipment,
  getFeaturedEquipment,
  getEquipmentById,
  createEquipment,
  getMyEquipment,
  updateEquipment,
  // Existing imports...
  deleteEquipment,
  getAllAdminEquipment,
  updateAdminEquipmentStatus,
  updateAdminEquipment,
  deleteAdminEquipment
} from "../services/equipment.service.js";

import { sendSuccess } from "../utils/api-response.js";
import { serializeEquipment } from "../utils/serialize-equipment.js";

const getAllEquipmentController = async (req, res, next) => {
  try {
    const result = await getAllEquipment(req.query);

    return sendSuccess(res, {
      statusCode: 200,
      message: "Equipment fetched successfully.",
      data: result.data.map(serializeEquipment),
      meta: {
        total: result.total,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getFeaturedEquipmentController = async (req, res, next) => {
  try {
    const limit = req.query.limit || 6;

    const result = await getFeaturedEquipment(limit);

    return sendSuccess(res, {
      statusCode: 200,
      message: "Featured equipment fetched successfully.",
      data: result.data.map(serializeEquipment),
      meta: {
        total: result.total,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getEquipmentByIdController = async (req, res, next) => {
  try {
    const equipment = await getEquipmentById(req.params.id);

    return sendSuccess(res, {
      statusCode: 200,
      message: "Equipment details fetched successfully.",
      data: serializeEquipment(equipment),
    });
  } catch (error) {
    next(error);
  }
};

const createEquipmentController = async (req, res, next) => {
  try {
    const equipment = await createEquipment(req.authUser.email, req.body);

    return sendSuccess(res, {
      statusCode: 201,
      message: "Equipment submitted successfully for approval.",
      data: serializeEquipment(equipment),
    });
  } catch (error) {
    next(error);
  }
};

const getMyEquipmentController = async (req, res, next) => {
  try {
    const result = await getMyEquipment(req.authUser.email, req.query);

    return sendSuccess(res, {
      statusCode: 200,
      message: "Your equipment fetched successfully.",
      data: result.data.map(serializeEquipment),
      meta: {
        total: result.total,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getAllAdminEquipmentController = async (req, res, next) => {
  try {
    const result = await getAllAdminEquipment(req.query);

    return sendSuccess(res, {
      statusCode: 200,
      message: "Admin equipment fetched successfully.",
      data: result.data.map(serializeEquipment),
      meta: {
        total: result.total,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateAdminEquipmentStatusController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const equipment = await updateAdminEquipmentStatus(id, status);

    return sendSuccess(res, {
      statusCode: 200,
      message: `Equipment ${status} successfully.`,
      data: {
        equipment: serializeEquipment(equipment),
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateAdminEquipmentController = async (req, res, next) => {
  try {
    const { id } = req.params;

    const equipment = await updateAdminEquipment(id, req.body);

    return sendSuccess(res, {
      statusCode: 200,
      message: "Equipment updated successfully.",
      data: {
        equipment: serializeEquipment(equipment),
      },
    });
  } catch (error) {
    next(error);
  }
};

const deleteAdminEquipmentController = async (req, res, next) => {
  try {
    await deleteAdminEquipment(req.params.id);

    return sendSuccess(res, {
      statusCode: 200,
      message: "Equipment deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

const updateEquipmentController = async (req, res, next) => {
  try {
    const equipment = await updateEquipment(
      req.authUser.email,
      req.params.id,
      req.body,
    );

    return sendSuccess(res, {
      statusCode: 200,
      message: "Equipment updated successfully and submitted for approval.",
      data: serializeEquipment(equipment),
    });
  } catch (error) {
    next(error);
  }
};

const deleteEquipmentController = async (req, res, next) => {
  try {
    await deleteEquipment(req.authUser.email, req.params.id);

    return sendSuccess(res, {
      statusCode: 200,
      message: "Equipment deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

export {
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
};
