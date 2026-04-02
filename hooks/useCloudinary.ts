import { useState } from 'react';

export const useCloudinary = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (file: File): Promise<string> => {
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    // Debugging (Remove in production)
    console.log('[Cloudinary Debug]', {
      cloudName: cloudName ? 'Defined' : 'Missing',
      uploadPreset: uploadPreset ? 'Defined' : 'Missing',
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    });

    if (!cloudName || !uploadPreset) {
      setIsUploading(false);
      const msg = 'Cloudinary configuration (cloud name or upload preset) is missing in .env.local';
      setError(msg);
      throw new Error(msg);
    }

    const formData = new FormData();
    formData.append('file', file, file.name); // Explicitly pass the filename
    formData.append('upload_preset', uploadPreset);
    formData.append('resource_type', 'image'); // Force image type to prevent auto-download headers

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Upload failed');
      }

      // Force auto-format and quality to ensure it's treated as a web image
      const optimizedUrl = data.secure_url.replace('/upload/', '/upload/f_auto,q_auto/');

      setIsUploading(false);
      setUploadProgress(100);
      return optimizedUrl;
    } catch (err) {
      setIsUploading(false);
      const msg = err instanceof Error ? err.message : 'Unknown upload error';
      console.error('[Cloudinary Upload Error]', msg);
      setError(msg);
      throw err;
    }
  };

  return { uploadFile, isUploading, uploadProgress, error };
};
