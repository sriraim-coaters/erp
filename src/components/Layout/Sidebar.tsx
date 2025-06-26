import React from 'react';
import { 
  Users, 
  Clock, 
  Settings, 
  ShoppingCart, 
  Kanban,
  Factory,
  Menu,
  X,
  Recycle,
  UserCheck
} from 'lucide-react';

interface SidebarProps {
  activeModule: string;
  onModuleChange: (module: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const navigation = [
  { id: 'employees', name: 'Employee Management', icon: Users },
  { id: 'attendance', name: 'Attendance Tracker', icon: Clock },
  { id: 'mark-attendance', name: 'Mark Attendance', icon: UserCheck },
  { id: 'machines', name: 'Machine Health', icon: Settings },
  { id: 'purchases', name: 'Purchase Orders', icon: ShoppingCart },
  { id: 'jobs', name: 'Job Tracking', icon: Kanban },
  { id: 'scrap', name: 'Scrap Sell Tracker', icon: Recycle },
];

export default function Sidebar({ activeModule, onModuleChange, isOpen, onToggle }: SidebarProps) {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <Factory className="h-8 w-8 text-blue-400" />
            <div>
              <h1 className="text-lg font-bold">MFG Dashboard</h1>
              <p className="text-xs text-slate-400">CNC & Plating</p>
            </div>
          </div>
          <button
            onClick={onToggle}
            className="lg:hidden p-1 rounded-md hover:bg-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  onModuleChange(item.id);
                  onToggle();
                }}
                className={`
                  w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                  ${isActive 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }
                `}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
          <div className="text-xs text-slate-400 text-center">
            Manufacturing Operations v1.0
          </div>
        </div>
      </div>
    </>
  );
}