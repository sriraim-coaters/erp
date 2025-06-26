import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Job } from '../../types';

interface JobModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job | null;
  onSave: (job: Job) => void;
}

const operators = {
  CNC: ['John Smith', 'Sarah Johnson', 'Mike Davis', 'Emily Wilson'],
  Plating: ['Mike Wilson', 'Lisa Chen', 'David Brown', 'Jennifer Lee']
};

const machines = {
  CNC: ['CNC-001', 'CNC-002', 'CNC-003', 'CNC-004'],
  Plating: ['PLT-001', 'PLT-002', 'PLT-003', 'PLT-004']
};

export default function JobModal({ isOpen, onClose, job, onSave }: JobModalProps) {
  const [formData, setFormData] = useState<Partial<Job>>({
    clientName: '',
    description: '',
    quantity: 0,
    department: 'CNC',
    assignedOperator: '',
    assignedMachine: '',
    status: 'Queued',
    priority: 'Medium',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
    shift: 'Morning'
  });

  useEffect(() => {
    if (job) {
      setFormData(job);
    } else {
      setFormData({
        clientName: '',
        description: '',
        quantity: 0,
        department: 'CNC',
        assignedOperator: '',
        assignedMachine: '',
        status: 'Queued',
        priority: 'Medium',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        shift: 'Morning'
      });
    }
  }, [job]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as Job);
  };

  const handleDepartmentChange = (department: 'CNC' | 'Plating') => {
    setFormData({
      ...formData,
      department,
      assignedOperator: '',
      assignedMachine: ''
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            {job ? 'Edit Job' : 'Add New Job'}
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
              Client Name *
            </label>
            <input
              type="text"
              required
              value={formData.clientName}
              onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., AutoTech Industries"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Description *
            </label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe the job requirements..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity *
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department *
              </label>
              <select
                required
                value={formData.department}
                onChange={(e) => handleDepartmentChange(e.target.value as 'CNC' | 'Plating')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="CNC">CNC</option>
                <option value="Plating">Plating</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assigned Operator *
            </label>
            <select
              required
              value={formData.assignedOperator}
              onChange={(e) => setFormData({ ...formData, assignedOperator: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Operator</option>
              {operators[formData.department || 'CNC'].map(operator => (
                <option key={operator} value={operator}>{operator}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assigned Machine *
            </label>
            <select
              required
              value={formData.assignedMachine}
              onChange={(e) => setFormData({ ...formData, assignedMachine: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Machine</option>
              {machines[formData.department || 'CNC'].map(machine => (
                <option key={machine} value={machine}>{machine}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority *
              </label>
              <select
                required
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'Low' | 'Medium' | 'High' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
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
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date *
            </label>
            <input
              type="date"
              required
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {job && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Job['status'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Queued">Queued</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          )}

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
              {job ? 'Update' : 'Add'} Job
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}