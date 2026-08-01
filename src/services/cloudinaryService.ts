export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  format: string;
  bytes: number;
  width?: number;
  height?: number;
}

export const CLOUDINARY_CONFIG = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dz6qjy2t6',
  apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY || '3fYClvHtumjgKsUJKnojUjJ9NaM',
  uploadPreset: import.meta.env.VITE_CLOUDINARY_PRESET_NAME || 'Tablate',
};

/**
 * Uploads a file (image/pdf/video) directly to Cloudinary using unsigned/preset upload endpoint
 */
export const uploadToCloudinary = async (
  file: File | Blob,
  folderName: string = 'tablate_uploads'
): Promise<CloudinaryUploadResponse> => {
  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/auto/upload`;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
  formData.append('folder', folderName);

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error?.message || 'Cloudinary upload failed');
    }

    const data: CloudinaryUploadResponse = await response.json();
    return data;
  } catch (error: any) {
    console.error('[Cloudinary Upload Error]', error);
    throw error;
  }
};
