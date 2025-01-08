import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Button, 
  styled, 
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel,
  IconButton,
  Chip,
  Card,
  CardContent,
  Tooltip,
} from '@mui/material';
import {
  Print as PrintIcon,
  Restaurant as MealIcon,
  LocalFireDepartment as CaloriesIcon,
  FitnessCenter as ProteinIcon,
  Grain as CarbsIcon,
  Opacity as FatsIcon,
  Today as TodayIcon,
  DateRange as WeekIcon,
  Info as InfoIcon,
  LocalDining as FoodIcon,
  Schedule as TimeIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { MealPlan } from '../../types';
import { useState } from 'react';
import MacroPieChart from './MacroPieChart';

interface MealPlanDisplayProps {
  mealPlan: MealPlan;
}

interface PrintSelections {
  nutritionalGoals: boolean;
  todaysPlan: boolean;
  weeklyPlan: boolean;
  tips: boolean;
  selectedDay: string | null;
  personalInfo: boolean;
}

interface MealItem {
  name: string;
  portions: string;
  calories: number;
}

interface DayMeals {
  breakfast: MealItem[];
  morning_snack: MealItem[];
  lunch: MealItem[];
  afternoon_snack: MealItem[];
  dinner: MealItem[];
  [key: string]: MealItem[]; // Index signature for dynamic access
}

interface WeekPlan {
  [key: string]: DayMeals;
}

interface WeeklyPlan {
  week1: WeekPlan;
  week2: WeekPlan;
}

interface WeeklyPlanSectionProps {
  weekly_plan: WeeklyPlan;
  printSelections: PrintSelections;
}

// Styled components for print-friendly layout
const PrintableContent = styled('div')(({ theme }) => ({
  // Regular styles for screen
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.default,
  minHeight: '100vh',
  width: '100%',
  '& .print-hide': {
    '@media screen': {
      display: 'block'
    },
    '@media print': {
      display: 'none !important'
    }
  },
  '& .show-in-print': {
    display: 'block'
  },
  '& .hide-in-print': {
    '@media print': {
      display: 'none !important'
    }
  },
  // Print media styles
  '@media print': {
    backgroundColor: 'white !important',
    color: 'black !important',
    margin: '0 !important',
    padding: '0 !important',
    width: '100% !important',
    minHeight: 'auto !important',
    position: 'relative',

    // Size and layout
    '@page': {
      size: 'A4',
      margin: '1.5cm',
    },

    // Enable page breaks
    '& .page-break': {
      pageBreakBefore: 'always !important',
      breakBefore: 'page !important',
    },

    // Prevent unwanted breaks
    '& .no-break': {
      pageBreakInside: 'avoid !important',
      breakInside: 'avoid !important',
    },

    // Grid layout adjustments
    '& .MuiGrid-container': {
      display: 'grid !important',
      gridTemplateColumns: '1fr 1fr !important',
      gap: '16px !important',
      width: '100% !important',
      margin: '0 !important',
      pageBreakInside: 'avoid !important',
    },

    '& .MuiGrid-item': {
      padding: '8px !important',
      pageBreakInside: 'avoid !important',
      breakInside: 'avoid !important',
      width: '100% !important',
      maxWidth: '100% !important',
      flexBasis: '100% !important',
    },

    // Card styles
    '& .MuiPaper-root': {
      boxShadow: 'none !important',
      border: '1px solid #ddd !important',
      margin: '16px 0 !important',
      pageBreakInside: 'avoid !important',
      breakInside: 'avoid !important',
      width: '100% !important',
      backgroundColor: 'white !important',
    },

    // Typography and content
    '& .MuiTypography-root': {
      color: 'black !important',
      marginBottom: '4px !important',
    },

    '& .MuiChip-root': {
      border: '1px solid #ddd !important',
      backgroundColor: 'transparent !important',
      pageBreakInside: 'avoid !important',
      display: 'inline-flex !important',
      margin: '2px !important',
      color: 'black !important',
    },

    // Icons in print
    '& .MuiSvgIcon-root': {
      color: 'black !important',
      fill: 'black !important',
    },
  }
}));

// Container for better layout
const ContentContainer = styled('div')(({ theme }) => ({
  maxWidth: '1200px',
  margin: '0 auto',
  width: '100%',
  '@media print': {
    maxWidth: 'none',
    margin: 0,
    width: '100%',
  }
}));

const StyledCard = styled(Card)(({ theme }) => ({
  transition: 'transform 0.2s, box-shadow 0.2s',
  borderRadius: '16px',
  border: '1px solid rgba(0, 0, 0, 0.08)',
  background: '#ffffff',
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
  },
  '& .MuiCardContent-root': {
    padding: theme.spacing(2),
    '&:last-child': {
      paddingBottom: theme.spacing(2),
    },
  },
}));

// Add new styled components for enhanced design
const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '2rem',
  fontWeight: 600,
  color: theme.palette.primary.main,
  marginBottom: theme.spacing(3),
  display: 'flex',
  alignItems: 'center',
  '& .MuiSvgIcon-root': {
    fontSize: '2rem',
    marginRight: theme.spacing(2),
  },
}));

const SubSectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.5rem',
  fontWeight: 500,
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  '& .MuiSvgIcon-root': {
    fontSize: '1.5rem',
    marginRight: theme.spacing(1.5),
  },
}));

const InfoLabel = styled(Typography)(({ theme }) => ({
  fontSize: '1rem',
  color: theme.palette.text.secondary,
  fontWeight: 500,
  marginBottom: theme.spacing(0.5),
}));

const InfoValue = styled(Typography)(({ theme }) => ({
  fontSize: '1.1rem',
  color: theme.palette.text.primary,
  fontWeight: 400,
  marginBottom: theme.spacing(2),
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  borderRadius: '12px',
  padding: theme.spacing(1, 2),
  height: 'auto',
  '& .MuiChip-label': {
    fontSize: '1rem',
    padding: theme.spacing(0.5, 0),
  },
  '& .MuiChip-icon': {
    fontSize: '1.2rem',
    marginLeft: theme.spacing(0.5),
    marginRight: theme.spacing(0.5),
  },
  '& .MuiSvgIcon-root': {
    marginRight: theme.spacing(0.5),
  },
}));

const MacroChip = styled(StyledChip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  padding: theme.spacing(1.5, 2),
  '& .MuiChip-label': {
    fontSize: '1.1rem',
    fontWeight: 500,
  },
  '& .MuiChip-icon': {
    fontSize: '1.3rem',
  },
}));

const DayCard = styled(StyledCard)(({ theme }) => ({
  background: theme.palette.background.paper,
  '& .day-header': {
    borderBottom: `2px solid ${theme.palette.primary.main}`,
    marginBottom: theme.spacing(2),
    paddingBottom: theme.spacing(1),
  },
  '& .meal-type': {
    background: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
    padding: theme.spacing(1, 2),
    borderRadius: '8px',
    marginBottom: theme.spacing(2),
  },
}));

const MealItem = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: '12px',
  background: theme.palette.grey[50],
  marginBottom: theme.spacing(2),
  border: `1px solid ${theme.palette.grey[200]}`,
  '&:hover': {
    background: theme.palette.grey[100],
  },
}));

// Add this styled component for the recommendation cards
const RecommendationCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  cursor: 'default',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
  },
  border: `1px solid ${theme.palette.divider}`,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '4px',
    height: '100%',
    backgroundColor: theme.palette.primary.main,
  }
}));

const formatMealType = (mealType: string) => {
  const type = mealType.toLowerCase();
  switch (type) {
    case 'morning_snack':
      return 'Morning Snack';
    case 'afternoon_snack':
      return 'Afternoon Snack';
    default:
      return mealType.charAt(0).toUpperCase() + mealType.slice(1).toLowerCase();
  }
};

const getMealTypeOrder = (mealType: string): number => {
  const type = mealType.toLowerCase();
  switch (type) {
    case 'breakfast':
      return 1;
    case 'morning_snack':
      return 2;
    case 'lunch':
      return 3;
    case 'afternoon_snack':
      return 4;
    case 'dinner':
      return 5;
    default:
      return 6;
  }
};

const WeeklyPlanSection: React.FC<WeeklyPlanSectionProps> = ({ weekly_plan, printSelections }) => {
  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

  // Helper function to ensure we always have an array
  const ensureArray = (mealList: MealItem[] | undefined): MealItem[] => {
    if (!mealList) return [];
    return Array.isArray(mealList) ? mealList : [mealList];
  };

  // Early validation and data structure handling
  if (!weekly_plan) {
    return (
      <Box>
        <Typography color="error">No meal plan data available</Typography>
      </Box>
    );
  }

  // Check if it's the new two-week structure or old single-week structure
  const isNewStructure = 'week1' in weekly_plan && 'week2' in weekly_plan;
  
  // If it's the old structure, wrap it in the new structure format
  const normalizedWeeklyPlan = isNewStructure ? weekly_plan : {
    week1: weekly_plan,
    week2: weekly_plan // Use same data for week 2 as temporary solution
  };

  return (
    <Box>
      <SectionTitle>
        <WeekIcon />
        {isNewStructure ? 'Two-Week Meal Plan' : 'Weekly Meal Plan'}
      </SectionTitle>
      {(['week1', 'week2'] as const).map((weekNum) => {
        // Skip week2 if using old structure
        if (!isNewStructure && weekNum === 'week2') return null;
        
        return (
          <Box key={weekNum}>
            {isNewStructure && (
              <SubSectionTitle sx={{ mt: 4, mb: 2 }}>
                <WeekIcon />
                {capitalizeFirstLetter(weekNum)}
              </SubSectionTitle>
            )}
            <Box className="weekly-plan-grid" sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(4, 1fr)'
              },
              gap: 2
            }}>
              {Object.entries(normalizedWeeklyPlan[weekNum] as WeekPlan).map(([day, meals]) => (
                <DayCard key={day} className="no-break">
                  <CardContent>
                    <Box className="day-header">
                      <SubSectionTitle>
                        <TodayIcon />
                        {capitalizeFirstLetter(day)}
                      </SubSectionTitle>
                    </Box>
                    {Object.entries(meals as DayMeals)
                      .sort(([a], [b]) => getMealTypeOrder(a) - getMealTypeOrder(b))
                      .map(([mealType, mealList]) => (
                        <Box key={mealType} className="meal-section">
                          <Typography variant="h6" className="meal-type">
                            <FoodIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                            {formatMealType(mealType)}
                          </Typography>
                          {ensureArray(mealList).map((meal, index) => (
                            <MealItem key={index}>
                              <Typography variant="h6" sx={{ fontWeight: 500, mb: 1 }}>
                                {meal.name}
                              </Typography>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                <StyledChip 
                                  label={`${meal.portions}`}
                                  color="primary"
                                  variant="outlined"
                                />
                                <StyledChip 
                                  icon={<CaloriesIcon />}
                                  label={`${meal.calories} kcal`}
                                  color="secondary"
                                  sx={{ 
                                    '& .MuiChip-icon': {
                                      marginRight: '4px'
                                    }
                                  }}
                                />
                              </Box>
                            </MealItem>
                          ))}
                        </Box>
                      ))}
                  </CardContent>
                </DayCard>
              ))}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

// Add type for recommendation
type Recommendation = string | { category?: string; tip?: string; importance?: string; text?: string };

const MealPlanDisplay = ({ mealPlan }: MealPlanDisplayProps) => {
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
  const [printSelections, setPrintSelections] = useState<PrintSelections>({
    nutritionalGoals: true,
    todaysPlan: true,
    weeklyPlan: true,
    tips: true,
    selectedDay: null,
    personalInfo: true
  });

  // Early validation
  if (!mealPlan?.plan_data) {
    return null;
  }

  const {
    daily_calories = 0,
    macros = { protein: 0, carbs: 0, fats: 0 },
    meals = [],
    weekly_plan = {},
    user_info = {
      full_name: 'N/A',
      sex: 'N/A',
      phone: 'N/A',
      email: 'N/A',
      age: 'N/A'
    },
    recommendations = [],
    created_at
  } = mealPlan.plan_data;

  console.log('Meal Plan Data:', mealPlan.plan_data); // Debug log
  console.log('User Info:', user_info); // Debug log

  const handlePrintDialogOpen = () => {
    setIsPrintDialogOpen(true);
  };

  const handlePrint = () => {
    setIsPrintDialogOpen(false);
    
    setTimeout(() => {
      // Store original styles
      const originalStyles = {
        overflow: document.body.style.overflow,
        height: document.body.style.height,
        position: document.body.style.position,
        backgroundColor: document.body.style.backgroundColor,
      };

      // Prepare document for printing
      document.body.style.overflow = 'visible';
      document.body.style.height = 'auto';
      document.body.style.position = 'relative';
      document.body.style.backgroundColor = 'white';

      // Hide all non-selected sections
      const sections = document.querySelectorAll('.print-section');
      sections.forEach((section: Element) => {
        const sectionElement = section as HTMLElement;
        if (sectionElement.dataset.section) {
          const sectionName = sectionElement.dataset.section as keyof PrintSelections;
          if (!printSelections[sectionName]) {
            sectionElement.style.display = 'none';
          } else {
            sectionElement.style.display = 'block';
          }
        }
      });

      // Print the document
      window.print();

      // Restore section visibility
      sections.forEach((section: Element) => {
        const sectionElement = section as HTMLElement;
        sectionElement.style.display = '';
      });

      // Restore original styles
      document.body.style.overflow = originalStyles.overflow;
      document.body.style.height = originalStyles.height;
      document.body.style.position = originalStyles.position;
      document.body.style.backgroundColor = originalStyles.backgroundColor;
    }, 100);
  };

  const handlePrintSelectionChange = (section: keyof PrintSelections) => {
    setPrintSelections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleDaySelection = (day: string) => {
    setPrintSelections(prev => ({
      ...prev,
      selectedDay: day
    }));
  };

  // Helper function to get meals for a specific day
  const getMealsForDay = (day: string) => {
    if (!weekly_plan[day]) return [];
    
    return Object.entries(weekly_plan[day])
      .sort(([a], [b]) => getMealTypeOrder(a) - getMealTypeOrder(b))
      .flatMap(([mealType, mealList]) =>
        mealList.map(meal => ({
          ...meal,
          type: mealType,
          macros: { protein: 0, carbs: 0, fats: 0 }, // Default macros
          foods: [{ name: meal.name, amount: parseInt(meal.portions), unit: 'portion' }]
        }))
      );
  };

  // Get the meals to display based on selection
  const mealsToDisplay = printSelections.selectedDay ? 
    getMealsForDay(printSelections.selectedDay) : 
    meals;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

  return (
    <>
      <PrintableContent>
        <ContentContainer>
          <Box sx={{ position: 'relative', mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <MealIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Typography variant="h4" gutterBottom>
                  Your Personalized Meal Plan
                </Typography>
              </Box>
            </Box>
            
            <Typography variant="subtitle1" color="text.secondary" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <TimeIcon sx={{ mr: 1 }} />
              Created on {formatDate(mealPlan.created_at)}
            </Typography>

            <Box className="print-section" data-section="personalInfo">
              <StyledCard>
                <CardContent>
                  <SubSectionTitle>
                    <PersonIcon />
                    Personal Information
                  </SubSectionTitle>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ mb: 2 }}>
                        <InfoLabel>Full Name</InfoLabel>
                        <InfoValue>{user_info.full_name}</InfoValue>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <InfoLabel>Sex</InfoLabel>
                        <InfoValue>{user_info.sex}</InfoValue>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <InfoLabel>Age</InfoLabel>
                        <InfoValue>{user_info.age}</InfoValue>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ mb: 2 }}>
                        <InfoLabel>Phone Number</InfoLabel>
                        <InfoValue>{user_info.phone}</InfoValue>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <InfoLabel>Email Address</InfoLabel>
                        <InfoValue>{user_info.email}</InfoValue>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </StyledCard>
            </Box>

            <Box className="print-section" data-section="nutritionalGoals">
              <StyledCard>
                <CardContent>
                  <SubSectionTitle>
                    <CaloriesIcon />
                    Daily Nutritional Goals
                  </SubSectionTitle>
                  <Grid container spacing={4}>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 3 }}>
                        <Typography variant="h3" color="primary" sx={{ fontWeight: 600 }}>
                          {daily_calories}
                        </Typography>
                        <Typography variant="h5" sx={{ ml: 1 }}>kcal/day</Typography>
                      </Box>
                      <MacroPieChart macros={macros} />
                    </Grid>
                  </Grid>
                </CardContent>
              </StyledCard>
            </Box>
            <Box className="print-section" data-section="weeklyPlan">
              <WeeklyPlanSection weekly_plan={weekly_plan} printSelections={printSelections} />
            </Box>

            <Box className="print-section" data-section="tips">
              {recommendations && recommendations.length > 0 ? (
                <StyledCard sx={{ mt: 4 }} className="no-break">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <InfoIcon sx={{ color: 'primary.main', mr: 1, fontSize: 28 }} />
                      <Typography variant="h5">Personalized Recommendations</Typography>
                    </Box>
                    <Grid container spacing={3}>
                      {recommendations.map((recommendation: Recommendation, index) => {
                        // Handle both string and object recommendations
                        const recommendationText = typeof recommendation === 'string' 
                          ? recommendation 
                          : recommendation.tip || recommendation.text || 'No recommendation text';

                        return (
                          <Grid item xs={12} md={6} key={index}>
                            <RecommendationCard>
                              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                <Box
                                  sx={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: '50%',
                                    backgroundColor: 'primary.light',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                  }}
                                >
                                  <Typography 
                                    sx={{ 
                                      color: 'primary.main',
                                      fontWeight: 600,
                                      fontSize: '1rem'
                                    }}
                                  >
                                    {index + 1}
                                  </Typography>
                                </Box>
                                <Typography 
                                  variant="body1" 
                                  color="text.primary"
                                  sx={{ 
                                    fontWeight: 500,
                                    lineHeight: 1.5,
                                    pl: 1 
                                  }}
                                >
                                  {recommendationText}
                                </Typography>
                              </Box>
                            </RecommendationCard>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </CardContent>
                </StyledCard>
              ) : null}
            </Box>
          </Box>
        </ContentContainer>
      </PrintableContent>

      <Dialog 
        open={isPrintDialogOpen} 
        onClose={() => setIsPrintDialogOpen(false)}
        className="print-hide"
        sx={{
          '& .MuiDialog-paper': {
            minWidth: 300,
            p: 2
          }
        }}
      >
        <DialogTitle sx={{ pb: 2 }}>
          Select Sections to Print
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={printSelections.personalInfo}
                onChange={() => handlePrintSelectionChange('personalInfo')}
                color="primary"
              />
            }
            label="Personal Information"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={printSelections.nutritionalGoals}
                onChange={() => handlePrintSelectionChange('nutritionalGoals')}
                color="primary"
              />
            }
            label="Nutritional Goals"
          />
          <Box sx={{ ml: -1.5, mt: 1 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={printSelections.todaysPlan}
                  onChange={() => handlePrintSelectionChange('todaysPlan')}
                  color="primary"
                />
              }
              label="Daily Meal Plan"
            />
            {printSelections.todaysPlan && (
              <Box sx={{ ml: 4, mt: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Select Day:
                </Typography>
                {Object.keys(weekly_plan).map((day) => (
                  <FormControlLabel
                    key={day}
                    control={
                      <Checkbox
                        checked={printSelections.selectedDay === day}
                        onChange={() => handleDaySelection(day)}
                        color="primary"
                        size="small"
                      />
                    }
                    label={capitalizeFirstLetter(day)}
                  />
                ))}
              </Box>
            )}
          </Box>
          <FormControlLabel
            control={
              <Checkbox
                checked={printSelections.weeklyPlan}
                onChange={() => handlePrintSelectionChange('weeklyPlan')}
                color="primary"
              />
            }
            label="Weekly Meal Plan"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={printSelections.tips}
                onChange={() => handlePrintSelectionChange('tips')}
                color="primary"
              />
            }
            label="Notes & Tips"
          />
        </DialogContent>
        <DialogActions sx={{ pt: 2 }}>
          <Button 
            onClick={() => setIsPrintDialogOpen(false)}
            color="inherit"
          >
            Cancel
          </Button>
          <Button 
            onClick={handlePrint}
            variant="contained" 
            color="primary"
            startIcon={<PrintIcon />}
          >
            Print Selected
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MealPlanDisplay; 