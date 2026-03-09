import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (buffer, folder = 'petmat') => {
  const base64 = `data:image/jpeg;base64,${buffer.toString('base64')}`;
  return cloudinary.uploader.upload(base64, { folder });
};
