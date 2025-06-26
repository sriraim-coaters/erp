import React, { useState } from 'react';
import { Plus, Users, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Job } from '../../types';
import JobCard from './JobCard';
import JobModal from './JobModal';

const mockJobs: Job[] = [
  {
    id: 'JOB-001',
    clientName: 'AutoTech Industries',
    description: 'Precision motor housing',
    quantity: 150,
    department: 'CNC',
    assignedOperator: 'John Smith',
    assignedMachine: 'CNC-001',
    status: 'Queued',
    priority: 'High',
    dueDate: '2024-01-25',
    shift: 'Morning'
  },
  {
    id: 'JOB-002',
    clientName: 'Medical Devices Corp',
    description: 'Surgical instrument parts',
    quantity: 75,
    department: 'CNC',
    assignedOperator: 'Sarah Johnson',
    assignedMachine: 'CNC-002',
    status: 'In Progress',
    priority: 'High',
    startDate: '2024-01-15',
    dueDate: '2024-01-20',
    shift: 'Evening'
  },
  {
    id: 'JOB-003',
    clientName: 'Electronics Ltd',
    description: 'Chrome plated connectors',
    quantity: 500,
    department: 'Plating',
    assignedOperator: 'Mike Wilson',
    assignedMachine: 'PLT-001',
    status: 'In Progress',
    priority: 'Medium',
    startDate: '2024-01-14',
    dueDate: '2024-01-22',
    shift: 'Morning'
  },
  {
    id: 'JOB-004',
    clientName: 'Aerospace Solutions',
    description: 'Landing gear components',
    quantity: 25,
    department: 'CNC',
    assignedOperator: 'John Smith',
    assignedMachine: 'CNC-001',
    status: 'Completed',
    priority: 'High',
    startDate: '2024-01-10',
    completionDate: '2024-01-14',
    dueDate: '2024-01-15',
    shift: 'Morning'
  },
  {
    id: 'JOB-005',
    clientName: 'Home Appliances Inc',
    description: 'Decorative handles',
    quantity: 200,
    department: 'Plating',
    assignedOperator: 'Lisa Chen',
    assignedMachine: 'PLT-002',
    status: 'Queued',
    priority: 'Low',
    dueDate: '2024-01-30',
    shift: 'Evening'
  }
];

export default function JobTracker() {
  const [jobs, setJobs] = useState<Job[]>(mockJobs);
  const [selectedDepartment, setSelectedDepartment] = useState<'All' | 'CNC' | 'Plating'>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  const filteredJobs = jobs.filter(job => 
    selectedDepartment === 'All' || job.department === selectedDepartment
  );

  const jobsByStatus = {
    queued: filteredJobs.filter(job => job.status === 'Queued'),
    inProgress: filteredJobs.filter(job => job.status === 'In Progress'),
    completed: filteredJobs.filter(job => job.status === 'Completed')
  };

  const stats = {
    total: jobs.length,
    queued: jobs.filter(j => j.status === 'Queued').length,
    inProgress: jobs.filter(j => j.status === 'In Progress').length,
    completed: jobs.filter(j => j.status === 'Completed').length
  };

  const handleAddJob = () => {
    setEditingJob(null);
    setIsModalOpen(true);
  };

  const handleEditJob = (job: Job) => {
    setEditingJob(job);
    setIsModalOpen(true);
  };

  const handleSaveJob = (job: Job) => {
    if (editingJob) {
      setJobs(jobs.map(j => j.id === job.id ? job : j));
    } else {
      setJobs([...jobs, { ...job, id: `JOB-${(jobs.length + 1).toString().padStart(3, '0')}` }]);
    }
    setIsModalOpen(false);
    setEditingJob(null);
  };

  const handleStatusChange = (jobId: string, newStatus: Job['status']) => {
    setJobs(jobs.map(job => {
      if (job.id === jobId) {
        const updatedJob = { ...job, status: newStatus };
        if (newStatus === 'In Progress' && !job.startDate) {
          updatedJob.startDate = new Date().toISOString().split('T')[0];
        } else if (newStatus === 'Completed' && !job.completionDate) {
          updatedJob.completionDate = new Date().toISOString().split('T')[0];
        }
        return updatedJob;
      }
      return job;
    }));
  };

  const handleDragStart = (e: React.DragEvent, jobId: string) => {
    e.dataTransfer.setData('text/plain', jobId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: Job['status']) => {
    e.preventDefault();
    const jobId = e.dataTransfer.getData('text/plain');
    handleStatusChange(jobId, status);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Job Tracker</h2>
          <p className="text-gray-600">Manage jobs across all departments with Kanban board</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="All">All Departments</option>
            <option value="CNC">CNC</option>
            <option value="Plating">Plating</option>
          </select>
          <button
            onClick={handleAddJob}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Job</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Jobs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Users className="h-8 w-8 text-gray-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Queued</p>
              <p className="text-2xl font-bold text-orange-600">{stats.queued}</p>
            </div>
            <Clock className="h-8 w-8 text-orange-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Queued Column */}
        <div 
          className="bg-gray-50 rounded-lg p-4"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'Queued')}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-orange-500" />
              Queued ({jobsByStatus.queued.length})
            </h3>
          </div>
          <div className="space-y-3 min-h-[200px]">
            {jobsByStatus.queued.map(job => (
              <JobCard
                key={job.id}
                job={job}
                onEdit={handleEditJob}
                onDragStart={handleDragStart}
              />
            ))}
          </div>
        </div>

        {/* In Progress Column */}
        <div 
          className="bg-blue-50 rounded-lg p-4"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'In Progress')}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-blue-500" />
              In Progress ({jobsByStatus.inProgress.length})
            </h3>
          </div>
          <div className="space-y-3 min-h-[200px]">
            {jobsByStatus.inProgress.map(job => (
              <JobCard
                key={job.id}
                job={job}
                onEdit={handleEditJob}
                onDragStart={handleDragStart}
              />
            ))}
          </div>
        </div>

        {/* Completed Column */}
        <div 
          className="bg-green-50 rounded-lg p-4"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'Completed')}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
              Completed ({jobsByStatus.completed.length})
            </h3>
          </div>
          <div className="space-y-3 min-h-[200px]">
            {jobsByStatus.completed.map(job => (
              <JobCard
                key={job.id}
                job={job}
                onEdit={handleEditJob}
                onDragStart={handleDragStart}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Job Modal */}
      <JobModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingJob(null);
        }}
        job={editingJob}
        onSave={handleSaveJob}
      />
    </div>
  );
}