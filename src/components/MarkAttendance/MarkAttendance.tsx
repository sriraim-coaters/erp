import React, { useState } from 'react';
import { Calendar, Clock, Users, Save, CheckCircle, XCircle } from 'lucide-react';
import { Employee, AttendanceRecord } from '../../types';

const mockEmployees: Employee[] = [
  {
    id: '1',
    name: 'John Smith',
    role: 'Machine Operator',
    department: 'CNC',
    shiftTime: '06:00 - 14:00',
    sundayOff: true,
    assignedMachine: 'CNC-001',
    phone: '+1-555-0123',
    joinDate: '2023-01-15',
    otRate: 70
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    role: 'Senior Technician',
    department: 'CNC',
    shiftTime: '14:00 - 22:00',
    sundayOff: false,
    assignedMachine: 'CNC-002',
    phone: '+1-555-0124',
    joinDate: '2022-08-20',
    otRate: 85
  },
  {
    id: '3',
    name: 'Mike Wilson',
    role: 'Plating Specialist',
    department: 'Plating',
    shiftTime: '06:00 - 14:00',
    sundayOff: true,
    assignedMachine: 'PLT-001',
    phone: '+1-555-0125',
    joinDate: '2023-03-10',
    otRate: 75
  },
  {
    id: '4',
    name: 'Lisa Chen',
    role: 'Quality Inspector',
    department: 'Plating',
    shiftTime: '14:00 - 22:00',
    sundayOff: false,
    assignedMachine: 'PLT-002',
    phone: '+1-555-0126',
    joinDate: '2022-11-05',
    otRate: 80
  }
];

interface AttendanceEntry {
  employeeId: string;
  timeIn: string;
  timeOut: string;
  otHours: number;
  otRate: number;
  status: 'Present' | 'Absent';
}

export default function MarkAttendance() {
  const [selectedDepartment, setSelectedDepartment] = useState<'CNC' | 'Plating'>('CNC');
  const [selectedShift, setSelectedShift] = useState<'Morning' | 'Evening'>('Morning');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceEntries, setAttendanceEntries] = useState<Record<string, AttendanceEntry>>({});
  const [isSaving, setIsSaving] = useState(false);

  const filteredEmployees = mockEmployees.filter(emp => {
    const matchesDepartment = emp.department === selectedDepartment;
    const matchesShift = (selectedShift === 'Morning' && emp.shiftTime.includes('06:00')) ||
                        (selectedShift === 'Evening' && emp.shiftTime.includes('14:00'));
    return matchesDepartment && matchesShift;
  });

  const getAttendanceEntry = (employeeId: string): AttendanceEntry => {
    const employee = mockEmployees.find(emp => emp.id === employeeId);
    return attendanceEntries[employeeId] || {
      employeeId,
      timeIn: '',
      timeOut: '',
      otHours: 0,
      otRate: employee?.otRate || 70,
      status: 'Present'
    };
  };

  const updateAttendanceEntry = (employeeId: string, updates: Partial<AttendanceEntry>) => {
    const currentEntry = getAttendanceEntry(employeeId);
    setAttendanceEntries({
      ...attendanceEntries,
      [employeeId]: { ...currentEntry, ...updates }
    });
  };

  const handleSaveAttendance = async () => {
    setIsSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Here you would typically save to your backend/state management
    console.log('Saving attendance data:', {
      date: selectedDate,
      department: selectedDepartment,
      shift: selectedShift,
      entries: attendanceEntries
    });
    
    // Show success message
    alert('Attendance saved successfully!');
    
    setIsSaving(false);
  };

  const toggleStatus = (employeeId: string) => {
    const currentEntry = getAttendanceEntry(employeeId);
    updateAttendanceEntry(employeeId, {
      status: currentEntry.status === 'Present' ? 'Absent' : 'Present'
    });
  };

  const calculateOTAmount = (otHours: number, otRate: number) => {
    return otHours * otRate;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Mark Attendance</h2>
        <p className="text-gray-600">Bulk attendance marking for employees by department and shift</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department *
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value as 'CNC' | 'Plating')}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
              >
                <option value="CNC">CNC Department</option>
                <option value="Plating">Plating Department</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Shift *
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <select
                value={selectedShift}
                onChange={(e) => setSelectedShift(e.target.value as 'Morning' | 'Evening')}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
              >
                <option value="Morning">Morning Shift</option>
                <option value="Evening">Evening Shift</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Employee Attendance Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {selectedDepartment} - {selectedShift} Shift ({filteredEmployees.length} employees)
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Mark attendance for {new Date(selectedDate).toLocaleDateString()}
          </p>
        </div>

        {filteredEmployees.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time In
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time Out
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    OT Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    OT Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    OT Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEmployees.map((employee) => {
                  const entry = getAttendanceEntry(employee.id);
                  const otAmount = calculateOTAmount(entry.otHours, entry.otRate);
                  
                  return (
                    <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                            <span className="text-sm font-medium text-gray-600">
                              {employee.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                            <div className="text-sm text-gray-500">{employee.role}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="time"
                          value={entry.timeIn}
                          onChange={(e) => updateAttendanceEntry(employee.id, { timeIn: e.target.value })}
                          disabled={entry.status === 'Absent'}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="time"
                          value={entry.timeOut}
                          onChange={(e) => updateAttendanceEntry(employee.id, { timeOut: e.target.value })}
                          disabled={entry.status === 'Absent'}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={entry.otHours}
                          onChange={(e) => updateAttendanceEntry(employee.id, { otHours: parseFloat(e.target.value) || 0 })}
                          disabled={entry.status === 'Absent'}
                          className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-1">
                          <span className="text-sm text-gray-500">₹</span>
                          <input
                            type="number"
                            min="0"
                            value={entry.otRate}
                            onChange={(e) => updateAttendanceEntry(employee.id, { otRate: parseFloat(e.target.value) || 0 })}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ₹{otAmount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleStatus(employee.id)}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            entry.status === 'Present'
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                        >
                          {entry.status === 'Present' ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Present
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3 mr-1" />
                              Absent
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No employees found</h3>
            <p className="mt-1 text-sm text-gray-500">
              No employees match the selected department and shift criteria.
            </p>
          </div>
        )}
      </div>

      {/* Save Button */}
      {filteredEmployees.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={handleSaveAttendance}
            disabled={isSaving}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4" />
            <span>{isSaving ? 'Saving...' : 'Save Attendance'}</span>
          </button>
        </div>
      )}
    </div>
  );
}