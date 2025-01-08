// User types
export interface User {
  id: number;
  email: string;
  is_admin: boolean;
  created_at: string;
}

// Question types
export const QuestionTypes = {
  TEXT: 'text',
  NUMBER: 'number',
  BOOLEAN: 'boolean',
  MULTIPLE_CHOICE: 'multiple_choice',
  SLIDER: 'slider',
  RADIO: 'radio',
  CHECKBOX: 'checkbox'
} as const;

export type QuestionType = 
  | 'text' 
  | 'number' 
  | 'boolean' 
  | 'multiple_choice' 
  | 'slider' 
  | 'radio' 
  | 'checkbox';

export const QuestionCategories = {
  PERSONAL_INFO: 'personal_info',
  GOALS: 'goals',
  FOOD_INTAKE: 'food_intake',
  WORKOUT_ROUTINE: 'workout_routine',
  STRESS_LEVELS: 'stress_levels',
  TOXICITY_LIFESTYLE: 'toxicity_lifestyle',
  WAIVER: 'waiver'
} as const;

export type QuestionCategory = 
  | 'personal_info'
  | 'goals'
  | 'food_intake'
  | 'workout_routine'
  | 'stress_levels'
  | 'toxicity_lifestyle'
  | 'waiver';

export const OPTION_QUESTION_TYPES = [
  QuestionTypes.MULTIPLE_CHOICE,
  QuestionTypes.RADIO,
  QuestionTypes.CHECKBOX
] as const;

export type OptionQuestionType = typeof OPTION_QUESTION_TYPES[number];

export interface QuestionValidation {
  required?: boolean;
  min?: number;
  max?: number;
  minSelect?: number;
  pattern?: string;
}

export interface BaseQuestion {
  text: string;
  category: QuestionCategory;
  question_type: QuestionType;
  options?: string[];
  validation?: QuestionValidation;
  field_key: string;
  order: number;
  is_active: boolean;
}

export interface Question extends BaseQuestion {
  id: number;
  parent_id?: number;
  sub_questions?: Question[];
}

export type QuestionCreate = BaseQuestion;

export interface FormData extends BaseQuestion {}

export interface FormErrors {
  text?: string;
  category?: string;
  question_type?: string;
  options?: string;
  field_key?: string;
}

// Other types
export interface QuestionResponse {
  id?: number;
  user_id?: string;
  question_id: number;
  answer: string | string[] | number | boolean | Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

// Meal Plan types
export interface UserInfo {
  personalInfo: PersonalInfo;
  goalsInfo: GoalsInfo;
  foodIntake: FoodIntake;
  workoutRoutine: WorkoutRoutine;
  stressLevels: StressLevels;
  toxicityLifestyle: ToxicityLifestyle;
  waiver: Waiver;
}

export interface MealPlanData {
  daily_calories: number;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
  };
  weekly_plan: {
    [key: string]: {
      breakfast: Meal[];
      lunch: Meal[];
      dinner: Meal[];
      snacks: Meal[];
    };
  };
  recommendations: string[];
}

export interface Meal {
  name: string;
  portions: string;
  calories: number;
}

export interface MealPlan {
  id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  start_date: string;
  end_date?: string;
  plan_data: {
    daily_calories: number;
    macros: {
      protein: number;
      carbs: number;
      fats: number;
    };
    weekly_plan: {
      [key: string]: {
        breakfast: Array<{
          name: string;
          portions: string;
          calories: number;
        }>;
        lunch: Array<{
          name: string;
          portions: string;
          calories: number;
        }>;
        dinner: Array<{
          name: string;
          portions: string;
          calories: number;
        }>;
        snacks: Array<{
          name: string;
          portions: string;
          calories: number;
        }>;
      };
    };
    recommendations: string[];
  };
}

// Add these enums for strict typing
export enum ActivityLevel {
  Sedentary = 'Sedentary',
  LightlyActive = 'Lightly Active',
  ModeratelyActive = 'Moderately Active',
  VeryActive = 'Very Active',
  ExtraActive = 'Extra Active',
}

export enum FitnessGoal {
  WeightLoss = 'Weight Loss',
  MuscleGain = 'Muscle Gain',
  Maintenance = 'Maintenance',
  BetterHealth = 'Better Health',
  AthleticPerformance = 'Athletic Performance',
}

// Props interfaces
export interface QuestionItemProps {
  question: Question;
  onAnswer: (answer: string | string[], questionId: number) => void;
  value: string;
  error?: string;
  parentValue?: string;
}

export interface ReviewStepProps {
  userInfo: UserInfo;
  responses: QuestionResponse[];
  questions: Question[];
  onEdit: (step: number) => void;
  onSubmit: (data: UserInfo) => Promise<void>;
}

export interface QuestionFormData extends Omit<Question, 'id'> {}

export interface PersonalInfo {
  fullName: string;
  age: number;
  height: number;
  weight: number;
  bloodType?: string | null;
  bodyFatPercentage?: number | null;
  leanMassPercentage?: number | null;
  waistToHipRatio?: number | null;
}

export interface GoalsInfo {
  primaryGoals: string[];
  feelGoals: string;
  prioritizedGoals: string;
  challengeGoals: string;
  preferredDiet: string;
}

export interface FoodIntake {
  coffee: { isOrganic: boolean | null; additives: string[] };
  soda: { type: string | null; frequency: number | null };
  tea: { type: string; additives: string[] };
  alcohol: { type: string; drinksPerWeek: number };
  water: { isFiltered: boolean; dailyQuantity: number };
  sugaryDrinks: { types: string[] };
  artificialSweeteners: { types: string[] };
  flourProducts: { frequency: number };
  meat: { isGrassFed: boolean; processedTypes: string[] };
  dailyMeals: {
    breakfast: { description: string; isHomeCooked: boolean };
    lunch: { description: string; isHomeCooked: boolean };
    dinner: { description: string; isHomeCooked: boolean };
  };
  dislikedFoods: string;
  likedFoods: string;
}

export interface WorkoutRoutine {
  weightLifting: { frequency: string; type: string };
  cardio: { frequency: string; type: string };
  yogaPilates: { frequency: string | null; type: string | null };
  sleep: { hoursPerNight: number; quality: string; dreaming: string };
}

export interface StressLevels {
  currentLevel: number;
  endInSight: string;
  managementTechniques: string;
  recalibrationMethods: string[];
}

export interface ToxicityLifestyle {
  tobaccoUse: boolean;
  cravings: string[];
  plasticWaterBottles: boolean;
  processedFoodsPercentage: number;
  organicFoodsUse: string;
  householdProducts: string[];
}

export interface Waiver {
  agreement: boolean;
}

export interface WorkoutExercise {
  frequency: string;
  type: string;
}

export interface SleepInfo {
  hoursPerNight: number;
  quality: string;
  dreaming: string;
}

export interface StressInfo {
  currentLevel: number;
  endInSight: string;
  managementTechniques: string;
  recalibrationMethods: string[];
}

export interface BeverageInfo {
  isOrganic?: boolean;
  additives?: string[];
  type?: string;
  frequency?: number;
  isFiltered?: boolean;
  dailyQuantity?: number;
}

export interface FoodIntakeInfo {
  coffee: BeverageInfo;
  tea: BeverageInfo;
  soda: BeverageInfo;
  water: BeverageInfo;
  alcohol: BeverageInfo;
  breakfast: { isHomeCooked: boolean };
  morningSnack: { isHomePrepared: boolean };
  lunch: { isHomeCooked: boolean };
  afternoonSnack: { isHomePrepared: boolean };
  dinner: { isHomeCooked: boolean };
  likedFoods: string[];
  dislikedFoods: string[];
}

export interface ToxicityInfo {
  tobaccoUse: boolean;
  cravings: string[];
  plasticWaterBottles: boolean;
  processedFoodsPercentage: number;
  organicFoodsUse: string;
  householdProducts: string[];
}

export interface WorkoutRoutine {
  weightLifting: WorkoutExercise;
  cardio: WorkoutExercise;
  yogaPilates: WorkoutExercise;
  sleep: SleepInfo;
} 