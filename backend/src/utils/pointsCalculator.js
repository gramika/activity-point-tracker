// /backend/src/utils/pointsCalculator.js
const Event = require('../models/Event');
const { getActivityKeyword } = require('./activityUtils');

// Advanced points calculator based on extracted entities and KTU guidelines
const calculatePoints = async (extractedEntities) => {
  try {
    // Get a keyword-based activity name
    const keywordActivityName = getActivityKeyword(extractedEntities);
    console.log("Keyword activity name:", keywordActivityName);
    
    // Get raw text 
    let rawText = '';
    if (extractedEntities.rawText) {
      rawText = extractedEntities.rawText.toLowerCase();
    }
    
    // Create a searchable text
    const searchText = [
      rawText,
      extractedEntities.eventName || '',
      ...(extractedEntities.organizations || []),
      keywordActivityName || ''
    ].join(' ').toLowerCase();
    
    // Initialize result with basic info
    const result = {
      activityType: extractedEntities.activityHead || 'Unknown',
      activityName: keywordActivityName || extractedEntities.eventName || 'Unknown',
      activityLevel: extractedEntities.activityLevel || 'I',
      activityNumber: extractedEntities.activityNumber || 0,
      points: 0 // Start with 0 points and calculate
    };
    
    // SPECIAL CASE 1: NPTEL Courses always get 50 points
    if (keywordActivityName === 'NPTEL Course' || searchText.includes('nptel')) {
      console.log("NPTEL course detected! Setting points to 50.");
      result.points = 50;
      result.activityName = 'NPTEL Course';
      return result;
    }
    
    // SPECIAL CASE 2: Regular Course Completion Certificates get 6 points
    if ((keywordActivityName === 'Training Course' || 
         searchText.includes('course completion') || 
         searchText.includes('certificate') && searchText.includes('course') && 
         searchText.includes('completing')) && 
        !searchText.includes('nptel')) {
      
      console.log("Course completion certificate detected! Setting points to 6.");
      result.points = 6;
      result.activityName = 'Training Course';
      result.activityType = 'Professional Self Initiatives';
      return result;
    }
    
    // DETERMINE PRIZE TYPE (if any)
    let prizeType = null;
    let prizePoints = 0;
    
    if (searchText.includes('first') || searchText.includes('1st') || 
        searchText.includes('winner') && !searchText.includes('second') && !searchText.includes('third')) {
      prizeType = 'first';
      prizePoints = 10;
    } else if (searchText.includes('second') || searchText.includes('2nd')) {
      prizeType = 'second';
      prizePoints = 8;
    } else if (searchText.includes('third') || searchText.includes('3rd')) {
      prizeType = 'third';
      prizePoints = 6;
    }
    
    if (prizeType) {
      console.log(`Prize detected: ${prizeType} worth ${prizePoints} points`);
    }
    
    // SPECIAL CASE 3: Cultural Activities
    const isCultural = keywordActivityName === 'Cultural Activity' || 
                      result.activityName === 'Cultural Activity' ||
                      searchText.includes('cultural') ||
                      searchText.includes('arts') ||
                      searchText.includes('dance') ||
                      searchText.includes('music') ||
                      searchText.includes('singing') ||
                      searchText.includes('drama');
    
    if (isCultural && result.activityLevel === 'I') {
      // College level (I) cultural activity gets 8 participation points + prize points
      result.points = 8; // Participation points
      result.activityType = 'Cultural Activities Participation';
      result.activityName = 'Cultural Activity';
      
      if (prizeType) {
        result.points += prizePoints;
      }
      
      console.log(`Cultural activity at college level: ${result.points} points (8 participation + ${prizePoints} prize)`);
      return result;
    }
    
    // SPECIAL CASE 4: Sports Activities
    const isSports = keywordActivityName === 'Sports Activity' || 
                    result.activityName === 'Sports Activity' ||
                    searchText.includes('sports') ||
                    searchText.includes('game') ||
                    searchText.includes('athletic') ||
                    searchText.includes('tournament') ||
                    searchText.includes('championship') ||
                    result.activityType.toLowerCase().includes('sports');
    
    if (isSports && result.activityLevel === 'I') {
      // College level (I) sports activity gets 8 participation points + prize points
      result.points = 8; // Participation points
      result.activityType = 'Sports & Games Participation';
      result.activityName = 'Sports Activity';
      
      if (prizeType) {
        result.points += prizePoints;
      }
      
      console.log(`Sports activity at college level: ${result.points} points (8 participation + ${prizePoints} prize)`);
      return result;
    }
    
    // SPECIAL CASE 5: Literary Activities
    const isLiterary = keywordActivityName === 'Literary Activity' ||
                      result.activityName === 'Literary Activity' ||
                      searchText.includes('literary') || 
                      searchText.includes('debate') || 
                      searchText.includes('elocution') || 
                      searchText.includes('quiz') || 
                      searchText.includes('essay');
    
    if (isLiterary && result.activityLevel === 'I') {
      // College level (I) literary activity gets 8 participation points + prize points
      result.points = 8; // Participation points
      
      if (prizeType) {
        result.points += prizePoints;
      }
      
      console.log(`Literary activity at college level: ${result.points} points (8 participation + ${prizePoints} prize)`);
      return result;
    }
    
    // For all other cases, use the points from the database
    // Find events in the database that match keywords
    const allEvents = await Event.find({});
    let bestMatch = null;
    let bestMatchScore = 0;
    
    for (const event of allEvents) {
      for (const keyword of event.keywords) {
        if (searchText.includes(keyword.toLowerCase())) {
          // Score based on keyword length (longer = more specific)
          const score = keyword.length;
          if (score > bestMatchScore) {
            bestMatchScore = score;
            bestMatch = {
              event,
              keyword
            };
          }
        }
      }
    }
    
    // If we found a match, use its details
    if (bestMatch) {
      result.activityType = bestMatch.event.activityHead;
      result.activityNumber = bestMatch.event.activityNumber;
      
      // Get points based on level
      let levelPoints = bestMatch.event.pointsPerLevel[result.activityLevel] || 0;
      
      // Base points
      result.points = levelPoints;
      
      // If it's a prize winner, add prize points
      if (prizeType) {
        result.points += prizePoints;
      }
      
      // Apply any maximum points
      if (bestMatch.event.maxPoints) {
        result.points = Math.min(result.points, bestMatch.event.maxPoints);
      }
    } else {
      // Default to 10 points if no match
      result.points = 10;
    }
    
    // If Python service has provided points and none were calculated
    if (extractedEntities.pointsAwarded && result.points === 0) {
      result.points = extractedEntities.pointsAwarded;
    }
    
    console.log("Final points calculation result:", result);
    return result;
  } catch (error) {
    console.error('Error in points calculation:', error);
    return {
      activityType: extractedEntities.activityHead || 'Unknown',
      activityName: getActivityKeyword(extractedEntities) || extractedEntities.eventName || 'Unknown',
      activityLevel: extractedEntities.activityLevel || 'I',
      points: extractedEntities.pointsAwarded || 10
    };
  }
};

module.exports = { calculatePoints };