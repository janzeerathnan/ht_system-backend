import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter } from 'lucide-react';

import AdminNav from "../../../navbars/AdminNav";

import {
  Box,
  Button,
  Typography,
  TextField,
  InputAdornment,
  MenuItem,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  TableContainer,
  Paper,
  Chip,
  Select,
  FormControl,
  Pagination,
  Stack
} from '@mui/material';

const mockData = [
  { id: "1", name: "Thaneem", timeOffType: "Sick", date: "3/20/2025", period: "3 Days", status: "approved" },
  { id: "2", name: "Jane Doe", timeOffType: "Vacation", date: "3/21/2025", period: "5 Days", status: "pending" },
  { id: "3", name: "Alice Johnson", timeOffType: "Casual", date: "3/22/2025", period: "2 Days", status: "rejected" }
];

const TimeOff = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [timeOffData, setTimeOffData] = useState(mockData);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalPages = Math.ceil(timeOffData.length / itemsPerPage);
  const paginateData = timeOffData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (_, value) => setCurrentPage(value);

  const filteredData = paginateData.filter(entry =>
    (entry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.id.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (selectedType === '' || entry.timeOffType === selectedType)
  );

  const timeOffTypes = Array.from(new Set(timeOffData.map(entry => entry.timeOffType)));

  const handleAddLeaveDate = (newLeaveDate) => {
    setTimeOffData([
      ...timeOffData,
      { ...newLeaveDate, id: (timeOffData.length + 1).toString() }
    ]);
  };

  const dashboardName = 'Time Off';

  useEffect(() => {
    document.title = 'Time Off';
  }, []);

  return (
    <>
      <AdminNav />

      <div className='container'>
      <Box sx={{ mt: 12, p: 4, bgcolor: 'background.default', minHeight: '100vh' }}>
        <Stack spacing={4}>
          {/* Header */}
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap">
            <Typography variant="h5" fontWeight="bold" color="primary">
              Time Off
            </Typography>
            
          </Box>

          {/* Filters */}
          <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={3}>
            <TextField
              variant="outlined"
              fullWidth
              placeholder="Search by Employee ID or Name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={18} style={{ color: 'gray' }} />
                  </InputAdornment>
                )
              }}
            />
            <FormControl fullWidth variant="outlined">
              <Select
                displayEmpty
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                startAdornment={<Filter size={18} style={{ marginLeft: 8, marginRight: 8, color: 'gray' }} />}
              >
                <MenuItem value="">All Types</MenuItem>
                {timeOffTypes.map(type => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Table */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  {['Employee ID', 'Name', 'Time-off Type', 'Date', 'Period', 'Status'].map(header => (
                    <TableCell key={header} align="center" sx={{ fontWeight: 'bold', bgcolor: 'grey.100' }}>
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData.length > 0 ? (
                  filteredData.map(entry => (
                    <TableRow key={entry.id} hover>
                      <TableCell align="center">{entry.id}</TableCell>
                      <TableCell align="center">{entry.name}</TableCell>
                      <TableCell align="center">{entry.timeOffType}</TableCell>
                      <TableCell align="center">{entry.date}</TableCell>
                      <TableCell align="center">{entry.period}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                          color={
                            entry.status === 'approved'
                              ? 'success'
                              : entry.status === 'rejected'
                                ? 'error'
                                : 'warning'
                          }
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No records found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Box display="flex" justifyContent="center" mt={2}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              shape="rounded"
            />
          </Box>
        </Stack>
      </Box>
      </div>

      {/* Modal */}
      
    </>
  );
};

export default TimeOff;
