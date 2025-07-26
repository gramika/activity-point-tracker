import { useState } from 'react';
import * as XLSX from 'xlsx';

const StudentsList = ({ 
  students, 
  onSelectStudent, 
  onSelectCertificate, 
  selectedStudentId 
}) => {
  const [exportingStudentId, setExportingStudentId] = useState(null);
  
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
  
  const calculateTotalPoints = (certificates) => {
    return certificates.reduce((sum, cert) => {
      if (cert.status !== 'rejected') {
        return sum + cert.pointsAwarded;
      }
      return sum;
    }, 0);
  };
  
  const getPendingCount = (certificates) => {
    return certificates.filter(cert => cert.status === 'pending').length;
  };
  
  // Helper function to extract a more specific activity keyword
  const getActivityKeyword = (activityName, activityType) => {
    const activityNameLower = (activityName || '').toLowerCase();
    
    // Check for specific keywords in the activity name
    if (activityNameLower.includes('nptel')) return 'NPTEL Course';
    if (activityNameLower.includes('mooc')) return 'MOOC Course';
    if (activityNameLower.includes('python') || 
        activityNameLower.includes('programming') || 
        activityNameLower.includes('course')) return 'Training Course';
    if (activityNameLower.includes('workshop')) return 'Workshop';
    if (activityNameLower.includes('tech fest') || activityNameLower.includes('techfest')) return 'Tech Fest';
    if (activityNameLower.includes('paper')) return 'Paper Presentation';
    if (activityNameLower.includes('hackathon')) return 'Hackathon';
    if (activityNameLower.includes('competition')) return 'Competition';
    if (activityNameLower.includes('internship')) return 'Internship';
    if (activityNameLower.includes('ncc')) return 'NCC';
    if (activityNameLower.includes('nss')) return 'NSS';
    
    // If no specific keyword found, use the activity type
    return activityType || 'Unknown Activity';
  };

  // Helper function to determine the organizing body
  const determineOrganizingBody = (organizations, activityName) => {
    if (!organizations || organizations.length === 0) {
      // Try to extract from activity name if no organizations found
      const activityNameLower = (activityName || '').toLowerCase();
      
      // Check for common organizations in the activity name
      if (activityNameLower.includes('iit')) return 'IIT';
      if (activityNameLower.includes('nit')) return 'NIT';
      if (activityNameLower.includes('ktu')) return 'KTU';
      if (activityNameLower.includes('ieee')) return 'IEEE';
      if (activityNameLower.includes('techlearn')) return 'TechLearn';
      
      return 'Not Specified';
    }
    
    // Return the first organization found
    return organizations[0];
  };
  
  // Function to export individual student data as Excel
  const handleExportStudentData = (student, certificates) => {
    try {
      setExportingStudentId(student._id);
      
      // Sort certificates by activity name for consistent ordering
      const sortedCerts = [...certificates]
        .filter(cert => cert.status !== 'rejected')  // Only include non-rejected certificates
        .sort((a, b) => (a.activityName || '').localeCompare(b.activityName || ''));
      
      // Create a workbook
      const wb = XLSX.utils.book_new();
      
      // Create worksheet data
      // Start with student name as a title row
      const wsData = [
        [student.name], // Student name as title
        [], // Empty row
        ['Activity Type', 'Activity Level', 'Points', 'Organizing Body'], // Headers without Student Name
      ];
      
      // Add data for each certificate
      sortedCerts.forEach(cert => {
        const activityKeyword = getActivityKeyword(cert.activityName, cert.activityType);
        const organizingBody = determineOrganizingBody(cert.extractedData?.entities?.organizations || [], cert.activityName);
        
        wsData.push([
          activityKeyword,
          cert.activityLevel || '',
          cert.pointsAwarded || 0,
          organizingBody
        ]);
      });
      
      // Add empty row before summary
      if (sortedCerts.length > 0) {
        wsData.push([]);
      }
      
      // Add summary information
      const totalPoints = calculateTotalPoints(certificates);
      wsData.push(['SUMMARY']);
      wsData.push(['Total Certificates', sortedCerts.length]);
      wsData.push(['Total Points', totalPoints]);
      
      // Create worksheet from data
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      
      // Set column widths
      ws['!cols'] = [
        { wch: 25 },  // Activity Type
        { wch: 15 },  // Activity Level
        { wch: 10 },  // Points
        { wch: 25 },  // Organizing Body
      ];
      
      // Add style to the student name (make it larger)
      if (ws.A1) {
        ws.A1.s = { font: { bold: true, sz: 14 } };
      }
      
      // Add a worksheet to the workbook
      XLSX.utils.book_append_sheet(wb, ws, "Activity Points");
      
      // Format date for filename
      const now = new Date();
      const dateStr = now.toLocaleDateString().replace(/\//g, '-');
      
      // Generate Excel file and trigger download
      XLSX.writeFile(wb, `${student.name}_Activity_Points_${dateStr}.xlsx`);
      
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setExportingStudentId(null);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b">
        <h2 className="text-xl font-semibold">Students and Certificates</h2>
      </div>
      
      {students.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          No students have uploaded certificates yet.
        </div>
      ) : (
        <div>
          {students.map(({ student, certificates }) => (
            <div key={student._id} className="border-b last:border-b-0">
              <div 
                className={`p-4 ${
                  selectedStudentId === student._id ? 'bg-blue-50' : ''
                } cursor-pointer hover:bg-gray-50`}
                onClick={() => onSelectStudent(student)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-lg">{student.name}</h3>
                    <p className="text-gray-600 text-sm">{student.email}</p>
                  </div>
                  <div className="text-right flex items-center">
                    <div className="mr-4">
                      <p className="font-medium">
                        {calculateTotalPoints(certificates)} points
                      </p>
                      {getPendingCount(certificates) > 0 && (
                        <p className="text-yellow-600 text-sm">
                          {getPendingCount(certificates)} pending
                        </p>
                      )}
                    </div>
                    
                    {/* Export button for individual student */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent opening student details
                        handleExportStudentData(student, certificates);
                      }}
                      className="text-gray-600 hover:text-blue-600"
                      title="Export student data as Excel"
                      disabled={exportingStudentId === student._id}
                    >
                      {exportingStudentId === student._id ? (
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
              
              {selectedStudentId === student._id && (
                <div className="bg-gray-50 px-4 py-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Certificates
                  </h4>
                  <div className="space-y-2">
                    {certificates.map(cert => (
                      <div 
                        key={cert._id} 
                        className="bg-white p-3 rounded border flex justify-between items-center cursor-pointer hover:bg-blue-50"
                        onClick={() => onSelectCertificate(cert)}
                      >
                        <div>
                          <p className="font-medium">{cert.activityName}</p>
                          <p className="text-sm text-gray-600">{cert.activityType}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{cert.pointsAwarded} points</p>
                          <div className="mt-1">{getStatusBadge(cert.status)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentsList;