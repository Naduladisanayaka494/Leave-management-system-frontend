import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, Users, CheckSquare, LayoutDashboard, LogOut, ShieldCheck, User } from 'lucide-react';

export const Navbar = () => {
  const { user, employee, isAdmin, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="flex items-center gap-2.5 font-bold text-xl text-slate-900 group">
              <div className="p-2 bg-sky-600 text-white rounded-lg group-hover:bg-sky-700 transition">
                <Calendar className="w-5 h-5" />
              </div>
              <span className="tracking-tight text-slate-900">
                Ombits <span className="text-sky-600 font-semibold">LeaveFlow</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center space-x-1">
              <Link
                to="/dashboard"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive('/dashboard')
                    ? 'bg-sky-50 text-sky-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>

              <Link
                to="/leaves"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive('/leaves')
                    ? 'bg-sky-50 text-sky-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Calendar className="w-4 h-4" />
                Leave Requests
              </Link>

              <Link
                to="/employees"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive('/employees')
                    ? 'bg-sky-50 text-sky-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Users className="w-4 h-4" />
                Employees
              </Link>

              {isAdmin && (
                <Link
                  to="/admin/review"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive('/admin/review')
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50'
                  }`}
                >
                  <CheckSquare className="w-4 h-4" />
                  Review Approvals
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 pr-2 border-r border-slate-200">
              <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-medium">
                {employee?.name ? employee.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
              </div>
              <div className="text-left">
                <div className="text-sm font-medium text-slate-900 flex items-center gap-1.5">
                  {employee?.name || user.email}
                  {isAdmin ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 uppercase tracking-wide">
                      <ShieldCheck className="w-3 h-3" /> Admin
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 uppercase tracking-wide">
                      Staff
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500">{employee?.department || user.email}</div>
              </div>
            </div>

            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
