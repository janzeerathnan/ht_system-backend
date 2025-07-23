import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Grid,
  Tooltip
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight
} from '@mui/icons-material';
import EmpRMNav from '../../navbars/EmpRMNav';
import { getHolidaysForMonth } from '../../api';

const RMCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [monthHolidays, setMonthHolidays] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchMonthHolidays = async () => {
    try {
      setLoading(true);
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;
      const response = await getHolidaysForMonth(year, month);
      if (response.success) {
        setMonthHolidays(response.data);
      }
    } catch (error) {
      console.error('Error fetching holidays:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthHolidays();
    document.title = 'ICST | RM Calendar';
  }, [currentMonth]);

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isHoliday = (day) => {
    const currentDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day,
      0, 0, 0, 0
    ).getTime();

    return monthHolidays.find(holiday => {
      const start = new Date(holiday.StartDate).getTime();
      const end = new Date(holiday.EndDate).getTime();
      return currentDate >= start && currentDate <= end;
    });
  };

  const getHolidayColor = (day) => {
    const holiday = isHoliday(day);
    if (!holiday) return 'transparent';
    // Support both 'Type' and 'type' fields, case-insensitive
    const type = (holiday.Type || holiday.type || '').toLowerCase();
    if (type === 'public') return '#ff4444';
    if (type === 'company') return '#ff8800';
    return 'transparent';
  };

  const getHolidayName = (day) => {
    const holiday = isHoliday(day);
    return holiday ? holiday.HolidayName : '';
  };

  const nextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const renderCell = (dayNumber, weekIndex, dayIndex) => {
    if (dayNumber < 1 || dayNumber > getDaysInMonth(currentMonth)) {
      return <TableCell key={dayIndex} sx={{ height: 40, border: '1px solid #e0e0e0', py: 0.5, px: 0.5 }} />;
    }

    const today = new Date();
    const isToday = 
      today.getDate() === dayNumber && 
      today.getMonth() === currentMonth.getMonth() && 
      today.getFullYear() === currentMonth.getFullYear();

    const holiday = isHoliday(dayNumber);
    const holidayColor = getHolidayColor(dayNumber);
    const holidayName = getHolidayName(dayNumber);

    return (
      <Tooltip key={`tooltip-${weekIndex}-${dayIndex}-${dayNumber}`} title={holidayName} arrow placement="top">
        <TableCell 
          key={dayIndex} 
          sx={{ 
            height: 40, 
            border: '1px solid #e0e0e0',
            backgroundColor: holidayColor,
            color: holidayColor !== 'transparent' ? 'white' : 'inherit',
            fontWeight: isToday ? 'bold' : 'normal',
            position: 'relative',
            cursor: holidayName ? 'pointer' : 'default',
            py: 0.5,
            px: 0.5,
            transition: 'background-color 0.2s',
            '&:hover': {
              backgroundColor: holiday ? ((holiday.Type || holiday.type || '').toLowerCase() === 'public' ? '#ff6666' : ((holiday.Type || holiday.type || '').toLowerCase() === 'company' ? '#ffaa00' : 'transparent')) : 'transparent'
            }
          }}
        >
          <Box sx={{ 
            position: 'relative', 
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: isToday ? 'bold' : 'normal',
                fontSize: '0.875rem',
                color: holidayColor !== 'transparent' ? 'white' : 'inherit'
              }}
            >
              {dayNumber}
            </Typography>
            {holidayName && (
              <Typography 
                variant="caption" 
                sx={{ 
                  fontSize: '0.6rem',
                  lineHeight: 1,
                  maxWidth: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  color: 'white',
                  mt: 0.5
                }}
              >
                {holidayName}
              </Typography>
            )}
          </Box>
        </TableCell>
      </Tooltip>
    );
  };

  const dashboardName = 'RM Calendar';

  return (
    <Box sx={{ display: 'flex', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <EmpRMNav />
      <Box sx={{ flexGrow: 1, py: 8 }}>
        <Box sx={{ maxWidth: 900, mx: 'auto', mb: 4, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#941936', mb: 4, textAlign: 'center' }}>
            RM Calendar
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748b', mb: 4 }}>
            View and manage holidays and important dates.
          </Typography>
        </Box>
        <Box sx={{ maxWidth: 900, mx: 'auto', mb: 4 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  color: '#941936'
                }}>
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </Typography>
                <Box>
                  <IconButton onClick={prevMonth} size="small">
                    <ChevronLeft />
                  </IconButton>
                  <IconButton onClick={nextMonth} size="small">
                    <ChevronRight />
                  </IconButton>
                </Box>
              </Box>
              
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <TableCell key={day} align="center" sx={{ 
                          fontWeight: 600, 
                          color: '#941936',
                          border: '1px solid #e0e0e0',
                          py: 1,
                          px: 0.5
                        }}>
                          {day}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Array.from({ length: Math.ceil((getDaysInMonth(currentMonth) + getFirstDayOfMonth(currentMonth)) / 7) }, (_, weekIndex) => (
                      <TableRow key={weekIndex}>
                        {Array.from({ length: 7 }, (_, dayIndex) => {
                          const dayNumber = weekIndex * 7 + dayIndex - getFirstDayOfMonth(currentMonth) + 1;
                          return renderCell(dayNumber, weekIndex, dayIndex);
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <Box sx={{ mt: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, backgroundColor: '#ff4444', borderRadius: 0.5 }} />
                  <Typography variant="caption">Public Holiday</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, backgroundColor: '#ff8800', borderRadius: 0.5 }} />
                  <Typography variant="caption">Company Holiday</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default RMCalendar; 