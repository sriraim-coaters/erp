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
  // maintenanceLogs: MaintenanceLog[]; // Removed: Logs will be fetched separately
}

export interface MaintenanceLog {
  id: number; // Was string, backend sends int
  machine_name: string; // Was machineId, align with backend
  department: string; // New field from backend
  date_of_maintenance: string; // Was date, ISO Date string, align with backend
  shift: 'Morning' | 'Evening';
  technician_name: string; // Was technician, align with backend
  description: string;
  // type: 'Routine' | 'Repair' | 'Inspection'; // Field removed, covered by description. Requirement was "Description of issue or preventive maintenance done"
  machine_status_after: 'Working' | 'Needs Attention' | 'Broken'; // Was status, align with backend & requirement
  created_at?: string; // ISO DateTime string from backend
  updated_at?: string; // ISO DateTime string from backend
}

// New Type for Payments related to ScrapSale
export interface Payment {
  id: number;
  scrap_sale_id: number;
  date_of_payment: string; // ISO Date string
  amount_paid: number;
  created_at?: string; // ISO DateTime string
  updated_at?: string; // ISO DateTime string
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
  id: number; // Was string, backend sends int
  date_of_sale: string; // Was date, ISO Date string, align with backend
  material_kg: number; // Was kgSold, align with backend
  rate_per_kg: number; // Was rate, ₹ per kg, align with backend
  total_value: number; // Was totalAmount, align with backend
  amount_received: number;
  amount_pending: number;
  payments: Payment[]; // Added payment history
  created_at?: string; // ISO DateTime string from backend
  updated_at?: string; // ISO DateTime string from backend
}