import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Machine, MaintenanceLog } from '../../types';

interface MaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  machine: Machine | null;
  onSave: (log: MaintenanceLog) => void;
}

export default function MaintenanceModal({ isOpen, onClose, machine, onSave }: MaintenanceModalProps) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    shift: 'Morning' as 'Morning' | 'Evening',
    technician: machine?.assignedTechnician || '',
    type: 'Routine' as 'Routine' | 'Repair' | 'Inspection',
    description: '',
    status: 'Completed' as 'Completed' | 'In Progress' | 'Pending'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!machine) return;

    const log: MaintenanceLog = {
      id: Date.now().toString(),
      machineId: machine.id,
      ...formData
    };

    onSave(log);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      shift: 'Morning',
      technician: machine.assignedTechnician,
      type: 'Routine',
      description: '',
      status: 'Completed'
    });
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date *
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Shift *
            </label>
            <select
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Technician *
            </label>
            <input
              type="text"
              required
              value={formData.technician}
              onChange={(e) => setFormData({ ...formData, technician: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maintenance Type *
            </label>
            <select
              required
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as 'Routine' | 'Repair' | 'Inspection' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Routine">Routine Maintenance</option>
              <option value="Repair">Repair</option>
              <option value="Inspection">Inspection</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status *
            </label>
            <select
              required
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Completed' | 'In Progress' | 'Pending' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Completed">Completed</option>
              <option value="In Progress">In Progress</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the maintenance work performed..."
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
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Log
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}