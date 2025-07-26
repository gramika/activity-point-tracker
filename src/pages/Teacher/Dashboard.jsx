import { useState, useEffect, useContext } from 'react';
import { getClassCertificates } from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import Loader from '../../components/common/Loader';
import Message from '../../components/common/Message';
import StudentsList from './StudentsList';
import CertificateApproval from './CertificateApproval';
import ClassSummary from './ClassSummary';

const Dashboard = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  
  const { userInfo } = useContext(AuthContext);
  
  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        setLoading(true);
        const response = await getClassCertificates(userInfo.class);
        setCertificates(response.data);
      } catch (err) {
        setError('Failed to fetch certificates');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCertificates();
  }, [userInfo.class]);
  
  const handleCertificateUpdate = (updatedCertificate) => {
    setCertificates(
      certificates.map(cert => 
        cert._id === updatedCertificate._id ? updatedCertificate : cert
      )
    );
    setSelectedCertificate(null);
  };
  
  // Group certificates by student
  const studentCertificates = certificates.reduce((acc, cert) => {
    if (!cert.user) return acc;
    
    const studentId = cert.user._id;
    if (!acc[studentId]) {
      acc[studentId] = {
        student: cert.user,
        certificates: []
      };
    }
    
    acc[studentId].certificates.push(cert);
    return acc;
  }, {});
  
  const studentsList = Object.values(studentCertificates);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Teacher Dashboard - {userInfo.name}
        </h1>
        <p className="text-gray-600 mt-1">Class: {userInfo.class}</p>
      </div>
      
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="error">{error}</Message>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {selectedCertificate ? (
              <CertificateApproval
                certificate={selectedCertificate}
                onUpdate={handleCertificateUpdate}
                onBack={() => setSelectedCertificate(null)}
              />
            ) : (
              <StudentsList
                students={studentsList}
                onSelectStudent={setSelectedStudent}
                onSelectCertificate={setSelectedCertificate}
                selectedStudentId={selectedStudent?._id}
              />
            )}
          </div>
          
          <div>
            <ClassSummary
              certificates={certificates}
              students={studentsList.map(item => item.student)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;