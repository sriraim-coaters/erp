import { Machine, MaintenanceLog } from '../types';

// Initial mock machine data
let mockMachines: Machine[] = [
  {
    id: 'M001',
    name: 'CNC Mill A-01',
    type: 'CNC',
    status: 'Healthy',
    lastMaintenance: '2024-07-01',
    nextMaintenance: '2024-08-01',
    assignedTechnician: 'Tech Alice',
    location: 'Shop Floor 1',
    maintenanceLogs: [
      {
        id: 'L001',
        machineId: 'M001',
        date: '2024-07-01',
        shift: 'Morning',
        technician: 'Tech Alice',
        type: 'Routine',
        description: 'Scheduled monthly checkup. All systems nominal.',
        taskStatus: 'Completed',
        machineStatusAfter: 'Working',
      },
      {
        id: 'L002',
        machineId: 'M001',
        date: '2024-06-15',
        shift: 'Evening',
        technician: 'Tech Bob',
        type: 'Repair',
        description: 'Replaced spindle bearing.',
        taskStatus: 'Completed',
        machineStatusAfter: 'Working',
      },
    ],
  },
  {
    id: 'M002',
    name: 'Plating Line X-05',
    type: 'Plating',
    status: 'Needs Service',
    lastMaintenance: '2024-07-10',
    nextMaintenance: '2024-07-25',
    assignedTechnician: 'Tech Charlie',
    location: 'Plating Section A',
    maintenanceLogs: [
      {
        id: 'L003',
        machineId: 'M002',
        date: '2024-07-10',
        shift: 'Morning',
        technician: 'Tech Charlie',
        type: 'Inspection',
        description: 'Unusual noise reported. Found loose valve. Tightened.',
        taskStatus: 'Completed',
        machineStatusAfter: 'Needs Attention',
      },
    ],
  },
  {
    id: 'M003',
    name: 'CNC Lathe B-02',
    type: 'CNC',
    status: 'Healthy',
    lastMaintenance: '2024-07-15',
    nextMaintenance: '2024-08-15',
    assignedTechnician: 'Tech Dave',
    location: 'Shop Floor 2',
    maintenanceLogs: [],
  },
];

export const getMachines = (): Machine[] => {
  return [...mockMachines]; // Return a copy
};

export const getMachineById = (id: string): Machine | undefined => {
  return mockMachines.find(m => m.id === id);
};

// Helper to map MaintenanceLog.machineStatusAfter to Machine.status
const mapMachineStatus = (logStatus: MaintenanceLog['machineStatusAfter']): Machine['status'] => {
  switch (logStatus) {
    case 'Working':
      return 'Healthy';
    case 'Needs Attention':
      return 'Needs Service';
    case 'Broken':
      return 'Under Maintenance'; // Or potentially a new 'Broken' status for Machine if desired
    default:
      return 'Healthy'; // Default fallback
  }
};

export const addMachineMaintenanceLog = (
  machineId: string,
  logEntryData: Omit<MaintenanceLog, 'id' | 'machineId'>
): MaintenanceLog | null => {
  const machineIndex = mockMachines.findIndex(m => m.id === machineId);
  if (machineIndex === -1) {
    console.error(`Machine with ID ${machineId} not found.`);
    return null;
  }

  const newLog: MaintenanceLog = {
    ...logEntryData,
    id: `L${Date.now().toString()}-${Math.random().toString(36).substring(2, 7)}`, // Unique log ID
    machineId: machineId,
  };

  // Add log to the machine's maintenance logs
  mockMachines[machineIndex].maintenanceLogs.push(newLog);

  // Sort logs for the machine by date, latest first (important for consistency)
  mockMachines[machineIndex].maintenanceLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Update machine's main status and lastMaintenance date
  mockMachines[machineIndex].status = mapMachineStatus(newLog.machineStatusAfter);
  mockMachines[machineIndex].lastMaintenance = newLog.date;
  // Potentially update nextMaintenance based on type/statusAfter - for now, just lastMaintenance

  return newLog;
};

export const getMachineMaintenanceLogs = (
  machineId: string,
  dateFrom?: string,
  dateTo?: string
): MaintenanceLog[] => {
  const machine = mockMachines.find(m => m.id === machineId);
  if (!machine) {
    return [];
  }

  let logs = [...machine.maintenanceLogs]; // Work with a copy

  // Filter by date range
  if (dateFrom) {
    logs = logs.filter(log => new Date(log.date) >= new Date(dateFrom));
  }
  if (dateTo) {
    logs = logs.filter(log => new Date(log.date) <= new Date(dateTo));
  }

  // Sort by date, latest first (already sorted after add, but good to ensure here too)
  logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return logs;
};

// Function to update a machine's details (e.g., name, type, location) - not part of current request but useful
export const updateMachineDetails = (machineId: string, updates: Partial<Omit<Machine, 'id' | 'maintenanceLogs'>>): Machine | null => {
    const machineIndex = mockMachines.findIndex(m => m.id === machineId);
    if (machineIndex === -1) {
        console.error(`Machine with ID ${machineId} not found for update.`);
        return null;
    }
    mockMachines[machineIndex] = { ...mockMachines[machineIndex], ...updates };
    return mockMachines[machineIndex];
};

// Function to add a new machine - not part of current request but useful
export const addMachine = (newMachineData: Omit<Machine, 'id' | 'maintenanceLogs'>): Machine => {
    const newMachine: Machine = {
        ...newMachineData,
        id: `M${Date.now().toString()}-${Math.random().toString(36).substring(2, 7)}`,
        maintenanceLogs: [],
    };
    mockMachines.push(newMachine);
    return newMachine;
};

/*
==================================================================================
CONCEPTUAL API STRUCTURES FOR MACHINE MAINTENANCE
==================================================================================

This section outlines the conceptual structure for API requests and responses
if a real backend were implemented for machine maintenance logging.

----------------------------------------------------------------------------------
1. Add a Maintenance Log for a Machine
----------------------------------------------------------------------------------

Endpoint: POST /api/machines/{machineId}/maintenance-logs

Path Parameter:
  - machineId (string, required): The ID of the machine to add the log to.

Request Body:
  A MaintenanceLog object (excluding id and machineId, which are handled by the backend).

Example:
POST /api/machines/M001/maintenance-logs
Body:
{
  "date": "2024-07-31",
  "shift": "Morning",
  "technician": "Tech Eve",
  "type": "Repair",
  "description": "Fixed coolant leakage from pipe joint.",
  "taskStatus": "Completed",
  "machineStatusAfter": "Working"
}

Response:

Success (201 Created):
The newly created MaintenanceLog object, including its generated ID.
{
  "id": "LGeneratedId123",
  "machineId": "M001",
  "date": "2024-07-31",
  "shift": "Morning",
  "technician": "Tech Eve",
  "type": "Repair",
  "description": "Fixed coolant leakage from pipe joint.",
  "taskStatus": "Completed",
  "machineStatusAfter": "Working"
}

Error (400 Bad Request - Validation Error):
{
  "message": "Validation failed.",
  "errors": [
    { "field": "date", "message": "Date cannot be in the future." },
    // other field errors
  ]
}

Error (404 Not Found - Machine not found):
{ "message": "Machine with ID M001 not found." }

Error (500 Internal Server Error):
{ "message": "An unexpected error occurred while adding the maintenance log." }


----------------------------------------------------------------------------------
2. Fetch Maintenance Logs for a Machine
----------------------------------------------------------------------------------

Endpoint: GET /api/machines/{machineId}/maintenance-logs

Path Parameter:
  - machineId (string, required): The ID of the machine.

Query Parameters:
  - dateFrom (string, optional, YYYY-MM-DD): Start of the date range.
  - dateTo (string, optional, YYYY-MM-DD): End of the date range.
  - sortBy (string, optional, default 'date'): Field to sort by (e.g., 'date').
  - sortOrder (string, optional, default 'desc'): 'asc' or 'desc'.

Example Request:
GET /api/machines/M001/maintenance-logs?dateFrom=2024-07-01&dateTo=2024-07-31&sortOrder=desc

Response Body (200 OK):
An array of MaintenanceLog objects, sorted as requested (default: latest first).
[
  {
    "id": "LGeneratedId123",
    "machineId": "M001",
    "date": "2024-07-31",
    // ... other fields
  },
  {
    "id": "L001",
    "machineId": "M001",
    "date": "2024-07-01",
    // ... other fields
  }
]

Empty Response (200 OK with empty array if no logs match or machine has no logs):
[]

Error (404 Not Found - Machine not found):
{ "message": "Machine with ID M001 not found." }

==================================================================================
*/
