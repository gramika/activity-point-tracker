import { useState } from 'react';
import { exportToExcel } from '../../utils/exportUtils';
import * as XLSX from 'xlsx';

const ClassSummary = ({ certificates, students }) => {
  const [isExporting, setIsExporting] = useState(false);
  
  // Enhanced helper function to extract a more specific activity keyword
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

  // Helper function to determine the organizing body
  const determineOrganizingBody = (certificate) => {
    // Check for NPTEL first since it's a specific case
    if (certificate.extractedData && certificate.extractedData.rawText &&
        certificate.extractedData.rawText.toLowerCase().includes('nptel')) {
      return 'NPTEL';
    }
    
    // Then check organizations from extracted data
    if (certificate.extractedData && certificate.extractedData.entities && 
        certificate.extractedData.entities.organizations && 
        certificate.extractedData.entities.organizations.length > 0) {
      return certificate.extractedData.entities.organizations[0];
    }
    
    // Try to extract from activity name if no organizations found
    const activityNameLower = (certificate.activityName || '').toLowerCase();
    
    // Check for common organizations in the activity name
    if (activityNameLower.includes('nptel')) return 'NPTEL';
    if (activityNameLower.includes('iit')) return 'IIT';
    if (activityNameLower.includes('nit')) return 'NIT';
    if (activityNameLower.includes('ktu')) return 'KTU';
    if (activityNameLower.includes('ieee')) return 'IEEE';
    if (activityNameLower.includes('techlearn')) return 'TechLearn';
    
    return 'Not Specified';
  };
  
  // Function to export detailed student certificate data with total points as Excel
  const handleExportData = () => {
    try {
      setIsExporting(true);
      
      // Format date for filename
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      // Sort students alphabetically for consistent ordering
      const sortedStudents = [...students].sort((a, b) => a.name.localeCompare(b.name));
      
      // Group by student and create workbook directly
      const workbook = XLSX.utils.book_new();
      
      // Prepare worksheet data as array of arrays (for more control over formatting)
      const wsData = [
        ['Student Name', 'Activity Type', 'Activity Level', 'Points', 'Organizing Body']
      ];
      
      // Track the last student name to know when to add totals
      let lastStudentName = '';
      let currentStudentTotal = 0;
      let currentStudentRow = 1; // Start after header
      let studentStartRow = 1; // Track where each student's data begins
      
      // Process each student and their certificates
      for (const student of sortedStudents) {
        const studentCerts = certificates.filter(cert => 
          cert.user && cert.user._id === student._id && cert.status !== 'rejected'
        );
        
        // Sort certificates by activity name
        const sortedCerts = [...studentCerts].sort((a, b) => 
          (a.activityName || '').localeCompare(b.activityName || '')
        );
        
        // If this is a new student, update tracking variables
        if (lastStudentName !== student.name) {
          // If we had a previous student, add their total
          if (lastStudentName && currentStudentTotal > 0) {
            wsData.push(['', '', 'Total Points', currentStudentTotal, '']);
            currentStudentRow++;
            // Add empty row for separation
            wsData.push(['', '', '', '', '']);
            currentStudentRow++;
          }
          
          // Reset for new student
          lastStudentName = student.name;
          currentStudentTotal = 0;
          studentStartRow = currentStudentRow;
        }
        
        // If no certificates, add one row for the student
        if (sortedCerts.length === 0) {
          wsData.push([
            student.name,
            'No certificates',
            '',
            0,
            'None'
          ]);
          currentStudentRow++;
        } else {
          // Add a row for each certificate of this student
          sortedCerts.forEach(cert => {
            // Extract the activity keyword
            const activityKeyword = getActivityKeyword(cert);
            
            // Determine the organizing body
            const organizingBody = determineOrganizingBody(cert);
            
            // Add to student's total points
            const points = cert.pointsAwarded || 0;
            currentStudentTotal += points;
            
            wsData.push([
              student.name,
              activityKeyword,
              cert.activityLevel || '',
              points,
              organizingBody
            ]);
            currentStudentRow++;
          });
        }
      }
      
      // Add total for the last student
      if (lastStudentName && currentStudentTotal > 0) {
        wsData.push(['', '', 'Total Points', currentStudentTotal, '']);
      }
      
      // Create the worksheet
      const worksheet = XLSX.utils.aoa_to_sheet(wsData);
      
      // Add column widths for better readability
      worksheet['!cols'] = [
        { wch: 25 },  // Student Name
        { wch: 25 },  // Activity Type
        { wch: 15 },  // Activity Level
        { wch: 10 },  // Points
        { wch: 25 },  // Organizing Body
      ];
      
      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Student Activities');
      
      // Generate the Excel file and trigger download
      XLSX.writeFile(workbook, `Class_Activity_Points_${dateStr}.xlsx`);
      
    } catch (error) {
      console.error('Export failed:', error);
      alert(`Failed to export data: ${error.message || 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
  };
  
  // Calculate summary statistics - explicitly exclude rejected certificates
  const totalStudents = students.length;
  const studentsWithCertificates = new Set(
    certificates
      .filter(cert => cert.status !== 'rejected')
      .map(cert => cert.user?._id)
  ).size;
  
  const totalCertificates = certificates.filter(cert => cert.status !== 'rejected').length;
  const totalPoints = certificates
    .filter(cert => cert.status !== 'rejected')
    .reduce((sum, cert) => sum + (cert.pointsAwarded || 0), 0);
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Class Summary</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800">Total Students</h3>
          <p className="text-2xl font-bold text-blue-900">{totalStudents}</p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-green-800">Students with Certificates</h3>
          <p className="text-2xl font-bold text-green-900">{studentsWithCertificates}</p>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-purple-800">Total Certificates</h3>
          <p className="text-2xl font-bold text-purple-900">{totalCertificates}</p>
        </div>
        
        <div className="bg-amber-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-amber-800">Total Points</h3>
          <p className="text-2xl font-bold text-amber-900">{totalPoints}</p>
        </div>
      </div>
      
      {/* Export button */}
      <div className="mt-6">
        <button
          onClick={handleExportData}
          disabled={isExporting || students.length === 0}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded transition-colors disabled:bg-green-300 flex items-center justify-center"
          title="Export student points data as Excel"
        >
          {isExporting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Exporting...
            </>
          ) : (
            <>
              <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export Excel Report
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ClassSummary;