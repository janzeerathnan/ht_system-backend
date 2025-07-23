import React, { useState, useEffect, useRef } from 'react';
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
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Grid,
  CircularProgress
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  FilterList,
  ChevronLeft,
  ChevronRight,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import AdminNav from '../../../navbars/AdminNav';
import AddHolidayForm from '../../../components/AddHolidayForm';
import EditHolidayForm from '../../../components/EditHolidayForm';
import { 
  getHolidays, 
  getHolidaysForMonth, 
  createHoliday, 
  updateHoliday, 
  deleteHoliday 
} from '../../../api';
import { useToast } from '../../../components/ToastProvider';

const HolidayCalendar = () => {
  const [holidays, setHolidays] = useState([]);
  const [monthHolidays, setMonthHolidays] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [addDialog, setAddDialog] = useState({ open: false });
  const [editDialog, setEditDialog] = useState({ open: false, holiday: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, holiday: null });
  const deleteDialogRef = useRef(null);
  const { showToast } = useToast();

  const fetchHolidays = async () => {
    try {
      setLoading(true);
      const response = await getHolidays();
      if (response.success) {
        setHolidays(response.data);
      } else {
        showToast('Failed to load holidays', 'error');
      }
    } catch (error) {
      console.error('Error fetching holidays:', error);
      showToast('Failed to load holidays', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthHolidays = async () => {
    try {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;
      const response = await getHolidaysForMonth(year, month);
      if (response.success) {
        setMonthHolidays(response.data);
      }
    } catch (error) {
      console.error('Error fetching month holidays:', error);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  useEffect(() => {
    fetchMonthHolidays();
  }, [currentMonth]);

  useEffect(() => {
    document.title = 'Holiday Calendar';
  }, []);

  useEffect(() => {
    if (deleteDialog.open && deleteDialogRef.current) {
      const cancelButton = deleteDialogRef.current.querySelector('button[onclick*="handleDeleteCancel"]');
      if (cancelButton) {
        setTimeout(() => cancelButton.focus(), 100);
      }
    }
  }, [deleteDialog.open]);

  const handleAddHoliday = (newHoliday) => {
    setHolidays(prev => [...prev, newHoliday]);
    fetchMonthHolidays();
    showToast('Holiday added successfully!', 'success');
  };

  const handleDelete = (holiday) => {
    setDeleteDialog({ open: true, holiday });
  };

  const handleDeleteConfirm = async () => {
    if (deleteDialog.holiday) {
      try {
        const response = await deleteHoliday(deleteDialog.holiday.HolidayID);
        if (response.success) {
          setHolidays(prev => prev.filter(h => h.HolidayID !== deleteDialog.holiday.HolidayID));
          fetchMonthHolidays();
          showToast('Holiday deleted successfully!', 'success');
        } else {
          showToast(response.message || 'Failed to delete holiday', 'error');
        }
      } catch (error) {
        console.error('Error deleting holiday:', error);
        showToast('Failed to delete holiday', 'error');
      }
    }
    setDeleteDialog({ open: false, holiday: null });
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, holiday: null });
  };

  const handleEdit = (holiday) => {
    setEditDialog({ open: true, holiday });
  };

  const handleEditSubmit = async (formData) => {
    try {
      const response = await updateHoliday(editDialog.holiday.HolidayID, formData);
      if (response.success) {
        setHolidays(prev => prev.map(h => 
          h.HolidayID === editDialog.holiday.HolidayID ? response.data : h
        ));
        fetchMonthHolidays();
        showToast('Holiday updated successfully!', 'success');
        setEditDialog({ open: false, holiday: null });
      } else {
        showToast(response.message || 'Failed to update holiday', 'error');
      }
    } catch (error) {
      console.error('Error updating holiday:', error);
      showToast('Failed to update holiday', 'error');
    }
  };

  const nextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isHoliday = (day) => {
    const currentDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    currentDate.setHours(0, 0, 0, 0);
    
    return monthHolidays.find(holiday => {
      const start = new Date(holiday.StartDate);
      const end = new Date(holiday.EndDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      
      return currentDate >= start && currentDate <= end;
    });
  };

  const getHolidayColor = (day) => {
    const holiday = isHoliday(day);
    if (holiday) {
      return holiday.Type === 'public' ? '#ff4444' : '#ff8800';
    }
    return 'transparent';
  };

  const getHolidayName = (day) => {
    const holiday = isHoliday(day);
    return holiday ? holiday.HolidayName : '';
  };

  const calculateTotalDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // Include both start and end dates
  };

  const filteredHolidays = holidays.filter(holiday => {
    const matchesSearch = holiday.HolidayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         holiday.Description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || holiday.Type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <>
      <AdminNav />
      <div style={{ marginLeft: '250px', padding: '20px' }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ 
            fontWeight: 600, 
            color: '#941936',
            mb: 2,
            fontFamily: 'var(--front-primary, sans-serif)'
          }}>
            Holiday Calendar
          </Typography>
          
          {/* Search and Filter Bar */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder="Search holidays..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ color: '#666', mr: 1 }} />
              }}
              sx={{ minWidth: 250 }}
            />
            
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Filter Type</InputLabel>
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                label="Filter Type"
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="public">Public Holidays</MenuItem>
                <MenuItem value="company">Company Holidays</MenuItem>
              </Select>
            </FormControl>
            
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setAddDialog({ open: true })}
              sx={{
                bgcolor: '#941936',
                textTransform: 'none',
                fontWeight: 500,
                '&:hover': {
                  bgcolor: '#7a0f2b'
                }
              }}
            >
              Add Holiday
            </Button>
          </Box>

          <Grid container spacing={3}>
            {/* Table Section - Left Side */}
            <Grid xs={12} md={7}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#941936', mb: 2 }}>
                    Holiday List
                  </Typography>
                  
                  {loading ? (
                    <Typography>Loading holidays...</Typography>
                  ) : (
                    <TableContainer component={Paper} sx={{ maxHeight: 500 }}>
                      <Table stickyHeader size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600, color: '#941936' }}>ID</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#941936' }}>Name</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#941936' }}>Start Date</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#941936' }}>End Date</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#941936' }}>Type</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#941936' }}>Days</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#941936' }}>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {filteredHolidays.length > 0 ? (
                            filteredHolidays.map((holiday) => (
                              <TableRow key={holiday.HolidayID} hover>
                                <TableCell>{holiday.HolidayID}</TableCell>
                                <TableCell>
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {holiday.HolidayName}
                                  </Typography>
                                  {holiday.Description && (
                                    <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                                      {holiday.Description}
                                    </Typography>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {new Date(holiday.StartDate).toLocaleDateString('en-GB')}
                                </TableCell>
                                <TableCell>
                                  {new Date(holiday.EndDate).toLocaleDateString('en-GB')}
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={holiday.Type === 'public' ? 'Public' : 'Company'}
                                    size="small"
                                    color={holiday.Type === 'public' ? 'error' : 'warning'}
                                    variant="outlined"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Chip 
                                    label={calculateTotalDays(holiday.StartDate, holiday.EndDate)} 
                                    size="small" 
                                    sx={{ 
                                      backgroundColor: '#e3f2fd',
                                      color: '#1976d2',
                                      fontWeight: 500
                                    }}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Stack direction="row" spacing={1}>
                                    <IconButton
                                      size="small"
                                      color="primary"
                                      onClick={() => handleEdit(holiday)}
                                    >
                                      <Edit fontSize="small" />
                                    </IconButton>
                                    <IconButton
                                      size="small"
                                      color="error"
                                      onClick={() => handleDelete(holiday)}
                                    >
                                      <Delete fontSize="small" />
                                    </IconButton>
                                  </Stack>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                <Typography variant="body1" color="text.secondary">
                                  {searchTerm || filterType !== 'all' ? 'No holidays match your search.' : 'No holidays found.'}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Calendar Section - Right Side */}
            <Grid xs={12} md={5}>
              <Card sx={{ height: 'fit-content' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#941936' }}>
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
                              if (dayNumber < 1 || dayNumber > getDaysInMonth(currentMonth)) {
                                return <TableCell key={dayIndex} sx={{ height: 40, border: '1px solid #e0e0e0', py: 0.5, px: 0.5 }} />;
                              }
                              
                              const isToday = new Date().toDateString() === new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dayNumber).toDateString();
                              const holidayColor = getHolidayColor(dayNumber);
                              const holidayName = getHolidayName(dayNumber);

                              return (
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
                                    '&:hover': {
                                      backgroundColor: holidayName ? (holidayColor === '#ff4444' ? '#ff6666' : '#ffaa00') : holidayColor
                                    }
                                  }}
                                  title={holidayName}
                                >
                                  <Typography variant="body2" sx={{ fontWeight: 'inherit', fontSize: '0.875rem' }}>
                                    {dayNumber}
                                  </Typography>
                                  {holidayName && (
                                    <Typography 
                                      variant="caption" 
                                      sx={{ 
                                        position: 'absolute',
                                        bottom: 1,
                                        left: 1,
                                        fontSize: '0.6rem',
                                        lineHeight: 1,
                                        maxWidth: '100%',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                      }}
                                    >
                                      {holidayName}
                                    </Typography>
                                  )}
                                </TableCell>
                              );
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
            </Grid>
          </Grid>
        </Box>
      </div>

      {/* Add Holiday Dialog */}
      <AddHolidayForm
        isOpen={addDialog.open}
        onClose={() => setAddDialog({ open: false })}
        onAddHoliday={handleAddHoliday}
      />

      {/* Edit Holiday Dialog */}
      <EditHolidayForm
        isOpen={editDialog.open}
        onClose={() => setEditDialog({ open: false, holiday: null })}
        holiday={editDialog.holiday}
        onSubmit={handleEditSubmit}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={handleDeleteCancel} ref={deleteDialogRef}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{deleteDialog.holiday?.HolidayName}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default HolidayCalendar; 