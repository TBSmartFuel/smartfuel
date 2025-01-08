import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  TextField,
  Button,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormLabel,
  FormGroup,
  Paper,
  Grid,
  Slider
} from '@mui/material';
import { UserInfo } from '../../types';
import ReviewStep from './ReviewStep';

interface UserInfoFormProps {
  onSubmit: (data: UserInfo) => Promise<void>;
}

interface FormValues {
  personalInfo: {
    fullName: string;
    age: number;
    height: number;
    weight: number;
    bloodType?: string | null;
    bodyFatPercentage?: number | null;
    leanMassPercentage?: number | null;
    waistToHipRatio?: number | null;
  };
  goalsInfo: {
    primaryGoals: string[];
    feelGoals: string;
    prioritizedGoals: string;
    challengeGoals: string;
    preferredDiet: string;
  };
  foodIntake: {
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
  };
  workoutRoutine: {
    weightLifting: { frequency: string; type: string };
    cardio: { frequency: string; type: string };
    yogaPilates: { frequency: string | null; type: string | null };
    sleep: { hoursPerNight: number; quality: string; dreaming: string };
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

const formSchema = yup.object().shape({
  personalInfo: yup.object().shape({
    fullName: yup.string().required('Name is required'),
    age: yup.number()
      .transform((value) => (isNaN(value) || value === null || value === undefined) ? undefined : value)
      .required('Age is required')
      .min(18, 'Must be at least 18 years old')
      .max(120, 'Please enter a valid age'),
    height: yup.number()
      .transform((value) => (isNaN(value) || value === null || value === undefined) ? undefined : value)
      .required('Height is required')
      .min(100, 'Height must be at least 100 cm')
      .max(250, 'Height must be less than 250 cm'),
    weight: yup.number()
      .required('Weight is required')
      .min(30, 'Weight must be at least 30 kg')
      .max(300, 'Weight must be less than 300 kg'),
    bloodType: yup.string().nullable(),
    bodyFatPercentage: yup.number().nullable(),
    leanMassPercentage: yup.number().nullable(),
    waistToHipRatio: yup.number().nullable(),
  }),
  goalsInfo: yup.object().shape({
    primaryGoals: yup.array()
      .min(1, 'Please select at least one goal')
      .required('Please select your goals'),
    feelGoals: yup.string()
      .required('Please describe how you want to feel'),
    prioritizedGoals: yup.string()
      .required('Please prioritize your goals'),
    challengeGoals: yup.string()
      .required('Please describe your challenge goals'),
    preferredDiet: yup.string()
      .required('Please select your preferred diet')
  }),
  foodIntake: yup.object().shape({
    coffee: yup.object().shape({
      isOrganic: yup.boolean().nullable(),
      additives: yup.array().of(yup.string())
    }),
    soda: yup.object().shape({
      type: yup.string().nullable(),
      frequency: yup.number().nullable()
    }),
    tea: yup.object().shape({
      type: yup.string().required('Please select tea type'),
      additives: yup.array().of(yup.string())
    }),
    alcohol: yup.object().shape({
      type: yup.string(),
      drinksPerWeek: yup.number().min(0)
    }),
    water: yup.object().shape({
      isFiltered: yup.boolean(),
      dailyQuantity: yup.number().min(0)
    }),
    sugaryDrinks: yup.object().shape({
      types: yup.array().of(yup.string())
    }),
    artificialSweeteners: yup.object().shape({
      types: yup.array().of(yup.string())
    }),
    flourProducts: yup.object().shape({
      frequency: yup.number().min(0)
    }),
    meat: yup.object().shape({
      isGrassFed: yup.boolean(),
      processedTypes: yup.array().of(yup.string())
    }),
    dailyMeals: yup.object().shape({
      breakfast: yup.object().shape({
        description: yup.string().required('Please describe your breakfast'),
        isHomeCooked: yup.boolean()
      }),
      lunch: yup.object().shape({
        description: yup.string().required('Please describe your lunch'),
        isHomeCooked: yup.boolean()
      }),
      dinner: yup.object().shape({
        description: yup.string().required('Please describe your dinner'),
        isHomeCooked: yup.boolean()
      })
    }),
    dislikedFoods: yup.string().required('Please list foods you dislike'),
    likedFoods: yup.string().required('Please list foods you like')
  }),
  workoutRoutine: yup.object().shape({
    weightLifting: yup.object().shape({
      frequency: yup.string().required('Please specify weight lifting frequency'),
      type: yup.string().required('Please specify type of weight lifting')
    }),
    cardio: yup.object().shape({
      frequency: yup.string().required('Please specify cardio frequency'),
      type: yup.string().required('Please specify type of cardio')
    }),
    yogaPilates: yup.object().shape({
      frequency: yup.string().nullable(),
      type: yup.string().nullable()
    }),
    sleep: yup.object().shape({
      hoursPerNight: yup.number()
        .required('Please specify hours of sleep')
        .min(0, 'Invalid hours')
        .max(24, 'Invalid hours'),
      quality: yup.string().required('Please rate sleep quality'),
      dreaming: yup.string().required('Please specify dreaming frequency')
    })
  }),
  stressLevels: yup.object().shape({
    currentLevel: yup.number()
      .required('Please rate your stress level')
      .min(1, 'Must be between 1 and 10')
      .max(10, 'Must be between 1 and 10'),
    endInSight: yup.string().required('Please answer about stress end'),
    managementTechniques: yup.string().required('Please describe stress management'),
    recalibrationMethods: yup.array().of(yup.string())
  }),
  toxicityLifestyle: yup.object().shape({
    tobaccoUse: yup.boolean().required('Please specify tobacco use'),
    cravings: yup.array().of(yup.string()),
    plasticWaterBottles: yup.boolean().required('Please specify plastic water bottle use'),
    processedFoodsPercentage: yup.number()
      .required('Please specify processed foods percentage')
      .min(0, 'Must be between 0 and 100')
      .max(100, 'Must be between 0 and 100'),
    organicFoodsUse: yup.string().required('Please specify organic foods use'),
    householdProducts: yup.array().of(yup.string())
  }),
  waiver: yup.object().shape({
    agreement: yup.boolean()
      .oneOf([true], 'You must agree to the terms')
      .required('You must agree to the terms')
  })
});

const UserInfoForm = ({ onSubmit }: UserInfoFormProps) => {
  const [page, setPage] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Move form initialization here
  const { control, handleSubmit, formState: { errors }, getValues, trigger } = useForm<FormValues>({
    resolver: yupResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      personalInfo: {
        fullName: '',
        age: 0,
        height: 0,
        weight: 0,
        bloodType: null,
        bodyFatPercentage: null,
        leanMassPercentage: null,
        waistToHipRatio: null
      },
      goalsInfo: {
        primaryGoals: [],
        feelGoals: '',
        prioritizedGoals: '',
        challengeGoals: '',
        preferredDiet: ''
      },
      foodIntake: {
        coffee: { isOrganic: false, additives: [] },
        soda: { type: '', frequency: 0 },
        tea: { type: '', additives: [] },
        alcohol: { type: '', drinksPerWeek: 0 },
        water: { isFiltered: false, dailyQuantity: 0 },
        sugaryDrinks: { types: [] },
        artificialSweeteners: { types: [] },
        flourProducts: { frequency: 0 },
        meat: { isGrassFed: false, processedTypes: [] },
        dailyMeals: {
          breakfast: { description: '', isHomeCooked: false },
          lunch: { description: '', isHomeCooked: false },
          dinner: { description: '', isHomeCooked: false }
        },
        dislikedFoods: '',
        likedFoods: ''
      },
      workoutRoutine: {
        weightLifting: { frequency: '', type: '' },
        cardio: { frequency: '', type: '' },
        yogaPilates: { frequency: '', type: '' },
        sleep: { hoursPerNight: 0, quality: '', dreaming: '' }
      },
      stressLevels: {
        currentLevel: 1,
        endInSight: '',
        managementTechniques: '',
        recalibrationMethods: []
      },
      toxicityLifestyle: {
        tobaccoUse: false,
        cravings: [],
        plasticWaterBottles: false,
        processedFoodsPercentage: 0,
        organicFoodsUse: '',
        householdProducts: []
      },
      waiver: {
        agreement: false
      }
    }
  });

  // Helper function to safely check field values
  const getFieldValue = (field: any) => field?.value || [];

  // Helper function to safely handle array operations
  const handleArrayChange = (field: any, value: string, onChange: (value: string[]) => void) => {
    const currentValue = getFieldValue(field);
    const newValue = currentValue.includes(value)
      ? currentValue.filter((v: string) => v !== value)
      : [...currentValue, value];
    onChange(newValue);
  };

  // Define section components first
  const renderPersonalInfoSection = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Personal Information
      </Typography>

      <Controller
        name="personalInfo.fullName"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            value={field.value || ''}
            fullWidth
            label="Name"
            error={!!errors.personalInfo?.fullName}
            helperText={errors.personalInfo?.fullName?.message}
            margin="normal"
          />
        )}
      />

      <Controller
        name="personalInfo.age"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            type="number"
            label="Age"
            error={!!errors.personalInfo?.age}
            helperText={errors.personalInfo?.age?.message}
            margin="normal"
          />
        )}
      />

      <Controller
        name="personalInfo.height"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            type="number"
            label="Height (cm)"
            error={!!errors.personalInfo?.height}
            helperText={errors.personalInfo?.height?.message}
            margin="normal"
          />
        )}
      />

      <Controller
        name="personalInfo.weight"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            type="number"
            label="Weight (kg)"
            error={!!errors.personalInfo?.weight}
            helperText={errors.personalInfo?.weight?.message}
            margin="normal"
          />
        )}
      />

      <Controller
        name="personalInfo.bloodType"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            label="Blood Type (if known)"
            helperText="Ask your Fitness Consultant if unsure"
            margin="normal"
          />
        )}
      />

      <Controller
        name="personalInfo.bodyFatPercentage"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            type="number"
            label="Body Fat %"
            margin="normal"
          />
        )}
      />

      <Controller
        name="personalInfo.leanMassPercentage"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            type="number"
            label="Lean Mass %"
            margin="normal"
          />
        )}
      />

      <Controller
        name="personalInfo.waistToHipRatio"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            type="number"
            label="Waist to Hip Ratio"
            helperText="Divide waist circumference by hip circumference. Men: <0.9 is healthy, Women: <0.8 is healthy"
            margin="normal"
            inputProps={{
              step: "0.01",
              min: "0.6",
              max: "1.2"
            }}
          />
        )}
      />
    </Box>
  );

  const renderGoalsSection = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Goals
      </Typography>

      <Controller
        name="goalsInfo.primaryGoals"
        control={control}
        defaultValue={[]}
        render={({ field }) => (
          <FormControl fullWidth margin="normal">
            <FormLabel>What are your primary health and fitness goals?</FormLabel>
            <FormGroup>
              {[
                'Weight Loss',
                'Reduced Body Fat',
                'Maintenance',
                'Muscle Gain',
                'Increased Lean Mass',
                'Improved Strength'
              ].map((goal) => (
                <FormControlLabel
                  key={goal}
                  control={
                    <Checkbox
                      checked={getFieldValue(field).includes(goal)}
                      onChange={(e) => handleArrayChange(field, goal, field.onChange)}
                    />
                  }
                  label={goal}
                />
              ))}
            </FormGroup>
          </FormControl>
        )}
      />

      <Controller
        name="goalsInfo.feelGoals"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            multiline
            rows={3}
            label="How do you want to FEEL?"
            placeholder="e.g., improving energy, managing stress, addressing specific health conditions"
            margin="normal"
          />
        )}
      />

      <Controller
        name="goalsInfo.prioritizedGoals"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            multiline
            rows={3}
            label="Please list these goals in order of priority"
            placeholder="Rank them 1-5 based on importance"
            margin="normal"
          />
        )}
      />

      <Controller
        name="goalsInfo.challengeGoals"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            multiline
            rows={3}
            fullWidth
            label="What would you like to achieve through this program?"
            placeholder="Your goals for the 'Make America Healthy Again' Challenge"
            margin="normal"
          />
        )}
      />

      <Controller
        name="goalsInfo.preferredDiet"
        control={control}
        render={({ field }) => (
          <FormControl fullWidth margin="normal">
            <FormLabel>What type of diet do you prefer?</FormLabel>
            <RadioGroup {...field}>
              <FormControlLabel value="keto" control={<Radio />} label="Keto" />
              <FormControlLabel value="paleo" control={<Radio />} label="Paleo" />
              <FormControlLabel value="carnivore" control={<Radio />} label="Carnivore" />
              <FormControlLabel value="other" control={<Radio />} label="Other" />
            </RadioGroup>
          </FormControl>
        )}
      />
    </Box>
  );

  const renderFoodIntakeSection = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Food Intake
      </Typography>

      <Grid container spacing={4}>
        {/* Left Column */}
        <Grid item xs={12} md={6}>
          {/* Beverages Group */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom color="primary">
              Beverages
            </Typography>
            
            {/* Coffee Section */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" gutterBottom>Coffee</Typography>
              <Controller
                name="foodIntake.coffee.isOrganic"
                control={control}
                render={({ field }) => (
                  <FormControl component="fieldset" margin="normal">
                    <FormLabel>Type</FormLabel>
                    <RadioGroup {...field}>
                      <FormControlLabel 
                        value={true} 
                        control={<Radio />} 
                        label="Organic" 
                      />
                      <FormControlLabel 
                        value={false} 
                        control={<Radio />} 
                        label="Non-Organic" 
                      />
                    </RadioGroup>
                  </FormControl>
                )}
              />
              <Controller
                name="foodIntake.coffee.additives"
                control={control}
                defaultValue={[]}
                render={({ field }) => (
                  <FormControl fullWidth margin="normal">
                    <FormLabel>Additives</FormLabel>
                    <FormGroup>
                      {['Sugar', 'Cream', 'Milk', 'Sweetener'].map((type) => (
                        <FormControlLabel
                          key={type}
                          control={
                            <Checkbox
                              checked={field.value.includes(type)}
                              onChange={(e) => {
                                const newValue = e.target.checked
                                  ? [...field.value, type]
                                  : field.value.filter((v: string) => v !== type);
                                field.onChange(newValue);
                              }}
                            />
                          }
                          label={type}
                        />
                      ))}
                    </FormGroup>
                  </FormControl>
                )}
              />
            </Box>

            {/* Tea Section */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" gutterBottom>Tea</Typography>
              <Controller
                name="foodIntake.tea.type"
                control={control}
                render={({ field }) => (
                  <FormControl component="fieldset" margin="normal">
                    <FormLabel>Type</FormLabel>
                    <RadioGroup {...field}>
                      <FormControlLabel value="herbal" control={<Radio />} label="Herbal" />
                      <FormControlLabel value="regular" control={<Radio />} label="Regular" />
                    </RadioGroup>
                  </FormControl>
                )}
              />
              <Controller
                name="foodIntake.tea.additives"
                control={control}
                defaultValue={[]}
                render={({ field }) => (
                  <FormControl fullWidth margin="normal">
                    <FormLabel>Additives</FormLabel>
                    <FormGroup>
                      {['Sugar', 'Honey', 'Milk', 'Lemon'].map((type) => (
                        <FormControlLabel
                          key={type}
                          control={
                            <Checkbox
                              checked={field.value.includes(type)}
                              onChange={(e) => {
                                const newValue = e.target.checked
                                  ? [...field.value, type]
                                  : field.value.filter((v: string) => v !== type);
                                field.onChange(newValue);
                              }}
                            />
                          }
                          label={type}
                        />
                      ))}
                    </FormGroup>
                  </FormControl>
                )}
              />
            </Box>

            {/* Soda Section */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" gutterBottom>Soda</Typography>
              <Controller
                name="foodIntake.soda.type"
                control={control}
                render={({ field }) => (
                  <FormControl component="fieldset" margin="normal">
                    <FormLabel>Type</FormLabel>
                    <RadioGroup {...field}>
                      <FormControlLabel value="diet" control={<Radio />} label="Diet" />
                      <FormControlLabel value="regular" control={<Radio />} label="Regular" />
                    </RadioGroup>
                  </FormControl>
                )}
              />
              <Controller
                name="foodIntake.soda.frequency"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="number"
                    label="Frequency per week"
                    margin="normal"
                  />
                )}
              />
            </Box>

            {/* Water Section */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" gutterBottom>Water</Typography>
              <Controller
                name="foodIntake.water.isFiltered"
                control={control}
                render={({ field: { value, onChange, ...field } }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        {...field}
                        checked={!!value}
                        onChange={(e) => onChange(e.target.checked)}
                      />
                    }
                    label="Filtered Water"
                  />
                )}
              />
              <Controller
                name="foodIntake.water.dailyQuantity"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="number"
                    label="Daily Quantity (liters)"
                    margin="normal"
                  />
                )}
              />
            </Box>

            {/* Alcohol Section */}
            <Box>
              <Typography variant="subtitle1" gutterBottom>Alcohol</Typography>
              <Controller
                name="foodIntake.alcohol.type"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Type of Alcohol"
                    margin="normal"
                  />
                )}
              />
              <Controller
                name="foodIntake.alcohol.drinksPerWeek"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="number"
                    label="Drinks per Week"
                    margin="normal"
                  />
                )}
              />
            </Box>
          </Paper>

          {/* Sweeteners & Additives Group */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom color="primary">
              Sweeteners & Additives
            </Typography>
            
            {/* Sugary Drinks Section */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" gutterBottom>Sugary Drinks</Typography>
              <Controller
                name="foodIntake.sugaryDrinks.types"
                control={control}
                defaultValue={[]}
                render={({ field }) => (
                  <FormControl fullWidth margin="normal">
                    <FormLabel>Types of Sugary Drinks</FormLabel>
                    <FormGroup>
                      {['Fruit Juice', 'Sports Drinks', 'Energy Drinks', 'Sweetened Tea/Coffee', 'Other'].map((type) => (
                        <FormControlLabel
                          key={type}
                          control={
                            <Checkbox
                              checked={field.value.includes(type)}
                              onChange={(e) => {
                                const newValue = e.target.checked
                                  ? [...field.value, type]
                                  : field.value.filter((v: string) => v !== type);
                                field.onChange(newValue);
                              }}
                            />
                          }
                          label={type}
                        />
                      ))}
                    </FormGroup>
                  </FormControl>
                )}
              />
            </Box>

            {/* Artificial Sweeteners Section */}
            <Box>
              <Typography variant="subtitle1" gutterBottom>Artificial Sweeteners</Typography>
              <Controller
                name="foodIntake.artificialSweeteners.types"
                control={control}
                defaultValue={[]}
                render={({ field }) => (
                  <FormControl fullWidth margin="normal">
                    <FormLabel>Types of Artificial Sweeteners Used</FormLabel>
                    <FormGroup>
                      {['Aspartame', 'Sucralose', 'Stevia', 'Saccharin', 'Other'].map((type) => (
                        <FormControlLabel
                          key={type}
                          control={
                            <Checkbox
                              checked={field.value.includes(type)}
                              onChange={(e) => {
                                const newValue = e.target.checked
                                  ? [...field.value, type]
                                  : field.value.filter((v: string) => v !== type);
                                field.onChange(newValue);
                              }}
                            />
                          }
                          label={type}
                        />
                      ))}
                    </FormGroup>
                  </FormControl>
                )}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} md={6}>
          {/* Food Products Group */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom color="primary">
              Food Products
            </Typography>
            
            {/* Flour Products Section */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" gutterBottom>Flour Products</Typography>
              <Controller
                name="foodIntake.flourProducts.frequency"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth margin="normal">
                    <FormLabel>How often do you consume flour products?</FormLabel>
                    <RadioGroup {...field}>
                      <FormControlLabel value="daily" control={<Radio />} label="Daily" />
                      <FormControlLabel value="few_times_week" control={<Radio />} label="Few times a week" />
                      <FormControlLabel value="weekly" control={<Radio />} label="Weekly" />
                      <FormControlLabel value="rarely" control={<Radio />} label="Rarely" />
                      <FormControlLabel value="never" control={<Radio />} label="Never" />
                    </RadioGroup>
                  </FormControl>
                )}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                Examples: Pasta, Bagels, Crackers, Desserts
              </Typography>
            </Box>

            {/* Meat Section */}
            <Box>
              <Typography variant="subtitle1" gutterBottom>Meat</Typography>
              <Controller
                name="foodIntake.meat.isGrassFed"
                control={control}
                render={({ field: { value, onChange, ...field } }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        {...field}
                        checked={!!value}
                        onChange={(e) => onChange(e.target.checked)}
                      />
                    }
                    label="Grass-fed"
                  />
                )}
              />
              <Controller
                name="foodIntake.meat.processedTypes"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    rows={2}
                    label="Types of Processed Meat Consumed"
                    margin="normal"
                  />
                )}
              />
            </Box>
          </Paper>

          {/* Daily Meals Group */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom color="primary">
              Daily Meals
            </Typography>
            
            {/* Daily Meals Section */}
            {['breakfast', 'morningSnack', 'lunch', 'afternoonSnack', 'dinner'].map((meal) => (
              <Box key={meal} sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  {meal.charAt(0).toUpperCase() + meal.slice(1)}
                </Typography>
                <Controller
                  name={`foodIntake.dailyMeals.${meal}.description`}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      multiline
                      rows={2}
                      label="Description"
                      margin="normal"
                    />
                  )}
                />
                <Controller
                  name={`foodIntake.dailyMeals.${meal}.isHomeCooked`}
                  control={control}
                  render={({ field: { value, onChange, ...field } }) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          {...field}
                          checked={!!value}
                          onChange={(e) => onChange(e.target.checked)}
                        />
                      }
                      label="Home-cooked"
                    />
                  )}
                />
              </Box>
            ))}
          </Paper>

          {/* Food Preferences Group */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle1" gutterBottom color="primary">
              Food Preferences
            </Typography>
            
            {/* Food Preferences Section */}
            <Box>
              <Controller
                name="foodIntake.dislikedFoods"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    rows={3}
                    label="What foods do you dislike and won't eat?"
                    margin="normal"
                  />
                )}
              />
              <Controller
                name="foodIntake.likedFoods"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    rows={3}
                    label="What foods do you like?"
                    margin="normal"
                  />
                )}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );

  const renderWorkoutRoutineSection = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Current Workout Routine
      </Typography>

      {/* Weight Lifting */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>Weight Lifting</Typography>
        <Controller
          name="workoutRoutine.weightLifting.frequency"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth margin="normal">
              <FormLabel>Frequency</FormLabel>
              <RadioGroup {...field}>
                <FormControlLabel value="never" control={<Radio />} label="Never" />
                <FormControlLabel value="1-2_times" control={<Radio />} label="1-2 times per week" />
                <FormControlLabel value="3-4_times" control={<Radio />} label="3-4 times per week" />
                <FormControlLabel value="5+_times" control={<Radio />} label="5+ times per week" />
              </RadioGroup>
            </FormControl>
          )}
        />
        <Controller
          name="workoutRoutine.weightLifting.type"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Type of Weight Training"
              multiline
              rows={2}
              margin="normal"
              placeholder="Describe your weight training routine"
            />
          )}
        />
      </Paper>

      {/* Cardio */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>Cardio</Typography>
        <Controller
          name="workoutRoutine.cardio.frequency"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth margin="normal">
              <FormLabel>Frequency</FormLabel>
              <RadioGroup {...field}>
                <FormControlLabel value="never" control={<Radio />} label="Never" />
                <FormControlLabel value="1-2_times" control={<Radio />} label="1-2 times per week" />
                <FormControlLabel value="3-4_times" control={<Radio />} label="3-4 times per week" />
                <FormControlLabel value="5+_times" control={<Radio />} label="5+ times per week" />
              </RadioGroup>
            </FormControl>
          )}
        />
        <Controller
          name="workoutRoutine.cardio.type"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Type of Cardio"
              multiline
              rows={2}
              margin="normal"
              placeholder="Describe your cardio routine"
            />
          )}
        />
      </Paper>

      {/* Yoga/Pilates */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>Yoga/Pilates</Typography>
        <Controller
          name="workoutRoutine.yogaPilates.frequency"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth margin="normal">
              <FormLabel>Frequency</FormLabel>
              <RadioGroup {...field}>
                <FormControlLabel value="never" control={<Radio />} label="Never" />
                <FormControlLabel value="1-2_times" control={<Radio />} label="1-2 times per week" />
                <FormControlLabel value="3-4_times" control={<Radio />} label="3-4 times per week" />
                <FormControlLabel value="5+_times" control={<Radio />} label="5+ times per week" />
              </RadioGroup>
            </FormControl>
          )}
        />
        <Controller
          name="workoutRoutine.yogaPilates.type"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Type of Yoga/Pilates"
              multiline
              rows={2}
              margin="normal"
              placeholder="Describe your yoga/pilates practice"
            />
          )}
        />
      </Paper>

      {/* Sleep */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="subtitle1" gutterBottom>Sleep</Typography>
        <Controller
          name="workoutRoutine.sleep.hoursPerNight"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              type="number"
              label="Hours of Sleep per Night"
              margin="normal"
            />
          )}
        />
        <Controller
          name="workoutRoutine.sleep.quality"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth margin="normal">
              <FormLabel>Sleep Quality</FormLabel>
              <RadioGroup {...field}>
                <FormControlLabel value="poor" control={<Radio />} label="Poor" />
                <FormControlLabel value="fair" control={<Radio />} label="Fair" />
                <FormControlLabel value="good" control={<Radio />} label="Good" />
                <FormControlLabel value="excellent" control={<Radio />} label="Excellent" />
              </RadioGroup>
            </FormControl>
          )}
        />
        <Controller
          name="workoutRoutine.sleep.dreaming"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth margin="normal">
              <FormLabel>Dream Frequency</FormLabel>
              <RadioGroup {...field}>
                <FormControlLabel value="never" control={<Radio />} label="Never" />
                <FormControlLabel value="rarely" control={<Radio />} label="Rarely" />
                <FormControlLabel value="sometimes" control={<Radio />} label="Sometimes" />
                <FormControlLabel value="often" control={<Radio />} label="Often" />
              </RadioGroup>
            </FormControl>
          )}
        />
      </Paper>
    </Box>
  );

  const renderStressLevelsSection = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Stress Levels
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Controller
          name="stressLevels.currentLevel"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth margin="normal">
              <FormLabel>Current Stress Level (1-10)</FormLabel>
              <Slider
                {...field}
                marks
                min={1}
                max={10}
                step={1}
                valueLabelDisplay="auto"
              />
            </FormControl>
          )}
        />

        <Controller
          name="stressLevels.endInSight"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Is there an end in sight to your stressors?"
              multiline
              rows={2}
              margin="normal"
            />
          )}
        />

        <Controller
          name="stressLevels.managementTechniques"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="How do you currently manage stress?"
              multiline
              rows={3}
              margin="normal"
            />
          )}
        />

        <Controller
          name="stressLevels.recalibrationMethods"
          control={control}
          defaultValue={[]}
          render={({ field }) => (
            <FormControl fullWidth margin="normal">
              <FormLabel>Techniques to recalibrate</FormLabel>
              <FormGroup>
                {['Yoga', 'Deep Breathing', 'Meditation', 'Exercise', 'Other'].map((technique) => (
                  <FormControlLabel
                    key={technique}
                    control={
                      <Checkbox
                        checked={field.value.includes(technique)}
                        onChange={(e) => {
                          const newValue = e.target.checked
                            ? [...field.value, technique]
                            : field.value.filter((v: string) => v !== technique);
                          field.onChange(newValue);
                        }}
                      />
                    }
                    label={technique}
                  />
                ))}
              </FormGroup>
            </FormControl>
          )}
        />
      </Paper>
    </Box>
  );

  const renderToxicityLifestyleSection = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Toxicity & Lifestyle
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Controller
          name="toxicityLifestyle.tobaccoUse"
          control={control}
          render={({ field: { value, onChange, ...field } }) => (
            <FormControlLabel
              control={
                <Checkbox
                  {...field}
                  checked={!!value}
                  onChange={(e) => onChange(e.target.checked)}
                />
              }
              label="Do you use tobacco products?"
            />
          )}
        />

        <Controller
          name="toxicityLifestyle.cravings"
          control={control}
          defaultValue={[]}
          render={({ field }) => (
            <FormControl fullWidth margin="normal">
              <FormLabel>Cravings</FormLabel>
              <FormGroup>
                {['Sugar', 'Salt', 'Caffeine', 'Carbs', 'Other'].map((craving) => (
                  <FormControlLabel
                    key={craving}
                    control={
                      <Checkbox
                        checked={field.value.includes(craving)}
                        onChange={(e) => {
                          const newValue = e.target.checked
                            ? [...field.value, craving]
                            : field.value.filter((v: string) => v !== craving);
                          field.onChange(newValue);
                        }}
                      />
                    }
                    label={craving}
                  />
                ))}
              </FormGroup>
            </FormControl>
          )}
        />

        <Controller
          name="toxicityLifestyle.plasticWaterBottles"
          control={control}
          render={({ field: { value, onChange, ...field } }) => (
            <FormControlLabel
              control={
                <Checkbox
                  {...field}
                  checked={!!value}
                  onChange={(e) => onChange(e.target.checked)}
                />
              }
              label="Do you use plastic water bottles?"
            />
          )}
        />

        <Controller
          name="toxicityLifestyle.processedFoodsPercentage"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth margin="normal">
              <FormLabel>Percentage of processed foods in your diet</FormLabel>
              <Slider
                {...field}
                marks
                min={0}
                max={100}
                step={10}
                valueLabelDisplay="auto"
              />
            </FormControl>
          )}
        />

        <Controller
          name="toxicityLifestyle.organicFoodsUse"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth margin="normal">
              <FormLabel>Use of organic foods</FormLabel>
              <RadioGroup {...field}>
                <FormControlLabel value="never" control={<Radio />} label="Never" />
                <FormControlLabel value="sometimes" control={<Radio />} label="Sometimes" />
                <FormControlLabel value="mostly" control={<Radio />} label="Mostly" />
                <FormControlLabel value="always" control={<Radio />} label="Always" />
              </RadioGroup>
            </FormControl>
          )}
        />

        <Controller
          name="toxicityLifestyle.householdProducts"
          control={control}
          defaultValue={[]}
          render={({ field }) => (
            <FormControl fullWidth margin="normal">
              <FormLabel>Use of household products</FormLabel>
              <FormGroup>
                {['Microwaves', 'Air Fresheners', 'Chemical Cleaners', 'Plastic Containers', 'Other'].map((product) => (
                  <FormControlLabel
                    key={product}
                    control={
                      <Checkbox
                        checked={field.value.includes(product)}
                        onChange={(e) => {
                          const newValue = e.target.checked
                            ? [...field.value, product]
                            : field.value.filter((v: string) => v !== product);
                          field.onChange(newValue);
                        }}
                      />
                    }
                    label={product}
                  />
                ))}
              </FormGroup>
            </FormControl>
          )}
        />
      </Paper>
    </Box>
  );

  const renderWaiverSection = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Waiver and Acknowledgment
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Typography variant="body1" paragraph>
          By checking this box, you acknowledge that you understand the risks associated with this program
          and agree to our terms and conditions.
        </Typography>

        <Controller
          name="waiver.agreement"
          control={control}
          render={({ field: { value, onChange, ...field } }) => (
            <FormControlLabel
              control={
                <Checkbox
                  {...field}
                  checked={!!value}
                  onChange={(e) => onChange(e.target.checked)}
                />
              }
              label="I understand the risks associated with this program and agree to the terms"
            />
          )}
        />
        {errors.waiver?.agreement && (
          <Typography color="error" variant="caption">
            {errors.waiver.agreement.message}
          </Typography>
        )}
      </Paper>
    </Box>
  );

  // Define sections after the render functions
  const sections = [
    { title: 'Personal Information', component: renderPersonalInfoSection },
    { title: 'Goals', component: renderGoalsSection },
    { title: 'Food Intake', component: renderFoodIntakeSection },
    { title: 'Workout Routine', component: renderWorkoutRoutineSection },
    { title: 'Stress Levels', component: renderStressLevelsSection },
    { title: 'Toxicity & Lifestyle', component: renderToxicityLifestyleSection },
    { title: 'Waiver', component: renderWaiverSection }
  ];

  const handleNext = async () => {
    try {
      setError(null);
      
      // Get all current values
      const currentValues = getValues();
      
      // When clicking Review, validate all sections
      if (page === sections.length - 1) {
        // Log current values for debugging
        console.log('Current form values:', currentValues);

        // Validate only the required fields
        const requiredFields = {
          personalInfo: ['fullName', 'age', 'height', 'weight'],
          goalsInfo: ['primaryGoals', 'feelGoals', 'prioritizedGoals', 'challengeGoals', 'preferredDiet'],
          foodIntake: {
            dailyMeals: {
              breakfast: ['description'],
              lunch: ['description'],
              dinner: ['description']
            },
            preferences: ['dislikedFoods', 'likedFoods']
          },
          workoutRoutine: {
            weightLifting: ['frequency', 'type'],
            cardio: ['frequency', 'type'],
            sleep: ['hoursPerNight', 'quality', 'dreaming']
          },
          stressLevels: ['currentLevel', 'endInSight', 'managementTechniques'],
          toxicityLifestyle: ['processedFoodsPercentage', 'organicFoodsUse'],
          waiver: ['agreement']
        };

        // Check if all required fields are filled
        const validateRequiredFields = () => {
          const missingFields: string[] = [];

          // Check personalInfo
          requiredFields.personalInfo.forEach(field => {
            if (!currentValues.personalInfo[field]) {
              missingFields.push(`Personal Info: ${field}`);
            }
          });

          // Check goalsInfo
          requiredFields.goalsInfo.forEach(field => {
            if (field === 'primaryGoals' && (!currentValues.goalsInfo[field] || currentValues.goalsInfo[field].length === 0)) {
              missingFields.push(`Goals: Primary Goals`);
            } else if (!currentValues.goalsInfo[field]) {
              missingFields.push(`Goals: ${field}`);
            }
          });

          // Check foodIntake
          Object.entries(requiredFields.foodIntake.dailyMeals).forEach(([meal, fields]) => {
            fields.forEach(field => {
              if (!currentValues.foodIntake.dailyMeals[meal][field]) {
                missingFields.push(`Food Intake: ${meal} ${field}`);
              }
            });
          });

          requiredFields.foodIntake.preferences.forEach(field => {
            if (!currentValues.foodIntake[field]) {
              missingFields.push(`Food Intake: ${field}`);
            }
          });

          // Check workoutRoutine
          Object.entries(requiredFields.workoutRoutine).forEach(([category, fields]) => {
            fields.forEach(field => {
              if (!currentValues.workoutRoutine[category][field]) {
                missingFields.push(`Workout Routine: ${category} ${field}`);
              }
            });
          });

          // Check stressLevels
          requiredFields.stressLevels.forEach(field => {
            if (!currentValues.stressLevels[field]) {
              missingFields.push(`Stress Levels: ${field}`);
            }
          });

          // Check toxicityLifestyle
          requiredFields.toxicityLifestyle.forEach(field => {
            if (!currentValues.toxicityLifestyle[field]) {
              missingFields.push(`Toxicity & Lifestyle: ${field}`);
            }
          });

          // Check waiver
          if (!currentValues.waiver.agreement) {
            missingFields.push('Waiver: agreement');
          }

          return {
            isValid: missingFields.length === 0,
            missingFields
          };
        };

        const { isValid, missingFields } = validateRequiredFields();
        
        if (isValid) {
          setActiveStep(1);
        } else {
          console.log('Missing fields:', missingFields);
          setError(`Please complete the following fields: ${missingFields.join(', ')}`);
        }
      } else {
        // For other sections, validate current section only
        let fieldsToValidate = [];
        switch (page) {
          case 0: // Personal Information
            fieldsToValidate = ['personalInfo.fullName', 'personalInfo.age', 'personalInfo.height', 'personalInfo.weight'];
            break;
          case 1: // Goals
            fieldsToValidate = [
              'goalsInfo.primaryGoals',
              'goalsInfo.feelGoals',
              'goalsInfo.prioritizedGoals',
              'goalsInfo.challengeGoals',
              'goalsInfo.preferredDiet'
            ];
            break;
          case 2: // Food Intake
            fieldsToValidate = [
              'foodIntake.dailyMeals.breakfast.description',
              'foodIntake.dailyMeals.lunch.description',
              'foodIntake.dailyMeals.dinner.description',
              'foodIntake.dislikedFoods',
              'foodIntake.likedFoods'
            ];
            break;
        }

        const isValid = await trigger(fieldsToValidate);
        if (isValid) {
          setPage(prev => prev + 1);
        } else {
          setError('Please fill in all required fields for this section');
        }
      }
    } catch (err) {
      console.error('Form error:', err);
      setError('An error occurred while validating the form');
    }
  };

  const handleBack = () => {
    if (page > 0) {
      setPage(prev => prev - 1);
    }
  };

  const handleGenerateMealPlan = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      const formData = getValues();
      await onSubmit(formData);
    } catch (err) {
      console.error('Submission error:', err);
      setError('Failed to generate meal plan');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add these common styles for form fields
  const commonStyles = {
    textField: {
      '& .MuiOutlinedInput-root': {
        borderRadius: 2,
        '&:hover fieldset': {
          borderColor: 'primary.main',
        }
      }
    },
    section: {
      mb: 6,
      p: 3,
      bgcolor: 'background.paper',
      borderRadius: 2,
      boxShadow: 1
    },
    sectionTitle: {
      color: 'primary.main',
      fontWeight: 'medium',
      mb: 3
    },
    formControl: {
      mb: 3,
      '& .MuiFormLabel-root': {
        color: 'text.secondary'
      }
    }
  };

  // Add these styles near the top of the component
  const styles = {
    paper: {
      p: 3,
      mb: 3,
      borderRadius: 2,
      boxShadow: (theme) => theme.shadows[2],
      '&:hover': {
        boxShadow: (theme) => theme.shadows[4],
      },
      transition: 'box-shadow 0.3s ease-in-out'
    },
    sectionTitle: {
      color: 'primary.main',
      fontWeight: 500,
      mb: 2
    },
    subsection: {
      mb: 4,
      '&:last-child': {
        mb: 0
      }
    },
    formControl: {
      width: '100%'
    }
  };

  return (
    <Box sx={{ maxWidth: 'lg', mx: 'auto', p: 3 }}>
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 4,
            borderRadius: 2,
            boxShadow: 1
          }}
        >
          {error}
        </Alert>
      )}

      <Paper 
        elevation={3} 
        sx={{ 
          p: 4,
          borderRadius: 2,
          mb: 4
        }}
      >
        <Typography 
          variant="h4" 
          gutterBottom 
          sx={{ 
            mb: 4,
            fontWeight: 'medium',
            color: 'primary.main'
          }}
        >
          Create Your Meal Plan
        </Typography>

        <Typography 
          variant="subtitle1" 
          sx={{ 
            mb: 4,
            color: 'text.secondary'
          }}
        >
          Let's gather some information to create your personalized meal plan
        </Typography>

        <Stepper 
          activeStep={activeStep} 
          sx={{ 
            mb: 6,
            '& .MuiStepLabel-root': {
              color: 'text.secondary'
            },
            '& .MuiStepLabel-active': {
              color: 'primary.main'
            }
          }}
        >
          {['Form', 'Review'].map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep === 0 ? (
          <>
            <Typography 
              variant="h5" 
              gutterBottom
              sx={{ 
                mb: 4,
                fontWeight: 'medium',
                color: 'text.primary'
              }}
            >
              {sections[page].title}
            </Typography>

            <Box sx={{ mb: 4 }}>
              {sections[page].component()}
            </Box>

            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              borderTop: 1,
              borderColor: 'divider',
              pt: 3,
              mt: 4
            }}>
              {page > 0 && (
                <Button 
                  onClick={handleBack}
                  sx={{
                    px: 4,
                    py: 1.5,
                    borderRadius: 2
                  }}
                >
                  Back
                </Button>
              )}
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={isSubmitting}
                sx={{
                  px: 6,
                  py: 1.5,
                  borderRadius: 2,
                  boxShadow: 2
                }}
              >
                {page === sections.length - 1 ? 'Review' : 'Next'}
              </Button>
            </Box>
          </>
        ) : (
          <ReviewStep
            formData={getValues()}
            onBack={() => setActiveStep(0)}
            onSubmit={handleGenerateMealPlan}
            isSubmitting={isSubmitting}
          />
        )}
      </Paper>
    </Box>
  );
};

export default UserInfoForm; 