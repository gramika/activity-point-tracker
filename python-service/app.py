from flask import Flask, request, jsonify
from flask_cors import CORS
import pytesseract
import spacy
from PIL import Image
import os
import re
import json

app = Flask(__name__)
CORS(app)

# Load Spacy NLP model
nlp = spacy.load("en_core_web_sm")

# Define KTU activity categories and keywords
KTU_ACTIVITIES = {
    "National Initiatives Participation": {
        "keywords": ["ncc", "nss", "national initiatives"],
        "events": {
            "ncc": {"number": 1, "points": 60},
            "nss": {"number": 2, "points": 60}
        }
    },
    "Sports & Games Participation": {
        "keywords": ["sports", "games", "tournament", "athletics", "football", "cricket", "basketball", "volleyball"],
        "events": {
            "sports": {"number": 3, "points": {"I": 8, "II": 15, "III": 25, "IV": 40, "V": 60}},
            "games": {"number": 4, "points": {"I": 8, "II": 15, "III": 25, "IV": 40, "V": 60}}
        }
    },
    "Cultural Activities Participation": {
        "keywords": ["music", "dance", "singing", "drama", "arts", "literary"],
        "events": {
            "music": {"number": 5, "points": {"I": 8, "II": 12, "III": 20, "IV": 40, "V": 60}},
            "performing arts": {"number": 6, "points": {"I": 8, "II": 12, "III": 20, "IV": 40, "V": 60}},
            "literary arts": {"number": 7, "points": {"I": 8, "II": 12, "III": 20, "IV": 40, "V": 60}}
        }
    },
    "Professional Self Initiatives": {
        "keywords": ["techfest", "tech fest", "tech quiz", "competition", "workshop", "conference", "seminar", "paper", "poster", "ieee", "iet", "asme", "sae", "nasa", "nptel", "internship", "training", "course", "programming"],
        "events": {
            "tech fest": {"number": 8, "points": {"I": 10, "II": 20, "III": 30, "IV": 40, "V": 50}},
            "mooc": {"number": 9, "points": 50},
            "competition": {"number": 10, "points": {"I": 10, "II": 15, "III": 20, "IV": 30, "V": 40}},
            "conference": {"number": 11, "points": {"IIT/NIT": 15, "KTU": 6}},
            "workshop": {"number": "11a", "points": {"IIT/NIT": 15, "KTU": 6}},
            "course": {"number": "11a", "points": {"IIT/NIT": 15, "KTU": 6}},
            "paper presentation": {"number": 12, "points": {"IIT/NIT": 20, "KTU": 8}},
            "poster presentation": {"number": 13, "points": {"IIT/NIT": 10, "KTU": 4}},
            "internship": {"number": 14, "points": 20}
        }
    },
    "Entrepreneurship and Innovation": {
        "keywords": ["startup", "patent", "prototype", "innovation", "entrepreneurship", "venture capital"],
        "events": {
            "startup": {"number": 17, "points": 60},
            "patent filed": {"number": 18, "points": 30},
            "patent published": {"number": 19, "points": 35},
            "patent approved": {"number": 20, "points": 50},
            "patent licensed": {"number": 21, "points": 80},
            "prototype": {"number": 22, "points": 60}
        }
    },
    "Leadership & Management": {
        "keywords": ["coordinator", "volunteer", "association", "festival", "event", "club", "representative"],
        "events": {
            "professional society": {"number": 28, "points": {"core": 15, "sub": 10, "volunteer": 5}},
            "college association": {"number": 29, "points": {"core": 15, "sub": 10, "volunteer": 5}},
            "festival": {"number": 30, "points": {"core": 15, "sub": 10, "volunteer": 5}},
            "hobby club": {"number": 31, "points": {"core": 15, "sub": 10, "volunteer": 5}},
            "student representative": {"number": 32, "points": {"chairman": 30, "secretary": 25, "member": 15}}
        }
    }
}

@app.route('/process', methods=['POST'])
def process_image():
    if 'image' not in request.files:
        return jsonify({"error": "No image provided"}), 400
        
    image_file = request.files['image']
    image_path = "temp_image.png"
    image_file.save(image_path)
    
    try:
        # Extract text using OCR
        image = Image.open(image_path)
        text = pytesseract.image_to_string(image)
        
        # Process with Spacy NLP
        doc = nlp(text)
        
        # Extract names (PERSON entities)
        names = [ent.text for ent in doc.ents if ent.label_ == "PERSON"]
        
        # Extract organizations (ORG entities)
        organizations = [ent.text for ent in doc.ents if ent.label_ == "ORG"]
        
        # Extract dates (DATE entities)
        dates = [ent.text for ent in doc.ents if ent.label_ == "DATE"]
        
        # Extract position/role if any
        positions = extract_positions(text)
        
        # Detect prize information if any
        prize_info = detect_prize(text)
        
        # Extract event name and details
        event_info = extract_event_info(text)
        
        # Detect activity level
        activity_level = detect_activity_level(text)
        
        # Calculate points based on event info, level, and prize
        points_info = calculate_points(event_info, activity_level, prize_info, positions)
        
        result = {
            "names": names,
            "organizations": organizations,
            "dates": dates,
            "positions": positions,
            "prize": prize_info,
            "eventName": event_info["name"],
            "activityHead": event_info["activityHead"],
            "activityNumber": event_info["activityNumber"],
            "activityLevel": activity_level,
            "pointsAwarded": points_info["points"],
            "rawText": text
        }
        
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        # Clean up
        if os.path.exists(image_path):
            os.remove(image_path)

def extract_positions(text):
    text_lower = text.lower()
    
    position_keywords = {
        "core coordinator": "core",
        "coordinator": "core",
        "convener": "core",
        "chairperson": "chairman",
        "chairman": "chairman",
        "president": "core",
        "secretary": "secretary",
        "joint secretary": "sub",
        "treasurer": "sub",
        "vice president": "sub",
        "sub coordinator": "sub",
        "volunteer": "volunteer",
        "member": "volunteer"
    }
    
    found_positions = []
    
    for position, role in position_keywords.items():
        if position in text_lower:
            found_positions.append({"position": position, "role": role})
    
    return found_positions

def detect_prize(text):
    text_lower = text.lower()
    
    # Check for prize keywords
    if "first prize" in text_lower or "1st prize" in text_lower or "first place" in text_lower or "winner" in text_lower:
        return {"type": "first"}
    elif "second prize" in text_lower or "2nd prize" in text_lower or "second place" in text_lower or "runner up" in text_lower:
        return {"type": "second"}
    elif "third prize" in text_lower or "3rd prize" in text_lower or "third place" in text_lower:
        return {"type": "third"}
    
    return None

def extract_event_info(text):
    text_lower = text.lower()
    lines = text.split('\n')
    
    # Default values
    event_name = "Unknown Event"
    activity_head = "Professional Self Initiatives"  # Default category
    activity_number = 8  # Default to Tech Fest (8)
    matched_keyword = None
    
    # Special detection for course/workshop certificates
    course_keywords = ["course", "workshop", "training", "programming", "certificate of completion"]
    mooc_keywords = ["nptel", "mooc", "massive open online course"]
    
    # Check if this is a course certificate
    if any(keyword in text_lower for keyword in course_keywords) and "certificate" in text_lower:
        activity_head = "Professional Self Initiatives"
        
        # Check if this is a MOOC (NPTEL) course
        if any(keyword in text_lower for keyword in mooc_keywords):
            activity_number = 9  # MOOC with final assessment certificate
            matched_keyword = "mooc"
        else:
            # Check if it's from IIT/NIT
            if any(org in text_lower for org in ["iit", "nit"]):
                activity_number = 11  # Conference/Workshop at IITs/NITs
                matched_keyword = "workshop"
            else:
                activity_number = "11a"  # Conference/Workshop at KTU or affiliated institutes
                matched_keyword = "course"
        
        # Try to extract the course/program name
        for line in lines:
            line = line.strip()
            lower_line = line.lower()
            if "python" in lower_line or "course" in lower_line or "program" in lower_line or "workshop" in lower_line:
                if len(line) > 5:  # Ensure it's not just a single word
                    event_name = line
                    break
        
        return {
            "name": event_name,
            "activityHead": activity_head,
            "activityNumber": activity_number,
            "matched_keyword": matched_keyword
        }
    
    # If not a course certificate, proceed with standard detection
    for head, details in KTU_ACTIVITIES.items():
        for keyword in details["keywords"]:
            if keyword in text_lower:
                activity_head = head
                
                # Find specific event within this activity head
                for event, event_info in details["events"].items():
                    if event in text_lower:
                        activity_number = event_info["number"]
                        matched_keyword = event
                        break
                
                if matched_keyword:
                    break
        
        if matched_keyword:
            break
    
    # Try to find the full event name from the text
    for line in lines:
        line = line.strip()
        if matched_keyword and matched_keyword in line.lower():
            event_name = line
            break
    
    # If we still don't have an event name, use the matched keyword
    if event_name == "Unknown Event" and matched_keyword:
        event_name = matched_keyword.title()
    
    return {
        "name": event_name,
        "activityHead": activity_head,
        "activityNumber": activity_number,
        "matched_keyword": matched_keyword
    }

def detect_activity_level(text):
    text_lower = text.lower()
    
    # Check for activity level keywords
    if "international" in text_lower:
        return "V"
    elif "national" in text_lower:
        return "IV"
    elif "state" in text_lower or "university" in text_lower:
        return "III"
    elif "zonal" in text_lower or "district" in text_lower:
        return "II"
    elif "college" in text_lower or "institution" in text_lower:
        return "I"
    
    return "I"  # Default to level I

def calculate_points(event_info, activity_level, prize_info, positions):
    activity_head = event_info["activityHead"]
    activity_number = event_info["activityNumber"]
    matched_keyword = event_info["matched_keyword"]
    
    # Default points
    points = 10
    
    # Handle MOOC courses (activity number 9)
    if activity_number == 9:
        return {"points": 50}  # Fixed 50 points for MOOC courses
    
    # Handle workshops based on institution
    if activity_number == 11:
        return {"points": 15}  # IIT/NIT workshops
    
    if activity_number == "11a":
        return {"points": 6}  # KTU workshops
    
    # For other activities, check our database
    if activity_head in KTU_ACTIVITIES and matched_keyword in KTU_ACTIVITIES[activity_head]["events"]:
        event_details = KTU_ACTIVITIES[activity_head]["events"][matched_keyword]
        
        # Handle different point structures
        if isinstance(event_details["points"], dict):
            # For events with level-based points
            if "I" in event_details["points"]:
                points = event_details["points"].get(activity_level, 10)
            # For events with specific institution points (IIT/NIT vs KTU)
            elif "IIT/NIT" in event_details["points"]:
                text_lower = " ".join([event_info["name"].lower()] + [org.lower() for org in event_info.get("organizations", [])])
                if "iit" in text_lower or "nit" in text_lower:
                    points = event_details["points"]["IIT/NIT"]
                else:
                    points = event_details["points"]["KTU"]
            # For leadership positions
            elif "core" in event_details["points"]:
                if positions:
                    for position in positions:
                        if position["role"] in event_details["points"]:
                            points = event_details["points"][position["role"]]
                            break
        else:
            # Fixed points regardless of level
            points = event_details["points"]
    
    # Add prize points if applicable
    if prize_info and activity_head in ["Sports & Games Participation", "Cultural Activities Participation"]:
        prize_type = prize_info["type"]
        prize_points = 0
        
        if prize_type == "first":
            if activity_level in ["IV", "V"]:
                prize_points = 20
            else:
                prize_points = 10
        elif prize_type == "second":
            if activity_level in ["IV", "V"]:
                prize_points = 16
            else:
                prize_points = 8
        elif prize_type == "third":
            if activity_level in ["IV", "V"]:
                prize_points = 12
            else:
                prize_points = 5
        
        points += prize_points
    
    # Handle special cases
    if activity_head == "National Initiatives Participation":
        # NCC/NSS have fixed 60 points
        points = 60
    
    # Ensure points don't exceed maximum limits
    if activity_head in ["Sports & Games Participation", "Cultural Activities Participation"]:
        if activity_level in ["IV", "V"] and prize_info:
            points = min(points, 80)  # Maximum 80 for prize winners at national/international levels
        else:
            points = min(points, 60)  # Otherwise maximum is 60
    
    return {"points": points}

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)