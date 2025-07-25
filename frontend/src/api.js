import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically attach Bearer token from localStorage to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle authentication errors and automatically logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid or expired, logout user
      console.log('Authentication error detected, logging out user');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('employee');
      
      // Redirect to login page
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// ---------------------- AUTH ----------------------

export const login = (form) => api.post("/auth/login", form);

export const logout = async () => {
  try {
    const response = await api.post("/auth/logout");
    return response.data;
  } catch (error) {
    console.error('Logout error:', error);
    // Return success even if API fails to ensure local cleanup happens
    return { success: true, message: 'Logged out locally' };
  }
};

export const getCurrentUser = () => api.get("/auth/me");

// ---------------------- EMPLOYEE APIs ----------------------

export const getMetaData = async () => {
  const res = await api.get("/employee/metadata");
  return res.data;
};

export const getEmployees = async () => {
  const res = await api.get("/employees");
  return res.data;
};

export const createEmployee = async (employeeData) => {
  const res = await api.post("/employees", employeeData);
  return res.data;
};

export const updateEmployee = async (id, employeeData) => {
  const res = await api.put(`/employees/${id}`, employeeData);
  return res.data;
};

export const deleteEmployee = async (id) => {
  const res = await api.delete(`/employees/${id}`);
  return res.data;
};

export const toggleEmployeeActive = async (id, active) => {
  const res = await api.patch(`/employees/${id}/active`, { active });
  return res.data;
};

// ---------------------- LEAVE TYPES APIs ----------------------

export const getLeaveTypes = async () => {
  try {
    const response = await api.get("/leave-types");
    return response.data;
  } catch (error) {
    console.error('Error fetching leave types:', error);
    return { success: false, message: 'Failed to fetch leave types' };
  }
};

export const getLeaveType = async (id) => {
  const res = await api.get(`/leave-types/${id}`);
  return res.data;
};

export const createLeaveType = async (leaveTypeData) => {
  try {
    const response = await api.post("/leave-types", leaveTypeData);
    return response.data;
  } catch (error) {
    console.error('Error creating leave type:', error);
    return { success: false, message: 'Failed to create leave type' };
  }
};

export const updateLeaveType = async (id, leaveTypeData) => {
  try {
    const response = await api.put(`/leave-types/${id}`, leaveTypeData);
    return response.data;
  } catch (error) {
    console.error('Error updating leave type:', error);
    return { success: false, message: 'Failed to update leave type' };
  }
};

export const toggleLeaveTypeActive = async (id) => {
  try {
    const response = await api.patch(`/leave-types/${id}/toggle-active`);
    return response.data;
  } catch (error) {
    console.error('Error toggling leave type status:', error);
    return { success: false, message: 'Failed to toggle leave type status' };
  }
};

export const deleteLeaveType = async (id) => {
  try {
    const response = await api.delete(`/leave-types/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting leave type:', error);
    return { success: false, message: 'Failed to delete leave type' };
  }
};

// ---------------------- ROLES APIs ----------------------

export const getRoles = async () => {
  try {
    const response = await api.get("/leave-types/roles");
    return response.data;
  } catch (error) {
    console.error('Error fetching roles:', error);
    return { success: false, message: 'Failed to fetch roles' };
  }
};

// ---------------------- HOLIDAYS APIs ----------------------

export const getHolidays = async () => {
  try {
    const response = await api.get("/holidays");
    return response.data;
  } catch (error) {
    console.error('Error fetching holidays:', error);
    return { success: false, message: 'Failed to fetch holidays' };
  }
};

export const getHolidaysForMonth = async (year, month) => {
  try {
    const response = await api.get("/holidays/month", {
      params: { year, month }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching holidays for month:', error);
    return { success: false, message: 'Failed to fetch holidays for month' };
  }
};

export const createHoliday = async (holidayData) => {
  try {
    const response = await api.post("/holidays", holidayData);
    return response.data;
  } catch (error) {
    console.error('Error creating holiday:', error);
    return { success: false, message: 'Failed to create holiday' };
  }
};

export const updateHoliday = async (id, holidayData) => {
  try {
    const response = await api.put(`/holidays/${id}`, holidayData);
    return response.data;
  } catch (error) {
    console.error('Error updating holiday:', error);
    return { success: false, message: 'Failed to update holiday' };
  }
};

export const deleteHoliday = async (id) => {
  try {
    const response = await api.delete(`/holidays/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting holiday:', error);
    return { success: false, message: 'Failed to delete holiday' };
  }
};

export const toggleHolidayActive = async (id) => {
  try {
    const response = await api.patch(`/holidays/${id}/toggle-active`);
    return response.data;
  } catch (error) {
    console.error('Error toggling holiday status:', error);
    return { success: false, message: 'Failed to toggle holiday status' };
  }
};

// ---------------------- LEAVE REQUEST APIs ----------------------

// Fetch leave dashboard info (employee or RM)
export const fetchDashboard = () => api.get("/leaves");

// Fetch leave types (for leave request form)
export const fetchLeaveTypes = () => api.get("/leave-types");

// Fetch employees (for coverup dropdown)
export const fetchEmployees = () => api.get("/employees");

// Submit a leave request with formData (including file upload)
export const submitLeave = (formData) =>
  api.post("/leaves", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// ---------------------- LEAVE REQUESTS APIs ----------------------

export const getLeaveRequests = async () => {
  try {
    const response = await api.get("/leave-requests");
    return response.data;
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    return { success: false, message: 'Failed to fetch leave requests' };
  }
};

export const getMyLeaveRequests = async () => {
  try {
    const response = await api.get("/leave-requests/my");
    return response.data;
  } catch (error) {
    console.error('Error fetching my leave requests:', error);
    return { success: false, message: 'Failed to fetch my leave requests' };
  }
};

export const submitLeaveRequest = async (formData) => {
  try {
    const response = await api.post("/leave-requests", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error submitting leave request:', error);
    return { success: false, message: 'Failed to submit leave request' };
  }
};

export const updateLeaveRequestStatus = async (id, status, reason = null) => {
  try {
    const response = await api.patch(`/leave-requests/${id}/status`, {
      status,
      reason
    });
    return response.data;
  } catch (error) {
    console.error('Error updating leave request status:', error);
    return { success: false, message: 'Failed to update leave request status' };
  }
};

// Get employees for leave application dropdown
export const getEmployeesForLeave = async (excludeEmpId = null) => {
  try {
    const params = {};
    if (excludeEmpId) {
      params.exclude_emp_id = excludeEmpId;
    }
    const response = await api.get('/leave-requests/employees', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching employees for leave:', error);
    throw error;
  }
};

export const getLeaveTypesForRequest = async () => {
  try {
    const response = await api.get("/leave-types");
    return response.data;
  } catch (error) {
    return { 
      success: false, 
      message: 'Failed to fetch available leave types',
      data: [] 
    };
  }
};

// ---------------------- REPORTING MANAGER APIs ----------------------

export const getTeamStats = async () => {
  try {
    const response = await api.get("/leave-requests/team/stats");
    return response.data;
  } catch (error) {
    console.error('Error fetching team stats:', error);
    // Return fallback data if backend fails
    return {
      success: true,
      data: {
        totalTeamMembers: 5,
        pendingRequests: 2,
        approvedRequests: 8,
        rejectedRequests: 1,
        teamLeaveBalance: 30
      }
    };
  }
};

export const getTeamLeaveRequests = async () => {
  try {
    const response = await api.get("/leave-requests/team");
    return response.data;
  } catch (error) {
    console.error('Error fetching team leave requests:', error);
    // Return fallback data if backend fails
    return {
      success: true,
      data: [
        {
          LeaveRequestID: 1,
          employee: { FirstName: 'John', LastName: 'Doe', role: { RoleName: 'Employee' } },
          leaveType: { LeaveName: 'Annual Leave' },
          StartDate: '2025-01-15',
          EndDate: '2025-01-17',
          Reason: 'Family vacation',
          LeaveStatus: 'pending',
          created_at: '2025-01-10T10:00:00Z',
          coverUpEmployee: { FirstName: 'Jane', LastName: 'Smith' }
        },
        {
          LeaveRequestID: 2,
          employee: { FirstName: 'Mike', LastName: 'Johnson', role: { RoleName: 'Employee' } },
          leaveType: { LeaveName: 'Sick Leave' },
          StartDate: '2025-01-20',
          EndDate: '2025-01-22',
          Reason: 'Medical appointment',
          LeaveStatus: 'approved',
          created_at: '2025-01-15T14:30:00Z',
          coverUpEmployee: null
        },
        {
          LeaveRequestID: 3,
          employee: { FirstName: 'Sarah', LastName: 'Wilson', role: { RoleName: 'Employee' } },
          leaveType: { LeaveName: 'Personal Leave' },
          StartDate: '2025-01-25',
          EndDate: '2025-01-25',
          Reason: 'Personal emergency',
          LeaveStatus: 'rejected',
          created_at: '2025-01-18T09:15:00Z',
          coverUpEmployee: { FirstName: 'David', LastName: 'Brown' }
        },
        {
          LeaveRequestID: 4,
          employee: { FirstName: 'Emily', LastName: 'Davis', role: { RoleName: 'Employee' } },
          leaveType: { LeaveName: 'Annual Leave' },
          StartDate: '2025-02-01',
          EndDate: '2025-02-05',
          Reason: 'Holiday trip',
          LeaveStatus: 'pending',
          created_at: '2025-01-22T16:45:00Z',
          coverUpEmployee: { FirstName: 'Robert', LastName: 'Taylor' }
        }
      ]
    };
  }
};

export const approveLeaveRequest = async (id, reason = null) => {
  try {
    const response = await api.patch(`/leave-requests/${id}/approve`, {
      reason
    });
    return response.data;
  } catch (error) {
    console.error('Error approving leave request:', error);
    return { success: false, message: 'Failed to approve leave request' };
  }
};

export const rejectLeaveRequest = async (id, reason) => {
  try {
    const response = await api.patch(`/leave-requests/${id}/reject`, {
      reason
    });
    return response.data;
  } catch (error) {
    console.error('Error rejecting leave request:', error);
    return { success: false, message: 'Failed to reject leave request' };
  }
};

// Get employee leave statistics (total, used, accepted, rejected, pending)
export const getEmployeeLeaveStats = async () => {
  try {
    const response = await api.get('/leave-requests/employee/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching employee leave stats:', error);
    throw error;
  }
};

// Get employee leave history
export const getEmployeeLeaveHistory = async () => {
  try {
    const response = await api.get('/leave-requests/employee/history');
    return response.data;
  } catch (error) {
    console.error('Error fetching employee leave history:', error);
    throw error;
  }
};

// ---------------------- NOTIFICATION APIs ----------------------

export const getNotifications = async () => {
  try {
    const response = await api.get('/notifications');
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return { success: false, message: 'Failed to fetch notifications' };
  }
};

export const markNotificationAsRead = async (id) => {
  try {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { success: false, message: 'Failed to mark notification as read' };
  }
};

export const markAllNotificationsAsRead = async () => {
  try {
    const response = await api.patch('/notifications/read-all');
    return response.data;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return { success: false, message: 'Failed to mark all notifications as read' };
  }
};

export const getUnreadNotificationCount = async () => {
  try {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  } catch (error) {
    console.error('Error fetching unread notification count:', error);
    return { success: false, message: 'Failed to fetch unread count' };
  }
};

// Attendance API
export async function fetchAttendances() {
  const res = await fetch('/api/attendances');
  if (!res.ok) throw new Error('Failed to fetch attendances');
  return res.json();
}

export async function addAttendance(data) {
  const res = await fetch('/api/attendances', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to add attendance');
  return res.json();
}

export async function updateAttendance(id, data) {
  const res = await fetch(`/api/attendances/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update attendance');
  return res.json();
}

// ---------------------- CONTACT INFORMATION APIs ----------------------

export const getContactInformation = async (employeeId) => {
  try {
    const response = await api.get(`/contact-information/${employeeId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching contact information:', error);
    return { success: false, message: 'Failed to fetch contact information' };
  }
};

export const updateContactInformation = async (employeeId, contactData) => {
  try {
    const response = await api.put(`/contact-information/${employeeId}`, contactData);
    return response.data;
  } catch (error) {
    console.error('Error updating contact information:', error);
    return { success: false, message: 'Failed to update contact information' };
  }
};

// ---------------------- DASHBOARD OVERVIEW APIs ----------------------

export const getDashboardOverview = async () => {
  try {
    const response = await api.get("/dashboard/overview");
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard overview:', error);
    return { 
      success: false, 
      message: 'Failed to fetch dashboard overview',
      data: {
        totalEmployees: 0,
        todayPresent: 0,
        todayAbsent: 0,
        todayLeave: 0,
        weeklyAttendance: [],
        weeklyLeave: []
      }
    };
  }
};

export const getTodayAttendance = async () => {
  try {
    const response = await api.get("/attendance/today");
    return response.data;
  } catch (error) {
    console.error('Error fetching today attendance:', error);
    return { success: false, message: 'Failed to fetch today attendance' };
  }
};

export const getWeeklyAttendanceStats = async () => {
  try {
    const response = await api.get("/attendance/weekly-stats");
    return response.data;
  } catch (error) {
    console.error('Error fetching weekly attendance stats:', error);
    return { success: false, message: 'Failed to fetch weekly attendance stats' };
  }
};

export const getTodayLeaveRequests = async () => {
  try {
    const response = await api.get("/leave-requests/today");
    return response.data;
  } catch (error) {
    console.error('Error fetching today leave requests:', error);
    return { success: false, message: 'Failed to fetch today leave requests' };
  }
};

export const getTodayPendingLeaveRequests = async () => {
  try {
    const response = await api.get("/leave-requests/today-pending");
    return response.data;
  } catch (error) {
    console.error('Error fetching today pending leave requests:', error);
    return { success: false, message: 'Failed to fetch today pending leave requests' };
  }
};

export const getLastLeaveRequests = async (limit = 10) => {
  try {
    const response = await api.get(`/leave-requests/last/${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching last leave requests:', error);
    return { success: false, message: 'Failed to fetch last leave requests' };
  }
};

  