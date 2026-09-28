const ImageKit = require('@imagekit/nodejs');

let imagekit;

const connectimagekit = () => {
    if (!process.env.PRIVATE_IMAGEKIT_KEY) {
        throw new Error("PRIVATE_IMAGEKIT_KEY is not configured");
    }

    imagekit = new ImageKit({
        privateKey: process.env.PRIVATE_IMAGEKIT_KEY,
    });
    console.log("ImageKit initialized successfully");
    return imagekit;
};

const uploadFile = async (file, title, _mimeType, folder = "products") => {
    if (!file?.buffer) {
        throw new Error("A buffered file is required for upload");
    }

    const client = imagekit || connectimagekit();
    const extension = file.originalname?.match(/\.[^.]+$/)?.[0] || "";
    const fileName = `${title || "product"}-${Date.now()}${extension}`;
    const result = await client.files.upload({
        file: file.buffer.toString("base64"),
        fileName,
        folder,
        useUniqueFileName: true,
    });

    if (!result?.url) {
        throw new Error("ImageKit upload did not return a file URL");
    }

    return result;
};

module.exports = {
    uploadFile,connectimagekit
};
