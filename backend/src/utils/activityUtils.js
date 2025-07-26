// /backend/src/utils/activityUtils.js

/**
 * Gets a simplified keyword-based activity name from certificate data
 * @param {Object} certificate - The certificate object or extracted data
 * @returns {String} - A simplified activity name keyword
 */
const getActivityKeyword = (certificate) => {
    try {
      // Collect all text sources to check for keywords
      let rawText = '';
      
      // Get raw text from certificate data (check all possible locations)
      if (certificate.extractedData && certificate.extractedData.rawText) {
        rawText = certificate.extractedData.rawText.toLowerCase();
      } else if (certificate.rawText) {
        rawText = certificate.rawText.toLowerCase();
      }
      
      // Get other relevant text fields
      const fileName = (certificate.fileName || '').toLowerCase();
      const eventName = (certificate.eventName || '').toLowerCase();
      const activityName = (certificate.activityName || '').toLowerCase();
      const activityType = (certificate.activityType || '').toLowerCase();
      
      // Check for organizations if available
      const organizations = [];
      if (certificate.organizations) {
        organizations.push(...certificate.organizations);
      } else if (certificate.extractedData && certificate.extractedData.entities && 
                certificate.extractedData.entities.organizations) {
        organizations.push(...certificate.extractedData.entities.organizations);
      }
      
      const orgText = organizations.join(' ').toLowerCase();
      
      // Combine all text sources for comprehensive checking
      const allText = `${rawText} ${fileName} ${eventName} ${activityName} ${orgText} ${activityType}`;
      
      console.log("Activity Type:", activityType);
      
      // HIGHEST PRIORITY: Direct activity type mapping
      if (activityType.includes('sports') || activityType.includes('games')) {
        return 'Sports Activity';
      }
      
      if (activityType.includes('cultural')) {
        return 'Cultural Activity';
      }
      
      if (activityType.includes('literary')) {
        return 'Literary Activity';
      }
      
      // First check for highest priority categories
      
      // 1. First priority - NPTEL
      if (allText.includes('nptel')) {
        return 'NPTEL Course';
      }
      
      // 2. Second priority - Specific roles and positions
      if (allText.includes('intern') || allText.includes('internship')) {
        return 'Internship';
      }
      
      // 3. Sports and athletic activities (high priority)
      if (allText.includes('sports') || 
          allText.includes('sport') || 
          allText.includes('athletic') || 
          allText.includes('athletics') ||
          allText.includes('tournament') || 
          allText.includes('championship') ||
          allText.includes('olympic') ||
          allText.includes('football') ||
          allText.includes('cricket') ||
          allText.includes('basketball') ||
          allText.includes('volleyball') ||
          allText.includes('badminton') ||
          allText.includes('tennis') ||
          allText.includes('swimming') ||
          allText.includes('athletics') ||
          allText.includes('medal')) {
        
        return 'Sports Activity';
      }
      
      // 4. Cultural and literary activities (high priority)
      if (allText.includes('cultural') || 
          allText.includes('dance') || 
          allText.includes('music') ||
          allText.includes('singing') ||
          allText.includes('performance') ||
          allText.includes('drama') ||
          allText.includes('theatre') ||
          allText.includes('art') ||
          allText.includes('painting')) {
        
        return 'Cultural Activity';
      }
      
      if (allText.includes('literary') || 
          allText.includes('debate') || 
          allText.includes('elocution') ||
          allText.includes('quiz') ||
          allText.includes('essay') ||
          allText.includes('writing') ||
          allText.includes('speech') ||
          allText.includes('poetry')) {
        
        return 'Literary Activity';
      }
      
      // 5. Program affiliations
      if (allText.includes('ncc')) return 'NCC';
      if (allText.includes('nss')) return 'NSS';
      if (allText.includes('ieee')) return 'IEEE Activity';
      if (allText.includes('acm')) return 'ACM Activity';
      
      // 6. Specific events
      if (allText.includes('hackathon')) return 'Hackathon';
      if (allText.includes('workshop')) return 'Workshop';
      if (allText.includes('tech fest') || allText.includes('techfest')) return 'Tech Fest';
      if (allText.includes('paper presentation') || 
          (allText.includes('paper') && allText.includes('presentation'))) return 'Paper Presentation';
      if (allText.includes('competition')) return 'Competition';
      if (allText.includes('volunteer') || allText.includes('volunteering')) return 'Volunteering';
      
      // 7. Educational courses
      if (allText.includes('course') || 
          allText.includes('certification') || 
          allText.includes('certificate') || 
          allText.includes('training')) {
        
        // More specific course types
        if (allText.includes('deep learning')) return 'Deep Learning Course';
        if (allText.includes('machine learning') || allText.includes(' ml ')) return 'Machine Learning Course';
        if (allText.includes('artificial intelligence') || allText.includes(' ai ')) return 'AI Course';
        if (allText.includes('python')) return 'Python Course';
        if (allText.includes('java')) return 'Java Course';
        if (allText.includes('web development') || allText.includes('web design')) return 'Web Development Course';
        if (allText.includes('data science') || allText.includes('data analysis')) return 'Data Science Course';
        
        return 'Training Course';
      }
      
      // Keep the original activity name if coming from points calculation
      // This ensures we don't break existing functionality
      if (certificate.extractedData && 
          certificate.extractedData.pointsCalculation && 
          certificate.extractedData.pointsCalculation.activityName) {
        
        // Check if the activity name is specific enough
        const calculatedName = certificate.extractedData.pointsCalculation.activityName;
        if (calculatedName !== 'Unknown Event' && 
            calculatedName !== 'Unknown Activity' && 
            calculatedName !== 'Unknown') {
          return calculatedName;
        }
      }
      
      // Preserve the activity name from the certificate if available
      if (certificate.activityName && 
          certificate.activityName !== 'Unknown Event' && 
          certificate.activityName !== 'Unknown Activity' && 
          certificate.activityName !== 'Unknown') {
        return certificate.activityName;
      }
      
      // Default to activity type or a general name
      return certificate.activityType || 'Professional Self Initiatives';
    } catch (error) {
      console.error('Error in getActivityKeyword:', error);
      // In case of error, return a default or the original activity name if available
      return certificate.activityName || 'Activity';
    }
  };
  
  module.exports = { getActivityKeyword };