// utils/uploadToCloudinary.js
import cloudinary from '../config/cloudinary.js';

const uploadToCloudinary = async (file, folder = 'users') => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto',
        folder
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    ).end(file.buffer);
  });
};

export default uploadToCloudinary;
