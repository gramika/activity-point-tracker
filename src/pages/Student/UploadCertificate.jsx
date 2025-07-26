import { useState } from 'react';
import { uploadCertificate } from '../../services/api';
import Loader from '../../components/common/Loader';
import Message from '../../components/common/Message';

const UploadCertificate = ({ onSuccess }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file to upload');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const formData = new FormData();
      formData.append('certificate', file);
      
      const response = await uploadCertificate(formData);
      
      setSuccess('Certificate uploaded successfully! Points have been allocated.');
      onSuccess(response.data);
      
      // Reset form
      setFile(null);
      setPreview(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload certificate');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Upload New Certificate</h2>
      
      {error && <Message variant="error">{error}</Message>}
      {success && <Message variant="success">{success}</Message>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Certificate (JPG, PNG, or PDF)
          </label>
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-medium
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
        </div>
        
        {preview && (
          <div className="mt-2">
            <p className="text-sm text-gray-700 mb-1">Preview:</p>
            <img
              src={preview}
              alt="Certificate preview"
              className="max-h-48 rounded border border-gray-300"
            />
          </div>
        )}
        
        <div>
          <p className="text-sm text-gray-500 mb-2">
            Note: The system will automatically extract information from your certificate
            and assign activity points according to the KTU guidelines.
          </p>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded w-full"
        >
          {loading ? <Loader /> : 'Upload Certificate'}
        </button>
      </form>
    </div>
  );
};

export default UploadCertificate;