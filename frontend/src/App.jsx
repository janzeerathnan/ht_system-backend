import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Onboard from './Pages/Admin/Onboard';
import Overview from './pages/Overview';
import People from './Pages/Admin/Manage/People';
import EditEmployee from './Pages/Admin/EditEmployee';
import LeaveSettings from './Pages/Admin/Settings/LeaveSettings';
import HolidayCalendar from './Pages/Admin/Settings/HolidayCalendar';
import Login from './Login/Login';
import Employee from './Pages/Employee/Employee';
import EmployeeRM from './Pages/EmployeeRM/EmployeeRM';
import LeaveApply from './Pages/Employee/LeaveApply';
import Notifications from './Pages/Employee/Notifications';
import Profile from './Pages/Employee/Profile';
import Settings from './Pages/Employee/Settings';
import LeaveApplyRM from './Pages/EmployeeRM/LeaveApplyRM';
import NotificationsRM from './Pages/EmployeeRM/NotificationsRM';
import ProfileRM from './Pages/EmployeeRM/ProfileRM';
import SettingsRM from './Pages/EmployeeRM/SettingsRM';
import LeaveRequestRM from './Pages/EmployeeRM/Leaverequests';

// Main App Component
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const employee = JSON.parse(localStorage.getItem('employee') || '{}');
      const roleName = employee?.role?.RoleName?.toLowerCase();

      setIsAuthenticated(!!token);
      setUserRole(roleName);
    };

    checkAuth();
    
    // Listen for storage changes (when user logs out in another tab)
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      
      {/* Admin/HR Routes */}
      <Route path="/overview" element={<Overview />} />
      <Route path="/onboard" element={<Onboard />} />
      <Route path="/people" element={<People />} />
      <Route path="/edit-employee/:id" element={<EditEmployee />} />
      <Route path="/leavesettings" element={<LeaveSettings />} />
      <Route path="/holidaycalendar" element={<HolidayCalendar />} />

      {/* Employee Routes */}
      <Route path="/employee" element={<Employee />} />
      <Route path="/leave-apply" element={<LeaveApply />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/settings" element={<Settings />} />

 {/* Employee RM Routes */}
      <Route path="/employeerm" element={<EmployeeRM />} />
      <Route path="/leave-apply-rm" element={<LeaveApplyRM />} />
      <Route path="/leave-request-rm" element={<LeaveRequestRM />} />
      <Route path="/notifications-rm" element={<NotificationsRM />} />
      <Route path="/profile-rm" element={<ProfileRM />} />
      <Route path="/settings-rm" element={<SettingsRM />} />







      {/* Default redirect for authenticated users */}
      <Route 
        path="*" 
        element={
          isAuthenticated ? (
            userRole === 'admin' || userRole === 'hr' ? (
              <Navigate to="/overview" replace />
            ) : userRole === 'rm' ? (
              <Navigate to="/employeerm" replace />
            ) : (
              <Navigate to="/employee" replace />
            )
          ) : (
            <Navigate to="/" replace />
          )
        } 
      />
    </Routes>
  );
}

export default App;
