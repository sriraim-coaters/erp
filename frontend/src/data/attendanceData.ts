import { AttendanceRecord, Employee } from '../types';

// Centralized mock employee data
export const mockEmployees: Employee[] = [
  {
    id: '1',
    name: 'John Smith',
    role: 'Machine Operator',
    department: 'CNC',
    shiftTime: '06:00 - 14:00', // This might become less relevant if shifts are fully dynamic
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
    shiftTime: '14:00 - 22:00', // This might become less relevant
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
    shiftTime: '06:00 - 14:00', // This might become less relevant
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
    shiftTime: '14:00 - 22:00', // This might become less relevant
    sundayOff: false,
    assignedMachine: 'PLT-002',
    phone: '+1-555-0126',
    joinDate: '2022-11-05',
    otRate: 80
  }
];

// Mock data store for attendance records
let mockAttendanceRecords: AttendanceRecord[] = [];

/**
 * Adds or updates an attendance record.
 * If a record for the same employee and date exists, it's updated. Otherwise, a new record is added.
 */
export const addOrUpdateAttendanceRecord = (newRecord: AttendanceRecord): AttendanceRecord => {
  const existingRecordIndex = mockAttendanceRecords.findIndex(
    r => r.employeeId === newRecord.employeeId && r.date === newRecord.date
  );

  if (existingRecordIndex !== -1) {
    // Update existing record
    mockAttendanceRecords[existingRecordIndex] = { ...mockAttendanceRecords[existingRecordIndex], ...newRecord };
    return mockAttendanceRecords[existingRecordIndex];
  } else {
    // Add new record
    const recordWithId = { ...newRecord, id: Date.now().toString() }; // Simple ID generation
    mockAttendanceRecords.push(recordWithId);
    return recordWithId;
  }
};

/**
 * Retrieves attendance records, optionally filtered.
 */
export const getAttendanceRecords = (filters?: {
  date?: string;
  department?: 'CNC' | 'Plating' | 'All';
  shift?: 'Morning' | 'Evening' | 'All';
}): AttendanceRecord[] => {
  return mockAttendanceRecords.filter(record => {
    const matchesDate = !filters?.date || record.date === filters.date;
    const matchesDepartment = !filters?.department || filters.department === 'All' || record.department === filters.department;
    const matchesShift = !filters?.shift || filters.shift === 'All' || record.shift === filters.shift;
    return matchesDate && matchesDepartment && matchesShift;
  });
};

/**
 * Retrieves all mock employees.
 */
export const getEmployees = (): Employee[] => {
  return mockEmployees;
};

/**
 * Retrieves a single employee by ID.
 */
export const getEmployeeById = (id: string): Employee | undefined => {
  return mockEmployees.find(emp => emp.id === id);
};

/**
 * Clears all attendance records. Useful for testing or resetting state.
 */
export const clearAttendanceRecords = (): void => {
  mockAttendanceRecords = [];
};

/*
==================================================================================
CONCEPTUAL API STRUCTURES
==================================================================================

This section outlines the conceptual structure for API requests and responses
if a real backend were implemented for attendance management.

----------------------------------------------------------------------------------
1. Mark Attendance (Batch Save)
----------------------------------------------------------------------------------

Endpoint: POST /api/attendance/batch

Request Body:
An array of attendance records to be saved or updated.

Example:
[
  {
    "employeeId": "1",
    "employeeName": "John Smith", // Optional, can be looked up on backend
    "department": "CNC",         // Optional, can be looked up on backend
    "date": "2024-07-30",
    "shift": "Morning",
    "status": "Present",
    "checkIn": "08:02",            // Format: HH:mm
    "checkOut": "17:05",           // Format: HH:mm
    "otHours": 1.0,
    "otRate": 75.00,               // OT Rate used for this record
    // otAmount would be calculated and stored on the backend
  },
  {
    "employeeId": "2",
    "date": "2024-07-30",
    "shift": "Morning",
    "status": "Absent",
    "checkIn": null,
    "checkOut": null,
    "otHours": 0,
    "otRate": 80.00
  }
  // ... more records
]

Response:

Success (200 OK or 201 Created):
{
  "message": "Attendance records saved successfully.",
  "savedRecordsCount": 2,
  "errors": [] // Array of specific errors if some records failed, but overall success
}

Partial Success / Validation Error (207 Multi-Status or 400 Bad Request):
{
  "message": "Some attendance records could not be saved.",
  "savedRecordsCount": 1,
  "errors": [
    {
      "employeeId": "3",
      "date": "2024-07-30",
      "field": "otHours",
      "message": "OT hours cannot exceed 6."
    }
  ]
}

Error (500 Internal Server Error):
{
  "message": "An unexpected error occurred."
}


----------------------------------------------------------------------------------
2. Get Attendance Records (for Tracker)
----------------------------------------------------------------------------------

Endpoint: GET /api/attendance

Query Parameters:
  - date (string, YYYY-MM-DD, required)
  - department (string, optional, e.g., "CNC", "Plating")
  - shift (string, optional, e.g., "Morning", "Evening")
  - employeeId (string, optional)

Example Request:
GET /api/attendance?date=2024-07-30&department=CNC

Response Body (200 OK):
An array of AttendanceRecord objects.

Example:
[
  {
    "id": "recGeneratedId1",
    "employeeId": "1",
    "employeeName": "John Smith",
    "department": "CNC",
    "date": "2024-07-30",
    "shift": "Morning",
    "status": "Present",
    "checkIn": "08:02",
    "checkOut": "17:05",
    "otHours": 1.0,
    "otRate": 75.00,
    "otAmount": 75.00 // Calculated and stored OT Pay
  },
  // ... more records
]

Empty Response (200 OK with empty array if no records match):
[]

----------------------------------------------------------------------------------
3. Update Single Attendance Record (e.g., from Tracker inline edit)
----------------------------------------------------------------------------------

Endpoint: PUT /api/attendance/{recordId}

Request Body:
A partial or full AttendanceRecord object with fields to update.

Example:
PUT /api/attendance/recGeneratedId1
Body:
{
  "otHours": 2.5,
  "checkOut": "18:30"
}

Response:

Success (200 OK):
The updated AttendanceRecord object.
{
  "id": "recGeneratedId1",
  "employeeId": "1",
  "employeeName": "John Smith",
  "department": "CNC",
  "date": "2024-07-30",
  "shift": "Morning",
  "status": "Present",
  "checkIn": "08:02",
  "checkOut": "18:30", // Updated
  "otHours": 2.5,       // Updated
  "otRate": 75.00,
  "otAmount": 187.50    // Recalculated by backend
}

Error (404 Not Found, 400 Bad Request, 500 Internal Server Error):
{ "message": "Error message detailing what went wrong." }

==================================================================================
*/
