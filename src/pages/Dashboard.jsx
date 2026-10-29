import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { leaveApi } from '../api/leaveApi';
import { StatusBadge } from '../components/StatusBadge';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Users, 
  PlusCircle, 
  ArrowRight,
  ShieldCheck,
  Building
} from 'lucide-react';

export const Dashboard = () => {
  const { user, employee, isAdmin } = useAuth();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
  });
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsData, leavesData] = await Promise.all([
          leaveApi.getStats(),
          isAdmin ? leaveApi.getAll() : leaveApi.getAll({ employeeId: employee?.id }),
        ]);
        setStats(statsData);
        setRecentLeaves(leavesData.slice(0, 5));
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAdmin, employee?.id]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-sky-700 via-sky-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md mb-3">
            {isAdmin ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5" />
                Administrator Portal
              </>
            ) : (
              <>
                <Building className="w-3.5 h-3.5" />
                {employee?.department || 'Employee Dashboard'}
              </>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {employee?.name || user?.email}!
          </h1>
          <p className="mt-2 text-sky-100 text-sm sm:text-base leading-relaxed">
            {isAdmin 
              ? 'Manage organizational leave requests, review pending submissions, and monitor department headcount.'
              : 'Submit and track your annual, casual, and medical leave requests effortlessly.'}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/leaves"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-sky-800 text-sm font-bold shadow hover:bg-sky-50 transition"
            >
              <PlusCircle className="w-4 h-4 text-sky-600" />
              Submit Leave Request
            </Link>
            {isAdmin && (
              <Link
                to="/admin/review"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-900/60 backdrop-blur-md text-white border border-white/20 text-sm font-semibold hover:bg-sky-900/80 transition"
              >
                <Clock className="w-4 h-4 text-amber-300" />
                Review Pending ({stats.pendingRequests})
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Pending Review</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{stats.pendingRequests}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Approved Leaves</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{stats.approvedRequests}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Rejected Leaves</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{stats.rejectedRequests}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-sky-50 text-sky-600 border border-sky-100">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Employees</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{stats.totalEmployees}</h3>
          </div>
        </div>
      </div>

      {/* Recent Leave Requests Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recent Leave Requests</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isAdmin ? 'Latest leave applications from all staff members' : 'Your latest submitted requests'}
            </p>
          </div>
          <Link
            to="/leaves"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 hover:text-sky-700 transition"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading requests...</div>
        ) : recentLeaves.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No leave requests recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/75 text-xs uppercase font-semibold text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Employee</th>
                  <th className="px-6 py-3.5">Type</th>
                  <th className="px-6 py-3.5">Date Range</th>
                  <th className="px-6 py-3.5">Days</th>
                  <th className="px-6 py-3.5">Reason</th>
                  <th className="px-6 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentLeaves.map((leave) => (
                  <tr key={leave.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{leave.employeeName}</div>
                      <div className="text-xs text-slate-500">{leave.department}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700">
                        {leave.leaveType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-medium">
                      {leave.startDate} <span className="text-slate-400">→</span> {leave.endDate}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {leave.totalDays} {leave.totalDays === 1 ? 'day' : 'days'}
                    </td>
                    <td className="px-6 py-4 text-slate-600 max-w-xs truncate" title={leave.reason}>
                      {leave.reason}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={leave.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
