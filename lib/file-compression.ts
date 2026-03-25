/**
 * Compress image files before upload to reduce transfer time
 */
export async function compressImage(file: File, maxSizeKB: number = 500): Promise<File> {
  // Skip PDFs
  if (file.type === 'application/pdf') {
    return file;
  }

  // Create canvas for compression
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Scale down if needed
        const maxDimension = 1920;
        if (width > maxDimension || height > maxDimension) {
          const ratio = Math.min(maxDimension / width, maxDimension / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Compress to target size
        let quality = 0.8;
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }

            // If still too large, reduce quality
            if (blob.size > maxSizeKB * 1024 && quality > 0.5) {
              quality -= 0.1;
              canvas.toBlob(
                (retryBlob) => {
                  const compressedFile = new File([retryBlob || blob], file.name, {
                    type: 'image/jpeg',
                    lastModified: file.lastModified,
                  });
                  resolve(compressedFile);
                },
                'image/jpeg',
                quality
              );
            } else {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: file.lastModified,
              });
              resolve(compressedFile);
            }
          },
          'image/jpeg',
          quality
        );
      };
    };
  });
}

/**
 * Get human-readable file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
