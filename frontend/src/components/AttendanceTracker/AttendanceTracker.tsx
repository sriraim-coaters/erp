import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, Users, CheckCircle, XCircle, AlertCircle, UserCheck, IndianRupee, RefreshCw, LogIn, LogOut, Edit2, Briefcase } from 'lucide-react';
import { AttendanceRecord, Employee } from '../../types'; // Employee type might not be directly needed if all info is on AttendanceRecord
import { getAttendanceRecords as fetchAttendanceRecords, addOrUpdateAttendanceRecord, getEmployeeById } from '../../data/attendanceData';

export default function AttendanceTracker() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedShift, setSelectedShift] = useState<'Morning' | 'Evening' | 'All'>('All');
  const [selectedDepartment, setSelectedDepartment] = useState<'CNC' | 'Plating' | 'All'>('All');
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadAttendanceData = useCallback(async () => {
    setIsLoading(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200)); // Reduced delay
    const records = fetchAttendanceRecords({
      date: selectedDate,
      department: selectedDepartment === 'All' ? undefined : selectedDepartment,
      shift: selectedShift === 'All' ? undefined : selectedShift,
    });
    setAttendance(records);
    setIsLoading(false);
  }, [selectedDate, selectedDepartment, selectedShift]);

  useEffect(() => {
    loadAttendanceData();
  }, [loadAttendanceData]); // This hook now correctly calls loadAttendanceData when filters change

  // No need for separate filteredAttendance, `attendance` state is already filtered by `loadAttendanceData`

  const stats = {
    present: attendance.filter(r => r.status === 'Present').length,
    absent: attendance.filter(r => r.status === 'Absent').length,
    late: attendance.filter(r => r.status === 'Late').length,
    onLeave: attendance.filter(r => r.status === 'On Leave').length,
    total: attendance.length,
    totalOT: attendance.reduce((sum, r) => sum + r.otAmount, 0)
  };

  const updateRecord = async (recordId: string, updates: Partial<AttendanceRecord>) => {
    const recordToUpdate = attendance.find(r => r.id === recordId);
    if (!recordToUpdate) {
        console.error("Record not found for update:", recordId);
        return;
    }

    let newOtAmount = recordToUpdate.otAmount;
    if (updates.otHours !== undefined || updates.otRate !== undefined) {
        const newOtHours = updates.otHours !== undefined ? updates.otHours : recordToUpdate.otHours;
        const currentOtRate = updates.otRate !== undefined ? updates.otRate : recordToUpdate.otRate;
        newOtAmount = (newOtHours || 0) * (currentOtRate || 0);
    }
    
    const finalRecord = {
        ...recordToUpdate,
        ...updates,
        otAmount: newOtAmount // Ensure otAmount is updated based on potentially new hours/rate
    };

    addOrUpdateAttendanceRecord(finalRecord as AttendanceRecord);
    await loadAttendanceData(); // Refresh list to show changes
  };

  const handleCheckIn = (recordId: string) => {
    const currentTime = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    updateRecord(recordId, { checkIn: currentTime, status: 'Present' });
  };

  const handleCheckOut = (recordId: string) => {
    const currentTime = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    updateRecord(recordId, { checkOut: currentTime });
  };

  const handleOTHoursChange = (recordId: string, otHoursInput: string) => {
    const otHours = parseFloat(otHoursInput);
    if (isNaN(otHours) || otHours < 0 || otHours > 6) {
        alert("OT hours must be a number between 0 and 6.");
        loadAttendanceData(); // Revert input by reloading current data
        return;
    }
    updateRecord(recordId, { otHours });
  };

  // Quick status toggle - not in requirements but can be useful
  // const toggleStatus = (recordId: string, currentStatus: AttendanceRecord['status']) => {
  //   let newStatus: AttendanceRecord['status'] = 'Present';
  //   if (currentStatus === 'Present') newStatus = 'Absent';
  //   // Add more logic if needed
  //   updateRecord(recordId, { status: newStatus });
  // };

  const getStatusIcon = (status: AttendanceRecord['status']) => {
    switch (status) {
      case 'Present': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'Absent': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'Late': return <AlertCircle className="h-5 w-5 text-orange-500" />;
      case 'On Leave': return <Briefcase className="h-5 w-5 text-sky-500" />;
      default: return <Users className="h-5 w-5 text-gray-400" />; // Default icon
    }
  };

  const getStatusBadge = (status: AttendanceRecord['status']) => {
    const baseClasses = "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case 'Present': return `${baseClasses} bg-green-100 text-green-700`;
      case 'Absent': return `${baseClasses} bg-red-100 text-red-700`;
      case 'Late': return `${baseClasses} bg-orange-100 text-orange-700`;
      case 'On Leave': return `${baseClasses} bg-sky-100 text-sky-700`;
      default: return `${baseClasses} bg-gray-100 text-gray-700`;
    }
  };

  // Placeholder for a future Edit Modal to edit all fields of a record
  // const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  // const openEditModal = (record: AttendanceRecord) => setEditingRecord(record);

  const inputBaseClasses = "pl-11 pr-4 py-2.5 w-full text-sm border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-slate-400 transition-all";
  const selectClasses = `${inputBaseClasses} appearance-none`;


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-sky-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-full mx-auto">
        {/* Header and Refresh Button */}
        <div className="mb-8 p-6 bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div>
                  <h1 className="text-3xl font-bold tracking-tight text-slate-800">Attendance Tracker</h1>
                  <p className="text-sm text-slate-600 mt-2">View and manage daily employee attendance, shifts, and overtime.</p>
              </div>
              <button
                  onClick={loadAttendanceData}
                  disabled={isLoading}
                  className="mt-4 sm:mt-0 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-slate-50 transition-all duration-150 ease-in-out flex items-center space-x-2 text-sm font-medium shadow-md hover:shadow-lg disabled:opacity-70 disabled:hover:bg-blue-600"
              >
                  <RefreshCw className={`h-4.5 w-4.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>{isLoading ? 'Refreshing...' : 'Refresh Data'}</span>
              </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5 mb-8">
          {[
            { title: 'Present', value: stats.present, Icon: CheckCircle, iconColor: 'text-green-500', textColor: 'text-green-600' },
            { title: 'Absent', value: stats.absent, Icon: XCircle, iconColor: 'text-red-500', textColor: 'text-red-600' },
            { title: 'Late', value: stats.late, Icon: AlertCircle, iconColor: 'text-orange-500', textColor: 'text-orange-600' },
            { title: 'On Leave', value: stats.onLeave, Icon: Briefcase, iconColor: 'text-sky-500', textColor: 'text-sky-600' },
            { title: 'Total Tracked', value: stats.total, Icon: Users, iconColor: 'text-blue-500', textColor: 'text-blue-600' },
            { title: 'Total OT Pay', value: `₹${stats.totalOT.toFixed(2)}`, Icon: IndianRupee, iconColor: 'text-purple-500', textColor: 'text-purple-600' },
          ].map(stat => (
            <div key={stat.title} className="bg-white p-5 rounded-xl shadow-lg border border-gray-200 transition-all hover:shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-wider text-slate-500`}>{stat.title}</p>
                  <p className={`text-3xl font-bold ${stat.textColor} mt-1`}>{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full bg-opacity-10 bg-${stat.iconColor.split('-')[1]}-500`}>
                    <stat.Icon className={`h-7 w-7 ${stat.iconColor}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters Card */}
        <div className="mb-8 p-6 bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
            <div>
              <label htmlFor="tracker-date-filter" className="block text-sm font-semibold text-slate-700 mb-1.5">Date</label>
              <div className="relative group">
                <Calendar className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5 pointer-events-none group-focus-within:text-blue-500 transition-colors" />
                <input
                  id="tracker-date-filter"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className={inputBaseClasses}
                />
              </div>
            </div>
            <div>
              <label htmlFor="tracker-shift-filter" className="block text-sm font-semibold text-slate-700 mb-1.5">Shift</label>
              <div className="relative group">
                <Clock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5 pointer-events-none group-focus-within:text-blue-500 transition-colors" />
                <select
                  id="tracker-shift-filter"
                  value={selectedShift}
                  onChange={(e) => setSelectedShift(e.target.value as 'Morning' | 'Evening' | 'All')}
                  className={selectClasses}
                >
                  <option value="All">All Shifts</option>
                  <option value="Morning">Morning</option>
                  <option value="Evening">Evening</option>
                </select>
                 <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                        <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                    </svg>
                </div>
              </div>
            </div>
            <div>
              <label htmlFor="tracker-department-filter" className="block text-sm font-semibold text-slate-700 mb-1.5">Department</label>
              <div className="relative group">
                <Users className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5 pointer-events-none group-focus-within:text-blue-500 transition-colors" />
                <select
                  id="tracker-department-filter"
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value as 'CNC' | 'Plating' | 'All')}
                  className={selectClasses}
                >
                  <option value="All">All Departments</option>
                  <option value="CNC">CNC Department</option>
                  <option value="Plating">Plating Department</option>
                </select>
                 <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                        <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                    </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Table Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
           <div className="px-6 py-5 border-b border-gray-200 bg-slate-50">
             <h2 className="text-xl font-semibold text-slate-700">Attendance Records</h2>
             <p className="text-xs text-slate-500 mt-1">
                Displaying records for {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}.
                Adjust filters above to refine results.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-100">
                <tr>
                  {[
                    "Employee", "Department", "Shift", "Check In", "Check Out",
                    "OT Hours", "OT Rate (₹)", "OT Amount (₹)", "Status", "Actions"
                  ].map(header => (
                    <th key={header} className="px-4 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {isLoading ? (
                  <tr><td colSpan={10} className="text-center py-12 text-slate-500 text-sm">
                      <RefreshCw className="h-6 w-6 text-slate-400 animate-spin inline mr-2.5" />
                      Loading attendance data, please wait...
                  </td></tr>
                ) : attendance.length > 0 ? (
                  attendance.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-4 py-3 whitespace-nowrap align-top">
                        <div className="flex items-center">
                          <div className={`p-1.5 mr-3 rounded-full bg-opacity-20 ${record.status === 'Present' ? 'bg-green-500' : record.status === 'Absent' ? 'bg-red-500' : record.status === 'Late' ? 'bg-orange-500' : record.status === 'On Leave' ? 'bg-sky-500' : 'bg-gray-500'}`}>
                            {getStatusIcon(record.status)}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-800">{record.employeeName}</div>
                            <div className="text-xs text-slate-500">ID: {record.employeeId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap align-top">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                          record.department === 'CNC'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-indigo-100 text-indigo-700'
                        }`}>
                          {record.department}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600 align-top">{record.shift}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600 align-top">{record.checkIn || <span className="text-slate-400 italic">N/A</span>}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600 align-top">{record.checkOut || <span className="text-slate-400 italic">N/A</span>}</td>
                      <td className="px-4 py-3 whitespace-nowrap align-top">
                        <input
                          type="number"
                          min="0" max="6" step="0.5"
                          defaultValue={record.otHours}
                          onBlur={(e) => handleOTHoursChange(record.id, e.target.value)}
                          disabled={record.status === 'Absent' || record.status === 'On Leave'}
                          className="w-24 px-2.5 py-1.5 border border-slate-300 rounded-md text-sm shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-500 hover:border-slate-400 transition"
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600 align-top">₹{record.otRate.toFixed(2)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-slate-800 align-top">₹{record.otAmount.toFixed(2)}</td>
                      <td className="px-4 py-3 whitespace-nowrap align-top">
                        <span className={getStatusBadge(record.status)}>{record.status}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium align-top">
                        <div className="flex items-center space-x-1.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150">
                          {(record.status !== 'Absent' && record.status !== 'On Leave') && (
                            <>
                              {!record.checkIn && (
                                <button
                                  onClick={() => handleCheckIn(record.id)}
                                  title="Check In Now"
                                  className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition-all"
                                > <LogIn size={18} /> </button>
                              )}
                              {record.checkIn && !record.checkOut && (
                                <button
                                  onClick={() => handleCheckOut(record.id)}
                                  title="Check Out Now"
                                  className="p-2 text-orange-600 hover:text-orange-700 hover:bg-orange-100 rounded-lg transition-all"
                                > <LogOut size={18} /> </button>
                              )}
                            </>
                          )}
                           <button
                            onClick={() => alert(`Editing for ${record.employeeName} (ID: ${record.id}) - Full edit modal not implemented. OT Hours can be edited directly.`)}
                            title="Edit Record (Basic)"
                            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-all"
                          > <Edit2 size={18} /> </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={10} className="text-center py-16 text-slate-500">
                      <Users className="mx-auto h-16 w-16 text-slate-300 mb-4" />
                      <p className="text-lg font-semibold text-slate-700">No attendance records found.</p>
                      <p className="text-sm text-slate-500 mt-1.5">
                        Try adjusting the filters or <button onClick={loadAttendanceData} className="text-blue-600 hover:underline font-medium">click here to refresh</button> the data.
                      </p>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* Edit Modal Placeholder */}
      </div>
    </div>
  );
}