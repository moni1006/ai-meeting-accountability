import React, { useState } from 'react';
import { LayoutDashboard, FilePlus2, ListTodo, History, LogOut, Menu, X, Sparkles, RotateCcw } from 'lucide-react';
import { Link, useRouter } from '@/lib/router';
import { useStore } from '@/lib/store';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/create', label: 'Create Meeting', icon: FilePlus2 },
  { to: '/accountability', label: 'Accountability', icon: ListTodo },
  { to: '/history', label: 'Meeting History', icon: History },
];

export function Sidebar() {
  const { path } = useRouter();
  const { logout, currentUser, resetData } = useStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (to: string) => path === to || (to !== '/dashboard' && path.startsWith(to));

  const sidebarContent = (
    <>
      <div className="px-5 py-6">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-200">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-800 leading-tight">ActionAI</h1>
            <p className="text-[10px] text-gray-400">Meeting Accountability</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-1">
        {navItems.map(item => {
          const Icon = item.icon;
          const active = isActive(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
              <Icon className={`w-[18px] h-[18px] ${active ? 'text-blue-600' : 'text-gray-400'}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-3 border-t border-gray-100 space-y-1">
        <button
          onClick={() => { if (confirm('Reset all demo data to defaults?')) resetData(); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all"
        >
          <RotateCcw className="w-[18px] h-[18px] text-gray-400" />
          Reset Demo Data
        </button>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <LogOut className="w-[18px] h-[18px] text-gray-400" />
          Sign Out
        </button>
      </div>

      <div className="px-5 py-4 border-t border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
            {currentUser?.name?.charAt(0).toUpperCase() ?? 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-gray-700 truncate">{currentUser?.name}</p>
            <p className="text-[10px] text-gray-400 truncate">{currentUser?.email}</p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-40 lg:hidden w-10 h-10 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center"
      >
        <Menu className="w-5 h-5 text-gray-600" />
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 fixed left-0 top-0 bottom-0 bg-white border-r border-gray-100 flex-col z-30">
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white flex flex-col animate-slide-in">
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-3 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">
              <X className="w-5 h-5 text-gray-500" />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
