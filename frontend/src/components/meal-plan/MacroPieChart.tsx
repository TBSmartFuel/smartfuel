import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Label } from 'recharts';
import { Box, Typography } from '@mui/material';

interface MacroPieChartProps {
  macros: {
    protein: number;
    carbs: number;
    fats: number;
  };
}

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, value, name }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor="middle" 
      dominantBaseline="central"
      style={{ fontSize: '14px', fontWeight: 'bold' }}
    >
      {`${value}%`}
    </text>
  );
};

const MacroPieChart = ({ macros }: MacroPieChartProps) => {
  // Ensure total is 100%
  const total = macros.protein + macros.carbs + macros.fats;
  const normalizedMacros = total === 0 ? {
    protein: 30,
    carbs: 45,
    fats: 25
  } : {
    protein: Math.round((macros.protein / total) * 100),
    carbs: Math.round((macros.carbs / total) * 100),
    fats: Math.round((macros.fats / total) * 100)
  };

  // Adjust to ensure exactly 100%
  const adjustedMacros = { ...normalizedMacros };
  const currentTotal = adjustedMacros.protein + adjustedMacros.carbs + adjustedMacros.fats;
  if (currentTotal !== 100) {
    const diff = 100 - currentTotal;
    // Add the difference to the largest value
    const maxKey = Object.entries(adjustedMacros)
      .reduce((a, b) => a[1] > b[1] ? a : b)[0] as keyof typeof adjustedMacros;
    adjustedMacros[maxKey] += diff;
  }

  const data = [
    { name: 'Protein', value: adjustedMacros.protein, color: '#90EE90' },  // Light green
    { name: 'Carbs', value: adjustedMacros.carbs, color: '#4169E1' },     // Royal blue
    { name: 'Fat', value: adjustedMacros.fats, color: '#FF0000' }         // Red
  ];

  return (
    <Box sx={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={0}  // Changed to 0 for a full pie chart
            outerRadius={100}
            dataKey="value"
            labelLine={false}
            label={renderCustomizedLabel}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: 3, 
        mt: 2 
      }}>
        {data.map((entry) => (
          <Box 
            key={entry.name}
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: 1
            }}
          >
            <Box 
              sx={{ 
                width: 12, 
                height: 12, 
                borderRadius: '50%', 
                backgroundColor: entry.color 
              }} 
            />
            <Typography variant="body2">
              {entry.name}: {entry.value}%
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default MacroPieChart; 