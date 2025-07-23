import React, { useEffect, useState } from "react";
import { PeopleAlt, Fingerprint, PersonOff, PeopleOutline, Person, Notifications, CheckCircle, Cancel, Schedule } from '@mui/icons-material';
import { CircularProgress } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import AdminNav from "../navbars/AdminNav";
import { getDashboardOverview, getEmployees, getTodayAttendance, getTodayLeaveRequests, getLastLeaveRequests } from "../api";
import { useToast } from "../components/ToastProvider";
import './Overview.css';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Overview() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalEmployees: 0,
    todayPresent: 0,
    todayAbsent: 0,
    todayLeave: 0
  });
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [chartData, setChartData] = useState({
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Attendance',
        data: [0, 0, 0, 0, 0, 0, 0],
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      },
      {
        label: 'Leave',
        data: [0, 0, 0, 0, 0, 0, 0],
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
      }
    ]
  });
  const { showToast } = useToast();

  useEffect(() => {
    document.title = 'Overview';
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all dashboard data in parallel
      const [overviewRes, employeesRes, attendanceRes, leaveRes, lastRequestsRes] = await Promise.all([
        getDashboardOverview(),
        getEmployees(),
        getTodayAttendance(),
        getTodayLeaveRequests(),
        getLastLeaveRequests(10)
      ]);

      let totalEmployees = 0;
      let todayPresent = 0;
      let todayAbsent = 0;
      let todayLeave = 0;

      // Get total employees
      if (employeesRes && employeesRes.success) {
        totalEmployees = employeesRes.data?.length || 0;
      } else {
        console.error('Failed to fetch employees:', employeesRes?.message);
      }

      // Get today's attendance
      if (attendanceRes && attendanceRes.success) {
        const attendanceData = attendanceRes.data;
        todayPresent = attendanceData?.present || 0;
        todayAbsent = attendanceData?.absent || 0;
      } else {
        console.error('Failed to fetch today attendance:', attendanceRes?.message);
      }

      // Get today's leave
      if (leaveRes && leaveRes.success) {
        todayLeave = leaveRes.data?.length || 0;
      } else {
        console.error('Failed to fetch today leave:', leaveRes?.message);
      }

      // Get last 10 leave requests
      if (lastRequestsRes && lastRequestsRes.success) {
        setLeaveRequests(lastRequestsRes.data || []);
      } else {
        console.error('Failed to fetch last requests:', lastRequestsRes?.message);
      }

      // Get overview data (including weekly stats)
      let weeklyAttendance = [0, 0, 0, 0, 0, 0, 0];
      let weeklyLeave = [0, 0, 0, 0, 0, 0, 0];

      if (overviewRes && overviewRes.success) {
        const overview = overviewRes.data;
        todayPresent = overview.todayPresent || todayPresent;
        todayAbsent = overview.todayAbsent || todayAbsent;
        todayLeave = overview.todayLeave || todayLeave;
        weeklyAttendance = overview.weeklyAttendance || weeklyAttendance;
        weeklyLeave = overview.weeklyLeave || weeklyLeave;
      } else {
        console.error('Failed to fetch dashboard overview:', overviewRes?.message);
      }

      // Update dashboard data
      setDashboardData({
        totalEmployees,
        todayPresent,
        todayAbsent,
        todayLeave
      });

      // Update chart data
      setChartData({
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          {
            label: 'Attendance',
            data: weeklyAttendance,
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          },
          {
            label: 'Leave',
            data: weeklyLeave,
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
          }
        ]
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showToast('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="status-icon approved" />;
      case 'rejected':
        return <Cancel className="status-icon rejected" />;
      case 'pending':
        return <Schedule className="status-icon pending" />;
      default:
        return <Schedule className="status-icon pending" />;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'approved':
        return 'approved';
      case 'rejected':
        return 'rejected';
      case 'pending':
        return 'pending';
      default:
        return 'pending';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Options for the bar chart
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 14
          }
        }
      },
      title: {
        display: true,
        text: 'Weekly Attendance and Leave Statistics',
        font: {
          size: 18,
          weight: 'bold'
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          font: {
            size: 12
          }
        },
        title: {
          display: true,
          text: 'Number of Employees',
          font: {
            size: 14
          }
        }
      },
      x: {
        ticks: {
          font: {
            size: 12
          }
        },
        title: {
          display: true,
          text: 'Days of the Week',
          font: {
            size: 14
          }
        }
      }
    },
  };

  if (loading) {
    return (
      <>
        <AdminNav />
        <div className="container container-width">
          <h2 style={{ textAlign: 'center', color: '#941936', fontWeight: 700, margin: '24px 0' }}>Overview</h2>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
            <CircularProgress size={60} sx={{ color: '#941936' }} />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminNav />
      <div className="container container-width">
        <h2 style={{ textAlign: 'center', color: '#941936', fontWeight: 700, margin: '24px 0' }}>Overview</h2>
        <div className="card-container">
          {/* Cards for Total Employee, Today Presents, etc. */}
          <div className="card">
            <div className="text">
              <p>Total employee</p>
              <h1>{dashboardData.totalEmployees}</h1>
            </div>
            <PeopleAlt className='icon' />
          </div>
          <div className="card">
            <div className="text">
              <p>Today presents</p>
              <h1>{dashboardData.todayPresent}</h1>
            </div>
            <Fingerprint className='icon' />
          </div>
          <div className="card">
            <div className="text">
              <p>Today absents</p>
              <h1>{dashboardData.todayAbsent}</h1>
            </div>
            <PersonOff className='icon' />
          </div>
          <div className="card">
            <div className="text">
              <p>Today leave</p>
              <h1>{dashboardData.todayLeave}</h1>
            </div>
            <PeopleOutline className='icon' />
          </div>
        </div>

        {/* Statistic Section with Bar Chart and Notifications */}
        <div className="box">
          <div>
            <div className='statistic'>
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>

          {/* Notification Box */}
          <div className="notification-box">
            <div className="notification-header">
              <Notifications className="notification-icon" />
              <h3>Recent Leave Requests</h3>
            </div>
            <div className="notification-content">
              {leaveRequests.length === 0 ? (
                <p className="no-notifications">No leave requests found</p>
              ) : (
                leaveRequests.map((request) => (
                  <div key={request.LeaveRequestID} className="notification-item">
                    <div className="notification-user">
                      <Person className="user-icon" />
                      <div className="user-info">
                        <h4>{request.employee?.FirstName} {request.employee?.LastName}</h4>
                        <p>{request.leaveType?.LeaveName}</p>
                        <span className="request-date">
                          {formatDate(request.StartDate)} - {formatDate(request.EndDate)}
                        </span>
                        <span className="request-time">
                          {formatTime(request.created_at)}
                        </span>
                      </div>
                    </div>
                    <div className="notification-status-container">
                      {getStatusIcon(request.LeaveStatus)}
                      <span className={`notification-status ${getStatusClass(request.LeaveStatus)}`}>
                        {request.LeaveStatus}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Overview;
