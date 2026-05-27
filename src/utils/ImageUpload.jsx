import { useState } from 'react';
import { uploadToCloudinary} from './cloudinary';

function ImageUpload({ onUploadSuccess, currentImage = null }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImage);
  const [error, setError] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    
    if (!file) return;
    
    setError(null);
    setUploading(true);
    
    try {

      const imageUrl = await uploadToCloudinary(file);
      
      setPreview(imageUrl);
      onUploadSuccess(imageUrl);
    } catch (err) {
      setError(err.message || 'Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onUploadSuccess(null);
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Cover Image
      </label>
      
      <div className="flex items-center gap-4">
        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
          <div className={`px-4 py-2 rounded-lg inline-block transition-colors ${
            uploading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
          } text-white`}>
            {uploading ? 'Uploading...' : preview ? 'Change Image' : 'Upload Cover Image'}
          </div>
        </label>
        
        {preview && !uploading && (
          <button
            type="button"
            onClick={handleRemove}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Remove
          </button>
        )}
      </div>
      
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}
      
      {preview && (
        <div className="relative w-full max-w-2xl">
          <img
            src={preview}
            alt="Cover preview"
            className="w-full h-64 object-cover rounded-lg shadow-md"
          />
        </div>
      )}
    </div>
  );
}

export default ImageUpload;