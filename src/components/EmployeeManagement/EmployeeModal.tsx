import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, User } from 'lucide-react';
import { Employee } from '../../types';

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  onSave: (employee: Employee) => void;
  department: 'CNC' | 'Plating';
}

const machines = {
  CNC: ['CNC-001', 'CNC-002', 'CNC-003', 'CNC-004'],
  Plating: ['PLT-001', 'PLT-002', 'PLT-003', 'PLT-004']
};

const roles = {
  CNC: ['Machine Operator', 'Senior Technician', 'Setup Technician', 'Quality Inspector'],
  Plating: ['Plating Specialist', 'Chemical Technician', 'Quality Inspector', 'Line Supervisor']
};

export default function EmployeeModal({ isOpen, onClose, employee, onSave, department }: EmployeeModalProps) {
  const [formData, setFormData] = useState<Partial<Employee>>({
    name: '',
    role: '',
    department,
    shiftTime: '06:00 - 14:00',
    sundayOff: true,
    assignedMachine: '',
    phone: '',
    joinDate: new Date().toISOString().split('T')[0],
    photo: '',
    otRate: 70
  });
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (employee) {
      setFormData(employee);
      setPhotoPreview(employee.photo || '');
    } else {
      setFormData({
        name: '',
        role: '',
        department,
        shiftTime: '06:00 - 14:00',
        sundayOff: true,
        assignedMachine: '',
        phone: '',
        joinDate: new Date().toISOString().split('T')[0],
        photo: '',
        otRate: 70
      });
      setPhotoPreview('');
    }
  }, [employee, department]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setPhotoPreview(result);
        setFormData({ ...formData, photo: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as Employee);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            {employee ? 'Edit Employee' : 'Add New Employee'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Photo Upload */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Employee"
                  className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-200">
                  <User className="h-12 w-12 text-gray-400" />
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
              >
                <Upload className="h-3 w-3" />
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            <p className="text-xs text-gray-500 text-center">Click the upload button to add a photo</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role *
            </label>
            <select
              required
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Role</option>
              {roles[department].map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Shift Time *
            </label>
            <select
              required
              value={formData.shiftTime}
              onChange={(e) => setFormData({ ...formData, shiftTime: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="06:00 - 14:00">Morning (06:00 - 14:00)</option>
              <option value="14:00 - 22:00">Evening (14:00 - 22:00)</option>
              <option value="22:00 - 06:00">Night (22:00 - 06:00)</option>
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
              {machines[department].map(machine => (
                <option key={machine} value={machine}>{machine}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              OT Rate (₹/hour) *
            </label>
            <input
              type="number"
              required
              min="0"
              value={formData.otRate}
              onChange={(e) => setFormData({ ...formData, otRate: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Join Date *
            </label>
            <input
              type="date"
              required
              value={formData.joinDate}
              onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="sundayOff"
              checked={formData.sundayOff}
              onChange={(e) => setFormData({ ...formData, sundayOff: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="sundayOff" className="ml-2 block text-sm text-gray-900">
              Sunday Off
            </label>
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
              {employee ? 'Update' : 'Add'} Employee
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}