import { useState } from 'react';
import { deleteCertificate } from '../../services/api';
const CertificatesList = ({ certificates, onDeleteSuccess }) => {
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${statusClasses[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };
  
  const handleViewDetails = (certificate) => {
    setSelectedCertificate(certificate);
  };
  
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this certificate?')) {
      try {
        setLoading(true);
        setError('');
        await deleteCertificate(id);
        setSuccessMessage('Certificate deleted successfully');
        
        // Close the modal if open
        if (selectedCertificate && selectedCertificate._id === id) {
          setSelectedCertificate(null);
        }
        
        // Call the parent component's callback to refresh the list
        if (onDeleteSuccess) {
          onDeleteSuccess();
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete certificate');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };
  
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">My Certificates</h2>
      
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 relative">
          {successMessage}
          <button 
            className="absolute top-0 right-0 px-4 py-3" 
            onClick={() => setSuccessMessage('')}
          >
            &times;
          </button>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 relative">
          {error}
          <button 
            className="absolute top-0 right-0 px-4 py-3" 
            onClick={() => setError('')}
          >
            &times;
          </button>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 table-fixed">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                Certificate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">
                Activity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                Points
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {certificates.map((certificate) => (
              <tr key={certificate._id}>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {certificate.fileName}
                  </div>
                  <div className="text-sm text-gray-500">
                    Uploaded: {new Date(certificate.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 truncate" title={certificate.activityName}>
                    {certificate.activityName}
                  </div>
                  <div className="text-sm text-gray-500 truncate" title={certificate.activityType}>
                    {certificate.activityType}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{certificate.pointsAwarded}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(certificate.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button
                    onClick={() => handleViewDetails(certificate)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleDelete(certificate._id)}
                    className="text-red-600 hover:text-red-900"
                    disabled={loading}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {selectedCertificate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-semibold">Certificate Details</h3>
                <button
                  onClick={() => setSelectedCertificate(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  &times;
                </button>
              </div>
              
              <div className="mt-4 space-y-4">
                <div>
                  <h4 className="text-lg font-medium">Certificate Preview</h4>
                  <div className="mt-2 border rounded p-2 text-center">
                    <img
                      src={`http://localhost:5000/${selectedCertificate.filePath}`}
                      alt="Certificate"
                      className="max-h-64 mx-auto"
                      onError={(e) => {
                        console.error("Image failed to load");
                        e.target.src = "https://via.placeholder.com/400x300?text=Certificate+Preview+Unavailable";
                      }}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Activity Type</h4>
                    <p>{selectedCertificate.activityType}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Activity Name</h4>
                    <p>{selectedCertificate.activityName}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Activity Level</h4>
                    <p>{selectedCertificate.activityLevel}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Points Awarded</h4>
                    <p>{selectedCertificate.pointsAwarded}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Status</h4>
                    <p>{getStatusBadge(selectedCertificate.status)}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Upload Date</h4>
                    <p>{new Date(selectedCertificate.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="flex justify-end mt-4">
                  <button
                    onClick={() => handleDelete(selectedCertificate._id)}
                    className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded"
                    disabled={loading}
                  >
                    {loading ? 'Deleting...' : 'Delete Certificate'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default CertificatesList;