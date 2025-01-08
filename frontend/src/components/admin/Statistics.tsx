import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  CircularProgress,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  People as UsersIcon,
  RestaurantMenu as MealPlansIcon,
  QuestionAnswer as QuestionsIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { adminApi } from '../../services/api';

interface AdminStats {
  user_stats: {
    total_users: number;
    active_users: number;
    admin_users: number;
  };
  question_stats: {
    total_questions: number;
    active_questions: number;
  };
  meal_plan_stats: {
    total_meal_plans: number;
    active_meal_plans: number;
  };
  system_health: {
    database_connected: boolean;
    api_version: string;
    last_backup: string | null;
  };
}

interface QuestionStats {
  total_questions: number;
  active_questions: number;
  total_responses: number;
  average_responses_per_question: number;
  question_stats: Array<{
    question_id: number;
    question_text: string;
    response_count: number;
  }>;
}

interface MealPlanStats {
  total_meal_plans: number;
  active_meal_plans: number;
  users_with_plans: number;
  average_plans_per_user: number;
}

const Statistics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [questionStats, setQuestionStats] = useState<QuestionStats | null>(null);
  const [mealPlanStats, setMealPlanStats] = useState<MealPlanStats | null>(null);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    fetchStatistics();
  }, [timeRange]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all stats in parallel for better performance
      const [statsResponse, questionStatsResponse, mealPlanStatsResponse] = await Promise.all([
        adminApi.getSystemStats(),
        adminApi.getActivityData(timeRange),
        adminApi.getQuestionCategoryDistribution()
      ]);

      console.log('Stats Response:', statsResponse);
      console.log('Question Stats:', questionStatsResponse);
      console.log('Meal Plan Stats:', mealPlanStatsResponse);

      setStats(statsResponse);
      setQuestionStats(questionStatsResponse);
      setMealPlanStats(mealPlanStatsResponse);

    } catch (error: any) {
      console.error('Error fetching statistics:', error);
      const errorMsg = error.response?.data?.detail || 
                      error.response?.statusText ||
                      error.message ||
                      'Failed to fetch statistics';
      setError(`Error: ${errorMsg} (${error.response?.status || 'unknown status'})`);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color }: any) => (
    <Card>
      <CardContent sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        '&:last-child': { pb: 2 }
      }}>
        <Box>
          <Typography color="text.secondary" variant="subtitle2" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" component="div">
            {value.toLocaleString()}
          </Typography>
        </Box>
        <Box sx={{ 
          backgroundColor: `${color}.light`,
          borderRadius: '50%',
          p: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {icon}
        </Box>
      </CardContent>
    </Card>
  );

  if (loading && !stats) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Transform the data for the activity chart
  const activityData = questionStats?.question_stats?.map(stat => ({
    name: stat.question_text.length > 30 ? stat.question_text.substring(0, 30) + '...' : stat.question_text,
    responses: stat.response_count
  })) || [];

  // Transform the data for the category chart
  const categoryData = mealPlanStats ? [
    {
      category: 'Total Plans',
      count: mealPlanStats.total_meal_plans
    },
    {
      category: 'Active Plans',
      count: mealPlanStats.active_meal_plans
    },
    {
      category: 'Users with Plans',
      count: mealPlanStats.users_with_plans
    }
  ] : [];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          System Statistics
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small">
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => setTimeRange(e.target.value)}
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="7d">Last 7 Days</MenuItem>
              <MenuItem value="30d">Last 30 Days</MenuItem>
              <MenuItem value="90d">Last 90 Days</MenuItem>
            </Select>
          </FormControl>
          <Tooltip title="Refresh Statistics">
            <IconButton onClick={fetchStatistics} color="primary">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users"
            value={stats?.user_stats?.total_users || 0}
            icon={<UsersIcon sx={{ color: 'primary.main' }} />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Users"
            value={stats?.user_stats?.active_users || 0}
            icon={<UsersIcon sx={{ color: 'success.main' }} />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Questions"
            value={questionStats?.total_questions || 0}
            icon={<QuestionsIcon sx={{ color: 'info.main' }} />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Questions"
            value={questionStats?.active_questions || 0}
            icon={<QuestionsIcon sx={{ color: 'warning.main' }} />}
            color="warning"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Question Response Distribution
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    interval={0}
                  />
                  <YAxis />
                  <ChartTooltip />
                  <Legend />
                  <Bar 
                    dataKey="responses" 
                    name="Responses" 
                    fill="#1976d2" 
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Meal Plan Statistics
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis 
                    dataKey="category" 
                    type="category"
                    width={150}
                  />
                  <ChartTooltip />
                  <Bar 
                    dataKey="count" 
                    fill="#2e7d32" 
                    name="Count"
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Statistics; 