import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, Users, Save, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Employee, AttendanceRecord } from '../../types';
import { getEmployees, addOrUpdateAttendanceRecord, getEmployeeById } from '../../data/attendanceData';

// Helper to get default attendance entry for an employee
const getDefaultAttendanceEntry = (employeeId: string, date: string): Partial<AttendanceRecord> => {
  const employee = getEmployeeById(employeeId);
  return {
    employeeId,
    date,
    shift: 'Morning', // Default shift, can be changed per row
    status: 'Present', // Default status
    checkIn: '',
    checkOut: '',
    otHours: 0,
    otRate: employee?.otRate || 0,
    otAmount: 0,
  };
};

export default function MarkAttendance() {
  const [selectedDepartment, setSelectedDepartment] = useState<'CNC' | 'Plating'>('CNC');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  // Stores partial attendance records for each employee being edited
  const [attendanceEntries, setAttendanceEntries] = useState<Record<string, Partial<AttendanceRecord>>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [errors, setErrors] = useState<Record<string, Record<string, string>>>({}); // { employeeId: { field: 'message' } }

  useEffect(() => {
    setAllEmployees(getEmployees());
  }, []);

  const filteredEmployees = allEmployees.filter(emp => emp.department === selectedDepartment);

  // Initialize or get existing entry for an employee
  const getAttendanceEntry = useCallback((employeeId: string): Partial<AttendanceRecord> => {
    return attendanceEntries[employeeId] || getDefaultAttendanceEntry(employeeId, selectedDate);
  }, [attendanceEntries, selectedDate]);

  // When selectedDate or selectedDepartment changes, reset entries and errors
  useEffect(() => {
    setAttendanceEntries({});
    setErrors({});
    // Optionally, pre-populate entries for the new selection
    // filteredEmployees.forEach(emp => {
    //   if (!attendanceEntries[emp.id]) {
    //      // Logic to fetch existing record for this date or set default
    //   }
    // });
  }, [selectedDate, selectedDepartment]);


  const validateEntryField = (employeeId: string, field: keyof AttendanceRecord, value: any, currentEntry: Partial<AttendanceRecord>): string | null => {
    const newErrors = { ...errors[employeeId] };
    let error = null;

    switch (field) {
      case 'checkOut':
        if (value && currentEntry.checkIn && value <= currentEntry.checkIn) {
          error = 'Time Out must be after Time In.';
        }
        break;
      case 'otHours':
        if (value > 6) {
          error = 'OT Hours cannot exceed 6.';
        } else if (value < 0) {
          error = 'OT Hours cannot be negative.';
        }
        break;
      default:
        break;
    }

    if (error) {
      newErrors[field] = error;
    } else {
      delete newErrors[field];
    }
    setErrors(prev => ({ ...prev, [employeeId]: newErrors }));
    return error;
  };


  const updateAttendanceEntry = (employeeId: string, updates: Partial<AttendanceRecord>) => {
    const currentEntry = getAttendanceEntry(employeeId);
    let newEntryData = { ...currentEntry, ...updates };

    // Validate specific fields being updated
    for (const key in updates) {
      if (Object.prototype.hasOwnProperty.call(updates, key)) {
        validateEntryField(employeeId, key as keyof AttendanceRecord, (updates as any)[key], newEntryData);
      }
    }

    // Handle status change implications
    if (updates.status && (updates.status === 'Absent' || updates.status === 'On Leave')) {
      newEntryData = {
        ...newEntryData,
        checkIn: '',
        checkOut: '',
        otHours: 0,
        // otAmount will be 0 as otHours is 0
      };
      // Clear errors for these fields if status makes them irrelevant
      const currentEmpErrors = { ...errors[employeeId] };
      delete currentEmpErrors['checkIn'];
      delete currentEmpErrors['checkOut'];
      delete currentEmpErrors['otHours'];
      setErrors(prev => ({ ...prev, [employeeId]: currentEmpErrors }));
    }

    // Recalculate OT Amount if relevant fields change
    if (updates.otHours !== undefined || updates.otRate !== undefined) {
        const eh = newEntryData.otHours || 0;
        const er = newEntryData.otRate || 0;
        newEntryData.otAmount = eh * er;
    }


    setAttendanceEntries(prev => ({
      ...prev,
      [employeeId]: newEntryData,
    }));
  };

  const validateAllEntries = (): boolean => {
    let isValid = true;
    const newGlobalErrors: Record<string, Record<string, string>> = {};

    filteredEmployees.forEach(employee => {
      const entry = getAttendanceEntry(employee.id);
      // Only validate if some data has been entered or status is not default 'Present' with no times
      const hasData = entry.checkIn || entry.checkOut || entry.otHours || (entry.status && entry.status !== 'Present');

      if (hasData) { // Or more specific conditions if an entry is considered "active"
        const empErrors: Record<string, string> = {};
        if (entry.checkOut && entry.checkIn && entry.checkOut <= entry.checkIn) {
          empErrors['checkOut'] = 'Time Out must be after Time In.';
          isValid = false;
        }
        if (entry.otHours && entry.otHours > 6) {
          empErrors['otHours'] = 'OT Hours cannot exceed 6.';
          isValid = false;
        }
         if (entry.otHours && entry.otHours < 0) {
          empErrors['otHours'] = 'OT Hours cannot be negative.';
          isValid = false;
        }
        if ((entry.status === 'Absent' || entry.status === 'On Leave') && (entry.checkIn || entry.checkOut || entry.otHours)) {
          // This should be handled by updateAttendanceEntry, but double check here
           if(entry.checkIn) empErrors['checkIn'] = 'Time In not allowed if Absent/On Leave.';
           if(entry.checkOut) empErrors['checkOut'] = 'Time Out not allowed if Absent/On Leave.';
           if(entry.otHours && entry.otHours !== 0) empErrors['otHours'] = 'OT not allowed if Absent/On Leave.';
          isValid = false;
        }
        if (!entry.shift) { // Shift is mandatory
            empErrors['shift'] = 'Shift is required.';
            isValid = false;
        }
        if (!entry.status) { // Status is mandatory
            empErrors['status'] = 'Status is required.';
            isValid = false;
        }

        if (Object.keys(empErrors).length > 0) {
          newGlobalErrors[employee.id] = empErrors;
        }
      }
    });
    setErrors(newGlobalErrors);
    return isValid;
  };


  const handleSaveAttendance = async () => {
    if (!validateAllEntries()) {
      alert('Please correct the errors before saving.');
      return;
    }

    setIsSaving(true);
    
    const recordsToSave: AttendanceRecord[] = [];
    Object.values(attendanceEntries).forEach(partialRecord => {
      // Ensure it's a "complete" record ready for saving.
      // A record is "complete" if it has at least a status, or time entries.
      // Or, more simply, if it's in attendanceEntries, it's intended for saving.
      if (partialRecord.employeeId && partialRecord.date && partialRecord.shift && partialRecord.status) {
        const employee = getEmployeeById(partialRecord.employeeId);
        if(employee) {
            recordsToSave.push({
                id: partialRecord.id || '', // ID will be set by addOrUpdate if new
                employeeId: partialRecord.employeeId,
                employeeName: employee.name, // Get employee name
                department: employee.department,
                date: partialRecord.date,
                shift: partialRecord.shift,
                status: partialRecord.status,
                checkIn: partialRecord.checkIn || '',
                checkOut: partialRecord.checkOut || '',
                otHours: partialRecord.otHours || 0,
                otRate: partialRecord.otRate || employee.otRate, // Use record's otRate or default from employee
                otAmount: (partialRecord.otHours || 0) * (partialRecord.otRate || employee.otRate),
            });
        }
      }
    });

    if (recordsToSave.length === 0) {
        alert("No attendance data to save.");
        setIsSaving(false);
        return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      recordsToSave.forEach(record => {
        addOrUpdateAttendanceRecord(record);
      });

      alert('Attendance saved successfully!');
      setAttendanceEntries({}); // Clear entries after save
      setErrors({});
    } catch (error) {
      console.error("Failed to save attendance:", error);
      alert("Failed to save attendance. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const calculateOTAmount = (otHours?: number, otRate?: number) => {
    return (otHours || 0) * (otRate || 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-sky-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="mb-8 p-6 bg-white rounded-xl shadow-lg border border-gray-200">
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Mark Employee Attendance</h1>
          <p className="text-sm text-slate-600 mt-2">
            Efficiently mark daily attendance, assign shifts, and track overtime for your workforce.
          </p>
        </div>

        {/* Filters Card */}
        <div className="mb-8 p-6 bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <label htmlFor="department-select" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Select Department
              </label>
              <div className="relative group">
                <Users className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5 group-focus-within:text-blue-500 transition-colors" />
                <select
                  id="department-select"
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value as 'CNC' | 'Plating')}
                  className="pl-11 pr-4 py-2.5 w-full text-sm border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-slate-400 transition-all appearance-none"
                >
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

            <div>
              <label htmlFor="date-select" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Select Date
              </label>
              <div className="relative group">
                <Calendar className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5 group-focus-within:text-blue-500 transition-colors" />
                <input
                  id="date-select"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="pl-11 pr-4 py-2.5 w-full text-sm border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-slate-400 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Employee Attendance Table Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-slate-50">
            <h2 className="text-xl font-semibold text-slate-700">
              {selectedDepartment} Department <span className="text-slate-500 font-normal">- {filteredEmployees.length} Employees</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Marking attendance for {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {filteredEmployees.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-100">
                  <tr>
                    {[
                      "Employee Details", "Shift Assignment", "Attendance Status", "Time In", "Time Out",
                      "OT Hours", "OT Rate (₹)", "OT Pay (₹)"
                    ].map(header => (
                      <th key={header} className="px-4 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredEmployees.map((employee) => {
                  const entry = getAttendanceEntry(employee.id);
                  const empErrors = errors[employee.id] || {};
                  const isRowDisabled = entry.status === 'Absent' || entry.status === 'On Leave';
                  const otAmount = calculateOTAmount(entry.otHours, entry.otRate);
                  const hasRowErrors = Object.keys(empErrors).length > 0;

                  const inputBaseClasses = "w-full text-sm px-2.5 py-1.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors";
                  const disabledClasses = "disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed disabled:hover:border-slate-300";
                  const errorBorderClasses = "border-red-400 focus:border-red-500 focus:ring-red-500";
                  const normalBorderClasses = "border-slate-300 hover:border-slate-400";
                  
                  const getInputClasses = (fieldName: keyof AttendanceRecord) =>
                    `${inputBaseClasses} ${isRowDisabled ? disabledClasses : ''} ${empErrors[fieldName] ? errorBorderClasses : normalBorderClasses}`;

                  return (
                    <tr key={employee.id} className={`transition-colors ${hasRowErrors ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-slate-50'}`}>
                      {/* Employee Details */}
                      <td className="px-4 py-3 whitespace-nowrap align-top">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3 text-sm font-semibold flex-shrink-0">
                            {employee.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-800">{employee.name}</div>
                            <div className="text-xs text-slate-500">{employee.role}</div>
                            <div className="text-xs text-slate-500">ID: {employee.id}</div>
                          </div>
                        </div>
                        {hasRowErrors && <p className="text-xs text-red-600 mt-1.5">Check inputs for this row.</p>}
                      </td>
                      {/* Shift Assignment */}
                      <td className="px-4 py-3 whitespace-nowrap align-top">
                        <select
                          value={entry.shift || 'Morning'}
                          onChange={(e) => updateAttendanceEntry(employee.id, { shift: e.target.value as 'Morning' | 'Evening' })}
                          className={`${getInputClasses('shift')} min-w-[120px] appearance-none`}
                        >
                          <option value="Morning">Morning</option>
                          <option value="Evening">Evening</option>
                        </select>
                        {empErrors.shift && <p className="text-xs text-red-600 mt-1">{empErrors.shift}</p>}
                      </td>
                      {/* Attendance Status */}
                      <td className="px-4 py-3 whitespace-nowrap align-top">
                        <select
                          value={entry.status || 'Present'}
                          onChange={(e) => updateAttendanceEntry(employee.id, { status: e.target.value as AttendanceRecord['status'] })}
                           className={`${getInputClasses('status')} min-w-[120px] appearance-none`}
                        >
                          <option value="Present">Present</option>
                          <option value="Late">Late</option>
                          <option value="Absent">Absent</option>
                          <option value="On Leave">On Leave</option>
                        </select>
                         {empErrors.status && <p className="text-xs text-red-600 mt-1">{empErrors.status}</p>}
                      </td>
                      {/* Time In */}
                      <td className="px-4 py-3 whitespace-nowrap align-top">
                        <input
                          type="time"
                          value={entry.checkIn || ''}
                          onChange={(e) => updateAttendanceEntry(employee.id, { checkIn: e.target.value })}
                          disabled={isRowDisabled}
                          className={`${getInputClasses('checkIn')} min-w-[100px]`}
                        />
                        {empErrors.checkIn && <p className="text-xs text-red-600 mt-1">{empErrors.checkIn}</p>}
                      </td>
                      {/* Time Out */}
                      <td className="px-4 py-3 whitespace-nowrap align-top">
                        <input
                          type="time"
                          value={entry.checkOut || ''}
                          onChange={(e) => updateAttendanceEntry(employee.id, { checkOut: e.target.value })}
                          disabled={isRowDisabled}
                          className={`${getInputClasses('checkOut')} min-w-[100px]`}
                        />
                        {empErrors.checkOut && <p className="text-xs text-red-600 mt-1">{empErrors.checkOut}</p>}
                      </td>
                      {/* OT Hours */}
                      <td className="px-4 py-3 whitespace-nowrap align-top">
                        <input
                          type="number"
                          min="0" max="6" step="0.5"
                          placeholder="0"
                          value={entry.otHours === undefined ? '' : String(entry.otHours)}
                          onFocus={(e) => e.target.select()}
                          onChange={(e) => updateAttendanceEntry(employee.id, { otHours: e.target.value === '' ? undefined : parseFloat(e.target.value)})}
                          disabled={isRowDisabled}
                          className={`${getInputClasses('otHours')} w-24`}
                        />
                        {empErrors.otHours && <p className="text-xs text-red-600 mt-1">{empErrors.otHours}</p>}
                      </td>
                      {/* OT Rate */}
                      <td className="px-4 py-3 whitespace-nowrap align-top">
                        <div className="relative">
                            <span className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-slate-500 text-sm">₹</span>
                            <input
                            type="number"
                            min="0"
                            placeholder="Rate"
                            value={entry.otRate === undefined ? '' : String(entry.otRate)}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => updateAttendanceEntry(employee.id, { otRate: e.target.value === '' ? undefined : parseFloat(e.target.value) || 0 })}
                            className={`${getInputClasses('otRate')} w-28 pl-7`}
                            />
                        </div>
                         {empErrors.otRate && <p className="text-xs text-red-600 mt-1">{empErrors.otRate}</p>}
                      </td>
                       {/* OT Pay */}
                      <td className="px-4 py-3 whitespace-nowrap align-top text-sm font-semibold text-slate-700">
                        ₹{otAmount.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 px-6">
            <Users className="mx-auto h-16 w-16 text-slate-300" />
            <h3 className="mt-4 text-lg font-semibold text-slate-700">No employees found</h3>
            <p className="mt-1.5 text-sm text-slate-500">
              There are no employees listed for the selected department. Please check your filter or employee records.
            </p>
          </div>
        )}
        </div> {/* End of table card */}

        {/* Save Button Area */}
        {filteredEmployees.length > 0 && (
        <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4 p-6 bg-white rounded-xl shadow-lg border border-gray-200">
            {Object.values(errors).some(empErr => Object.keys(empErr).length > 0) && (
            <div className="flex items-center text-sm text-red-600">
                <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" aria-hidden="true" />
                <span>Please correct the highlighted errors before saving.</span>
            </div>
            )}
            <div className="sm:ml-auto"> {/* Pushes button to the right if there's space */}
            <button
                onClick={handleSaveAttendance}
                disabled={isSaving || Object.values(errors).some(empErr => Object.keys(empErr).length > 0)}
                className="w-full sm:w-auto bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-slate-50 transition-all duration-150 ease-in-out flex items-center justify-center space-x-2.5 text-base font-medium shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
            >
                <Save className="h-5 w-5" />
                <span>{isSaving ? 'Saving Attendance...' : 'Save All Attendance'}</span>
            </button>
            </div>
        </div>
        )}
      </div>
    </div>
  );
}