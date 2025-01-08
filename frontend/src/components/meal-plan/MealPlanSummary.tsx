import { Paper, Typography, Box, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { MealPlan } from '../../types';
import { mealPlanApi } from '../../services/api';
import { useState } from 'react';
import MacroPieChart from './MacroPieChart';

interface MealPlanSummaryProps {
  mealPlan: MealPlan;
  onDelete?: () => void;
}

const MealPlanSummary = ({ mealPlan, onDelete }: MealPlanSummaryProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Early validation
  if (!mealPlan?.plan_data) {
    return null;
  }

  // Safely extract data with default values
  const {
    daily_calories = 0,
    macros = { protein: 0, carbs: 0, fats: 0 },
  } = mealPlan.plan_data;

  // Calculate macro percentages safely
  const totalMacros = (macros.protein * 4) + (macros.carbs * 4) + (macros.fats * 9);
  const proteinPercentage = totalMacros > 0 ? Math.round((macros.protein * 4 / totalMacros) * 100) : 0;
  const carbsPercentage = totalMacros > 0 ? Math.round((macros.carbs * 4 / totalMacros) * 100) : 0;
  const fatsPercentage = totalMacros > 0 ? Math.round((macros.fats * 9 / totalMacros) * 100) : 0;

  const date = new Date(mealPlan.created_at).toLocaleDateString();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await mealPlanApi.deleteMealPlan(mealPlan.id);
      setIsDeleteDialogOpen(false);
      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      console.error('Failed to delete meal plan:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Paper sx={{ p: 3, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Created on {date}
            </Typography>
            <Typography variant="h6">
              {daily_calories} kcal/day
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button
              component={RouterLink}
              to={`/meal-plan/${mealPlan.id}`}
              variant="outlined"
            >
              View Details
            </Button>
            <IconButton
              onClick={() => setIsDeleteDialogOpen(true)}
              color="error"
              size="small"
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>
      </Paper>

      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => !isDeleting && setIsDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Meal Plan</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this meal plan? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setIsDeleteDialogOpen(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            disabled={isDeleting}
            variant="contained"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MealPlanSummary; 