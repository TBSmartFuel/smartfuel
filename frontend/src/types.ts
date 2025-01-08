export interface User {
  id: number;
  email: string;
  is_admin: boolean;
  is_active: boolean;
  is_approved: boolean;
  created_at: string;
  message?: string;
}

export interface Question {
  id: number;
  text: string;
  category: string;
  question_type: QuestionType;
  options?: string[];
  order: number;
  field_key: string;
  parent_id?: number;
  sub_questions?: Question[];
  validation: {
    required: boolean;
    min?: number;
    max?: number;
    minSelect?: number;
    pattern?: string;
  };
}

export interface QuestionResponse {
  question_id: number;
  answer: any;
}

export enum ActivityLevel {
  Sedentary = 'Sedentary',
  LightlyActive = 'Lightly Active',
  ModeratelyActive = 'Moderately Active',
  VeryActive = 'Very Active',
  ExtremelyActive = 'Extremely Active',
}

export enum FitnessGoal {
  WeightLoss = 'Weight Loss',
  MuscleGain = 'Muscle Gain',
  Maintenance = 'Maintenance',
  GeneralHealth = 'General Health',
}

export enum QuestionType {
  TEXT = 'text',
  MULTIPLE_CHOICE = 'multiple_choice',
  NUMBER = 'number',
  RADIO = 'radio',
  CHECKBOX = 'checkbox',
  SLIDER = 'slider',
  BOOLEAN = 'boolean',
  MEAL_INPUT = 'meal_input',
  DRINK_DETAILS = 'drink_details',
}

export enum DietType {
  KETO = 'Keto',
  PALEO = 'Paleo',
  CARNIVORE = 'Carnivore',
  OTHER = 'Other'
}

export interface DrinkDetails {
  type: string;
  organic?: boolean;
  additives?: string[];
  frequency?: string;
  quantity?: string;
}

export interface MealDetails {
  description: string;
  isHomeCooked: boolean;
}

export interface PersonalInfo {
  name: string;
  age: number;
  height: number;
  weight: number;
  bloodType?: string;
  bodyFatPercentage?: number;
  leanMassPercentage?: number;
  waistToHipRatio?: number;
}

export interface GoalsInfo {
  primaryGoals: string[];
  feelGoals: string;
  prioritizedGoals: string;
  challengeGoals: string;
  preferredDiet: DietType;
}

export interface MealDetail {
  description: string;
  isHomeCooked: boolean;
}

export interface DailyMeals {
  breakfast: MealDetail;
  morningSnack: MealDetail;
  lunch: MealDetail;
  afternoonSnack: MealDetail;
  dinner: MealDetail;
}

export interface FoodIntake {
  coffee: {
    isOrganic: boolean;
    additives: string[];
  };
  soda: {
    isDiet: boolean;
    frequencyPerWeek: number;
  };
  tea: {
    type: 'Herbal' | 'Regular';
    additives: string[];
  };
  alcohol: {
    type: string;
    drinksPerWeek: number;
  };
  water: {
    isFiltered: boolean;
    dailyQuantity: string;
  };
  sugaryDrinks: {
    types: string[];
  };
  artificialSweeteners: {
    types: string[];
  };
  flourProducts: {
    frequency: string;
    types: string[];
  };
  meat: {
    isGrassFed: boolean;
    processedTypes: string[];
  };
  dailyMeals: DailyMeals;
  dislikedFoods: string[];
  likedFoods: string[];
}

export interface UserInfo {
  personalInfo: PersonalInfo;
  goalsInfo: GoalsInfo;
  foodIntake: {
    coffee: {
      isOrganic: boolean;
      additives: string[];
    };
    tea: {
      type: string;
      additives: string[];
    };
    soda: {
      type: string;
      frequency: number;
    };
    water: {
      isFiltered: boolean;
      dailyQuantity: number;
    };
    alcohol: {
      type: string;
      drinksPerWeek: number;
    };
    breakfast: {
      description: string;
      isHomeCooked: boolean;
    };
    morningSnack: {
      description: string;
      isHomePrepared: boolean;
    };
    lunch: {
      description: string;
      isHomeCooked: boolean;
    };
    afternoonSnack: {
      description: string;
      isHomePrepared: boolean;
    };
    dinner: {
      description: string;
      isHomeCooked: boolean;
    };
    likedFoods: string[];
    dislikedFoods: string[];
  };
  workoutRoutine: {
    weightLifting: {
      frequency: string;
      type: string;
    };
    cardio: {
      frequency: string;
      type: string;
    };
    yogaPilates: {
      frequency: string;
      type: string;
    };
    sleep: {
      hoursPerNight: number;
      quality: string;
      dreaming: string;
    };
  };
  stressLevels: {
    currentLevel: number;
    endInSight: string;
    managementTechniques: string;
    recalibrationMethods: string[];
  };
  toxicityLifestyle: {
    tobaccoUse: boolean;
    cravings: string[];
    plasticWaterBottles: boolean;
    processedFoodsPercentage: number;
    organicFoodsUse: string;
    householdProducts: string[];
  };
  waiver: {
    agreement: boolean;
  };
}

export interface Food {
  name: string;
  amount: number;
  unit: string;
}

export interface Meal {
  calories: number;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
  };
  foods: Food[];
  type?: string;
  name?: string;
  portions?: string;
}

export interface MealPlan {
  id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  plan_data: {
    daily_calories: number;
    macros: {
      protein: number;
      carbs: number;
      fats: number;
    };
    weekly_plan: {
      week1: {
        [key: string]: {
          breakfast: Array<{ name: string; portions: string; calories: number }>;
          morning_snack: Array<{ name: string; portions: string; calories: number }>;
          lunch: Array<{ name: string; portions: string; calories: number }>;
          afternoon_snack: Array<{ name: string; portions: string; calories: number }>;
          dinner: Array<{ name: string; portions: string; calories: number }>;
        };
      };
      week2: {
        [key: string]: {
          breakfast: Array<{ name: string; portions: string; calories: number }>;
          morning_snack: Array<{ name: string; portions: string; calories: number }>;
          lunch: Array<{ name: string; portions: string; calories: number }>;
          afternoon_snack: Array<{ name: string; portions: string; calories: number }>;
          dinner: Array<{ name: string; portions: string; calories: number }>;
        };
      };
    };
    recommendations: string[];
    user_info?: {
      full_name: string;
      sex: string;
      phone: string;
      email: string;
      age: number | string;
    };
  };
}

export interface WellnessPlan {
  client_profile: {
    name: string;
    age: number;
    height: string;
    weight: string;
    blood_type: string;
    body_fat: string;
    lean_mass: string;
    goals: string[];
  };
  nutritional_plan: {
    food_groups: {
      highly_beneficial: string[];
      neutral: string[];
      avoid: string[];
    };
    macros: {
      daily_calories: number;
      protein: string;
      carbs: string;
      fats: string;
    };
  };
  // ... rest of the types as defined in WellnessReport props
} 