import { useState, useEffect, useContext } from 'react';
import { getUserCertificates } from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import Loader from '../../components/common/Loader';
import Message from '../../components/common/Message';
import UploadCertificate from './UploadCertificate';
import CertificatesList from './CertificatesList';
import PointsSummary from './PointsSummary';

const Dashboard = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);
  
  const { userInfo } = useContext(AuthContext);
  
  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const response = await getUserCertificates();
      setCertificates(response.data);
    } catch (err) {
      setError('Failed to fetch certificates');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchCertificates();
  }, []);
  
  const handleUploadSuccess = (newCertificate) => {
    setCertificates([...certificates, newCertificate]);
    setShowUploadForm(false);
  };
  
  const handleDeleteSuccess = () => {
    // Refresh the certificates list after deletion
    fetchCertificates();
  };
  
  const totalPoints = certificates.reduce((sum, cert) => {
    if (cert.status === 'approved' || cert.status === 'pending') {
      return sum + cert.pointsAwarded;
    }
    return sum;
  }, 0);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Student Dashboard - {userInfo.name}
          </h1>
          <p className="text-gray-600 mt-1">Class: {userInfo.class}</p>
        </div>
        
        <button
          onClick={() => setShowUploadForm(!showUploadForm)}
          className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {showUploadForm ? 'Cancel Upload' : 'Upload Certificate'}
        </button>
      </div>
      
      {showUploadForm && (
        <div className="bg-gray-100 p-4 rounded-lg mb-8">
          <UploadCertificate onSuccess={handleUploadSuccess} />
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          {loading ? (
            <Loader />
          ) : error ? (
            <Message variant="error">{error}</Message>
          ) : certificates.length === 0 ? (
            <Message variant="info">
              You haven't uploaded any certificates yet.
            </Message>
          ) : (
            <CertificatesList 
              certificates={certificates} 
              onDeleteSuccess={handleDeleteSuccess}
            />
          )}
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <PointsSummary 
            totalPoints={totalPoints}
            requiredPoints={100}
            certificates={certificates}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;