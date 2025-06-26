import React, { useState, useEffect, useCallback } from 'react';
import { Settings, AlertTriangle, CheckCircle, Wrench, Plus, Filter, ChevronDown, ListChecks, CalendarDays, Tool, FileText, ExternalLink, RefreshCw } from 'lucide-react';
import { Machine, MaintenanceLog } from '../../types';
import MachineMaintenanceModal from './MachineMaintenanceModal'; // Corrected import
import { getMachines, getMachineMaintenanceLogs } from '../../data/machineData'; // Data functions

// Helper to map MaintenanceLog.machineStatusAfter to Machine.status for display consistency
// This was in machineData.ts but might be useful here if we directly use log's machineStatusAfter for display
const mapLogStatusToDisplay = (logStatus: MaintenanceLog['machineStatusAfter']): string => {
  switch (logStatus) {
    case 'Working': return 'Working';
    case 'Needs Attention': return 'Needs Attention';
    case 'Broken': return 'Broken';
    default: return 'Unknown';
  }
};

const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

export default function MachineManagement() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [isLoadingMachines, setIsLoadingMachines] = useState(true);
  const [selectedType, setSelectedType] = useState<'All' | 'CNC' | 'Plating'>('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'All' | 'Healthy' | 'Needs Service' | 'Under Maintenance'>('All');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMachineForModal, setSelectedMachineForModal] = useState<{id: string, name: string} | null>(null);

  const [expandedMachineId, setExpandedMachineId] = useState<string | null>(null);
  const [currentMachineLogs, setCurrentMachineLogs] = useState<MaintenanceLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [logDateFrom, setLogDateFrom] = useState('');
  const [logDateTo, setLogDateTo] = useState('');

  const fetchMachinesData = useCallback(() => {
    setIsLoadingMachines(true);
    setTimeout(() => { // Simulate API delay
        const freshMachines = getMachines();
        setMachines(freshMachines);
        setIsLoadingMachines(false);
    }, 300);
  }, []);

  useEffect(() => {
    fetchMachinesData();
  }, [fetchMachinesData]);

  const filteredMachines = machines.filter(machine => {
    const matchesType = selectedType === 'All' || machine.type === selectedType;
    const matchesStatus = selectedStatusFilter === 'All' || machine.status === selectedStatusFilter;
    return matchesType && matchesStatus;
  });

  const stats = {
    healthy: machines.filter(m => m.status === 'Healthy').length,
    needsService: machines.filter(m => m.status === 'Needs Service').length,
    underMaintenance: machines.filter(m => m.status === 'Under Maintenance').length,
    total: machines.length
  };

  const getStatusIcon = (status: Machine['status'] | MaintenanceLog['machineStatusAfter'], size: number = 5, isLogStatus: boolean = false) => {
    const classes = `h-${size} w-${size} flex-shrink-0`;
    let effectiveStatus: Machine['status'] | 'Broken' | 'Working' | 'Needs Attention' = status as Machine['status'];
    if (isLogStatus) {
        effectiveStatus = status as MaintenanceLog['machineStatusAfter'];
    }

    switch (effectiveStatus) {
      case 'Healthy': case 'Working': return <CheckCircle className={`${classes} text-green-500`} />;
      case 'Needs Service': case 'Needs Attention': return <AlertTriangle className={`${classes} text-orange-500`} />;
      case 'Under Maintenance': case 'Broken': return <Wrench className={`${classes} text-red-500`} />; // Changed Broken to Wrench for consistency or use specific icon for broken
      default: return <Settings className={`${classes} text-gray-500`} />;
    }
  };

  const getStatusBadge = (status: Machine['status']) => {
    const baseClasses = "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case 'Healthy': return `${baseClasses} bg-green-100 text-green-700`;
      case 'Needs Service': return `${baseClasses} bg-orange-100 text-orange-700`;
      case 'Under Maintenance': return `${baseClasses} bg-blue-100 text-blue-700`; // Original color
      default: return `${baseClasses} bg-gray-100 text-gray-700`;
    }
  };

  const openMaintenanceModal = (machine: Machine) => {
    setSelectedMachineForModal({id: machine.id, name: machine.name});
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedMachineForModal(null);
  };

  const handleModalSave = (newLog: MaintenanceLog) => {
    fetchMachinesData();
    if (expandedMachineId === newLog.machineId) {
      fetchSpecificMachineLogs(expandedMachineId, logDateFrom, logDateTo);
    }
    setIsModalOpen(false); // Close modal after save
    setSelectedMachineForModal(null);
  };

  const fetchSpecificMachineLogs = useCallback(async (machineId: string, from?: string, to?: string) => {
    if (!machineId) return;
    setIsLoadingLogs(true);
    await new Promise(resolve => setTimeout(resolve, 250));
    setCurrentMachineLogs(getMachineMaintenanceLogs(machineId, from, to));
    setIsLoadingLogs(false);
  }, []);

  const toggleMachineLogs = (machineId: string) => {
    if (expandedMachineId === machineId) {
      setExpandedMachineId(null);
      setCurrentMachineLogs([]);
    } else {
      setExpandedMachineId(machineId);
      setLogDateFrom('');
      setLogDateTo('');
      fetchSpecificMachineLogs(machineId);
    }
  };

  useEffect(() => {
    if (expandedMachineId && !isModalOpen) { // Avoid refetch if modal is open and causes parent re-render
        fetchSpecificMachineLogs(expandedMachineId, logDateFrom, logDateTo);
    }
  }, [expandedMachineId, logDateFrom, logDateTo, fetchSpecificMachineLogs, isModalOpen]);

  const inputBaseClasses = "pl-11 pr-4 py-2.5 w-full text-sm border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-slate-400 transition-all";
  const selectClasses = `${inputBaseClasses} appearance-none`;


  const renderMaintenanceLogs = () => {
    if (!expandedMachineId) return null;
    if (isLoadingLogs) return <div className="p-6 text-center text-slate-500"><RefreshCw className="animate-spin h-6 w-6 inline mr-2"/>Loading logs...</div>;
    if (currentMachineLogs.length === 0) return <div className="p-6 text-center text-slate-500">No maintenance logs found for the selected period.</div>;

    // Group logs by date
    const groupedLogs = currentMachineLogs.reduce((acc, log) => {
        const dateKey = formatDate(log.date);
        if (!acc[dateKey]) {
            acc[dateKey] = [];
        }
        acc[dateKey].push(log);
        return acc;
    }, {} as Record<string, MaintenanceLog[]>);


    return (
        <div className="bg-slate-50 p-4 md:p-6 border-t border-slate-200">
            <h4 className="text-md font-semibold text-slate-700 mb-4">Maintenance History ({currentMachineLogs.length} logs)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label htmlFor="log-date-from" className="text-xs font-medium text-slate-600">From:</label>
                    <input type="date" id="log-date-from" value={logDateFrom} onChange={e => setLogDateFrom(e.target.value)} className="mt-1 block w-full text-sm border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 py-1.5"/>
                </div>
                <div>
                    <label htmlFor="log-date-to" className="text-xs font-medium text-slate-600">To:</label>
                    <input type="date" id="log-date-to" value={logDateTo} onChange={e => setLogDateTo(e.target.value)} className="mt-1 block w-full text-sm border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 py-1.5"/>
                </div>
            </div>
             {Object.entries(groupedLogs).map(([dateKey, logsOnDate]) => (
                <div key={dateKey} className="mb-6">
                    <div className="flex items-center mb-3">
                        <CalendarDays size={18} className="text-blue-500 mr-2" />
                        <h5 className="text-sm font-semibold text-slate-700">{dateKey}</h5>
                    </div>
                    <ul className="space-y-3 ml-2 border-l-2 border-blue-200 pl-5 py-1">
                        {logsOnDate.map(log => (
                            <li key={log.id} className="p-3 bg-white rounded-md shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">{log.type}</span>
                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${log.taskStatus === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{log.taskStatus}</span>
                                </div>
                                <p className="text-sm text-slate-700 mb-1 leading-relaxed">{log.description}</p>
                                <div className="text-xs text-slate-500 flex items-center justify-between flex-wrap gap-x-3 gap-y-1">
                                    <span>Technician: <span className="font-medium text-slate-600">{log.technician}</span></span>
                                    <span>Shift: <span className="font-medium text-slate-600">{log.shift}</span></span>
                                    <span className="flex items-center">
                                        After: {getStatusIcon(log.machineStatusAfter, 4, true)}
                                        <span className="font-medium text-slate-600 ml-1">{mapLogStatusToDisplay(log.machineStatusAfter)}</span>
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-sky-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-full mx-auto">
        <div className="mb-8 p-6 bg-white rounded-xl shadow-lg border border-gray-200">
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Machine Fleet Management</h1>
          <p className="text-sm text-slate-600 mt-2">Oversee machine operational status, maintenance history, and upcoming service schedules.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {[
                { title: 'Healthy', value: stats.healthy, Icon: CheckCircle, iconColor: 'text-green-500', textColor: 'text-green-600' },
                { title: 'Needs Service', value: stats.needsService, Icon: AlertTriangle, iconColor: 'text-orange-500', textColor: 'text-orange-600' },
                { title: 'Under Maintenance', value: stats.underMaintenance, Icon: Wrench, iconColor: 'text-blue-500', textColor: 'text-blue-600' },
                { title: 'Total Machines', value: stats.total, Icon: Settings, iconColor: 'text-slate-500', textColor: 'text-slate-700' },
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
        
        <div className="mb-8 p-6 bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <label htmlFor="machine-type-filter" className="block text-sm font-semibold text-slate-700 mb-1.5">Machine Type</label>
              <div className="relative group">
                <Tool className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5 pointer-events-none group-focus-within:text-blue-500 transition-colors" />
                <select id="machine-type-filter" value={selectedType} onChange={(e) => setSelectedType(e.target.value as any)} className={selectClasses} >
                  <option value="All">All Types</option>
                  <option value="CNC">CNC</option>
                  <option value="Plating">Plating</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5 pointer-events-none"> <ChevronDown size={20} /> </div>
              </div>
            </div>
            <div>
              <label htmlFor="machine-status-filter" className="block text-sm font-semibold text-slate-700 mb-1.5">Machine Status</label>
              <div className="relative group">
                 <ListChecks className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5 pointer-events-none group-focus-within:text-blue-500 transition-colors" />
                <select id="machine-status-filter" value={selectedStatusFilter} onChange={(e) => setSelectedStatusFilter(e.target.value as any)} className={selectClasses} >
                  <option value="All">All Statuses</option>
                  <option value="Healthy">Healthy</option>
                  <option value="Needs Service">Needs Service</option>
                  <option value="Under Maintenance">Under Maintenance</option>
                </select>
                 <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5 pointer-events-none"> <ChevronDown size={20} /> </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-slate-50">
             <h2 className="text-xl font-semibold text-slate-700">Machine Overview</h2>
             <p className="text-xs text-slate-500 mt-1">
                List of all registered machines. Click "View Logs" to see maintenance history.
            </p>
          </div>
          <div className="overflow-x-auto">
            {isLoadingMachines ? (
                 <div className="text-center py-16 text-slate-500"> <RefreshCw className="mx-auto h-12 w-12 text-slate-400 animate-spin mb-4" /> <p className="text-lg">Loading machines...</p></div>
            ): filteredMachines.length > 0 ? (
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Machine Details</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Type</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Current Status</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Last Maintained</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Next Due</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredMachines.map((machine) => (
                  <React.Fragment key={machine.id}>
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                            {getStatusIcon(machine.status, 5)}
                            <div className="ml-3">
                                <div className="text-sm font-semibold text-slate-800">{machine.name}</div>
                                <div className="text-xs text-slate-500">ID: <span className="font-mono">{machine.id}</span> | Loc: {machine.location}</div>
                            </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                          machine.type === 'CNC' ? 'bg-sky-100 text-sky-700' : 'bg-purple-100 text-purple-700'
                        }`}> {machine.type} </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">{getStatusBadge(machine.status)}</td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm text-slate-600">{formatDate(machine.lastMaintenance)}</td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm text-slate-600">{formatDate(machine.nextMaintenance)}</td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center justify-center space-x-2">
                            <button onClick={() => openMaintenanceModal(machine)} title="Add Maintenance Log" className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition-all">
                            <Plus size={18} />
                            </button>
                            <button onClick={() => toggleMachineLogs(machine.id)} title={expandedMachineId === machine.id ? 'Hide Logs' : 'View Logs'} className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-all">
                            <ChevronDown size={18} className={`transition-transform duration-200 ${expandedMachineId === machine.id ? 'rotate-180' : ''}`} />
                            </button>
                        </div>
                      </td>
                    </tr>
                    {expandedMachineId === machine.id && (
                        <tr>
                            <td colSpan={6} className="p-0"> {/* No padding on the td itself */}
                                {renderMaintenanceLogs()}
                            </td>
                        </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
            ) : (
                 <div className="text-center py-16 text-slate-500">
                    <Filter className="mx-auto h-16 w-16 text-slate-300 mb-4" />
                    <p className="text-lg font-semibold text-slate-700">No machines match your filters.</p>
                    <p className="text-sm text-slate-500 mt-1.5">Try adjusting the type or status filters, or add new machines.</p>
                </div>
            )}
          </div>
        </div>

        {isModalOpen && selectedMachineForModal && (
          <MachineMaintenanceModal
            machineId={selectedMachineForModal.id}
            machineName={selectedMachineForModal.name}
            onClose={handleModalClose}
            onSave={handleModalSave}
          />
        )}
      </div>
    </div>
  );
}