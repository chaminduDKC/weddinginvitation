import imageCompression from 'browser-image-compression';

export interface CompressionResult {
  file: File;
  originalSizeMb: number;
  compressedSizeMb: number;
  previewUrl: string;
}

/**
 * Compresses large mobile camera uploads (often 5MB - 15MB)
 * down to ~300KB - 600KB before transmission over the network.
 */
export const compressPaymentSlip = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<CompressionResult> => {
  const originalSizeMb = Number((file.size / (1024 * 1024)).toFixed(2));

  // If already under 600KB, skip heavy compression
  if (file.size <= 600 * 1024) {
    return {
      file,
      originalSizeMb,
      compressedSizeMb: originalSizeMb,
      previewUrl: URL.createObjectURL(file),
    };
  }

  const options = {
    maxSizeMB: 0.6, // Target ~600KB maximum
    maxWidthOrHeight: 1600, // Sufficient for readable receipt/bank slip details
    useWebWorker: true,
    fileType: 'image/jpeg',
    onProgress: (p: number) => {
      if (onProgress) onProgress(p);
    },
  };

  try {
    const compressedBlob = await imageCompression(file, options);
    const compressedFile = new File([compressedBlob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
      type: 'image/jpeg',
      lastModified: Date.now(),
    });

    const compressedSizeMb = Number((compressedFile.size / (1024 * 1024)).toFixed(2));
    const previewUrl = URL.createObjectURL(compressedFile);

    return {
      file: compressedFile,
      originalSizeMb,
      compressedSizeMb,
      previewUrl,
    };
  } catch (error) {
    console.warn('Client-side compression fallback to original file:', error);
    return {
      file,
      originalSizeMb,
      compressedSizeMb: originalSizeMb,
      previewUrl: URL.createObjectURL(file),
    };
  }
};
