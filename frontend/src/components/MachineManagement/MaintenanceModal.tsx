import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Machine, MaintenanceLog } from '../../types';
import { addMaintenanceLog, NewMaintenanceLogData } from '../../services/maintenanceService';

interface MaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  machine: Machine | null;
  onSaveSuccess: (newLog: MaintenanceLog) => void; // Callback after successful save
}

const initialFormData = {
  date_of_maintenance: new Date().toISOString().split('T')[0],
  shift: 'Morning' as 'Morning' | 'Evening',
  technician_name: '',
  description: '',
  machine_status_after: 'Working' as 'Working' | 'Needs Attention' | 'Broken',
};

export default function MaintenanceModal({ isOpen, onClose, machine, onSaveSuccess }: MaintenanceModalProps) {
  const [formData, setFormData] = useState<Omit<NewMaintenanceLogData, 'machine_name' | 'department'>>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (machine) {
      setFormData(prev => ({
        ...prev,
        technician_name: machine.assignedTechnician || '', // Pre-fill technician if available
      }));
    }
    // Reset form when modal is opened for a new machine or closed
    if (!isOpen) {
        setFormData(initialFormData);
        setError(null);
        setIsLoading(false);
    }
  }, [isOpen, machine]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!machine) return;
    setIsLoading(true);
    setError(null);

    const logData: NewMaintenanceLogData = {
      machine_name: machine.name, // machine.id might be more appropriate if it's used as machine_name
      department: machine.type, // Assuming machine.type is 'CNC' or 'Plating'
      ...formData,
    };

    try {
      const newLog = await addMaintenanceLog(logData);
      onSaveSuccess(newLog);
      onClose(); // Close modal on success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save maintenance log.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !machine) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Log Maintenance - {machine.name}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          <div>
            <label htmlFor="date_of_maintenance" className="block text-sm font-medium text-gray-700 mb-1">
              Date of Maintenance *
            </label>
            <input
              type="date"
              id="date_of_maintenance"
              required
              value={formData.date_of_maintenance}
              onChange={(e) => setFormData({ ...formData, date_of_maintenance: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="shift" className="block text-sm font-medium text-gray-700 mb-1">
              Shift *
            </label>
            <select
              id="shift"
              required
              value={formData.shift}
              onChange={(e) => setFormData({ ...formData, shift: e.target.value as 'Morning' | 'Evening' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Morning">Morning</option>
              <option value="Evening">Evening</option>
            </select>
          </div>

          <div>
            <label htmlFor="technician_name" className="block text-sm font-medium text-gray-700 mb-1">
              Technician Name *
            </label>
            <input
              type="text"
              id="technician_name"
              required
              value={formData.technician_name}
              onChange={(e) => setFormData({ ...formData, technician_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Maintenance Type field removed as it's not in the new model, covered by description */}

          <div>
            <label htmlFor="machine_status_after" className="block text-sm font-medium text-gray-700 mb-1">
              Machine Status After Maintenance *
            </label>
            <select
              id="machine_status_after"
              required
              value={formData.machine_status_after}
              onChange={(e) => setFormData({ ...formData, machine_status_after: e.target.value as 'Working' | 'Needs Attention' | 'Broken' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Working">Working</option>
              <option value="Needs Attention">Needs Attention</option>
              <option value="Broken">Broken</option>
            </select>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description of Issue / Preventive Maintenance *
            </label>
            <textarea
              id="description"
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the issue or preventive maintenance done..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
              {isLoading ? 'Saving...' : 'Save Log'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}