import React, { useState, useEffect } from 'react';
import { Settings, AlertTriangle, CheckCircle, Wrench, Plus, Filter, Loader2 } from 'lucide-react';
import { Machine, MaintenanceLog } from '../../types'; // MaintenanceLog type is used by onSaveSuccess
import MaintenanceModal from './MaintenanceModal';
// import { fetchMaintenanceLogs } from '../../services/maintenanceService'; // Example if we were to fetch logs

// Mock machine data (without maintenanceLogs array as it's fetched separately)
// The machine list itself is not part of backend work in this scope, so keeping it mock.
const initialMockMachines: Machine[] = [
  {
    id: 'CNC-001', // This ID might be used as machine_name in logs if it's unique like a name
    name: 'CNC Milling Machine 1',
    type: 'CNC', // This corresponds to 'department' in MaintenanceLog
    status: 'Healthy', // This will be updated by new logs
    lastMaintenance: '2024-01-10', // This will be updated by new logs
    nextMaintenance: '2024-02-10', // Not directly affected by new logs in this scope
    assignedTechnician: 'John Smith', // Default technician
    location: 'Floor A - Station 1',
  },
  {
    id: 'CNC-002',
    name: 'CNC Lathe Machine 2',
    type: 'CNC',
    status: 'Needs Service',
    lastMaintenance: '2023-12-15',
    nextMaintenance: '2024-01-15',
    assignedTechnician: 'Sarah Johnson',
    location: 'Floor A - Station 2',
  },
  {
    id: 'PLT-001',
    name: 'Electroplating Tank 1',
    type: 'Plating',
    status: 'Under Maintenance',
    lastMaintenance: '2024-01-14',
    nextMaintenance: '2024-02-14',
    assignedTechnician: 'Mike Wilson',
    location: 'Floor B - Bay 1',
  },
  {
    id: 'PLT-002',
    name: 'Chrome Plating Line 2',
    type: 'Plating',
    status: 'Healthy',
    lastMaintenance: '2024-01-08',
    nextMaintenance: '2024-02-08',
    assignedTechnician: 'Lisa Chen',
    location: 'Floor B - Bay 2',
  }
];

export default function MachineManagement() {
  const [machines, setMachines] = useState<Machine[]>(initialMockMachines);
  // const [allMaintenanceLogs, setAllMaintenanceLogs] = useState<MaintenanceLog[]>([]); // If we were to display all logs
  // const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  // const [logsError, setLogsError] = useState<string | null>(null);

  const [selectedType, setSelectedType] = useState<'All' | 'CNC' | 'Plating'>('All');
  const [selectedStatus, setSelectedStatus] = useState<'All' | 'Healthy' | 'Needs Service' | 'Under Maintenance'>('All');
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);

  // useEffect(() => { // Example: Fetching all logs on mount - not doing this now to keep scope focused
  //   const loadLogs = async () => {
  //     setIsLoadingLogs(true);
  //     setLogsError(null);
  //     try {
  //       const logs = await fetchMaintenanceLogs();
  //       setAllMaintenanceLogs(logs);
  //     } catch (err) {
  //       setLogsError(err instanceof Error ? err.message : 'Failed to fetch logs');
  //     } finally {
  //       setIsLoadingLogs(false);
  //     }
  //   };
  //   loadLogs();
  // }, []);

  const filteredMachines = machines.filter(machine => {
    const matchesType = selectedType === 'All' || machine.type === selectedType;
    const matchesStatus = selectedStatus === 'All' || machine.status === selectedStatus;
    return matchesType && matchesStatus;
  });

  const stats = {
    healthy: machines.filter(m => m.status === 'Healthy').length,
    needsService: machines.filter(m => m.status === 'Needs Service').length,
    underMaintenance: machines.filter(m => m.status === 'Under Maintenance').length,
    total: machines.length
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Healthy':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'Needs Service':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'Under Maintenance':
        return <Wrench className="h-4 w-4 text-blue-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (status) {
      case 'Healthy':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'Needs Service':
        return `${baseClasses} bg-orange-100 text-orange-800`;
      case 'Under Maintenance':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const handleAddMaintenance = (machine: Machine) => {
    setSelectedMachine(machine);
    setIsMaintenanceModalOpen(true);
  };

  const handleSaveMaintenanceSuccess = (newLog: MaintenanceLog) => {
    // Update the specific machine's status and last maintenance date
    setMachines(prevMachines =>
      prevMachines.map(m => {
        // The log contains machine_name. We need to find the machine by its name.
        // Assuming machine.name is unique and used as machine_name in the log.
        // Or, if machine.id was used as machine_name, then m.id === newLog.machine_name
        if (m.name === newLog.machine_name) {
          return {
            ...m,
            lastMaintenance: newLog.date_of_maintenance,
            // Determine new status. 'Working' maps to 'Healthy'.
            // 'Needs Attention' or 'Broken' could map to 'Needs Service' or 'Under Maintenance'.
            // This mapping might need refinement based on exact operational meaning.
            status: newLog.machine_status_after === 'Working' ? 'Healthy'
                  : newLog.machine_status_after === 'Needs Attention' ? 'Needs Service'
                  : 'Under Maintenance', // Default for 'Broken' or other states
          };
        }
        return m;
      })
    );

    // Optionally, add to a global list of logs if displaying them elsewhere
    // setAllMaintenanceLogs(prevLogs => [newLog, ...prevLogs]);

    setIsMaintenanceModalOpen(false); // Modal closes itself on success, but good to ensure state consistency
    setSelectedMachine(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Machine Health & Maintenance</h2>
          <p className="text-gray-600">Monitor machine status and schedule maintenance</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Healthy</p>
              <p className="text-2xl font-bold text-green-600">{stats.healthy}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Needs Service</p>
              <p className="text-2xl font-bold text-orange-600">{stats.needsService}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Under Maintenance</p>
              <p className="text-2xl font-bold text-blue-600">{stats.underMaintenance}</p>
            </div>
            <Wrench className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Machines</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Settings className="h-8 w-8 text-gray-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Machine Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="All">All Types</option>
              <option value="CNC">CNC</option>
              <option value="Plating">Plating</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="All">All Status</option>
              <option value="Healthy">Healthy</option>
              <option value="Needs Service">Needs Service</option>
              <option value="Under Maintenance">Under Maintenance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Machine Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Machine
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Maintenance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Next Maintenance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Technician
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMachines.map((machine) => (
                <tr key={machine.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="flex items-center">
                        {getStatusIcon(machine.status)}
                        <div className="ml-2">
                          <div className="text-sm font-medium text-gray-900">{machine.name}</div>
                          <div className="text-sm text-gray-500">{machine.id}</div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      machine.type === 'CNC' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {machine.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getStatusBadge(machine.status)}>
                      {machine.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(machine.lastMaintenance).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(machine.nextMaintenance).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {machine.assignedTechnician}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleAddMaintenance(machine)}
                      className="text-blue-600 hover:text-blue-900 transition-colors flex items-center space-x-1"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Log Maintenance</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredMachines.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No machines found for the selected filters.</p>
          </div>
        )}
      </div>

      {/* Maintenance Modal */}
      <MaintenanceModal
        isOpen={isMaintenanceModalOpen}
        onClose={() => {
          setIsMaintenanceModalOpen(false);
          setSelectedMachine(null);
        }}
        machine={selectedMachine}
        onSaveSuccess={handleSaveMaintenanceSuccess}
      />
    </div>
  );
}