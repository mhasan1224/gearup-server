
const uploadImageToImageBB = async (file) => {
  const apiKey = process.env.IMGBB_API_KEY;

  if (!apiKey) {
    throw new Error("ImageBB API key is not configured.");
  }

  if (!file) {
    const error = new Error("Image file is required.");
    error.statusCode = 400;
    throw error;
  }

  const formData = new FormData();

  formData.append(
    "image",
    new Blob([file.buffer], { type: file.mimetype }),
    file.originalname,
  );

  const response = await fetch(
    `https://api.imgbb.com/1/upload?key=${apiKey}`,
    {
      method: "POST",
      body: formData,
    },
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.error?.message || "Image upload failed.",
    );
  }

  return {
    url: result.data.url,
    deleteUrl: result.data.delete_url,
  };
};

export default uploadImageToImageBB;
