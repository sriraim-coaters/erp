import React, { useState } from 'react';
import { X, Save, Calendar, User, Settings, Tool, MessageSquare, Activity, ShieldCheck, AlertTriangle, Zap } from 'lucide-react';
import { MaintenanceLog, Machine } from '../../types';
import { addMachineMaintenanceLog } from '../../data/machineData';

interface MachineMaintenanceModalProps {
  machineId: string;
  machineName: string;
  onClose: () => void;
  onSave: (newLog: MaintenanceLog) => void; // Callback after successful save
}

const MachineMaintenanceModal: React.FC<MachineMaintenanceModalProps> = ({
  machineId,
  machineName,
  onClose,
  onSave,
}) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [shift, setShift] = useState<'Morning' | 'Evening'>('Morning');
  const [technician, setTechnician] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<MaintenanceLog['type']>('Routine');
  const [taskStatus, setTaskStatus] = useState<MaintenanceLog['taskStatus']>('Completed');
  const [machineStatusAfter, setMachineStatusAfter] = useState<MaintenanceLog['machineStatusAfter']>('Working');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!date) newErrors.date = 'Date is required.';
    if (!technician.trim()) newErrors.technician = 'Technician name is required.';
    if (!description.trim()) newErrors.description = 'Description is required.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setIsSaving(true);

    const logEntryData: Omit<MaintenanceLog, 'id' | 'machineId'> = {
      date,
      shift,
      technician,
      type,
      description,
      taskStatus,
      machineStatusAfter,
    };

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 700));
      const newLog = addMachineMaintenanceLog(machineId, logEntryData);
      if (newLog) {
        onSave(newLog); // Pass the new log to parent
        onClose(); // Close modal on successful save
      } else {
        // This case might happen if machineId was invalid, though props should ensure it.
        setErrors({ form: 'Failed to save maintenance log. Machine not found.' });
      }
    } catch (error) {
      console.error("Error saving maintenance log:", error);
      setErrors({ form: 'An unexpected error occurred while saving.' });
    } finally {
      setIsSaving(false);
    }
  };

  const inputBaseClasses = "w-full text-sm px-3 py-2.5 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-slate-400 transition-all";
  const iconBaseClasses = "absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5 group-focus-within:text-blue-500 transition-colors pointer-events-none";


  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">Add Maintenance Log</h2>
            <p className="text-xs text-slate-500 mt-0.5">For Machine: <span className="font-medium text-blue-600">{machineName} (ID: {machineId})</span></p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X size={22} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-5">
          {errors.form && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm flex items-center">
              <AlertTriangle size={18} className="mr-2 flex-shrink-0" />
              {errors.form}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Date */}
            <div>
              <label htmlFor="log-date" className="block text-sm font-semibold text-slate-700 mb-1.5">Date of Maintenance *</label>
              <div className="relative group">
                <Calendar className={iconBaseClasses} />
                <input type="date" id="log-date" value={date} onChange={(e) => setDate(e.target.value)} className={`${inputBaseClasses} pl-10 ${errors.date ? 'border-red-500' : ''}`} required />
              </div>
              {errors.date && <p className="text-xs text-red-600 mt-1">{errors.date}</p>}
            </div>

            {/* Shift */}
            <div>
              <label htmlFor="log-shift" className="block text-sm font-semibold text-slate-700 mb-1.5">Shift *</label>
              <div className="relative group">
                <Clock className={iconBaseClasses} />
                <select id="log-shift" value={shift} onChange={(e) => setShift(e.target.value as 'Morning' | 'Evening')} className={`${inputBaseClasses} pl-10 appearance-none`}>
                  <option value="Morning">Morning</option>
                  <option value="Evening">Evening</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none"><ChevronDownIcon /></div>
              </div>
            </div>
          </div>

          {/* Technician Name */}
          <div>
            <label htmlFor="log-technician" className="block text-sm font-semibold text-slate-700 mb-1.5">Technician Name *</label>
            <div className="relative group">
                <User className={iconBaseClasses} />
                <input type="text" id="log-technician" value={technician} onChange={(e) => setTechnician(e.target.value)} placeholder="e.g., John Doe" className={`${inputBaseClasses} pl-10 ${errors.technician ? 'border-red-500' : ''}`} required />
            </div>
            {errors.technician && <p className="text-xs text-red-600 mt-1">{errors.technician}</p>}
          </div>

          {/* Maintenance Type */}
          <div>
              <label htmlFor="log-type" className="block text-sm font-semibold text-slate-700 mb-1.5">Maintenance Type *</label>
              <div className="relative group">
                <Tool className={iconBaseClasses} />
                <select id="log-type" value={type} onChange={(e) => setType(e.target.value as MaintenanceLog['type'])} className={`${inputBaseClasses} pl-10 appearance-none`}>
                  <option value="Routine">Routine Checkup</option>
                  <option value="Repair">Repair / Fix</option>
                  <option value="Inspection">Inspection</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none"><ChevronDownIcon /></div>
              </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="log-description" className="block text-sm font-semibold text-slate-700 mb-1.5">Description of Work / Issue *</label>
             <div className="relative group">
                <MessageSquare className={`${iconBaseClasses} top-3.5 transform-none`} />
                <textarea id="log-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the maintenance performed or the issue found..." rows={4} className={`${inputBaseClasses} pl-10 pt-2.5 ${errors.description ? 'border-red-500' : ''}`} required />
            </div>
            {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Task Status */}
            <div>
              <label htmlFor="log-taskStatus" className="block text-sm font-semibold text-slate-700 mb-1.5">Task Status *</label>
              <div className="relative group">
                 <Activity className={iconBaseClasses} />
                <select id="log-taskStatus" value={taskStatus} onChange={(e) => setTaskStatus(e.target.value as MaintenanceLog['taskStatus'])} className={`${inputBaseClasses} pl-10 appearance-none`}>
                  <option value="Completed">Completed</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Pending">Pending</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none"><ChevronDownIcon /></div>
              </div>
            </div>

            {/* Machine Status After Maintenance */}
            <div>
              <label htmlFor="log-machineStatusAfter" className="block text-sm font-semibold text-slate-700 mb-1.5">Machine Status After Maintenance *</label>
              <div className="relative group">
                <Zap className={iconBaseClasses} /> {/* Changed icon for variety */}
                <select id="log-machineStatusAfter" value={machineStatusAfter} onChange={(e) => setMachineStatusAfter(e.target.value as MaintenanceLog['machineStatusAfter'])} className={`${inputBaseClasses} pl-10 appearance-none`}>
                  <option value="Working">Working / Healthy</option>
                  <option value="Needs Attention">Needs Attention / Service</option>
                  <option value="Broken">Broken / Under Maintenance</option>
                </select>
                 <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none"><ChevronDownIcon /></div>
              </div>
            </div>
          </div>
        </form>

        {/* Footer / Actions */}
        <div className="flex items-center justify-end p-5 border-t border-slate-200 bg-slate-50 space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:ring-2 focus:ring-slate-300 focus:outline-none transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="maintenance-log-form" // This should match the form's id if used, or just rely on button being inside form
            onClick={handleSubmit} // Or rely on form's onSubmit
            disabled={isSaving || Object.keys(errors).some(key => key !== 'form' && errors[key])} // Disable if field errors exist
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-slate-50 transition-all duration-150 ease-in-out flex items-center space-x-2 text-sm font-medium shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Save size={18} />
            <span>{isSaving ? 'Saving Log...' : 'Save Maintenance Log'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Simple ChevronDownIcon for select dropdowns
const ChevronDownIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
  </svg>
);

export default MachineMaintenanceModal;
