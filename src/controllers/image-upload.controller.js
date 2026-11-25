
import uploadImageToImageBB from "../services/image-upload.service.js";
import { sendSuccess } from "../utils/api-response.js";

const uploadEquipmentImageController = async (req, res, next) => {
  try {
    const result = await uploadImageToImageBB(req.file);

    return sendSuccess(res, {
      statusCode: 200,
      message: "Equipment image uploaded successfully.",
      data: {
        image: result.url,
      },
    });
  } catch (error) {
    next(error);
  }
};

export { uploadEquipmentImageController };
