import { useState } from 'react';
import { Box, Tabs, Tab, Typography } from '@mui/material';
import QuestionManager from './QuestionManager';
import UserManager from './UserManager';
import Statistics from './Statistics';
import UserApproval from './UserApproval';
import SystemPromptManager from './SystemPromptManager';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `admin-tab-${index}`,
    'aria-controls': `admin-tabpanel-${index}`,
  };
}

const AdminDashboard = () => {
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={currentTab} 
          onChange={handleTabChange}
          aria-label="admin dashboard tabs"
        >
          <Tab label="Questions" {...a11yProps(0)} />
          <Tab label="Users" {...a11yProps(1)} />
          <Tab label="User Approval" {...a11yProps(2)} />
          <Tab label="Statistics" {...a11yProps(3)} />
          <Tab label="System Prompts" {...a11yProps(4)} />
        </Tabs>
      </Box>

      <TabPanel value={currentTab} index={0}>
        <QuestionManager />
      </TabPanel>
      <TabPanel value={currentTab} index={1}>
        <UserManager />
      </TabPanel>
      <TabPanel value={currentTab} index={2}>
        <UserApproval />
      </TabPanel>
      <TabPanel value={currentTab} index={3}>
        <Statistics />
      </TabPanel>
      <TabPanel value={currentTab} index={4}>
        <SystemPromptManager />
      </TabPanel>
    </Box>
  );
};

export default AdminDashboard; 