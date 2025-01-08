from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.models import MealPlan, User
from ..schemas.meal_plan import MealPlanCreate, MealPlanResponse
from ..services.auth import get_current_user
from ..services.openai_service import generate_meal_plan
from datetime import datetime
import json

router = APIRouter()

@router.post("/", response_model=MealPlanResponse)
async def create_meal_plan(
    meal_plan: MealPlanCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new meal plan for the current user"""
    db_meal_plan = MealPlan(
        user_id=current_user.id,
        plan_data=meal_plan.plan_data,
        start_date=meal_plan.start_date,
        end_date=meal_plan.end_date
    )
    db.add(db_meal_plan)
    db.commit()
    db.refresh(db_meal_plan)
    return db_meal_plan

@router.get("/", response_model=List[MealPlanResponse])
async def get_meal_plans(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all meal plans for the current user"""
    meal_plans = db.query(MealPlan)\
        .filter(MealPlan.user_id == current_user.id)\
        .offset(skip)\
        .limit(limit)\
        .all()
    return meal_plans

@router.get("/{meal_plan_id}", response_model=MealPlanResponse)
async def get_meal_plan(
    meal_plan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific meal plan by ID"""
    meal_plan = db.query(MealPlan)\
        .filter(MealPlan.id == meal_plan_id, MealPlan.user_id == current_user.id)\
        .first()
    if not meal_plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meal plan not found"
        )
    return meal_plan

@router.put("/{meal_plan_id}", response_model=MealPlanResponse)
async def update_meal_plan(
    meal_plan_id: int,
    meal_plan_update: MealPlanCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a meal plan"""
    db_meal_plan = db.query(MealPlan)\
        .filter(MealPlan.id == meal_plan_id, MealPlan.user_id == current_user.id)\
        .first()
    if not db_meal_plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meal plan not found"
        )
    
    for key, value in meal_plan_update.dict().items():
        setattr(db_meal_plan, key, value)
    
    db.commit()
    db.refresh(db_meal_plan)
    return db_meal_plan

@router.delete("/{meal_plan_id}")
async def delete_meal_plan(
    meal_plan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a meal plan"""
    db_meal_plan = db.query(MealPlan)\
        .filter(MealPlan.id == meal_plan_id, MealPlan.user_id == current_user.id)\
        .first()
    if not db_meal_plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meal plan not found"
        )
    
    db.delete(db_meal_plan)
    db.commit()
    return {"message": "Meal plan deleted successfully"}

@router.post("/generate")
async def generate_ai_meal_plan(
    request_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generate a meal plan using AI based on user responses"""
    try:
        print("[Step 1] Starting meal plan generation...")
        print("[Step 1] Received request_data:", json.dumps(request_data, indent=2))
        
        if not request_data:
            print("[Error] Request data is empty")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Request data is empty"
            )
            
        # Extract user responses and user info from request data
        try:
            user_responses = request_data.get('responses', [])
            user_info_data = request_data.get('user_info', {})
            print("[Step 2] Successfully extracted user data")
            print("[Step 2] User responses count:", len(user_responses))
            print("[Step 2] User info data keys:", list(user_info_data.keys()))
        except Exception as e:
            print("[Error] Failed to extract user data:", str(e))
            print("[Error] Request data structure:", type(request_data))
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to extract user data: {str(e)}"
            )
            
        print("[Step 3] Structuring user info...")
        try:
            # Structure the user info according to what generate_meal_plan expects
            user_info = {
                'personalInfo': {
                    'name': user_info_data.get('name', 'User'),
                    'age': user_info_data.get('age', 30),
                    'height': user_info_data.get('height', 170),
                    'weight': user_info_data.get('weight', 70),
                    'sex': user_info_data.get('sex', 'Not specified'),
                    'email': user_info_data.get('email', ''),
                    'phone': user_info_data.get('phone', ''),
                    'bodyFatPercentage': user_info_data.get('bodyFatPercentage'),
                    'leanMassPercentage': user_info_data.get('leanMassPercentage'),
                    'waistToHipRatio': user_info_data.get('waistToHipRatio')
                },
                'goalsInfo': {
                    'primaryGoals': user_info_data.get('goals', ['Better Health']),
                    'preferredDiet': user_info_data.get('preferredDiet', 'Balanced'),
                    'feelGoals': user_info_data.get('feelGoals'),
                    'challengeGoals': user_info_data.get('challengeGoals'),
                    'prioritizedGoals': user_info_data.get('prioritizedGoals', [])
                },
                'foodIntake': {
                    'dailyMeals': {
                        'breakfast': {
                            'description': user_info_data.get('breakfast'),
                            'isHomeCooked': user_info_data.get('breakfastHomeCooked')
                        },
                        'morningSnack': {
                            'description': user_info_data.get('morningSnack'),
                            'isHomeCooked': user_info_data.get('morningSnackHomeCooked')
                        },
                        'lunch': {
                            'description': user_info_data.get('lunch'),
                            'isHomeCooked': user_info_data.get('lunchHomeCooked')
                        },
                        'afternoonSnack': {
                            'description': user_info_data.get('afternoonSnack'),
                            'isHomeCooked': user_info_data.get('afternoonSnackHomeCooked')
                        },
                        'dinner': {
                            'description': user_info_data.get('dinner'),
                            'isHomeCooked': user_info_data.get('dinnerHomeCooked')
                        }
                    },
                    'coffee': {
                        'isOrganic': user_info_data.get('organicCoffee', False),
                        'additives': user_info_data.get('coffeeAdditives', [])
                    },
                    'tea': {
                        'type': user_info_data.get('teaType'),
                        'additives': user_info_data.get('teaAdditives', [])
                    },
                    'water': {
                        'dailyQuantity': user_info_data.get('waterQuantity', 0),
                        'isFiltered': user_info_data.get('filteredWater', False)
                    },
                    'alcohol': {
                        'type': user_info_data.get('alcoholType'),
                        'drinksPerWeek': user_info_data.get('alcoholDrinksPerWeek', 0)
                    },
                    'likedFoods': user_info_data.get('likedFoods', []),
                    'dislikedFoods': user_info_data.get('dislikedFoods', [])
                },
                'workoutRoutine': {
                    'weightLifting': {
                        'frequency': user_info_data.get('weightTrainingFrequency'),
                        'type': user_info_data.get('weightTrainingType')
                    },
                    'cardio': {
                        'frequency': user_info_data.get('cardioFrequency'),
                        'type': user_info_data.get('cardioType')
                    },
                    'yogaPilates': {
                        'frequency': user_info_data.get('yogaPilatesFrequency'),
                        'type': user_info_data.get('yogaPilatesType')
                    },
                    'sleep': {
                        'hoursPerNight': user_info_data.get('sleepHours'),
                        'quality': user_info_data.get('sleepQuality')
                    }
                },
                'stressLevels': {
                    'currentLevel': user_info_data.get('stressLevel'),
                    'managementTechniques': user_info_data.get('stressManagement'),
                    'recalibrationMethods': user_info_data.get('recalibrationMethods', [])
                },
                'toxicityLifestyle': {
                    'processedFoodsPercentage': user_info_data.get('processedFoodsPercentage', 0),
                    'organicFoodsUse': user_info_data.get('organicFoodsUse'),
                    'cravings': user_info_data.get('cravings', [])
                }
            }
            print("[Step 3] Successfully structured user info")
            print("[Step 3] Structured data sections:", list(user_info.keys()))
        except Exception as e:
            print("[Error] Failed to structure user info:", str(e))
            print("[Error] User info data:", json.dumps(user_info_data, indent=2))
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to structure user info: {str(e)}"
            )
        
        print("[Step 4] Preparing data for OpenAI service...")
        try:
            # Combine the data into a single dictionary
            data = {
                'user_info': user_info,
                'responses': user_responses,
                'user_id': current_user.id  # Add the user ID to the data
            }
            print("[Step 4] Data prepared successfully")
            print("[Step 4] Data sections:", list(data.keys()))
        except Exception as e:
            print("[Error] Failed to prepare data:", str(e))
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to prepare data: {str(e)}"
            )
        
        print("[Step 5] Calling OpenAI service...")
        try:
            # Generate the meal plan using OpenAI
            meal_plan_data = generate_meal_plan(data, db)
            print("[Step 5] Successfully generated meal plan")
            print("[Step 5] Meal plan sections:", list(meal_plan_data.keys()))
        except Exception as e:
            print("[Error] Failed to generate meal plan:", str(e))
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to generate meal plan: {str(e)}"
            )
        
        print("[Step 6] Saving meal plan to database...")
        try:
            # Create a new meal plan record
            db_meal_plan = MealPlan(
                user_id=current_user.id,
                plan_data=meal_plan_data['plan_data'],
                start_date=datetime.utcnow(),
                is_active=True
            )
            db.add(db_meal_plan)
            db.commit()
            db.refresh(db_meal_plan)
            print("[Step 6] Successfully saved meal plan")
            
            return meal_plan_data
            
        except Exception as e:
            print("[Error] Failed to save meal plan:", str(e))
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to save meal plan: {str(e)}"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        print("[Error] Unexpected error:", str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}"
        ) 