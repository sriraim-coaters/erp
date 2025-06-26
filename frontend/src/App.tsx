import React, { useState } from 'react';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import EmployeeManagement from './components/EmployeeManagement/EmployeeManagement';
import AttendanceTracker from './components/AttendanceTracker/AttendanceTracker';
import MarkAttendance from './components/MarkAttendance/MarkAttendance';
import MachineManagement from './components/MachineManagement/MachineManagement';
import PurchaseOrders from './components/PurchaseOrders/PurchaseOrders';
import JobTracker from './components/JobTracker/JobTracker';
import ScrapSellTracker from './components/ScrapSellTracker/ScrapSellTracker';

const moduleComponents = {
  employees: EmployeeManagement,
  attendance: AttendanceTracker,
  'mark-attendance': MarkAttendance,
  machines: MachineManagement,
  purchases: PurchaseOrders,
  jobs: JobTracker,
  scrap: ScrapSellTracker,
};

const moduleTitles = {
  employees: 'Employee Management',
  attendance: 'Attendance Tracker',
  'mark-attendance': 'Mark Attendance',
  machines: 'Machine Health & Maintenance',
  purchases: 'Purchase Orders',
  jobs: 'Job Tracking',
  scrap: 'Scrap Sell Tracker',
};

function App() {
  const [activeModule, setActiveModule] = useState('employees');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const ActiveComponent = moduleComponents[activeModule as keyof typeof moduleComponents];
  const pageTitle = moduleTitles[activeModule as keyof typeof moduleTitles];

  const handleModuleChange = (module: string) => {
    setActiveModule(module);
    setSidebarOpen(false); // Close sidebar on mobile after selection
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        activeModule={activeModule}
        onModuleChange={handleModuleChange}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          title={pageTitle}
        />
        
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <ActiveComponent />
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;