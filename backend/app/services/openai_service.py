from openai import OpenAI
from typing import List, Dict
import json
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from ..core.config import get_settings
from ..models.models import SystemPrompt, UserResponse, Question

settings = get_settings()

# Initialize OpenAI client with API key from settings
client = OpenAI(api_key=settings.OPENAI_API_KEY)

# Define the required output format separately
MEAL_PLAN_OUTPUT_FORMAT = """
IMPORTANT: Your response must be valid JSON matching exactly this structure:
{
    "daily_calories": number,  /* Recommended daily calorie intake */
    "macros": {
        "protein": number,  /* Percentage of daily calories (20-35%) */
        "carbs": number,    /* Percentage of daily calories (45-65%) */
        "fats": number      /* Percentage of daily calories (20-35%) */
    },
    "weekly_plan": {
        "week1": {
            "monday": {
                "breakfast": [{"name": string, "portions": string, "calories": number}],
                "morning_snack": [{"name": string, "portions": string, "calories": number}],
                "lunch": [{"name": string, "portions": string, "calories": number}],
                "afternoon_snack": [{"name": string, "portions": string, "calories": number}],
                "dinner": [{"name": string, "portions": string, "calories": number}]
            },
            "tuesday": {"breakfast": [], "morning_snack": [], "lunch": [], "afternoon_snack": [], "dinner": []},
            "wednesday": {"breakfast": [], "morning_snack": [], "lunch": [], "afternoon_snack": [], "dinner": []},
            "thursday": {"breakfast": [], "morning_snack": [], "lunch": [], "afternoon_snack": [], "dinner": []},
            "friday": {"breakfast": [], "morning_snack": [], "lunch": [], "afternoon_snack": [], "dinner": []},
            "saturday": {"breakfast": [], "morning_snack": [], "lunch": [], "afternoon_snack": [], "dinner": []},
            "sunday": {"breakfast": [], "morning_snack": [], "lunch": [], "afternoon_snack": [], "dinner": []}
        },
        "week2": {
            "monday": {"breakfast": [], "morning_snack": [], "lunch": [], "afternoon_snack": [], "dinner": []},
            "tuesday": {"breakfast": [], "morning_snack": [], "lunch": [], "afternoon_snack": [], "dinner": []},
            "wednesday": {"breakfast": [], "morning_snack": [], "lunch": [], "afternoon_snack": [], "dinner": []},
            "thursday": {"breakfast": [], "morning_snack": [], "lunch": [], "afternoon_snack": [], "dinner": []},
            "friday": {"breakfast": [], "morning_snack": [], "lunch": [], "afternoon_snack": [], "dinner": []},
            "saturday": {"breakfast": [], "morning_snack": [], "lunch": [], "afternoon_snack": [], "dinner": []},
            "sunday": {"breakfast": [], "morning_snack": [], "lunch": [], "afternoon_snack": [], "dinner": []}
        }
    },
    "recommendations": [string]  /* List of personalized dietary and lifestyle recommendations */
}

Requirements:
1. Response must be ONLY valid JSON - DO NOT include any comments or explanatory text
2. Macronutrient ratios MUST sum to exactly 100%
3. Each meal must include name, portions, and calories
4. Include at least 5 specific recommendations
5. Provide different meals for week 1 and week 2 to ensure variety
6. Morning snack should be lighter than afternoon snack
7. Fill in all meals for all days - do not use comments or placeholders
"""

def clean_json_response(response_text: str) -> str:
    """Clean the response text to ensure valid JSON"""
    # Remove any JavaScript-style comments
    import re
    response_text = re.sub(r'//.*?\n', '\n', response_text)
    response_text = re.sub(r'/\*.*?\*/', '', response_text, flags=re.DOTALL)
    
    # Remove any trailing commas
    response_text = re.sub(r',(\s*[}\]])', r'\1', response_text)
    
    return response_text

def get_meal_plan_system_prompt(db: Session) -> str:
    """
    Get the system prompt for meal plan generation from the database.
    Combines the user-defined prompt with the required output format.
    """
    try:
        # Add more detailed logging
        print("[OpenAI Service] Fetching system prompt from database...")
        
        # Query the system prompt
        prompt = db.query(SystemPrompt).filter(
            SystemPrompt.name == "meal_plan",
            SystemPrompt.is_active == True
        ).first()
        
        # Log the query results
        if prompt:
            print(f"[OpenAI Service] Found system prompt: id={prompt.id}, name={prompt.name}")
            if prompt.prompt_text:
                print("[OpenAI Service] Using system prompt from database")
                return f"{prompt.prompt_text}\n\n{MEAL_PLAN_OUTPUT_FORMAT}"
            else:
                print("[OpenAI Service] System prompt found but prompt_text is empty")
        else:
            print("[OpenAI Service] No active system prompt found with name 'meal_plan'")
            
    except Exception as e:
        print(f"[OpenAI Service] Error fetching system prompt: {str(e)}")
        import traceback
        print("[OpenAI Service] Traceback:", traceback.format_exc())
    
    # If no prompt exists in database or there was an error, use a default prompt
    print("[OpenAI Service] Using default prompt as fallback")
    default_prompt = """You are a professional nutritionist and meal planner. Create a personalized weekly meal plan based on the user's information, preferences, and goals."""
    return f"{default_prompt}\n\n{MEAL_PLAN_OUTPUT_FORMAT}"

def generate_meal_plan(data: Dict, db: Session) -> Dict:
    """
    Generate a meal plan using OpenAI's API based on user responses and information
    """
    try:
        print("[OpenAI Service] Starting meal plan generation...")
        current_user_id = data.get('user_id')  # Get the current user's ID
        
        if not current_user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User ID is required"
            )
        
        # Retrieve saved responses from the database
        saved_responses = db.query(UserResponse).join(Question).filter(
            UserResponse.user_id == current_user_id
        ).all()
        
        if not saved_responses:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No responses found for user"
            )
        
        # Convert saved responses to a structured format based on field_keys
        structured_data = {}
        for response in saved_responses:
            field_key = response.question.field_key
            value = response.response_value
            
            # Split the field key into parts (e.g., "personalInfo.name" -> ["personalInfo", "name"])
            parts = field_key.split('.')
            
            # Build the nested structure
            current = structured_data
            for i, part in enumerate(parts[:-1]):
                if part not in current:
                    current[part] = {}
                current = current[part]
            
            # Set the value at the final level
            current[parts[-1]] = value
        
        print("[OpenAI Service] Structured data:", json.dumps(structured_data, indent=2))
        
        # Get the system prompt from the database
        system_prompt = get_meal_plan_system_prompt(db)
        
        # Prepare messages for OpenAI
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "system", "content": "You must respond with ONLY valid JSON. Do not include any explanatory text before or after the JSON. The JSON must be properly formatted with double quotes around property names and string values."},
            {"role": "user", "content": json.dumps(structured_data, indent=2)}
        ]
        
        try:
            # Make the API call to OpenAI
            response = client.chat.completions.create(
                model="gpt-4",
                messages=messages,
                temperature=0.7,
                max_tokens=4000,  # Increased from 2000 to handle larger responses
                presence_penalty=0.1,
                frequency_penalty=0.1
            )
            
            # Extract the response content
            response_content = response.choices[0].message.content.strip()
            print("[OpenAI Service] Raw response:", response_content)
            
            try:
                # Parse and clean the JSON response
                meal_plan = parse_meal_plan_response(response_content)
                
                # Validate the response structure
                required_fields = ['daily_calories', 'macros', 'weekly_plan', 'recommendations']
                missing_fields = [field for field in required_fields if field not in meal_plan]
                
                if missing_fields:
                    print(f"[OpenAI Service] Missing fields in response: {missing_fields}")
                    # Create a default structure for missing fields
                    default_meal_plan = {
                        'daily_calories': 2000,
                        'macros': {
                            'protein': 30,
                            'carbs': 45,
                            'fats': 25
                        },
                        'weekly_plan': meal_plan.get('weekly_plan', {
                            'week1': {},
                            'week2': {}
                        }),
                        'recommendations': [
                            "Maintain regular meal times",
                            "Stay hydrated throughout the day",
                            "Focus on whole, unprocessed foods",
                            "Include protein with every meal",
                            "Eat a variety of colorful vegetables"
                        ]
                    }
                    
                    # Merge the default with the actual response
                    meal_plan = {**default_meal_plan, **meal_plan}
                
                # Ensure weekly_plan has both week1 and week2 with all days populated
                if 'weekly_plan' in meal_plan:
                    if not isinstance(meal_plan['weekly_plan'], dict):
                        meal_plan['weekly_plan'] = {'week1': {}, 'week2': {}}
                    
                    days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
                    meal_types = {
                        'breakfast': [],
                        'morning_snack': [],
                        'lunch': [],
                        'afternoon_snack': [],
                        'dinner': []
                    }
                    
                    # Create default meal structure
                    default_meals = {
                        'breakfast': [{'name': 'Balanced breakfast', 'portions': '1 serving', 'calories': 300}],
                        'morning_snack': [{'name': 'Healthy snack', 'portions': '1 serving', 'calories': 150}],
                        'lunch': [{'name': 'Nutritious lunch', 'portions': '1 serving', 'calories': 500}],
                        'afternoon_snack': [{'name': 'Energy snack', 'portions': '1 serving', 'calories': 200}],
                        'dinner': [{'name': 'Balanced dinner', 'portions': '1 serving', 'calories': 600}]
                    }
                    
                    for week in ['week1', 'week2']:
                        if week not in meal_plan['weekly_plan']:
                            meal_plan['weekly_plan'][week] = {}
                            
                        # Ensure each day exists and has all meal types
                        for day in days:
                            if day not in meal_plan['weekly_plan'][week]:
                                meal_plan['weekly_plan'][week][day] = {}
                                
                            day_meals = meal_plan['weekly_plan'][week][day]
                            
                            # Ensure each meal type exists and has content
                            for meal_type, default_content in default_meals.items():
                                if meal_type not in day_meals or not day_meals[meal_type]:
                                    day_meals[meal_type] = default_content.copy()
                                elif not isinstance(day_meals[meal_type], list):
                                    day_meals[meal_type] = [day_meals[meal_type]] if day_meals[meal_type] else default_content.copy()
                                
                                # Ensure each meal has required fields
                                for meal in day_meals[meal_type]:
                                    if not isinstance(meal, dict):
                                        meal = {'name': str(meal), 'portions': '1 serving', 'calories': 300}
                                    meal.setdefault('name', 'Balanced meal')
                                    meal.setdefault('portions', '1 serving')
                                    meal.setdefault('calories', 300)
                
                # Validate and adjust macros to sum to 100%
                macros = meal_plan.get('macros', {})
                if macros:
                    total = sum([
                        macros.get('protein', 0),
                        macros.get('carbs', 0),
                        macros.get('fats', 0)
                    ])
                    
                    if total != 100:
                        print(f"[OpenAI Service] Adjusting macros. Original sum: {total}%")
                        if total > 0:  # Avoid division by zero
                            adjustment_factor = 100 / total
                            macros['protein'] = round(macros.get('protein', 0) * adjustment_factor)
                            macros['carbs'] = round(macros.get('carbs', 0) * adjustment_factor)
                            macros['fats'] = round(macros.get('fats', 0) * adjustment_factor)
                            
                            # Ensure exactly 100% by adjusting the largest value if needed
                            new_total = macros['protein'] + macros['carbs'] + macros['fats']
                            if new_total != 100:
                                diff = 100 - new_total
                                max_macro = max(macros.items(), key=lambda x: x[1])[0]
                                macros[max_macro] += diff
                        else:
                            # If all macros are 0, set default balanced ratios
                            macros['protein'] = 30
                            macros['carbs'] = 45
                            macros['fats'] = 25
                        
                        meal_plan['macros'] = macros
                        print(f"[OpenAI Service] Adjusted macros: {macros}")
                
                # Add user info from structured data
                personal_info = structured_data.get('personalInfo', {})
                meal_plan['user_info'] = {
                    'full_name': personal_info.get('fullName', 'User'),
                    'sex': personal_info.get('sex', 'Not specified'),
                    'phone': personal_info.get('phoneNumber', ''),
                    'email': personal_info.get('email', ''),
                    'age': personal_info.get('age', 0)
                }
                
                # Add a function to format recommendations
                def format_recommendations(recommendations):
                    if not recommendations:
                        return []
                    
                    formatted = []
                    for rec in recommendations:
                        if isinstance(rec, str):
                            formatted.append(rec)
                        elif isinstance(rec, dict):
                            # If recommendation is an object, extract the tip or text
                            formatted.append(rec.get('tip') or rec.get('text') or str(rec))
                        else:
                            formatted.append(str(rec))
                    return formatted
                
                if 'recommendations' in meal_plan:
                    meal_plan['recommendations'] = format_recommendations(meal_plan['recommendations'])
                
                # Return the validated and structured meal plan
                return {
                    'plan_data': meal_plan
                }
                
            except json.JSONDecodeError as e:
                print(f"[OpenAI Service] JSON decode error: {str(e)}")
                print("[OpenAI Service] Failed response content:", response_content)
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Failed to parse meal plan response: {str(e)}"
                )
                
        except Exception as e:
            print(f"[OpenAI Service] Error calling OpenAI API: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to generate meal plan: {str(e)}"
            )
        
    except HTTPException:
        raise
    except Exception as e:
        print("[OpenAI Service Error] Unexpected error in generate_meal_plan:", str(e))
        print("[OpenAI Service Error] Error type:", type(e).__name__)
        print("[OpenAI Service Error] Full error:", repr(e))
        import traceback
        print("[OpenAI Service Error] Traceback:", traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unexpected error generating meal plan: {str(e)}"
        )

def construct_meal_plan_prompt(user_info: Dict) -> str:
    """
    Construct a detailed prompt for the OpenAI API using all available user information
    """
    personal_info = user_info.get('personalInfo', {})
    goals_info = user_info.get('goalsInfo', {})
    workout_info = user_info.get('workoutRoutine', {})
    food_info = user_info.get('foodIntake', {})
    stress_info = user_info.get('stressLevels', {})
    toxicity_info = user_info.get('toxicityLifestyle', {})
    
    return f"""
    Please generate a comprehensive wellness and meal plan for:
    
    Personal Information:
    - Name: {personal_info.get('name', 'Not specified')}
    - Age: {personal_info.get('age', 'Not specified')} years
    - Height: {personal_info.get('height', 'Not specified')}cm
    - Weight: {personal_info.get('weight', 'Not specified')}kg
    - Sex: {personal_info.get('sex', 'Not specified')}
    - Body Fat: {personal_info.get('bodyFatPercentage', 'Not specified')}%
    - Lean Mass: {personal_info.get('leanMassPercentage', 'Not specified')}%
    - Waist to Hip Ratio: {personal_info.get('waistToHipRatio', 'Not specified')}

    Goals: {', '.join(goals_info.get('primaryGoals', []))}
    Preferred Diet: {goals_info.get('preferredDiet', 'Not specified')}
    Feel Goals: {', '.join(goals_info.get('feelGoals', [])) if goals_info.get('feelGoals') else 'Not specified'}
    Challenge Goals: {', '.join(goals_info.get('challengeGoals', [])) if goals_info.get('challengeGoals') else 'Not specified'}

    Current Diet:
    - Breakfast: {food_info.get('breakfast', {}).get('description', 'Not specified')}
    - Lunch: {food_info.get('lunch', {}).get('description', 'Not specified')}
    - Dinner: {food_info.get('dinner', {}).get('description', 'Not specified')}
    - Morning Snack: {food_info.get('morningSnack', {}).get('description', 'Not specified')}
    - Afternoon Snack: {food_info.get('afternoonSnack', {}).get('description', 'Not specified')}
    
    Dietary Habits:
    - Coffee: Organic: {food_info.get('coffee', {}).get('isOrganic', False)}, Additives: {', '.join(food_info.get('coffee', {}).get('additives', []))}
    - Tea Type: {food_info.get('tea', {}).get('type', 'Not specified')}, Additives: {', '.join(food_info.get('tea', {}).get('additives', []))}
    - Water: {food_info.get('water', {}).get('dailyQuantity', 0)}L/day, Filtered: {food_info.get('water', {}).get('isFiltered', False)}
    - Alcohol: Type: {food_info.get('alcohol', {}).get('type', 'None')}, {food_info.get('alcohol', {}).get('drinksPerWeek', 0)} drinks/week
    - Processed Foods: {toxicity_info.get('processedFoodsPercentage', 0)}%
    - Organic Foods: {toxicity_info.get('organicFoodsUse', 'Not specified')}
    - Cravings: {', '.join(toxicity_info.get('cravings', []))}

    Food Preferences:
    - Liked Foods: {', '.join(food_info.get('likedFoods', []))}
    - Disliked Foods: {', '.join(food_info.get('dislikedFoods', []))}

    Exercise Routine:
    - Weight Training: Frequency: {workout_info.get('weightLifting', {}).get('frequency', 'Not specified')}, Type: {workout_info.get('weightLifting', {}).get('type', 'Not specified')}
    - Cardio: Frequency: {workout_info.get('cardio', {}).get('frequency', 'Not specified')}, Type: {workout_info.get('cardio', {}).get('type', 'Not specified')}
    - Yoga/Pilates: Frequency: {workout_info.get('yogaPilates', {}).get('frequency', 'Not specified')}, Type: {workout_info.get('yogaPilates', {}).get('type', 'Not specified')}

    Sleep & Recovery:
    - Hours per Night: {workout_info.get('sleep', {}).get('hoursPerNight', 'Not specified')}
    - Sleep Quality: {workout_info.get('sleep', {}).get('quality', 'Not specified')}

    Stress Management:
    - Current Stress Level: {stress_info.get('currentLevel', 'Not specified')}/10
    - Management Techniques: {stress_info.get('managementTechniques', 'Not specified')}
    - Recalibration Methods: {', '.join(stress_info.get('recalibrationMethods', []))}
    
    Please provide a comprehensive meal plan following the specified JSON structure.
    Include specific meal portions, calorie counts, and practical dietary recommendations.
    The meal plan should be balanced and aligned with the user's goals, current habits, stress levels, and lifestyle factors.
    Consider their current diet, cravings, and food preferences when designing the meal plan.
    Adjust portions and timing based on their workout routine and sleep patterns.
    """

def parse_meal_plan_response(response_text: str) -> Dict:
    """Parse and validate the meal plan response"""
    try:
        # Clean the response text
        cleaned_response = clean_json_response(response_text)
        
        # Try to parse the cleaned JSON
        return json.loads(cleaned_response)
    except json.JSONDecodeError as e:
        print(f"[OpenAI Service] JSON parsing error: {str(e)}")
        print("[OpenAI Service] Failed response content:", response_text)
        
        # Try to extract the valid parts of the response
        try:
            # Find the first valid JSON object in the response
            import re
            json_pattern = r'{[\s\S]*}'
            match = re.search(json_pattern, response_text)
            if match:
                cleaned_json = clean_json_response(match.group(0))
                return json.loads(cleaned_json)
        except Exception as inner_e:
            print(f"[OpenAI Service] Failed to extract valid JSON: {str(inner_e)}")
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to parse meal plan response"
        ) 