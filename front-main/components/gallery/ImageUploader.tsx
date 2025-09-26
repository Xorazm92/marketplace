import React, { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { 
  FiUpload, 
  FiX, 
  FiEdit3, 
  FiRotateCw, 
  FiCrop, 
  FiDownload,
  FiEye,
  FiStar
} from 'react-icons/fi';
import { MdDragIndicator } from 'react-icons/md';
import styles from './ImageUploader.module.scss';

interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  url?: string;
  isMain?: boolean;
  cropData?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  metadata?: {
    size: number;
    dimensions: { width: number; height: number };
    format: string;
  };
}

interface ImageUploaderProps {
  maxFiles?: number;
  maxFileSize?: number; // in MB
  acceptedFormats?: string[];
  onImagesChange?: (images: UploadedImage[]) => void;
  enableCropping?: boolean;
  enableWatermark?: boolean;
  autoResize?: boolean;
  compressionQuality?: number;
  className?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  maxFiles = 10,
  maxFileSize = 5,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/webp'],
  onImagesChange,
  enableCropping = true,
  enableWatermark = false,
  autoResize = true,
  compressionQuality = 0.8,
  className = ''
}) => {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [editingImage, setEditingImage] = useState<string | null>(null);
  const [cropMode, setCropMode] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const processImage = useCallback(async (file: File): Promise<UploadedImage> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const img = new window.Image();
        img.onload = async () => {
          let processedFile = file;
          let preview = e.target?.result as string;

          // Auto-resize if enabled
          if (autoResize && (img.width > 1200 || img.height > 1200)) {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            const maxSize = 1200;
            const ratio = Math.min(maxSize / img.width, maxSize / img.height);
            
            canvas.width = img.width * ratio;
            canvas.height = img.height * ratio;
            
            ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            canvas.toBlob((blob) => {
              if (blob) {
                processedFile = new File([blob], file.name, {
                  type: file.type,
                  lastModified: Date.now()
                });
                preview = canvas.toDataURL(file.type, compressionQuality);
              }
              
              resolve({
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                file: processedFile,
                preview,
                metadata: {
                  size: processedFile.size,
                  dimensions: { width: canvas.width, height: canvas.height },
                  format: file.type
                }
              });
            }, file.type, compressionQuality);
          } else {
            resolve({
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
              file: processedFile,
              preview,
              metadata: {
                size: file.size,
                dimensions: { width: img.width, height: img.height },
                format: file.type
              }
            });
          }
        };
        img.src = preview;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }, [autoResize, compressionQuality]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (images.length + acceptedFiles.length > maxFiles) {
      alert(`Maksimal ${maxFiles} ta rasm yuklash mumkin`);
      return;
    }

    setIsUploading(true);
    
    try {
      const processedImages = await Promise.all(
        acceptedFiles.map(file => processImage(file))
      );
      
      const newImages = [...images, ...processedImages];
      
      // Set first image as main if no main image exists
      if (!images.some(img => img.isMain) && newImages.length > 0) {
        newImages[0].isMain = true;
      }
      
      setImages(newImages);
      onImagesChange?.(newImages);
    } catch (error) {
      console.error('Error processing images:', error);
      alert('Rasmlarni yuklashda xatolik yuz berdi');
    } finally {
      setIsUploading(false);
    }
  }, [images, maxFiles, processImage, onImagesChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': acceptedFormats
    },
    maxSize: maxFileSize * 1024 * 1024,
    multiple: true,
    disabled: isUploading || images.length >= maxFiles
  });

  const removeImage = (id: string) => {
    const newImages = images.filter(img => img.id !== id);
    
    // If removed image was main, set first remaining as main
    if (images.find(img => img.id === id)?.isMain && newImages.length > 0) {
      newImages[0].isMain = true;
    }
    
    setImages(newImages);
    onImagesChange?.(newImages);
  };

  const setMainImage = (id: string) => {
    const newImages = images.map(img => ({
      ...img,
      isMain: img.id === id
    }));
    setImages(newImages);
    onImagesChange?.(newImages);
  };

  const reorderImages = (fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    setImages(newImages);
    onImagesChange?.(newImages);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      reorderImages(draggedIndex, index);
      setDraggedIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const cropImage = (imageId: string, cropData: any) => {
    const newImages = images.map(img => 
      img.id === imageId ? { ...img, cropData } : img
    );
    setImages(newImages);
    onImagesChange?.(newImages);
    setCropMode(false);
    setEditingImage(null);
  };

  const rotateImage = async (imageId: string) => {
    const image = images.find(img => img.id === imageId);
    if (!image) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const img = new window.Image();
    
    img.onload = () => {
      canvas.width = img.height;
      canvas.height = img.width;
      
      ctx?.translate(canvas.width / 2, canvas.height / 2);
      ctx?.rotate(Math.PI / 2);
      ctx?.drawImage(img, -img.width / 2, -img.height / 2);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const rotatedFile = new File([blob], image.file.name, {
            type: image.file.type,
            lastModified: Date.now()
          });
          
          const newImages = images.map(img => 
            img.id === imageId 
              ? { ...img, file: rotatedFile, preview: canvas.toDataURL() }
              : img
          );
          setImages(newImages);
          onImagesChange?.(newImages);
        }
      }, image.file.type, compressionQuality);
    };
    
    img.src = image.preview;
  };

  const addWatermark = async (imageId: string) => {
    const image = images.find(img => img.id === imageId);
    if (!image) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const img = new window.Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      ctx?.drawImage(img, 0, 0);
      
      // Add watermark
      if (ctx) {
        ctx.font = '20px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.textAlign = 'right';
        ctx.fillText('INBOLA', canvas.width - 20, canvas.height - 20);
      }
      
      canvas.toBlob((blob) => {
        if (blob) {
          const watermarkedFile = new File([blob], image.file.name, {
            type: image.file.type,
            lastModified: Date.now()
          });
          
          const newImages = images.map(img => 
            img.id === imageId 
              ? { ...img, file: watermarkedFile, preview: canvas.toDataURL() }
              : img
          );
          setImages(newImages);
          onImagesChange?.(newImages);
        }
      }, image.file.type, compressionQuality);
    };
    
    img.src = image.preview;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`${styles.uploader} ${className}`}>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      {/* Upload Zone */}
      {images.length < maxFiles && (
        <div
          {...getRootProps()}
          className={`${styles.dropzone} ${isDragActive ? styles.active : ''} ${isUploading ? styles.uploading : ''}`}
        >
          <input {...getInputProps()} />
          <div className={styles.dropzoneContent}>
            <FiUpload className={styles.uploadIcon} />
            <h3>Rasmlarni yuklang</h3>
            <p>
              {isDragActive
                ? 'Rasmlarni bu yerga tashlang...'
                : 'Rasmlarni bu yerga sudrab olib keling yoki bosing'
              }
            </p>
            <div className={styles.uploadInfo}>
              <span>Maksimal: {maxFiles} ta rasm</span>
              <span>Hajm: {maxFileSize}MB gacha</span>
              <span>Format: JPG, PNG, WebP</span>
            </div>
          </div>
          {isUploading && (
            <div className={styles.uploadingOverlay}>
              <div className={styles.spinner}></div>
              <span>Yuklanmoqda...</span>
            </div>
          )}
        </div>
      )}

      {/* Image Grid */}
      {images.length > 0 && (
        <div className={styles.imageGrid}>
          {images.map((image, index) => (
            <div
              key={image.id}
              className={`${styles.imageItem} ${image.isMain ? styles.mainImage : ''}`}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
            >
              {/* Drag Handle */}
              <div className={styles.dragHandle}>
                <MdDragIndicator />
              </div>

              {/* Main Image Badge */}
              {image.isMain && (
                <div className={styles.mainBadge}>
                  <FiStar />
                  <span>Asosiy</span>
                </div>
              )}

              {/* Image Preview */}
              <div className={styles.imagePreview}>
                <Image
                  src={image.preview}
                  alt={`Yuklangan rasm ${index + 1}`}
                  width={200}
                  height={200}
                  className={styles.previewImage}
                  quality={80}
                />
              </div>

              {/* Image Controls */}
              <div className={styles.imageControls}>
                <button
                  onClick={() => setMainImage(image.id)}
                  className={styles.controlButton}
                  title="Asosiy rasm qilish"
                  disabled={image.isMain}
                >
                  <FiStar />
                </button>

                <button
                  onClick={() => setEditingImage(image.id)}
                  className={styles.controlButton}
                  title="Tahrirlash"
                >
                  <FiEdit3 />
                </button>

                <button
                  onClick={() => rotateImage(image.id)}
                  className={styles.controlButton}
                  title="Aylantirish"
                >
                  <FiRotateCw />
                </button>

                {enableCropping && (
                  <button
                    onClick={() => {
                      setEditingImage(image.id);
                      setCropMode(true);
                    }}
                    className={styles.controlButton}
                    title="Kesish"
                  >
                    <FiCrop />
                  </button>
                )}

                {enableWatermark && (
                  <button
                    onClick={() => addWatermark(image.id)}
                    className={styles.controlButton}
                    title="Watermark qo'shish"
                  >
                    <FiDownload />
                  </button>
                )}

                <button
                  onClick={() => removeImage(image.id)}
                  className={`${styles.controlButton} ${styles.deleteButton}`}
                  title="O'chirish"
                >
                  <FiX />
                </button>
              </div>

              {/* Image Info */}
              <div className={styles.imageInfo}>
                <span className={styles.fileName}>
                  {image.file.name.length > 20 
                    ? image.file.name.substring(0, 20) + '...' 
                    : image.file.name
                  }
                </span>
                <span className={styles.fileSize}>
                  {formatFileSize(image.metadata?.size || 0)}
                </span>
                {image.metadata?.dimensions && (
                  <span className={styles.dimensions}>
                    {image.metadata.dimensions.width} × {image.metadata.dimensions.height}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Summary */}
      {images.length > 0 && (
        <div className={styles.uploadSummary}>
          <span>{images.length} / {maxFiles} ta rasm yuklandi</span>
          <span>
            Jami hajm: {formatFileSize(
              images.reduce((total, img) => total + (img.metadata?.size || 0), 0)
            )}
          </span>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
