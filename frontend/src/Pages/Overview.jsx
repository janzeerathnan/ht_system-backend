import React from "react";
import { PeopleAlt, Fingerprint, PersonOff, PeopleOutline, Person } from '@mui/icons-material';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import AdminNav from "../navbars/AdminNav";
import './Overview.css';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Overview() {
  // Data for the bar chart
  const chartData = {
    labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5'], // Days of the week
    datasets: [
      {
        label: 'Attendance',
        data: [3, 4, 2, 5, 3], // Example attendance numbers for each day
        backgroundColor: 'rgba(75, 192, 192, 0.5)', // Attendance bar color
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      },
      {
        label: 'Leave',
        data: [1, 2, 1, 0, 1], // Example leave numbers for each day
        backgroundColor: 'rgba(255, 99, 132, 0.5)', // Leave bar color
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
      }
    ]
  };
  
  

  // Options for the bar chart
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Attendance and Leave by Day'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };
  
  

  return (
    <>
    
    <AdminNav />
      <div className="container container-width">
        <div className="card-container">
          {/* Cards for Total Employee, Today Presents, etc. */}
          <div className="card">
            <div className="text">
              <p>Total employee</p>
              <h1>6</h1>
            </div>
            <PeopleAlt className='icon' />
          </div>
          <div className="card">
            <div className="text">
              <p>Today presents</p>
              <h1>3</h1>
            </div>
            <Fingerprint className='icon' />
          </div>
          <div className="card">
            <div className="text">
              <p>Today absents</p>
              <h1>3</h1>
            </div>
            <PersonOff className='icon' />
          </div>
          <div className="card">
            <div className="text">
              <p>Today leave</p>
              <h1>0</h1>
            </div>
            <PeopleOutline className='icon' />
          </div>
        </div>

        {/* Statistic Section with Bar Chart */}
        <div className="box">
          <div>
            <div className='statistic'>
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>

          {/* Leave Application Section */}
          <div>
            <div className='leaveApplication'>
              <p>Leave Application</p>
              <div className='user'>
                <div className='user-card'>
                  <Person className='icon-u' />
                  <div className='text'>
                    <h1>HMM Thasneem</h1>
                    <p>reason</p>
                  </div>
                  <p className='action'>Rejected</p>
                </div>

                <div className='user-card'>
                  <Person className='icon-u' />
                  <div className='text'>
                    <h1>HMM Thasneem</h1>
                    <p>reason</p>
                  </div>
                  <p className='action'>Rejected</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Overview;
