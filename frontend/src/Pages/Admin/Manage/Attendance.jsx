import React, { useState, useEffect } from "react";
import AdminNav from '../../../navbars/AdminNav';
import { Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Button } from "@mui/material";
import { fetchAttendances } from '../../../api';
import { useToast } from '../../../components/ToastProvider';

// Optional: Helper function to convert 24h time to AM/PM format
const formatAMPM = (time) => {
  if (!time) return "";
  const [hour, minute] = time.split(":");
  const hourNum = parseInt(hour, 10);
  const ampm = hourNum >= 12 ? "PM" : "AM";
  const hour12 = hourNum % 12 || 12;
  return `${hour12}:${minute} ${ampm}`;
};

// Remove initialData, will fetch from API
// const initialData = [...];

const AttendanceTable = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [filterId, setFilterId] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const dashboardName = 'Attendance';

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await fetchAttendances();
        setAttendanceData(data);
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    document.title = 'ICST | Attendance';
  }, []);

  const handleFilter = () => {
    // Filtering is now done on the client side from fetched data
    setAttendanceData((prev) => prev.filter((entry) => {
      const matchesId = filterId ? entry.employee_id?.toString() === filterId : true;
      const matchesDate = filterDate ? entry.date === filterDate : true;
      return matchesId && matchesDate;
    }));
  };

  const handleTimeChange = (index, field, value) => {
    const updatedData = [...attendanceData];
    updatedData[index][field] = value;
    setAttendanceData(updatedData);
  };

  return (
    <>
      <AdminNav />
      <Box sx={{p: 15,pl:30, background: '#f8fafc', minHeight: '100vh' }}>
        
        <Paper sx={{ p: 3, maxWidth: 1100, mx: 'auto', mb: 4, boxShadow: 3 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3, justifyContent: 'center', alignItems: 'center' }}>
            <TextField
              label="Emp ID"
              value={filterId}
              onChange={(e) => setFilterId(e.target.value)}
              size="small"
              sx={{ minWidth: 120, background: 'white' }}
            />
            <TextField
              label="Date"
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 180, background: 'white' }}
            />
            <Button variant="contained" onClick={handleFilter} sx={{ bgcolor: '#941936', fontWeight: 600, px: 3, '&:hover': { bgcolor: '#7a0f2b' } }}>
              Apply Filter
            </Button>
          </Box>
          {loading ? (
            <Typography align="center">Loading...</Typography>
          ) : (
            <TableContainer sx={{ borderRadius: 2, boxShadow: 1 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: '#f3e6ea' }}>
                    <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Emp ID</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Department</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Check-in Time</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Check-out Time</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Today Apply Leave</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Leave Day Type</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {attendanceData.length > 0 ? (
                    attendanceData.map((entry, index) => (
                      <TableRow key={index} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                        <TableCell>{entry.date}</TableCell>
                        <TableCell>{entry.employee_id}</TableCell>
                        <TableCell>{entry.employee_name}</TableCell>
                        <TableCell>{entry.department}</TableCell>
                        <TableCell>
                          <TextField
                            type="time"
                            value={entry.check_in_time || ''}
                            size="small"
                            onChange={(e) => handleTimeChange(index, "check_in_time", e.target.value)}
                            sx={{ background: 'white', borderRadius: 1, minWidth: 110 }}
                            inputProps={{ step: 300 }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="time"
                            value={entry.check_out_time || ''}
                            size="small"
                            onChange={(e) => handleTimeChange(index, "check_out_time", e.target.value)}
                            sx={{ background: 'white', borderRadius: 1, minWidth: 110 }}
                            inputProps={{ step: 300 }}
                          />
                        </TableCell>
                        <TableCell>{entry.today_apply_leave}</TableCell>
                        <TableCell>{entry.leave_day_type}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} align="center">No records found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Box>
    </>
  );
};

export default AttendanceTable;
