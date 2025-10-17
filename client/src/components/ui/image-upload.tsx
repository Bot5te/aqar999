import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Upload } from "lucide-react";

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

export function ImageUpload({ images = [], onChange, maxImages = 10 }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setIsUploading(true);
    const newFiles = Array.from(e.target.files);
    const availableSlots = maxImages - images.length;
    
    // Limit the number of images that can be uploaded at once
    const filesToProcess = newFiles.slice(0, availableSlots);
    
    // Create an array to hold processed files
    const processedFiles: Promise<string>[] = [];
    
    // Process each file
    for (const file of filesToProcess) {
      processedFiles.push(
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result as string);
          };
          reader.readAsDataURL(file);
        })
      );
    }
    
    // When all files are processed, update the state
    Promise.all(processedFiles)
      .then(newImages => {
        onChange([...images, ...newImages]);
        setIsUploading(false);
        // Reset the input value so the same file can be selected again
        e.target.value = '';
      });
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    onChange(newImages);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {images.map((image, index) => (
          <div 
            key={index} 
            className="relative group aspect-square bg-gray-100 rounded-md overflow-hidden"
          >
            <img 
              src={image} 
              alt={`Uploaded image ${index + 1}`} 
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => handleRemoveImage(index)}
              className="absolute top-2 right-2 bg-white/80 hover:bg-white text-red-600 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="حذف الصورة"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        
        {images.length < maxImages && (
          <div className="aspect-square border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center p-2 hover:border-primary transition-colors">
            <input 
              type="file"
              id="image-upload"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
              disabled={isUploading}
            />
            <label 
              htmlFor="image-upload"
              className="w-full h-full flex flex-col items-center justify-center cursor-pointer text-neutral-500 hover:text-primary"
            >
              <Upload className="w-10 h-10 mb-2" />
              <span className="text-sm text-center">
                {isUploading ? 'جاري رفع الصور...' : 'انقر لإضافة صورة'}
              </span>
              <span className="text-xs text-center mt-1">
                {images.length} / {maxImages}
              </span>
            </label>
          </div>
        )}
      </div>
      
      {images.length > 0 && (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-red-600 border-red-200 hover:border-red-600 hover:bg-red-50"
            onClick={() => onChange([])}
          >
            حذف جميع الصور
          </Button>
        </div>
      )}
    </div>
  );
}