export interface Employee {
  id: string;
  name: string;
  role: string;
  department: 'CNC' | 'Plating';
  shiftTime: string;
  sundayOff: boolean;
  assignedMachine: string;
  phone?: string;
  joinDate: string;
  photo?: string;
  otRate: number; // OT rate per hour in ₹
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: 'CNC' | 'Plating';
  date: string;
  shift: 'Morning' | 'Evening';
  checkIn?: string; // Maps to Time In
  checkOut?: string; // Maps to Time Out
  status: 'Present' | 'Absent' | 'Late' | 'On Leave';
  otHours: number;
  otRate: number; // Store the OT rate used for this specific record
  otAmount: number; // Stores calculated OT Pay (otHours * otRate)
}

export interface Machine {
  id: string;
  name: string;
  type: 'CNC' | 'Plating';
  status: 'Healthy' | 'Needs Service' | 'Under Maintenance';
  lastMaintenance: string;
  nextMaintenance: string;
  assignedTechnician: string;
  location: string;
  maintenanceLogs: MaintenanceLog[];
}

export interface MaintenanceLog {
  id: string;
  machineId: string;
  date: string;
  shift: 'Morning' | 'Evening';
  technician: string;
  type: 'Routine' | 'Repair' | 'Inspection';
  description: string;
  status: 'Completed' | 'In Progress' | 'Pending';
}

export interface Purchase {
  id: string;
  materialName: string;
  quantity: number;
  unit: string;
  supplier: string;
  rate: number;
  totalAmount: number;
  date: string;
  department: 'CNC' | 'Plating';
  status: 'Ordered' | 'Received' | 'Pending';
}

export interface Job {
  id: string;
  clientName: string;
  description: string;
  quantity: number;
  department: 'CNC' | 'Plating';
  assignedOperator: string;
  assignedMachine: string;
  status: 'Queued' | 'In Progress' | 'Completed';
  priority: 'Low' | 'Medium' | 'High';
  startDate?: string;
  dueDate: string;
  completionDate?: string;
  shift: 'Morning' | 'Evening';
}

export interface ScrapSale {
  id: string;
  date: string;
  kgSold: number;
  rate: number; // ₹ per kg
  amountReceived: number;
  amountPending: number;
  totalAmount: number;
}