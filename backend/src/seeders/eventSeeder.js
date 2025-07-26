// /backend/src/seeders/eventSeeder.js
const mongoose = require('mongoose');
const Event = require('../models/Event');
const dotenv = require('dotenv');
const connectDB = require('../config/db');

// Load env vars
dotenv.config();

// Connect to DB
connectDB();

// KTU Activity Points data
const eventData = [
  // National Initiatives Participation
  {
    name: 'NCC',
    activityHead: 'National Initiatives Participation',
    activityNumber: '1',
    keywords: ['ncc', 'national cadet corps'],
    pointsPerLevel: {
      I: 60,
      II: 60,
      III: 60,
      IV: 60,
      V: 60
    },
    maxPoints: 60,
    minDuration: '2 Year',
    approvalDocuments: 'a/b',
    hasSpecialRules: true,
    specialRules: 'For C certificate / outstanding performance supported by certification, additional marks upto 20 can be provided subjected to maximum limit of 80 points.'
  },
  {
    name: 'NSS',
    activityHead: 'National Initiatives Participation',
    activityNumber: '2',
    keywords: ['nss', 'national service scheme'],
    pointsPerLevel: {
      I: 60,
      II: 60,
      III: 60,
      IV: 60,
      V: 60
    },
    maxPoints: 60,
    minDuration: '2 Year',
    approvalDocuments: 'a/b',
    hasSpecialRules: true,
    specialRules: 'Best NSS Volunteer Awardee (University level) / Participation in National Integration Camp / Pre Republic Day Parade Camp (South India), supported by certification, additional marks upto 10 can be provided subjected to maximum limit of 70 points. Best NSS Volunteer Awardee (State / National level) / Participation in Republic Day Parade Camp / International Youth Exchange Programme, supported by certification, additional marks upto 20 can be provided subjected to maximum limit of 80 points.'
  },
  
  // Sports & Games Participation
  {
    name: 'Sports',
    activityHead: 'Sports & Games Participation',
    activityNumber: '3',
    keywords: ['sports', 'athletics', 'tournament', 'football', 'cricket', 'basketball', 'volleyball', 'badminton', 'tennis'],
    pointsPerLevel: {
      I: 8,
      II: 15,
      III: 25,
      IV: 40,
      V: 60
    },
    prizePoints: {
      first: {
        I: 10,
        II: 10,
        III: 10,
        IV: 20,
        V: 20
      },
      second: {
        I: 8,
        II: 8,
        III: 8,
        IV: 16,
        V: 16
      },
      third: {
        I: 5,
        II: 5,
        III: 5,
        IV: 12,
        V: 12
      }
    },
    maxPoints: 60,
    minDuration: '1 Year',
    approvalDocuments: 'a',
    hasSpecialRules: true,
    specialRules: 'Additional points can be provided for winning. The maximum limit for activity points is 60. But for Level IV and V winning, the maximum point limit is enhanced to 80.'
  },
  {
    name: 'Games',
    activityHead: 'Sports & Games Participation',
    activityNumber: '4',
    keywords: ['games', 'chess', 'carrom', 'table tennis'],
    pointsPerLevel: {
      I: 8,
      II: 15,
      III: 25,
      IV: 40,
      V: 60
    },
    prizePoints: {
      first: {
        I: 10,
        II: 10,
        III: 10,
        IV: 20,
        V: 20
      },
      second: {
        I: 8,
        II: 8,
        III: 8,
        IV: 16,
        V: 16
      },
      third: {
        I: 5,
        II: 5,
        III: 5,
        IV: 12,
        V: 12
      }
    },
    maxPoints: 60,
    minDuration: '1 Year',
    approvalDocuments: 'a',
    hasSpecialRules: true,
    specialRules: 'Additional points can be provided for winning. The maximum limit for activity points is 60. But for Level IV and V winning, the maximum point limit is enhanced to 80.'
  },
  
  // Cultural Activities Participation
  {
    name: 'Music',
    activityHead: 'Cultural Activities Participation',
    activityNumber: '5',
    keywords: ['music', 'singing', 'choir', 'band', 'orchestra'],
    pointsPerLevel: {
      I: 8,
      II: 12,
      III: 20,
      IV: 40,
      V: 60
    },
    prizePoints: {
      first: {
        I: 10,
        II: 10,
        III: 10,
        IV: 20,
        V: 20
      },
      second: {
        I: 8,
        II: 8,
        III: 8,
        IV: 16,
        V: 16
      },
      third: {
        I: 5,
        II: 5,
        III: 5,
        IV: 12,
        V: 12
      }
    },
    maxPoints: 60,
    minDuration: '1 Year',
    approvalDocuments: 'a',
    hasSpecialRules: true,
    specialRules: 'Additional points can be provided for winning. The maximum limit for activity points is 60. But for Level IV and V winning, the maximum point limit is enhanced to 80.'
  },
  {
    name: 'Performing Arts',
    activityHead: 'Cultural Activities Participation',
    activityNumber: '6',
    keywords: ['performing arts', 'dance', 'drama', 'theatre', 'mime', 'skit'],
    pointsPerLevel: {
      I: 8,
      II: 12,
      III: 20,
      IV: 40,
      V: 60
    },
    prizePoints: {
      first: {
        I: 10,
        II: 10,
        III: 10,
        IV: 20,
        V: 20
      },
      second: {
        I: 8,
        II: 8,
        III: 8,
        IV: 16,
        V: 16
      },
      third: {
        I: 5,
        II: 5,
        III: 5,
        IV: 12,
        V: 12
      }
    },
    maxPoints: 60,
    minDuration: '1 Year',
    approvalDocuments: 'a',
    hasSpecialRules: true,
    specialRules: 'Additional points can be provided for winning. The maximum limit for activity points is 60. But for Level IV and V winning, the maximum point limit is enhanced to 80.'
  },
  {
    name: 'Literary Arts',
    activityHead: 'Cultural Activities Participation',
    activityNumber: '7',
    keywords: ['literary arts', 'debate', 'elocution', 'essay', 'poetry', 'writing','collage'],
    pointsPerLevel: {
      I: 8,
      II: 12,
      III: 20,
      IV: 40,
      V: 60
    },
    prizePoints: {
      first: {
        I: 10,
        II: 10,
        III: 10,
        IV: 20,
        V: 20
      },
      second: {
        I: 8,
        II: 8,
        III: 8,
        IV: 16,
        V: 16
      },
      third: {
        I: 5,
        II: 5,
        III: 5,
        IV: 12,
        V: 12
      }
    },
    maxPoints: 60,
    minDuration: '1 Year',
    approvalDocuments: 'a',
    hasSpecialRules: true,
    specialRules: 'Additional points can be provided for winning. The maximum limit for activity points is 60. But for Level IV and V winning, the maximum point limit is enhanced to 80.'
  },
  
  // Professional Self Initiatives
  {
    name: 'Tech Fest, Tech Quiz',
    activityHead: 'Professional Self Initiatives',
    activityNumber: '8',
    keywords: ['tech fest', 'techfest', 'tech quiz', 'technical quiz', 'technical festival'],
    pointsPerLevel: {
      I: 10,
      II: 20,
      III: 30,
      IV: 40,
      V: 50
    },
    maxPoints: 50,
    approvalDocuments: 'a'
  },
  {
    name: 'MOOC with final assessment certificate',
    activityHead: 'Professional Self Initiatives',
    activityNumber: '9',
    keywords: [
      'nptel', 'mooc', 'massive open online course', 'online certification',
      'swayam', 'online course certification', 'nptel certification'
    ],
    pointsPerLevel: {
      I: 50,
      II: 50,
      III: 50,
      IV: 50,
      V: 50
    },
    maxPoints: 50,
    approvalDocuments: 'a'
  },
  {
    name: 'Competitions by Professional Societies',
    activityHead: 'Professional Self Initiatives',
    activityNumber: '10',
    keywords: ['ieee', 'iet', 'asme', 'sae', 'nasa', 'competition', 'hackathon', 'codeathon'],
    pointsPerLevel: {
      I: 10,
      II: 15,
      III: 20,
      IV: 30,
      V: 40
    },
    maxPoints: 40,
    approvalDocuments: 'a'
  },
  {
    name: 'Conference/Workshop/Training at IITs/NITs',
    activityHead: 'Professional Self Initiatives',
    activityNumber: '11',
    keywords: [
      'workshop', 'training', 'course', 'seminar', 'conference','webinar',
      'iit', 'nit', 'national institute of technology', 'indian institute of technology'
    ],
    pointsPerLevel: {
      I: 15,
      II: 15,
      III: 15,
      IV: 15,
      V: 15
    },
    maxPoints: 30,
    approvalDocuments: 'a'
  },
  {
    name: 'Conference/Workshop/Training at KTU or affiliated institutes',
    activityHead: 'Professional Self Initiatives',
    activityNumber: '11a',
    keywords: [
      'course', 'workshop', 'training', 'certificate of completion',
      'programming course', 'python programming', 'workshop certificate',
      'training certificate', 'learning certificate', 'techlearn'
    ],
    pointsPerLevel: {
      I: 6,
      II: 6,
      III: 6,
      IV: 6,
      V: 6
    },
    maxPoints: 12,
    approvalDocuments: 'a'
  },
  {
    name: 'Paper Presentation/Publication at IITs/NITs',
    activityHead: 'Professional Self Initiatives',
    activityNumber: '12',
    keywords: ['paper presentation', 'paper publication', 'research paper', 'iit', 'nit'],
    pointsPerLevel: {
      I: 20,
      II: 20,
      III: 20,
      IV: 20,
      V: 20
    },
    maxPoints: 40,
    approvalDocuments: 'a',
    hasSpecialRules: true,
    specialRules: 'Additional 10 points for certificate of recognition.'
  },
  {
    name: 'Paper Presentation/Publication at KTU',
    activityHead: 'Professional Self Initiatives',
    activityNumber: '12a',
    keywords: ['paper presentation', 'paper publication', 'research paper', 'ktu'],
    pointsPerLevel: {
      I: 8,
      II: 8,
      III: 8,
      IV: 8,
      V: 8
    },
    maxPoints: 16,
    approvalDocuments: 'a',
    hasSpecialRules: true,
    specialRules: 'Additional 2 points for certificate of recognition.'
  },
  {
    name: 'Poster Presentation at IITs/NITs',
    activityHead: 'Professional Self Initiatives',
    activityNumber: '13',
    keywords: ['poster presentation', 'poster', 'iit', 'nit'],
    pointsPerLevel: {
      I: 10,
      II: 10,
      III: 10,
      IV: 10,
      V: 10
    },
    maxPoints: 20,
    approvalDocuments: 'a',
    hasSpecialRules: true,
    specialRules: 'Additional 10 points for certificate of recognition.'
  },
  {
    name: 'Poster Presentation at KTU',
    activityHead: 'Professional Self Initiatives',
    activityNumber: '13a',
    keywords: ['poster presentation', 'poster', 'ktu'],
    pointsPerLevel: {
      I: 4,
      II: 4,
      III: 4,
      IV: 4,
      V: 4
    },
    maxPoints: 8,
    approvalDocuments: 'a',
    hasSpecialRules: true,
    specialRules: 'Additional 2 points for certificate of recognition.'
  },
  {
    name: 'Industrial Training/Internship',
    activityHead: 'Professional Self Initiatives',
    activityNumber: '14',
    keywords: ['industrial training', 'internship', 'training', 'intern'],
    pointsPerLevel: {
      I: 20,
      II: 20,
      III: 20,
      IV: 20,
      V: 20
    },
    maxPoints: 20,
    approvalDocuments: 'a/b'
  },
  {
    name: 'Industrial/Exhibition Visits',
    activityHead: 'Professional Self Initiatives',
    activityNumber: '15',
    keywords: ['industrial visit', 'exhibition visit', 'industry visit'],
    pointsPerLevel: {
      I: 5,
      II: 5,
      III: 5,
      IV: 5,
      V: 5
    },
    maxPoints: 10,
    approvalDocuments: 'a/b/d'
  },
  {
    name: 'Foreign Language Skill',
    activityHead: 'Professional Self Initiatives',
    activityNumber: '16',
    keywords: ['toefl', 'ielts', 'bec', 'foreign language', 'language certification'],
    pointsPerLevel: {
      I: 50,
      II: 50,
      III: 50,
      IV: 50,
      V: 50
    },
    maxPoints: 50,
    approvalDocuments: 'a'
  },
  
  // Entrepreneurship and Innovation
  {
    name: 'Start-up Company - Registered legally',
    activityHead: 'Entrepreneurship and Innovation',
    activityNumber: '17',
    keywords: ['startup', 'start-up', 'registered company'],
    pointsPerLevel: {
      I: 60,
      II: 60,
      III: 60,
      IV: 60,
      V: 60
    },
    maxPoints: 60,
    approvalDocuments: 'd'
  },
  {
    name: 'Patent-Filed',
    activityHead: 'Entrepreneurship and Innovation',
    activityNumber: '18',
    keywords: ['patent filed', 'patent application'],
    pointsPerLevel: {
      I: 30,
      II: 30,
      III: 30,
      IV: 30,
      V: 30
    },
    maxPoints: 60,
    approvalDocuments: 'd'
  },
  {
    name: 'Patent-Published',
    activityHead: 'Entrepreneurship and Innovation',
    activityNumber: '19',
    keywords: ['patent published', 'published patent'],
    pointsPerLevel: {
      I: 35,
      II: 35,
      III: 35,
      IV: 35,
      V: 35
    },
    maxPoints: 60,
    approvalDocuments: 'd'
  },
  {
    name: 'Patent-Approved',
    activityHead: 'Entrepreneurship and Innovation',
    activityNumber: '20',
    keywords: ['patent approved', 'approved patent', 'patent granted'],
    pointsPerLevel: {
      I: 50,
      II: 50,
      III: 50,
      IV: 50,
      V: 50
    },
    maxPoints: 60,
    approvalDocuments: 'd'
  },
  {
    name: 'Patent-Licensed',
    activityHead: 'Entrepreneurship and Innovation',
    activityNumber: '21',
    keywords: ['patent licensed', 'licensed patent'],
    pointsPerLevel: {
      I: 80,
      II: 80,
      III: 80,
      IV: 80,
      V: 80
    },
    maxPoints: 80,
    approvalDocuments: 'd'
  },
  {
    name: 'Prototype developed and tested',
    activityHead: 'Entrepreneurship and Innovation',
    activityNumber: '22',
    keywords: ['prototype', 'prototype development', 'product prototype'],
    pointsPerLevel: {
      I: 60,
      II: 60,
      III: 60,
      IV: 60,
      V: 60
    },
    maxPoints: 60,
    approvalDocuments: 'd'
  },
  {
    name: 'Awards for Products developed',
    activityHead: 'Entrepreneurship and Innovation',
    activityNumber: '23',
    keywords: ['product award', 'award winning product', 'product development award'],
    pointsPerLevel: {
      I: 60,
      II: 60,
      III: 60,
      IV: 60,
      V: 60
    },
    maxPoints: 60,
    approvalDocuments: 'd'
  },
  {
    name: 'Innovative technologies developed and used by industries/users',
    activityHead: 'Entrepreneurship and Innovation',
    activityNumber: '24',
    keywords: ['innovative technology', 'technology development', 'industry technology'],
    pointsPerLevel: {
      I: 60,
      II: 60,
      III: 60,
      IV: 60,
      V: 60
    },
    maxPoints: 60,
    approvalDocuments: 'd'
  },
  {
    name: 'Got venture capital funding for innovative ideas/products',
    activityHead: 'Entrepreneurship and Innovation',
    activityNumber: '25',
    keywords: ['venture capital', 'funding', 'investor funding', 'seed funding'],
    pointsPerLevel: {
      I: 80,
      II: 80,
      III: 80,
      IV: 80,
      V: 80
    },
    maxPoints: 80,
    approvalDocuments: 'd'
  },
  {
    name: 'Startup Employment',
    activityHead: 'Entrepreneurship and Innovation',
    activityNumber: '26',
    keywords: ['startup employment', 'startup jobs', 'startup hiring'],
    pointsPerLevel: {
      I: 80,
      II: 80,
      III: 80,
      IV: 80,
      V: 80
    },
    maxPoints: 80,
    approvalDocuments: 'd'
  },
  {
    name: 'Societal innovations',
    activityHead: 'Entrepreneurship and Innovation',
    activityNumber: '27',
    keywords: ['societal innovation', 'social innovation', 'community innovation'],
    pointsPerLevel: {
      I: 50,
      II: 50,
      III: 50,
      IV: 50,
      V: 50
    },
    maxPoints: 50,
    approvalDocuments: 'd'
  },
  
  // Leadership & Management
  {
    name: 'Student Professional Societies - Core Coordinator',
    activityHead: 'Leadership & Management',
    activityNumber: '28',
    keywords: ['ieee', 'iet', 'asme', 'sae', 'nasa', 'core coordinator', 'coordinator', 'chairperson', 'president'],
    pointsPerLevel: {
      I: 15,
      II: 15,
      III: 15,
      IV: 15,
      V: 15
    },
    maxPoints: 40,
    approvalDocuments: 'd'
  },
  {
    name: 'Student Professional Societies - Sub Coordinator',
    activityHead: 'Leadership & Management',
    activityNumber: '28',
    keywords: ['ieee', 'iet', 'asme', 'sae', 'nasa', 'sub coordinator', 'joint secretary', 'vice president', 'treasurer'],
    pointsPerLevel: {
      I: 10,
      II: 10,
      III: 10,
      IV: 10,
      V: 10
    },
    maxPoints: 40,
    approvalDocuments: 'd'
  },
  {
    name: 'Student Professional Societies - Volunteer',
    activityHead: 'Leadership & Management',
    activityNumber: '28',
    keywords: ['ieee', 'iet', 'asme', 'sae', 'nasa', 'volunteer', 'member'],
    pointsPerLevel: {
      I: 5,
      II: 5,
      III: 5,
      IV: 5,
      V: 5
    },
    maxPoints: 40,
    approvalDocuments: 'd'
  },
  {
    name: 'College Association Chapters - Core Coordinator',
    activityHead: 'Leadership & Management',
    activityNumber: '29',
    keywords: ['college association', 'chapter', 'mechanical', 'civil', 'electrical', 'core coordinator', 'coordinator', 'chairperson', 'president'],
    pointsPerLevel: {
      I: 15,
      II: 15,
      III: 15,
      IV: 15,
      V: 15
    },
    maxPoints: 40,
    approvalDocuments: 'd'
  },
  {
    name: 'Festival & Technical Events - Core Coordinator',
    activityHead: 'Leadership & Management',
    activityNumber: '30',
    keywords: ['festival', 'technical event', 'tech event', 'core coordinator', 'coordinator', 'chairperson', 'president'],
    pointsPerLevel: {
      I: 15,
      II: 15,
      III: 15,
      IV: 15,
      V: 15
    },
    maxPoints: 40,
    approvalDocuments: 'd'
  },
  {
    name: 'Hobby Clubs - Core Coordinator',
    activityHead: 'Leadership & Management',
    activityNumber: '31',
    keywords: ['hobby club', 'club', 'core coordinator', 'coordinator', 'chairperson', 'president'],
    pointsPerLevel: {
      I: 15,
      II: 15,
      III: 15,
      IV: 15,
      V: 15
    },
    maxPoints: 40,
    approvalDocuments: 'd'
  },
  {
    name: 'Elected Student Representatives - Chairman',
    activityHead: 'Leadership & Management',
    activityNumber: '32',
    keywords: ['elected student representative', 'student representative', 'chairman', 'chairperson'],
    pointsPerLevel: {
      I: 30,
      II: 30,
      III: 30,
      IV: 30,
      V: 30
    },
    maxPoints: 60,
    approvalDocuments: 'd'
  },
  {
    name: 'Elected Student Representatives - Secretary',
    activityHead: 'Leadership & Management',
    activityNumber: '32',
    keywords: ['elected student representative', 'student representative', 'secretary'],
    pointsPerLevel: {
      I: 25,
      II: 25,
      III: 25,
      IV: 25,
      V: 25
    },
    maxPoints: 60,
    approvalDocuments: 'd'
  },
  {
    name: 'Elected Student Representatives - Council Member',
    activityHead: 'Leadership & Management',
    activityNumber: '32',
    keywords: ['elected student representative', 'student representative', 'council member', 'committee member'],
    pointsPerLevel: {
      I: 15,
      II: 15,
      III: 15,
      IV: 15,
      V: 15
    },
    maxPoints: 60,
    approvalDocuments: 'd'
  }
];

// Import Events to DB
const importEvents = async () => {
  try {
    await Event.deleteMany();
    console.log('Previous events deleted');
    
    await Event.insertMany(eventData);
    console.log('KTU activity events imported successfully');
    
    process.exit();
  } catch (error) {
    console.error(`Error importing events: ${error.message}`);
    process.exit(1);
  }
};

// Delete all Events from DB
const destroyEvents = async () => {
  try {
    await Event.deleteMany();
    console.log('All events deleted successfully');
    
    process.exit();
  } catch (error) {
    console.error(`Error deleting events: ${error.message}`);
    process.exit(1);
  }
};

// Process command line arguments
if (process.argv[2] === '-d') {
  destroyEvents();
} else {
  importEvents();
}