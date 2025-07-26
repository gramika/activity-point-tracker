const axios = require('axios');

/**
 * Extract entities from certificate text using a more robust approach
 * This implementation provides better entity extraction for certificate data
 */
const extractEntities = async (text) => {
  try {
    // Option 1: Use a dedicated NLP service (recommended)
    // If you have a spaCy or other NLP service running
    return await extractEntitiesFromService(text);
  } catch (error) {
    console.warn('NLP service error, falling back to pattern matching:', error.message);
    // Option 2: Fall back to improved regex patterns
    return extractEntitiesWithPatterns(text);
  }
};

/**
 * Extract entities using a dedicated NLP service
 * This could be a Python microservice running spaCy or other NLP tools
 */
const extractEntitiesFromService = async (text) => {
  try {
    const response = await axios.post('http://localhost:5002/extract-entities', {
      text: text
    }, {
      timeout: 10000 // 10 seconds timeout
    });
    
    return response.data;
  } catch (error) {
    console.error('NLP Service Error:', error.message);
    throw error;
  }
};

/**
 * Extract entities using improved pattern matching
 * This is a fallback when the NLP service is not available
 */
const extractEntitiesWithPatterns = (text) => {
  // Normalize text - remove extra spaces, normalize line breaks
  const normalizedText = text
    .replace(/\r\n/g, '\n')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Determine the activity category and name
  const activityHead = determineActivityCategory(normalizedText);
  const activityName = determineActivityName(normalizedText);
  
  return {
    names: extractNames(normalizedText),
    eventName: extractEventName(normalizedText),
    dates: extractDates(normalizedText),
    organizations: extractOrganizations(normalizedText),
    certificateType: extractCertificateType(normalizedText),
    eventDuration: extractEventDuration(normalizedText),
    location: extractLocation(normalizedText),
    positions: extractPositions(normalizedText),
    prize: extractPrize(normalizedText),
    activityHead: activityHead,
    activityName: activityName
  };
};

/**
 * Improved name extraction with common certificate patterns
 */
const extractNames = (text) => {
  const names = [];
  
  // Common certificate patterns for names
  const patterns = [
    // "This is to certify that [Name]"
    /(?:this is to certify that|awarded to|presented to|certify that)\s+(?!mr\.|ms\.|mrs\.|dr\.)\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})\b/gi,
    
    // Name with prefix
    /\b(?:Mr\.|Ms\.|Mrs\.|Dr\.)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})\b/g,
    
    // Name in all caps with prefix
    /\b(?:Mr\.|Ms\.|Mrs\.|Dr\.)\s+([A-Z]+(?:\s+[A-Z]+){1,3})\b/g,
    
    // Name with common certificate phrases
    /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})\s+(?:has successfully completed|has participated|has attended|is awarded|was a participant)\b/gi,
    
    // Special case for all caps names (common in certificates)
    /\b([A-Z]+(?:\s+[A-Z]+){1,3})\s+(?:has successfully|has participated|has attended|is awarded|was a participant|of [A-Z]{2,4} for)/i
  ];
  
  // Apply each pattern
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      if (match[1] && match[1].trim()) {
        // Only add if name is reasonable (2-40 chars, contains at least a space)
        const name = match[1].trim();
        if (name.length > 2 && name.length < 40 && name.includes(' ')) {
          names.push(name);
        }
      }
    }
  }
  
  // Remove duplicates
  return [...new Set(names)];
};

/**
 * Improved event name extraction
 */
const extractEventName = (text) => {
  // Arts fest specific patterns
  const artsFestPatterns = [
    /arts\s*fest\s*of\s*([A-Za-z\s]+)/i,
    /([A-Za-z\s]+)\s*-\s*The\s*Arts\s*Fest/i,
    /\b(Sargam\s+Chitram\s+Thalam[\s\S]*?Arts\s+Fest[\s\S]*?(?:College|Engineering|University))\b/i,
    /\b(Arts\s+Fest[\s\S]*?(?:College|Engineering|University))\b/i,
    /\b((?:College|University|School|Institute)\s+Arts\s+Fest[\s\S]*?)\b/i
  ];
  
  for (const pattern of artsFestPatterns) {
    const match = text.match(pattern);
    if (match && match[1] && match[1].trim().length > 3) {
      return match[1].trim();
    }
  }
  
  // Common certificate event patterns
  const eventPatterns = [
    // Certificate of [Event Type]
    /certificate\s+of\s+([A-Za-z\s]+?)(?:\s+(?:for|in|awarded|presented)|\n|$)/i,
    
    // Common event header formats
    /^([A-Z][A-Za-z\s]+(?:workshop|conference|symposium|seminar|competition|hackathon|course|training|webinar|fest).*?)(?:\n|$)/im,
    
    // Event with date format
    /\b([A-Z][A-Za-z\s]+(?:workshop|conference|symposium|seminar|competition|hackathon|course|training|webinar|fest))\s+(?:on|from|held on|conducted on)/i
  ];
  
  for (const pattern of eventPatterns) {
    const match = text.match(pattern);
    if (match && match[1] && match[1].trim().length > 3) {
      return match[1].trim();
    }
  }
  
  // Look for lines containing event keywords
  const eventKeywords = [
    'workshop', 'conference', 'symposium', 'seminar', 'competition', 
    'hackathon', 'fest', 'webinar', 'training', 'program', 'course', 'nptel',
    'collage', 'art'
  ];
  
  const lines = text.split('\n');
  for (const line of lines) {
    const lineLower = line.toLowerCase();
    for (const keyword of eventKeywords) {
      if (lineLower.includes(keyword)) {
        // Don't return very long lines or very short ones
        if (line.length > 5 && line.length < 100) {
          return line.trim();
        }
      }
    }
  }
  
  return 'Unknown Event';
};

/**
 * Improved date extraction
 */
const extractDates = (text) => {
  const datePatterns = [
    // MM/DD/YYYY or DD/MM/YYYY
    /\b(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-](19|20)?\d{2}\b/g,
    
    // YYYY/MM/DD or YYYY-MM-DD
    /\b(19|20)\d{2}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])\b/g,
    
    // Month DD, YYYY
    /\b(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[,\s]+(\d{1,2})(?:st|nd|rd|th)?[,\s]+(19|20\d{2})\b/gi,
    
    // DD Month YYYY
    /\b(\d{1,2})(?:st|nd|rd|th)?[,\s]+(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[,\s]+(19|20\d{2})\b/gi
  ];
  
  let dates = [];
  
  // Apply each pattern
  for (const pattern of datePatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      dates.push(match[0]);
    }
  }
  
  // Look for date ranges
  const dateRangePatterns = [
    // "from [date] to [date]"
    /\bfrom\s+(.{3,30})\s+to\s+(.{3,30})\b/gi,
    
    // "[date] - [date]"
    /\b(\d{1,2}(?:st|nd|rd|th)?[,\s]+(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[,\s]+(?:19|20)\d{2})\s*[-–—]\s*(\d{1,2}(?:st|nd|rd|th)?[,\s]+(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[,\s]+(?:19|20)\d{2})\b/gi,
    
    // Multiple dates separated by commas
    /\b((?:\d{1,2})[,\s]*(?:\d{1,2})[,\s]*(?:\d{1,2}))\s+([A-Za-z]+)[,\s]+((?:19|20)\d{2})\b/gi
  ];
  
  // Apply date range patterns
  for (const pattern of dateRangePatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      dates.push(match[0]);
    }
  }
  
  // Remove duplicates
  return [...new Set(dates)];
};

/**
 * Improved organization extraction
 */
const extractOrganizations = (text) => {
  const organizations = [];
  
  // Common organization indicators in certificates
  const orgPatterns = [
    // Organization followed by common words
    /\b([A-Z][A-Za-z\s]+(?:University|College|Institution|School|Institute|Academy))\b/g,
    
    // Common organization abbreviations
    /\b((?:IIT|NIT|BITS|IIIT|MIT|IEEE|IET|ASME|SAE|NASA|ACM|AICTE|UGC|SCTCE)[A-Za-z\s]*)\b/g,
    
    // Organization with location
    /\b([A-Z][A-Za-z\s]+(?:University|College|Institution|School|Institute|Academy)[,\s]+(?:at|in|of)[,\s]+[A-Za-z\s]+)\b/g
  ];
  
  // Apply each pattern
  for (const pattern of orgPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      if (match[1] && match[1].trim()) {
        organizations.push(match[1].trim());
      }
    }
  }
  
  // Look for organization keywords in context
  const orgKeywords = [
    'university', 'college', 'institution', 'institute', 'school', 'academy',
    'department', 'faculty', 'association', 'society', 'organization',
    'IEEE', 'IET', 'ASME', 'SAE', 'NASA', 'ACM', 'AICTE', 'UGC', 'SCTCE'
  ];
  
  const lines = text.split('\n');
  for (const line of lines) {
    const lineLower = line.toLowerCase();
    for (const keyword of orgKeywords) {
      // Only add if not already captured by patterns above
      if (lineLower.includes(keyword.toLowerCase()) && 
          !organizations.some(org => lineLower.includes(org.toLowerCase()))) {
        // Don't add very long lines
        if (line.length > 3 && line.length < 100) {
          organizations.push(line.trim());
          break;
        }
      }
    }
  }
  
  // Remove duplicates
  return [...new Set(organizations)];
};

/**
 * Extract certificate type
 */
const extractCertificateType = (text) => {
  const certificatePatterns = [
    /\b(certificate of (?:completion|achievement|appreciation|excellence|participation|recognition|merit|attendance))\b/gi,
    /\b((?:completion|achievement|appreciation|excellence|participation|recognition|merit|attendance) certificate)\b/gi
  ];
  
  for (const pattern of certificatePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return 'Certificate';
};

/**
 * Extract event duration
 */
const extractEventDuration = (text) => {
  // Common patterns for duration in certificates
  const durationPatterns = [
    // "X days/weeks/months/hours"
    /\b(\d+)\s+(?:day|days|week|weeks|month|months|hour|hours)\b/i,
    
    // "X-week/month/day"
    /\b(\d+)[-\s](?:day|week|month|hour)\b/i
  ];
  
  for (const pattern of durationPatterns) {
    const match = text.match(pattern);
    if (match && match[0]) {
      return match[0].trim();
    }
  }
  
  return null;
};

/**
 * Extract location
 */
const extractLocation = (text) => {
  // Common location patterns in certificates
  const locationPatterns = [
    // "held at/in [Location]"
    /\bheld\s+(?:at|in)\s+([A-Za-z\s,]+)(?:\s+on|\s+from|\.|,|\n|$)/i,
    
    // "conducted in/at [Location]"
    /\bconducted\s+(?:at|in)\s+([A-Za-z\s,]+)(?:\s+on|\s+from|\.|,|\n|$)/i,
    
    // Location after organization
    /\b(?:University|College|Institution|Institute|School)\s+(?:of|at|in)\s+([A-Za-z\s,]+)(?:\.|,|\n|$)/i
  ];
  
  for (const pattern of locationPatterns) {
    const match = text.match(pattern);
    if (match && match[1] && match[1].trim().length > 2) {
      return match[1].trim();
    }
  }
  
  return null;
};

/**
 * Extract prize or position information
 */
const extractPrize = (text) => {
  const prizePatterns = [
    /\b(?:securing|won|achieved|awarded|bagged)\s+(first|second|third|1st|2nd|3rd|I|II|III|\d+(?:st|nd|rd|th))\s+(?:place|position|prize|rank)/i,
    /\b(first|second|third|1st|2nd|3rd|I|II|III|\d+(?:st|nd|rd|th))\s+(?:place|position|prize|rank)\b/i,
    /\brank\s+(\d+)(?:st|nd|rd|th)?\b/i
  ];
  
  for (const pattern of prizePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return null;
};

/**
 * Extract positions (similar to prize but for array return)
 */
const extractPositions = (text) => {
  const positionPatterns = [
    /\b(?:securing|won|achieved|awarded|bagged)\s+(first|second|third|1st|2nd|3rd|I|II|III|\d+(?:st|nd|rd|th))\s+(?:place|position|prize|rank)/i,
    /\b(first|second|third|1st|2nd|3rd|I|II|III|\d+(?:st|nd|rd|th))\s+(?:place|position|prize|rank)\b/i,
    /\brank\s+(\d+)(?:st|nd|rd|th)?\b/i
  ];
  
  const positions = [];
  
  for (const pattern of positionPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      positions.push(match[1].trim());
    }
  }
  
  return positions;
};

/**
 * Determine the activity category based on text content
 */
const determineActivityCategory = (text) => {
  const textLower = text.toLowerCase();
  
  // Check for arts fest and cultural activities
  if (textLower.includes('arts fest') || 
      textLower.includes('sargam') || 
      textLower.includes('chitram') || 
      textLower.includes('thalam') || 
      textLower.includes('cultural') || 
      textLower.includes('collage competition') ||
      (textLower.includes('collage') && textLower.includes('arts'))) {
    return 'Cultural Activities Participation';
  }
  
  // Check for sports and games
  if (textLower.includes('sports') || 
      textLower.includes('game') || 
      textLower.includes('tournament') || 
      textLower.includes('athletic')) {
    return 'Sports & Games Participation';
  }
  
  // Check for professional self initiatives
  if (textLower.includes('workshop') || 
      textLower.includes('training') || 
      textLower.includes('course') || 
      textLower.includes('nptel') || 
      textLower.includes('certification') || 
      textLower.includes('webinar')) {
    return 'Professional Self Initiatives';
  }
  
  // Default to Professional Self Initiatives
  return 'Professional Self Initiatives';
};

/**
 * Determine the activity name based on text content
 */
const determineActivityName = (text) => {
  const textLower = text.toLowerCase();
  
  // Literary Arts (includes collage)
  if (textLower.includes('collage') || 
      textLower.includes('literary') || 
      textLower.includes('essay') || 
      textLower.includes('poetry') || 
      textLower.includes('writing') || 
      textLower.includes('debate') || 
      textLower.includes('elocution')) {
    return 'Literary Arts';
  }
  
  // Performing Arts
  if (textLower.includes('music') || 
      textLower.includes('dance') || 
      textLower.includes('singing') || 
      textLower.includes('instrument') || 
      textLower.includes('band') || 
      textLower.includes('performance')) {
    return 'Performing Arts';
  }
  
  // Training Course
  if (textLower.includes('workshop') || 
      textLower.includes('training') || 
      textLower.includes('course')) {
    return 'Training Course';
  }
  
  // NPTEL
  if (textLower.includes('nptel')) {
    return 'NPTEL';
  }
  
  // Default to Training Course for Professional initiatives
  return 'Training Course';
};

module.exports = { 
  extractEntities, 
  extractEntitiesFromService, 
  extractEntitiesWithPatterns,
  extractNames,
  extractEventName,
  extractDates,
  extractOrganizations,
  extractCertificateType,
  extractEventDuration,
  extractLocation,
  extractPrize,
  extractPositions,
  determineActivityCategory,
  determineActivityName
};