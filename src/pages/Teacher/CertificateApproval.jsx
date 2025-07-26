import { useState } from 'react';
import { updateCertificateStatus } from '../../services/api';
import Loader from '../../components/common/Loader';
import Message from '../../components/common/Message';

const CertificateApproval = ({ certificate, onUpdate, onBack }) => {
  const [status, setStatus] = useState(certificate.status);
  const [points, setPoints] = useState(certificate.pointsAwarded);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Enhanced helper function to get a more descriptive activity name
  const getActivityKeyword = (certificate) => {
    // Check if it's an NPTEL certificate by examining all available data
    if (certificate) {
      // Check in the rawText if available
      if (certificate.extractedData && certificate.extractedData.rawText) {
        const rawTextLower = certificate.extractedData.rawText.toLowerCase();
        
        // NPTEL check
        if (rawTextLower.includes('nptel')) {
          return 'NPTEL Course';
        }
        
        // Fix for startup event vs actual startup
        if (rawTextLower.includes('startup') || rawTextLower.includes('start-up') || 
            rawTextLower.includes('start up')) {
          // Check if it's just a volunteer/event or an actual registered startup
          if (rawTextLower.includes('volunteer') || rawTextLower.includes('event') || 
              rawTextLower.includes('fest') || rawTextLower.includes('workshop') ||
              rawTextLower.includes('conference') || rawTextLower.includes('talk')) {
            // It's an event related to startups, not an actual startup
            if (rawTextLower.includes('workshop') || rawTextLower.includes('conference')) {
              return 'Startup Workshop';
            }
            return 'Startup Event';
          }
          // Check if it's a legally registered startup
          if (rawTextLower.includes('registered') || rawTextLower.includes('incorporation') || 
              rawTextLower.includes('company registration') || rawTextLower.includes('llc') || 
              rawTextLower.includes('pvt ltd') || rawTextLower.includes('private limited')) {
            return 'Registered Startup Company';
          }
        }
      }
      
      // Check in activity name and file name
      const activityNameLower = (certificate.activityName || '').toLowerCase();
      const fileNameLower = (certificate.fileName || '').toLowerCase();
      
      // NPTEL check in activity name or file name
      if (activityNameLower.includes('nptel') || fileNameLower.includes('nptel')) {
        return 'NPTEL Course';
      }
      
      // Startup classification checks
      if (activityNameLower.includes('startup') || activityNameLower.includes('start-up') || 
          fileNameLower.includes('startup') || fileNameLower.includes('start-up')) {
        // Check for registered startup vs event
        if (activityNameLower.includes('volunteer') || activityNameLower.includes('event') || 
            activityNameLower.includes('fest') || activityNameLower.includes('workshop') || 
            fileNameLower.includes('volunteer') || fileNameLower.includes('event')) {
          if (activityNameLower.includes('workshop') || fileNameLower.includes('workshop')) {
            return 'Startup Workshop';
          }
          return 'Startup Event';
        }
        if (activityNameLower.includes('registered') || activityNameLower.includes('company') || 
            fileNameLower.includes('registered') || fileNameLower.includes('company')) {
          return 'Registered Startup Company';
        }
      }
      
      // Check in all other fields for various keywords
      const activityTypeLower = (certificate.activityType || '').toLowerCase();
      const combinedText = activityNameLower + ' ' + activityTypeLower + ' ' + fileNameLower;
      
      // Checking for various keywords
      if (combinedText.includes('mooc')) return 'MOOC Course';
      if (combinedText.includes('python') || 
          combinedText.includes('programming') || 
          combinedText.includes('course')) return 'Training Course';
      if (combinedText.includes('workshop')) return 'Workshop';
      if (combinedText.includes('tech fest') || combinedText.includes('techfest')) return 'Tech Fest';
      if (combinedText.includes('paper')) return 'Paper Presentation';
      if (combinedText.includes('hackathon')) return 'Hackathon';
      if (combinedText.includes('competition')) return 'Competition';
      if (combinedText.includes('internship')) return 'Internship';
      if (combinedText.includes('ncc')) return 'NCC';
      if (combinedText.includes('nss')) return 'NSS';
    }
    
    // Default to activity type if available, or Unknown
    return certificate?.activityType || 'Unknown Activity';
  };
  
  const handleUpdateCertificate = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const response = await updateCertificateStatus(certificate._id, {
        status,
        pointsAwarded: parseInt(points),
      });
      
      setSuccess('Certificate updated successfully');
      onUpdate(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update certificate');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Get the keyword-based activity name
  const keywordActivityName = getActivityKeyword(certificate);
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b flex justify-between items-center">
        <h2 className="text-xl font-semibold">Certificate Review</h2>
        <button 
          onClick={onBack}
          className="text-blue-600 hover:text-blue-800"
        >
          Back to List
        </button>
      </div>
      
      <div className="p-6">
        {error && <Message variant="error">{error}</Message>}
        {success && <Message variant="success">{success}</Message>}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-3">Certificate Details</h3>
            
            <div className="border rounded-lg overflow-hidden">
              <img
                src={`http://localhost:5000/${certificate.filePath.replace('backend/', '')}`}
                alt="Certificate"
                className="w-full h-auto"
              />
              
              <div className="p-4 space-y-2">
                <div>
                  <p className="text-sm text-gray-500">Student</p>
                  <p className="font-medium">{certificate.user.name}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Activity Type</p>
                  <p>{certificate.activityType}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Activity Name</p>
                  <p>{keywordActivityName}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Activity Level</p>
                  <p>{certificate.activityLevel}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Uploaded On</p>
                  <p>{new Date(certificate.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-3">Review and Approval</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Points to Award
                </label>
                <input
                  type="number"
                  min="0"
                  value={points}
                  onChange={(e) => setPoints(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Suggested points based on KTU guidelines: {certificate.pointsAwarded}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              
              <div className="pt-4">
                <button
                  onClick={handleUpdateCertificate}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
                >
                  {loading ? <Loader /> : 'Update Certificate'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateApproval;