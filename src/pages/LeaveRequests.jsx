import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { leaveApi } from '../api/leaveApi';
import { employeeApi } from '../api/employeeApi';
import { Modal } from '../components/Modal';
import { StatusBadge } from '../components/StatusBadge';
import {
  Calendar,
  PlusCircle,
  Filter,
  AlertCircle,
  CheckCircle,
  Clock,
  Info,
  CalendarDays
} from 'lucide-react';

export const LeaveRequests = () => {
  const { user, employee, isAdmin } = useAuth();
  const location = useLocation();

  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    employeeId: employee?.id || '',
    leaveType: 'ANNUAL',
    startDate: '',
    endDate: '',
    reason: '',
  });

  const [dateError, setDateError] = useState('');
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-open modal if URL has ?action=new
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('action') === 'new') {
      setIsModalOpen(true);
    }
  }, [location.search]);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (statusFilter) filters.status = statusFilter;
      if (!isAdmin && employee?.id) {
        filters.employeeId = employee.id;
      }
      const data = await leaveApi.getAll(filters);
      setLeaves(data);
    } catch (err) {
      console.error('Failed to load leaves', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeesList = async () => {
    try {
      const data = await employeeApi.getAll();
      setEmployees(data);
      if (!formData.employeeId && data.length > 0) {
        setFormData((prev) => ({
          ...prev,
          employeeId: employee?.id || data[0].id,
        }));
      }
    } catch (err) {
      console.error('Failed to load employees for dropdown', err);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [statusFilter, isAdmin, employee?.id]);

  useEffect(() => {
    fetchEmployeesList();
  }, []);

  // Calculate day difference & validate dates live
  const calculateDays = () => {
    if (!formData.startDate || !formData.endDate) return null;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);

    if (end < start) {
      return null;
    }
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    const nextForm = { ...formData, [name]: value };
    setFormData(nextForm);

    if (nextForm.startDate && nextForm.endDate) {
      if (new Date(nextForm.endDate) < new Date(nextForm.startDate)) {
        setDateError('End date cannot be earlier than start date.');
      } else {
        setDateError('');
      }
    } else {
      setDateError('');
    }
  };

  const handleSubmitLeave = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccessMessage('');

    if (!formData.startDate || !formData.endDate) {
      setFormError('Both start date and end date are required');
      return;
    }

    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      setDateError('End date cannot be earlier than start date.');
      return;
    }

    if (!formData.reason.trim()) {
      setFormError('Please provide a reason for the leave request');
      return;
    }

    setIsSubmitting(true);
    try {
      await leaveApi.create({
        employeeId: Number(formData.employeeId),
        leaveType: formData.leaveType,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason.trim(),
      });

      setSuccessMessage('Leave request submitted successfully! Status is Pending review.');
      setFormData({
        employeeId: employee?.id || (employees[0] ? employees[0].id : ''),
        leaveType: 'ANNUAL',
        startDate: '',
        endDate: '',
        reason: '',
      });
      setIsModalOpen(false);
      fetchLeaves();
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Failed to submit leave request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const durationDays = calculateDays();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Calendar className="w-6 h-6 text-sky-600" />
            Leave Requests
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isAdmin 
              ? 'View, track, and monitor employee leave requests across all departments.'
              : 'Submit and check the live status of your personal leave applications.'}
          </p>
        </div>

        <button
          onClick={() => {
            setFormError('');
            setDateError('');
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm shadow transition"
        >
          <PlusCircle className="w-4 h-4" />
          Submit Leave Request
        </button>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center gap-2.5">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          <button
            onClick={() => setStatusFilter('')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              statusFilter === ''
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Requests
          </button>
          <button
            onClick={() => setStatusFilter('PENDING')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              statusFilter === 'PENDING'
                ? 'bg-amber-500 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setStatusFilter('APPROVED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              statusFilter === 'APPROVED'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setStatusFilter('REJECTED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              statusFilter === 'REJECTED'
                ? 'bg-rose-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Rejected
          </button>
        </div>

        <div className="text-xs font-semibold text-slate-500 px-2">
          {leaves.length} records found
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-400">Loading leave requests...</div>
        ) : leaves.length === 0 ? (
          <div className="p-16 text-center text-slate-500 text-sm">
            No leave requests matching the selected filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/75 text-xs uppercase font-semibold text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Leave Type</th>
                  <th className="px-6 py-4">Duration</th>
                  <th className="px-6 py-4">Days</th>
                  <th className="px-6 py-4">Reason</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Admin Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaves.map((leave) => (
                  <tr key={leave.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{leave.employeeName}</div>
                      <div className="text-xs text-slate-500">{leave.department}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-800">
                        {leave.leaveType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-700 whitespace-nowrap">
                      <span className="font-medium">{leave.startDate}</span>
                      <span className="text-slate-400 mx-1.5">→</span>
                      <span className="font-medium">{leave.endDate}</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 whitespace-nowrap">
                      {leave.totalDays} {leave.totalDays === 1 ? 'day' : 'days'}
                    </td>
                    <td className="px-6 py-4 text-slate-600 max-w-xs">
                      <p className="truncate" title={leave.reason}>{leave.reason}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={leave.status} />
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {leave.status === 'REJECTED' && leave.rejectionReason ? (
                        <div className="p-2 rounded bg-rose-50 border border-rose-100 text-rose-700 max-w-xs">
                          <span className="font-bold">Rejection Note: </span>
                          {leave.rejectionReason}
                        </div>
                      ) : leave.status === 'APPROVED' ? (
                        <span className="text-emerald-600 font-medium">Approved by Admin</span>
                      ) : (
                        <span className="text-slate-400 italic">Awaiting review</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Submit Leave Request Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Submit Leave Request"
      >
        {formError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmitLeave} className="space-y-4">
          {/* Employee Selector (Admins can select any employee; employees default to self) */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Employee *</label>
            {isAdmin ? (
              <select
                name="employeeId"
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.department} - {emp.email})
                  </option>
                ))}
              </select>
            ) : (
              <div className="px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-sm font-semibold text-slate-800">
                {employee?.name || user?.email} ({employee?.department})
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Leave Type *</label>
            <select
              name="leaveType"
              value={formData.leaveType}
              onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
            >
              <option value="ANNUAL">Annual Leave</option>
              <option value="CASUAL">Casual Leave</option>
              <option value="MEDICAL">Medical Leave</option>
            </select>
          </div>

          {/* Date Range with live validation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Start Date *</label>
              <input
                type="date"
                required
                name="startDate"
                value={formData.startDate}
                onChange={handleDateChange}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">End Date *</label>
              <input
                type="date"
                required
                name="endDate"
                value={formData.endDate}
                onChange={handleDateChange}
                className={`w-full px-3.5 py-2 rounded-xl border ${
                  dateError ? 'border-rose-400 ring-1 ring-rose-200' : 'border-slate-300'
                } text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition`}
              />
            </div>
          </div>

          {/* Validation Feedback */}
          {dateError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{dateError}</span>
            </div>
          )}

          {durationDays && !dateError && (
            <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-800 text-xs flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-sky-600" />
              <span>Total duration: <strong>{durationDays} {durationDays === 1 ? 'day' : 'days'}</strong></span>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Reason *</label>
            <textarea
              required
              rows={3}
              name="reason"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="State the purpose of this leave request..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !!dateError}
              className="px-5 py-2 rounded-xl text-sm font-semibold bg-sky-600 hover:bg-sky-700 text-white shadow transition disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
