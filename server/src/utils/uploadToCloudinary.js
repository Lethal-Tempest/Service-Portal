// utils/uploadToCloudinary.js
import cloudinary from '../config/cloudinary.js';

const uploadToCloudinary = async (file, folder = 'users') => {
  console.log(file);
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto',
        folder
      },
      (error, result) => {
        if (error) return reject(error);
        console.log(result);
        resolve(result.secure_url);
      }
    ).end(file.buffer);
  });
};

export default uploadToCloudinary;
