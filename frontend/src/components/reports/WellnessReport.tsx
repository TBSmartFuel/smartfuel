import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableRow,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip
} from '@mui/material';

interface WellnessReportProps {
  report: {
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
    meal_plan: {
      weeks: Array<{
        days: Array<{
          breakfast: { meal: string; portion: string };
          lunch: { meal: string; portion: string };
          dinner: { meal: string; portion: string };
          snacks: Array<{ meal: string; portion: string }>;
        }>;
      }>;
    };
    stress_management: {
      rest_recovery: string[];
      journaling: string;
      breathing: string[];
    };
    workout_plan: {
      frequency: string;
      exercises: Array<{
        type: string;
        frequency: string;
        guidelines: string[];
      }>;
      recovery: string[];
    };
    additional_recommendations: string[];
  };
}

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 3, mb: 2 }}>
    {children}
  </Typography>
);

const WellnessReport = ({ report }: WellnessReportProps) => {
  return (
    <Box sx={{ p: 3 }}>
      {/* Client Profile */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>Client Wellness Profile</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography><strong>Name:</strong> {report.client_profile.name}</Typography>
            <Typography><strong>Age:</strong> {report.client_profile.age}</Typography>
            <Typography><strong>Height:</strong> {report.client_profile.height}</Typography>
            <Typography><strong>Weight:</strong> {report.client_profile.weight}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography><strong>Blood Type:</strong> {report.client_profile.blood_type}</Typography>
            <Typography><strong>Body Fat:</strong> {report.client_profile.body_fat}</Typography>
            <Typography><strong>Lean Mass:</strong> {report.client_profile.lean_mass}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ mt: 2 }}>
              <Typography><strong>Goals:</strong></Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                {report.client_profile.goals.map((goal, index) => (
                  <Chip key={index} label={goal} color="primary" variant="outlined" />
                ))}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Nutritional Plan */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <SectionTitle>Nutritional Plan</SectionTitle>
        <Grid container spacing={3}>
          {/* Food Groups */}
          <Grid item xs={12}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Highly Beneficial</strong></TableCell>
                  <TableCell><strong>Neutral</strong></TableCell>
                  <TableCell><strong>Avoid</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>{report.nutritional_plan.food_groups.highly_beneficial.join(', ')}</TableCell>
                  <TableCell>{report.nutritional_plan.food_groups.neutral.join(', ')}</TableCell>
                  <TableCell>{report.nutritional_plan.food_groups.avoid.join(', ')}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Grid>
          
          {/* Macros */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>Daily Macros</Typography>
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              <Typography><strong>Calories:</strong> {report.nutritional_plan.macros.daily_calories}</Typography>
              <Typography><strong>Protein:</strong> {report.nutritional_plan.macros.protein}</Typography>
              <Typography><strong>Carbs:</strong> {report.nutritional_plan.macros.carbs}</Typography>
              <Typography><strong>Fats:</strong> {report.nutritional_plan.macros.fats}</Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Meal Plan */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <SectionTitle>14-Day Meal Plan</SectionTitle>
        {report.meal_plan.weeks.map((week, weekIndex) => (
          <Box key={weekIndex} sx={{ mb: 4 }}>
            <Typography variant="subtitle1" gutterBottom>Week {weekIndex + 1}</Typography>
            {week.days.map((day, dayIndex) => (
              <Box key={dayIndex} sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>Day {dayIndex + 1}</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography><strong>Breakfast:</strong></Typography>
                    <Typography>{day.breakfast.meal} - {day.breakfast.portion}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography><strong>Lunch:</strong></Typography>
                    <Typography>{day.lunch.meal} - {day.lunch.portion}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography><strong>Dinner:</strong></Typography>
                    <Typography>{day.dinner.meal} - {day.dinner.portion}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography><strong>Snacks:</strong></Typography>
                    {day.snacks.map((snack, index) => (
                      <Typography key={index}>{snack.meal} - {snack.portion}</Typography>
                    ))}
                  </Grid>
                </Grid>
                <Divider sx={{ my: 2 }} />
              </Box>
            ))}
          </Box>
        ))}
      </Paper>

      {/* Stress Management */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <SectionTitle>Stress Management</SectionTitle>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" gutterBottom>Rest & Recovery</Typography>
            <List>
              {report.stress_management.rest_recovery.map((item, index) => (
                <ListItem key={index}>
                  <ListItemText primary={item} />
                </ListItem>
              ))}
            </List>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" gutterBottom>Journaling Practice</Typography>
            <Typography>{report.stress_management.journaling}</Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" gutterBottom>Breathing Techniques</Typography>
            <List>
              {report.stress_management.breathing.map((technique, index) => (
                <ListItem key={index}>
                  <ListItemText primary={technique} />
                </ListItem>
              ))}
            </List>
          </Grid>
        </Grid>
      </Paper>

      {/* Workout Plan */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <SectionTitle>Workout Plan</SectionTitle>
        <Typography><strong>Frequency:</strong> {report.workout_plan.frequency}</Typography>
        {report.workout_plan.exercises.map((exercise, index) => (
          <Box key={index} sx={{ mt: 2 }}>
            <Typography variant="subtitle2">{exercise.type}</Typography>
            <Typography>Frequency: {exercise.frequency}</Typography>
            <List>
              {exercise.guidelines.map((guideline, idx) => (
                <ListItem key={idx}>
                  <ListItemText primary={guideline} />
                </ListItem>
              ))}
            </List>
          </Box>
        ))}
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2">Recovery Guidelines</Typography>
          <List>
            {report.workout_plan.recovery.map((item, index) => (
              <ListItem key={index}>
                <ListItemText primary={item} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Paper>

      {/* Additional Recommendations */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <SectionTitle>Additional Recommendations</SectionTitle>
        <List>
          {report.additional_recommendations.map((recommendation, index) => (
            <ListItem key={index}>
              <ListItemText primary={recommendation} />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default WellnessReport; 