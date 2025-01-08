from ..models.models import Question, QuestionCategory, QuestionType
from sqlalchemy.orm import Session
from ..database import SessionLocal

QUESTIONS_SEED = [
    # Personal Information Section
    {
        "text": "What is your full name?",
        "category": QuestionCategory.PERSONAL_INFO,
        "question_type": QuestionType.TEXT,
        "field_key": "personalInfo.fullName",
        "validation": {"required": True},
        "order": 1,
        "is_active": True
    },
    {
        "text": "What is your sex?",
        "category": QuestionCategory.PERSONAL_INFO,
        "question_type": QuestionType.RADIO,
        "field_key": "personalInfo.sex",
        "options": ["Male", "Female"],
        "validation": {"required": True},
        "order": 2,
        "is_active": True
    },
    {
        "text": "What is your phone number?",
        "category": QuestionCategory.PERSONAL_INFO,
        "question_type": QuestionType.TEXT,
        "field_key": "personalInfo.phoneNumber",
        "validation": {"required": True},
        "order": 3,
        "is_active": True
    },
    {
        "text": "What is your email address?",
        "category": QuestionCategory.PERSONAL_INFO,
        "question_type": QuestionType.TEXT,
        "field_key": "personalInfo.email",
        "validation": {
            "required": True,
            "pattern": "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
        },
        "order": 4,
        "is_active": True
    },
    {
        "text": "What is your age?",
        "category": QuestionCategory.PERSONAL_INFO,
        "question_type": QuestionType.NUMBER,
        "field_key": "personalInfo.age",
        "validation": {
            "required": True,
            "min": 18,
            "max": 120
        },
        "order": 5,
        "is_active": True
    },
    {
        "text": "What is your height (cm)?",
        "category": QuestionCategory.PERSONAL_INFO,
        "question_type": QuestionType.NUMBER,
        "field_key": "personalInfo.height",
        "validation": {
            "required": True,
            "min": 100,
            "max": 250
        },
        "order": 6,
        "is_active": True
    },
    {
        "text": "What is your weight (kg)?",
        "category": QuestionCategory.PERSONAL_INFO,
        "question_type": QuestionType.NUMBER,
        "field_key": "personalInfo.weight",
        "validation": {
            "required": True,
            "min": 30,
            "max": 300
        },
        "order": 7,
        "is_active": True
    },
    {
        "text": "What is your blood type (if known)?",
        "category": QuestionCategory.PERSONAL_INFO,
        "question_type": QuestionType.TEXT,
        "field_key": "personalInfo.bloodType",
        "validation": {"required": False},
        "order": 8,
        "is_active": True
    },
    {
        "text": "What is your body fat percentage?",
        "category": QuestionCategory.PERSONAL_INFO,
        "question_type": QuestionType.NUMBER,
        "field_key": "personalInfo.bodyFatPercentage",
        "validation": {
            "required": False,
            "min": 0,
            "max": 100
        },
        "order": 9,
        "is_active": True
    },
    {
        "text": "What is your lean mass percentage?",
        "category": QuestionCategory.PERSONAL_INFO,
        "question_type": QuestionType.NUMBER,
        "field_key": "personalInfo.leanMassPercentage",
        "validation": {
            "required": False,
            "min": 0,
            "max": 100
        },
        "order": 10,
        "is_active": True
    },
    {
        "text": "What is your waist to hip ratio?",
        "category": QuestionCategory.PERSONAL_INFO,
        "question_type": QuestionType.NUMBER,
        "field_key": "personalInfo.waistToHipRatio",
        "validation": {
            "required": False,
            "min": 0.6,
            "max": 1.2
        },
        "order": 11,
        "is_active": True
    },
    
    # Goals Section
    {
        "text": "What are your primary health and fitness goals?",
        "category": QuestionCategory.GOALS,
        "question_type": QuestionType.CHECKBOX,
        "field_key": "goalsInfo.primaryGoals",
        "options": [
            "Weight Loss",
            "Reduced Body Fat",
            "Maintenance",
            "Muscle Gain",
            "Increased Lean Mass",
            "Improved Strength"
        ],
        "validation": {
            "required": True,
            "minSelect": 1
        },
        "order": 12,
        "is_active": True
    },
    {
        "text": "How do you want to FEEL?",
        "category": QuestionCategory.GOALS,
        "question_type": QuestionType.TEXT,
        "field_key": "goalsInfo.feelGoals",
        "validation": {"required": True},
        "order": 13,
        "is_active": True
    },
    {
        "text": "Please list these goals in order of priority",
        "category": QuestionCategory.GOALS,
        "question_type": QuestionType.TEXT,
        "field_key": "goalsInfo.prioritizedGoals",
        "validation": {"required": True},
        "order": 14,
        "is_active": True
    },
    {
        "text": "What would you like to achieve through this program?",
        "category": QuestionCategory.GOALS,
        "question_type": QuestionType.TEXT,
        "field_key": "goalsInfo.challengeGoals",
        "validation": {"required": True},
        "order": 15,
        "is_active": True
    },
    {
        "text": "What type of diet do you prefer?",
        "category": QuestionCategory.GOALS,
        "question_type": QuestionType.RADIO,
        "field_key": "goalsInfo.preferredDiet",
        "options": ["keto", "paleo", "carnivore", "other"],
        "validation": {"required": True},
        "order": 16,
        "is_active": True
    },
    
    # Food Intake Section
    {
        "text": "Do you drink organic coffee?",
        "category": QuestionCategory.FOOD_INTAKE,
        "question_type": QuestionType.BOOLEAN,
        "field_key": "foodIntake.coffee.isOrganic",
        "validation": {"required": False},
        "order": 17,
        "is_active": True
    },
    {
        "text": "What do you add to your coffee?",
        "category": QuestionCategory.FOOD_INTAKE,
        "question_type": QuestionType.CHECKBOX,
        "field_key": "foodIntake.coffee.additives",
        "options": ["Sugar", "Cream", "Milk", "Sweetener"],
        "validation": {"required": False},
        "order": 18,
        "is_active": True
    },
    {
        "text": "What type of tea do you drink?",
        "category": QuestionCategory.FOOD_INTAKE,
        "question_type": QuestionType.RADIO,
        "field_key": "foodIntake.tea.type",
        "options": ["herbal", "regular"],
        "validation": {"required": True},
        "order": 19,
        "is_active": True
    },
    {
        "text": "What do you add to your tea?",
        "category": QuestionCategory.FOOD_INTAKE,
        "question_type": QuestionType.CHECKBOX,
        "field_key": "foodIntake.tea.additives",
        "options": ["Sugar", "Honey", "Milk", "Lemon"],
        "validation": {"required": False},
        "order": 20,
        "is_active": True
    },
    {
        "text": "What type of soda do you drink?",
        "category": QuestionCategory.FOOD_INTAKE,
        "question_type": QuestionType.RADIO,
        "field_key": "foodIntake.soda.type",
        "options": ["diet", "regular"],
        "validation": {"required": False},
        "order": 21,
        "is_active": True
    },
    {
        "text": "How many sodas do you drink per week?",
        "category": QuestionCategory.FOOD_INTAKE,
        "question_type": QuestionType.NUMBER,
        "field_key": "foodIntake.soda.frequency",
        "validation": {
            "required": False,
            "min": 0
        },
        "order": 22,
        "is_active": True
    },
    {
        "text": "Do you drink filtered water?",
        "category": QuestionCategory.FOOD_INTAKE,
        "question_type": QuestionType.BOOLEAN,
        "field_key": "foodIntake.water.isFiltered",
        "validation": {"required": True},
        "order": 23,
        "is_active": True
    },
    {
        "text": "How many liters of water do you drink daily?",
        "category": QuestionCategory.FOOD_INTAKE,
        "question_type": QuestionType.NUMBER,
        "field_key": "foodIntake.water.dailyQuantity",
        "validation": {
            "required": True,
            "min": 0
        },
        "order": 24,
        "is_active": True
    },
    {
        "text": "What type of alcohol do you drink?",
        "category": QuestionCategory.FOOD_INTAKE,
        "question_type": QuestionType.TEXT,
        "field_key": "foodIntake.alcohol.type",
        "validation": {"required": False},
        "order": 25,
        "is_active": True
    },
    {
        "text": "How many alcoholic drinks do you have per week?",
        "category": QuestionCategory.FOOD_INTAKE,
        "question_type": QuestionType.NUMBER,
        "field_key": "foodIntake.alcohol.drinksPerWeek",
        "validation": {
            "required": False,
            "min": 0
        },
        "order": 26,
        "is_active": True
    },
    {
        "text": "What types of sugary drinks do you consume?",
        "category": QuestionCategory.FOOD_INTAKE,
        "question_type": QuestionType.CHECKBOX,
        "field_key": "foodIntake.sugaryDrinks.types",
        "options": ["Fruit Juice", "Sports Drinks", "Energy Drinks", "Sweetened Tea/Coffee", "Other"],
        "validation": {"required": False},
        "order": 27,
        "is_active": True
    },
    {
        "text": "What types of artificial sweeteners do you use?",
        "category": QuestionCategory.FOOD_INTAKE,
        "question_type": QuestionType.CHECKBOX,
        "field_key": "foodIntake.artificialSweeteners.types",
        "options": ["Aspartame", "Sucralose", "Stevia", "Saccharin", "Other"],
        "validation": {"required": False},
        "order": 28,
        "is_active": True
    },
    {
        "text": "How often do you consume flour products?",
        "category": QuestionCategory.FOOD_INTAKE,
        "question_type": QuestionType.RADIO,
        "field_key": "foodIntake.flourProducts.frequency",
        "options": ["daily", "few_times_week", "weekly", "rarely", "never"],
        "validation": {"required": True},
        "order": 29,
        "is_active": True
    },
    {
        "text": "Do you eat grass-fed meat?",
        "category": QuestionCategory.FOOD_INTAKE,
        "question_type": QuestionType.BOOLEAN,
        "field_key": "foodIntake.meat.isGrassFed",
        "validation": {"required": True},
        "order": 30,
        "is_active": True
    },
    {
        "text": "What types of processed meat do you consume?",
        "category": QuestionCategory.FOOD_INTAKE,
        "question_type": QuestionType.TEXT,
        "field_key": "foodIntake.meat.processedTypes",
        "validation": {"required": False},
        "order": 31,
        "is_active": True
    },
    {
        "text": "Describe your typical breakfast",
        "category": QuestionCategory.FOOD_INTAKE,
        "question_type": QuestionType.TEXT,
        "field_key": "foodIntake.dailyMeals.breakfast.description",
        "validation": {"required": True},
        "order": 32,
        "is_active": True
    },
    {
        "text": "Is your breakfast home-cooked?",
        "category": QuestionCategory.FOOD_INTAKE,
        "question_type": QuestionType.BOOLEAN,
        "field_key": "foodIntake.dailyMeals.breakfast.isHomeCooked",
        "validation": {"required": False},
        "order": 33,
        "is_active": True
    },
    {
        "text": "Describe your typical morning snack",
        "category": QuestionCategory.FOOD_INTAKE,
        "question_type": QuestionType.TEXT,
        "field_key": "foodIntake.dailyMeals.morningSnack.description",
        "validation": {"required": False},
        "order": 33.5,
        "is_active": True
    },
    {
        "text": "Is your morning snack home-prepared?",
        "category": QuestionCategory.FOOD_INTAKE,
        "question_type": QuestionType.BOOLEAN,
        "field_key": "foodIntake.dailyMeals.morningSnack.isHomeCooked",
        "validation": {"required": False},
        "order": 33.6,
        "is_active": True
    },
    {
        "text": "Describe your typical lunch",
        "category": QuestionCategory.FOOD_INTAKE,
        "question_type": QuestionType.TEXT,
        "field_key": "foodIntake.dailyMeals.lunch.description",
        "validation": {"required": True},
        "order": 34,
        "is_active": True
    },
    {
        "text": "Is your lunch home-cooked?",
        "category": QuestionCategory.FOOD_INTAKE,
        "question_type": QuestionType.BOOLEAN,
        "field_key": "foodIntake.dailyMeals.lunch.isHomeCooked",
        "validation": {"required": False},
        "order": 35,
        "is_active": True
    },
    {
        "text": "Describe your typical afternoon snack",
        "category": QuestionCategory.FOOD_INTAKE,
        "question_type": QuestionType.TEXT,
        "field_key": "foodIntake.dailyMeals.afternoonSnack.description",
        "validation": {"required": False},
        "order": 35.5,
        "is_active": True
    },
    {
        "text": "Is your afternoon snack home-prepared?",
        "category": QuestionCategory.FOOD_INTAKE,
        "question_type": QuestionType.BOOLEAN,
        "field_key": "foodIntake.dailyMeals.afternoonSnack.isHomeCooked",
        "validation": {"required": False},
        "order": 35.6,
        "is_active": True
    },
    {
        "text": "Describe your typical dinner",
        "category": QuestionCategory.FOOD_INTAKE,
        "question_type": QuestionType.TEXT,
        "field_key": "foodIntake.dailyMeals.dinner.description",
        "validation": {"required": True},
        "order": 36,
        "is_active": True
    },
    {
        "text": "Is your dinner home-cooked?",
        "category": QuestionCategory.FOOD_INTAKE,
        "question_type": QuestionType.BOOLEAN,
        "field_key": "foodIntake.dailyMeals.dinner.isHomeCooked",
        "validation": {"required": False},
        "order": 37,
        "is_active": True
    },
    {
        "text": "What foods do you dislike and won't eat?",
        "category": QuestionCategory.FOOD_INTAKE,
        "question_type": QuestionType.TEXT,
        "field_key": "foodIntake.dislikedFoods",
        "validation": {"required": True},
        "order": 38,
        "is_active": True
    },
    {
        "text": "What foods do you like?",
        "category": QuestionCategory.FOOD_INTAKE,
        "question_type": QuestionType.TEXT,
        "field_key": "foodIntake.likedFoods",
        "validation": {"required": True},
        "order": 39,
        "is_active": True
    },
    
    # Workout Routine Section
    {
        "text": "How often do you do weight training?",
        "category": QuestionCategory.WORKOUT_ROUTINE,
        "question_type": QuestionType.RADIO,
        "field_key": "workoutRoutine.weightLifting.frequency",
        "options": ["never", "1-2_times", "3-4_times", "5+_times"],
        "validation": {"required": True},
        "order": 40,
        "is_active": True
    },
    {
        "text": "What type of weight training do you do?",
        "category": QuestionCategory.WORKOUT_ROUTINE,
        "question_type": QuestionType.TEXT,
        "field_key": "workoutRoutine.weightLifting.type",
        "validation": {"required": True},
        "order": 41,
        "is_active": True
    },
    {
        "text": "How often do you do cardio?",
        "category": QuestionCategory.WORKOUT_ROUTINE,
        "question_type": QuestionType.RADIO,
        "field_key": "workoutRoutine.cardio.frequency",
        "options": ["never", "1-2_times", "3-4_times", "5+_times"],
        "validation": {"required": True},
        "order": 42,
        "is_active": True
    },
    {
        "text": "What type of cardio do you do?",
        "category": QuestionCategory.WORKOUT_ROUTINE,
        "question_type": QuestionType.TEXT,
        "field_key": "workoutRoutine.cardio.type",
        "validation": {"required": True},
        "order": 43,
        "is_active": True
    },
    {
        "text": "How often do you do yoga/pilates?",
        "category": QuestionCategory.WORKOUT_ROUTINE,
        "question_type": QuestionType.RADIO,
        "field_key": "workoutRoutine.yogaPilates.frequency",
        "options": ["never", "1-2_times", "3-4_times", "5+_times"],
        "validation": {"required": False},
        "order": 44,
        "is_active": True
    },
    {
        "text": "What type of yoga/pilates do you do?",
        "category": QuestionCategory.WORKOUT_ROUTINE,
        "question_type": QuestionType.TEXT,
        "field_key": "workoutRoutine.yogaPilates.type",
        "validation": {"required": False},
        "order": 45,
        "is_active": True
    },
    {
        "text": "How many hours of sleep do you get per night?",
        "category": QuestionCategory.WORKOUT_ROUTINE,
        "question_type": QuestionType.NUMBER,
        "field_key": "workoutRoutine.sleep.hoursPerNight",
        "validation": {
            "required": True,
            "min": 0,
            "max": 24
        },
        "order": 46,
        "is_active": True
    },
    {
        "text": "How would you rate your sleep quality?",
        "category": QuestionCategory.WORKOUT_ROUTINE,
        "question_type": QuestionType.RADIO,
        "field_key": "workoutRoutine.sleep.quality",
        "options": ["poor", "fair", "good", "excellent"],
        "validation": {"required": True},
        "order": 47,
        "is_active": True
    },
    {
        "text": "How often do you dream?",
        "category": QuestionCategory.WORKOUT_ROUTINE,
        "question_type": QuestionType.RADIO,
        "field_key": "workoutRoutine.sleep.dreaming",
        "options": ["never", "rarely", "sometimes", "often"],
        "validation": {"required": True},
        "order": 48,
        "is_active": True
    },
    
    # Stress Levels Section
    {
        "text": "What is your current stress level? (1-10)",
        "category": QuestionCategory.STRESS_LEVELS,
        "question_type": QuestionType.SLIDER,
        "field_key": "stressLevels.currentLevel",
        "validation": {
            "required": True,
            "min": 1,
            "max": 10
        },
        "order": 49,
        "is_active": True
    },
    {
        "text": "Is there an end in sight to your stressors?",
        "category": QuestionCategory.STRESS_LEVELS,
        "question_type": QuestionType.TEXT,
        "field_key": "stressLevels.endInSight",
        "validation": {"required": True},
        "order": 50,
        "is_active": True
    },
    {
        "text": "How do you currently manage stress?",
        "category": QuestionCategory.STRESS_LEVELS,
        "question_type": QuestionType.TEXT,
        "field_key": "stressLevels.managementTechniques",
        "validation": {"required": True},
        "order": 51,
        "is_active": True
    },
    {
        "text": "What techniques do you use to recalibrate?",
        "category": QuestionCategory.STRESS_LEVELS,
        "question_type": QuestionType.CHECKBOX,
        "field_key": "stressLevels.recalibrationMethods",
        "options": ["Yoga", "Deep Breathing", "Meditation", "Exercise", "Other"],
        "validation": {"required": False},
        "order": 52,
        "is_active": True
    },
    
    # Toxicity & Lifestyle Section
    {
        "text": "Do you use tobacco products?",
        "category": QuestionCategory.TOXICITY_LIFESTYLE,
        "question_type": QuestionType.BOOLEAN,
        "field_key": "toxicityLifestyle.tobaccoUse",
        "validation": {"required": True},
        "order": 53,
        "is_active": True
    },
    {
        "text": "What do you crave?",
        "category": QuestionCategory.TOXICITY_LIFESTYLE,
        "question_type": QuestionType.CHECKBOX,
        "field_key": "toxicityLifestyle.cravings",
        "options": ["Sugar", "Salt", "Caffeine", "Carbs", "Other"],
        "validation": {"required": False},
        "order": 54,
        "is_active": True
    },
    {
        "text": "Do you use plastic water bottles?",
        "category": QuestionCategory.TOXICITY_LIFESTYLE,
        "question_type": QuestionType.BOOLEAN,
        "field_key": "toxicityLifestyle.plasticWaterBottles",
        "validation": {"required": True},
        "order": 55,
        "is_active": True
    },
    {
        "text": "What percentage of your diet is processed foods?",
        "category": QuestionCategory.TOXICITY_LIFESTYLE,
        "question_type": QuestionType.SLIDER,
        "field_key": "toxicityLifestyle.processedFoodsPercentage",
        "validation": {
            "required": True,
            "min": 0,
            "max": 100
        },
        "order": 56,
        "is_active": True
    },
    {
        "text": "How often do you use organic foods?",
        "category": QuestionCategory.TOXICITY_LIFESTYLE,
        "question_type": QuestionType.RADIO,
        "field_key": "toxicityLifestyle.organicFoodsUse",
        "options": ["never", "sometimes", "mostly", "always"],
        "validation": {"required": True},
        "order": 57,
        "is_active": True
    },
    {
        "text": "Which household products do you use?",
        "category": QuestionCategory.TOXICITY_LIFESTYLE,
        "question_type": QuestionType.CHECKBOX,
        "field_key": "toxicityLifestyle.householdProducts",
        "options": ["Microwaves", "Air Fresheners", "Chemical Cleaners", "Plastic Containers", "Other"],
        "validation": {"required": False},
        "order": 58,
        "is_active": True
    },
    
    # Waiver Section
    {
        "text": "Do you agree to the terms and conditions?",
        "category": QuestionCategory.WAIVER,
        "question_type": QuestionType.BOOLEAN,
        "field_key": "waiver.agreement",
        "validation": {"required": True},
        "order": 59,
        "is_active": True
    }
] 

def seed_questions(db: Session):
    """Seed the questions table with initial data"""
    from ..models.models import Question
    
    # First, check if questions already exist
    existing_questions = db.query(Question).count()
    print(f"Found {existing_questions} existing questions")
    
    if existing_questions == 0:
        try:
            # Create Question objects from the seed data
            for question_data in QUESTIONS_SEED:
                print(f"Seeding question: {question_data['text']}")
                question = Question(
                    text=question_data["text"],
                    category=question_data["category"],
                    question_type=question_data["question_type"],
                    options=question_data.get("options"),
                    validation=question_data["validation"],
                    order=question_data["order"],
                    is_active=question_data["is_active"],
                    field_key=question_data["field_key"]
                )
                db.add(question)
            
            # Commit the changes
            db.commit()
            print(f"Successfully seeded {len(QUESTIONS_SEED)} questions")
            
        except Exception as e:
            print(f"Error seeding questions: {e}")
            db.rollback()
            raise e
    else:
        print("Questions already exist in database. Skipping seeding.") 