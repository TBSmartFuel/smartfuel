import { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Box, Container, Typography, CircularProgress, Alert } from '@mui/material';
import MealPlanDisplay from '../components/meal-plan/MealPlanDisplay';
import MealPlanSummary from '../components/meal-plan/MealPlanSummary';
import { MealPlan as MealPlanType } from '../types';
import { mealPlanApi } from '../services/api';

const MealPlan = () => {
  const location = useLocation();
  const { id } = useParams();
  const [mealPlans, setMealPlans] = useState<MealPlanType[]>([]);
  const [currentMealPlan, setCurrentMealPlan] = useState<MealPlanType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get the newly generated meal plan from navigation state
  const newMealPlan = location.state?.mealPlan;

  useEffect(() => {
    if (newMealPlan) {
      setCurrentMealPlan(newMealPlan);
      setLoading(false);
    } else if (id) {
      fetchSingleMealPlan(id);
    } else {
      fetchMealPlans();
    }
  }, [newMealPlan, id]);

  const fetchSingleMealPlan = async (planId: string) => {
    try {
      setLoading(true);
      const data = await mealPlanApi.getMealPlan(planId);
      setCurrentMealPlan(data);
    } catch (error) {
      console.error('Failed to fetch meal plan:', error);
      setError('Failed to load meal plan details');
    } finally {
      setLoading(false);
    }
  };

  const fetchMealPlans = async () => {
    try {
      const data = await mealPlanApi.getMealPlans();
      setMealPlans(data);
    } catch (error) {
      console.error('Failed to fetch meal plans:', error);
      setError('Failed to load meal plans');
    } finally {
      setLoading(false);
    }
  };

  const handleMealPlanDelete = () => {
    // Refresh the list after deletion
    fetchMealPlans();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Typography color="error" gutterBottom>
            {error}
          </Typography>
        </Box>
      </Container>
    );
  }

  // If we have a current meal plan (either new or fetched by ID), show it
  if (currentMealPlan) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Typography variant="h4" gutterBottom align="center">
            Your Personalized Meal Plan
          </Typography>
          <MealPlanDisplay mealPlan={currentMealPlan} />
        </Box>
      </Container>
    );
  }

  // Otherwise show the list of existing plans
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Your Meal Plans
        </Typography>
        {mealPlans.length === 0 ? (
          <Typography color="text.secondary">
            You haven't created any meal plans yet.
          </Typography>
        ) : (
          mealPlans.map((mealPlan) => (
            <MealPlanSummary 
              key={mealPlan.id} 
              mealPlan={mealPlan} 
              onDelete={handleMealPlanDelete}
            />
          ))
        )}
      </Box>
    </Container>
  );
};

export default MealPlan; 