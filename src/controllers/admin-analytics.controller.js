
import { getAdminAnalytics } from "../services/admin-analytics.service.js";

import { sendSuccess } from "../utils/api-response.js";

const getAdminAnalyticsController = async (req, res, next) => {
  try {
    const result = await getAdminAnalytics();

    return sendSuccess(res, {
      statusCode: 200,
      message: "Admin analytics fetched successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export { getAdminAnalyticsController };
