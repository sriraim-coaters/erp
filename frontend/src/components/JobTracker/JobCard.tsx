import React from 'react';
import { Edit, Calendar, Users, Settings, AlertTriangle } from 'lucide-react';
import { Job } from '../../types';

interface JobCardProps {
  job: Job;
  onEdit: (job: Job) => void;
  onDragStart: (e: React.DragEvent, jobId: string) => void;
}

export default function JobCard({ job, onEdit, onDragStart }: JobCardProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-orange-100 text-orange-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDepartmentColor = (department: string) => {
    return department === 'CNC' 
      ? 'bg-blue-100 text-blue-800' 
      : 'bg-purple-100 text-purple-800';
  };

  const isOverdue = new Date(job.dueDate) < new Date() && job.status !== 'Completed';

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, job.id)}
      className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-move group"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-gray-900 text-sm">{job.id}</h4>
          <p className="text-xs text-gray-500">{job.clientName}</p>
        </div>
        <button
          onClick={() => onEdit(job)}
          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 transition-all duration-200"
        >
          <Edit className="h-4 w-4" />
        </button>
      </div>

      <p className="text-sm text-gray-700 mb-3 line-clamp-2">{job.description}</p>

      <div className="flex items-center justify-between mb-3">
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(job.priority)}`}>
          {job.priority === 'High' && <AlertTriangle className="h-3 w-3 mr-1" />}
          {job.priority}
        </span>
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDepartmentColor(job.department)}`}>
          {job.department}
        </span>
      </div>

      <div className="space-y-2 text-xs text-gray-600">
        <div className="flex items-center">
          <Users className="h-3 w-3 mr-2" />
          <span>{job.assignedOperator}</span>
        </div>
        <div className="flex items-center">
          <Settings className="h-3 w-3 mr-2" />
          <span>{job.assignedMachine}</span>
        </div>
        <div className="flex items-center">
          <Calendar className="h-3 w-3 mr-2" />
          <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
            Due: {new Date(job.dueDate).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">Qty: {job.quantity}</span>
          <span className="text-gray-500">{job.shift} Shift</span>
        </div>
      </div>
    </div>
  );
}