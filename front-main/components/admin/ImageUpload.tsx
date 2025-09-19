import React, { useState, useRef, useCallback } from 'react';
import { FiUpload, FiX, FiImage, FiAlertCircle } from 'react-icons/fi';
import { MdOutlineCameraAlt } from 'react-icons/md';
import styles from './ImageUpload.module.scss';

interface ImageFile {
  file: File;
  preview: string;
  id: string;
}

interface ImageUploadProps {
  images: File[];
  onImagesChange: (images: File[]) => void;
  maxImages?: number;
  maxFileSize?: number; // in MB
  acceptedFormats?: string[];
  error?: string;
  required?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  images,
  onImagesChange,
  maxImages = 10,
  maxFileSize = 5,
  acceptedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  error,
  required = false
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Convert File array to ImageFile array for preview
  React.useEffect(() => {
    const newImageFiles: ImageFile[] = images.map((file, index) => ({
      file,
      preview: URL.createObjectURL(file),
      id: `${file.name}-${index}-${Date.now()}`
    }));
    
    // Cleanup old object URLs
    imageFiles.forEach(img => URL.revokeObjectURL(img.preview));
    setImageFiles(newImageFiles);
    
    return () => {
      newImageFiles.forEach(img => URL.revokeObjectURL(img.preview));
    };
  }, [images]);

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!acceptedFormats.includes(file.type)) {
      return `Fayl turi qo'llab-quvvatlanmaydi. Ruxsat etilgan: ${acceptedFormats.join(', ')}`;
    }

    // Check file size
    const fileSizeMB = file.size / 1024 / 1024;
    if (fileSizeMB > maxFileSize) {
      return `Fayl hajmi ${maxFileSize}MB dan oshmasligi kerak. Sizning fayl: ${fileSizeMB.toFixed(2)}MB`;
    }

    return null;
  };

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    const errors: string[] = [];

    // Check total count
    if (images.length + fileArray.length > maxImages) {
      errors.push(`Maksimal ${maxImages} ta rasm yuklash mumkin`);
      return;
    }

    // Validate each file
    fileArray.forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      console.error('File validation errors:', errors);
      // You can show these errors to user via toast or state
      return;
    }

    // Add valid files to existing images
    const newImages = [...images, ...validFiles];
    onImagesChange(newImages);
  }, [images, maxImages, maxFileSize, acceptedFormats, onImagesChange]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    // Reset input value to allow selecting same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (indexToRemove: number) => {
    const newImages = images.filter((_, index) => index !== indexToRemove);
    onImagesChange(newImages);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={styles.imageUpload}>
      <div className={styles.uploadHeader}>
        <label className={styles.label}>
          Mahsulot rasmlari {required && <span className={styles.required}>*</span>}
        </label>
        <div className={styles.uploadInfo}>
          {images.length}/{maxImages} ta rasm
        </div>
      </div>

      {/* Upload Area */}
      <div
        className={`${styles.uploadArea} ${dragActive ? styles.dragActive : ''} ${error ? styles.error : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={triggerFileInput}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedFormats.join(',')}
          onChange={handleInputChange}
          className={styles.hiddenInput}
        />
        
        <div className={styles.uploadContent}>
          <div className={styles.uploadIcon}>
            <MdOutlineCameraAlt size={32} />
          </div>
          <div className={styles.uploadText}>
            <div className={styles.primaryText}>
              Rasmlarni bu yerga sudrab olib keling yoki
            </div>
            <button type="button" className={styles.browseButton}>
              Fayllarni tanlang
            </button>
          </div>
          <div className={styles.uploadHint}>
            PNG, JPG, WEBP (maks. {maxFileSize}MB har biri)
          </div>
        </div>
      </div>

      {/* Image Preview Grid */}
      {imageFiles.length > 0 && (
        <div className={styles.previewGrid}>
          {imageFiles.map((imageFile, index) => (
            <div key={imageFile.id} className={styles.previewItem}>
              <div className={styles.imageContainer}>
                <img
                  src={imageFile.preview}
                  alt={`Preview ${index + 1}`}
                  className={styles.previewImage}
                />
                <button
                  type="button"
                  className={styles.removeButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(index);
                  }}
                >
                  <FiX size={16} />
                </button>
              </div>
              <div className={styles.imageInfo}>
                <div className={styles.imageName} title={imageFile.file.name}>
                  {imageFile.file.name.length > 20 
                    ? `${imageFile.file.name.substring(0, 20)}...` 
                    : imageFile.file.name
                  }
                </div>
                <div className={styles.imageSize}>
                  {formatFileSize(imageFile.file.size)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className={styles.errorMessage}>
          <FiAlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Upload Guidelines */}
      <div className={styles.guidelines}>
        <div className={styles.guidelineTitle}>Rasm yuklash qoidalari:</div>
        <ul className={styles.guidelineList}>
          <li>Maksimal {maxImages} ta rasm yuklash mumkin</li>
          <li>Har bir rasm hajmi {maxFileSize}MB dan oshmasligi kerak</li>
          <li>Qo'llab-quvvatlanadigan formatlar: JPG, PNG, WEBP</li>
          <li>Eng yaxshi natija uchun 1:1 nisbatdagi (kvadrat) rasmlar tavsiya etiladi</li>
          <li>Birinchi rasm mahsulotning asosiy rasmi bo'ladi</li>
        </ul>
      </div>
    </div>
  );
};

export default ImageUpload;
