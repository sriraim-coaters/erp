import React, { useState } from 'react';
import { Calendar, Clock, Users, CheckCircle, XCircle, AlertCircle, UserCheck, IndianRupee } from 'lucide-react';
import { AttendanceRecord, Employee } from '../../types';

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

const mockAttendance: AttendanceRecord[] = [
  {
    id: '1',
    employeeId: '1',
    employeeName: 'John Smith',
    department: 'CNC',
    date: '2024-01-15',
    shift: 'Morning',
    checkIn: '06:05',
    checkOut: '14:00',
    status: 'Present',
    otHours: 2,
    otAmount: 140
  },
  {
    id: '2',
    employeeId: '2',
    employeeName: 'Sarah Johnson',
    department: 'CNC',
    date: '2024-01-15',
    shift: 'Evening',
    checkIn: '14:10',
    status: 'Late',
    otHours: 0,
    otAmount: 0
  },
  {
    id: '3',
    employeeId: '3',
    employeeName: 'Mike Wilson',
    department: 'Plating',
    date: '2024-01-15',
    shift: 'Morning',
    status: 'Absent',
    otHours: 0,
    otAmount: 0
  },
  {
    id: '4',
    employeeId: '4',
    employeeName: 'Lisa Chen',
    department: 'Plating',
    date: '2024-01-15',
    shift: 'Evening',
    checkIn: '14:00',
    checkOut: '22:00',
    status: 'Present',
    otHours: 1.5,
    otAmount: 120
  }
];

export default function AttendanceTracker() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedShift, setSelectedShift] = useState<'Morning' | 'Evening' | 'All'>('All');
  const [selectedDepartment, setSelectedDepartment] = useState<'CNC' | 'Plating' | 'All'>('All');
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(mockAttendance);
  const [employees] = useState<Employee[]>(mockEmployees);

  const filteredAttendance = attendance.filter(record => {
    const matchesDate = record.date === selectedDate;
    const matchesShift = selectedShift === 'All' || record.shift === selectedShift;
    const matchesDepartment = selectedDepartment === 'All' || record.department === selectedDepartment;
    return matchesDate && matchesShift && matchesDepartment;
  });

  const stats = {
    present: filteredAttendance.filter(r => r.status === 'Present').length,
    absent: filteredAttendance.filter(r => r.status === 'Absent').length,
    late: filteredAttendance.filter(r => r.status === 'Late').length,
    total: filteredAttendance.length,
    totalOT: filteredAttendance.reduce((sum, r) => sum + r.otAmount, 0)
  };

  const handleCheckIn = (id: string) => {
    const currentTime = new Date().toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    setAttendance(attendance.map(record => 
      record.id === id 
        ? { ...record, checkIn: currentTime, status: 'Present' as const }
        : record
    ));
  };

  const handleCheckOut = (id: string) => {
    const currentTime = new Date().toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    setAttendance(attendance.map(record => 
      record.id === id 
        ? { ...record, checkOut: currentTime }
        : record
    ));
  };

  const handleMarkAttendance = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) return;

    const existingRecord = attendance.find(record => 
      record.employeeId === employeeId && record.date === selectedDate
    );

    if (existingRecord) {
      setAttendance(attendance.map(record => 
        record.id === existingRecord.id 
          ? { ...record, status: 'Present' as const, checkIn: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) }
          : record
      ));
    } else {
      const newRecord: AttendanceRecord = {
        id: Date.now().toString(),
        employeeId: employee.id,
        employeeName: employee.name,
        department: employee.department,
        date: selectedDate,
        shift: selectedShift === 'All' ? 'Morning' : selectedShift,
        checkIn: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        status: 'Present',
        otHours: 0,
        otAmount: 0
      };
      setAttendance([...attendance, newRecord]);
    }
  };

  const handleOTHoursChange = (id: string, otHours: number) => {
    const record = attendance.find(r => r.id === id);
    const employee = employees.find(emp => emp.id === record?.employeeId);
    
    if (record && employee) {
      const otAmount = otHours * employee.otRate;
      setAttendance(attendance.map(r => 
        r.id === id 
          ? { ...r, otHours, otAmount }
          : r
      ));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Present':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'Absent':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'Late':
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (status) {
      case 'Present':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'Absent':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'Late':
        return `${baseClasses} bg-orange-100 text-orange-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Attendance Tracker</h2>
        <p className="text-gray-600">Track daily employee attendance and overtime hours</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Present</p>
              <p className="text-2xl font-bold text-green-600">{stats.present}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Absent</p>
              <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Late</p>
              <p className="text-2xl font-bold text-orange-600">{stats.late}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-orange-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total OT</p>
              <p className="text-2xl font-bold text-purple-600">₹{stats.totalOT}</p>
            </div>
            <IndianRupee className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
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
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Shift
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <select
                value={selectedShift}
                onChange={(e) => setSelectedShift(e.target.value as 'Morning' | 'Evening' | 'All')}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
              >
                <option value="All">All Shifts</option>
                <option value="Morning">Morning</option>
                <option value="Evening">Evening</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value as 'CNC' | 'Plating' | 'All')}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
              >
                <option value="All">All Departments</option>
                <option value="CNC">CNC</option>
                <option value="Plating">Plating</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Shift
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check In
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check Out
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  OT Hours
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  OT Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAttendance.map((record) => {
                const employee = employees.find(emp => emp.id === record.employeeId);
                return (
                  <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(record.status)}
                        <div className="ml-2">
                          <span className="text-sm font-medium text-gray-900">
                            {record.employeeName}
                          </span>
                          {employee && (
                            <div className="text-xs text-gray-500">
                              OT Rate: ₹{employee.otRate}/hr
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        record.department === 'CNC' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {record.department}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.shift}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.checkIn || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.checkOut || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={record.otHours}
                        onChange={(e) => handleOTHoursChange(record.id, parseFloat(e.target.value) || 0)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ₹{record.otAmount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadge(record.status)}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleMarkAttendance(record.employeeId)}
                          className="text-green-600 hover:text-green-900 transition-colors flex items-center space-x-1"
                        >
                          <UserCheck className="h-4 w-4" />
                          <span>Mark</span>
                        </button>
                        {!record.checkIn && (
                          <button
                            onClick={() => handleCheckIn(record.id)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                          >
                            Check In
                          </button>
                        )}
                        {record.checkIn && !record.checkOut && (
                          <button
                            onClick={() => handleCheckOut(record.id)}
                            className="text-orange-600 hover:text-orange-900 transition-colors"
                          >
                            Check Out
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredAttendance.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No attendance records found for the selected filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}