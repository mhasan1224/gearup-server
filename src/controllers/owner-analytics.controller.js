
import { getOwnerAnalytics } from "../services/owner-analytics.service.js";

import { sendSuccess } from "../utils/api-response.js";

const getOwnerAnalyticsController = async (req, res, next) => {
  try {
    const result = await getOwnerAnalytics(req.authUser.email);

    return sendSuccess(res, {
      statusCode: 200,
      message: "Owner analytics fetched successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export { getOwnerAnalyticsController };
