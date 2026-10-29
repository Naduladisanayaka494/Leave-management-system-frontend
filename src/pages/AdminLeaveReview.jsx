import React, { useState, useEffect } from 'react';
import { leaveApi } from '../api/leaveApi';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import {
  CheckSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  ShieldAlert,
  Calendar,
  MessageSquare,
  User
} from 'lucide-react';

export const AdminLeaveReview = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('PENDING'); // PENDING, ALL, APPROVED, REJECTED
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionError, setRejectionError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const filters = activeTab === 'ALL' ? {} : { status: activeTab };
      const data = await leaveApi.getAll(filters);
      setLeaves(data);
    } catch (err) {
      console.error('Failed to load leaves for admin review', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [activeTab]);

  const handleApprove = async (id, employeeName) => {
    if (!window.confirm(`Are you sure you want to approve this leave request for ${employeeName}?`)) {
      return;
    }

    setActionLoading(true);
    setAlert(null);
    try {
      await leaveApi.approve(id);
      setAlert({ type: 'success', message: `Leave request for ${employeeName} was approved successfully.` });
      fetchLeaves();
    } catch (err) {
      console.error(err);
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to approve leave request.' });
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectModal = (leave) => {
    setSelectedLeave(leave);
    setRejectionReason('');
    setRejectionError('');
    setRejectionModalOpen(true);
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      setRejectionError('Rejection reason is strictly mandatory.');
      return;
    }

    setActionLoading(true);
    try {
      await leaveApi.reject(selectedLeave.id, rejectionReason.trim());
      setAlert({
        type: 'success',
        message: `Leave request for ${selectedLeave.employeeName} has been rejected.`,
      });
      setRejectionModalOpen(false);
      setSelectedLeave(null);
      fetchLeaves();
    } catch (err) {
      console.error(err);
      setRejectionError(err.response?.data?.message || 'Failed to reject leave request.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            Administrator Review Queue
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-indigo-600" />
            Leave Approvals & Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review pending leave requests, authorize time-off, or provide mandatory rejection feedback.
          </p>
        </div>
      </div>

      {/* Notifications / Alerts */}
      {alert && (
        <div
          className={`p-4 rounded-xl border text-sm flex items-center justify-between ${
            alert.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {alert.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            )}
            <span>{alert.message}</span>
          </div>
          <button
            onClick={() => setAlert(null)}
            className="text-xs font-semibold underline ml-4 hover:opacity-80"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
        {[
          { key: 'PENDING', label: 'Pending Review', icon: Clock },
          { key: 'APPROVED', label: 'Approved', icon: CheckCircle },
          { key: 'REJECTED', label: 'Rejected', icon: XCircle },
          { key: 'ALL', label: 'All Requests', icon: Calendar },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Review Cards / List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-400">Loading leave requests for review...</div>
        ) : leaves.length === 0 ? (
          <div className="p-16 text-center text-slate-500 text-sm">
            No leave requests in "{activeTab}" state.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {leaves.map((leave) => (
              <div
                key={leave.id}
                className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-slate-50/50 transition"
              >
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                        {leave.employeeName ? leave.employeeName.charAt(0) : 'E'}
                      </div>
                      <span className="font-bold text-slate-900">{leave.employeeName}</span>
                    </div>

                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {leave.department}
                    </span>

                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      {leave.leaveType}
                    </span>

                    <StatusBadge status={leave.status} />
                  </div>

                  <div className="flex flex-wrap items-center gap-6 text-sm text-slate-600">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span>{leave.startDate} to {leave.endDate}</span>
                      <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800">
                        {leave.totalDays} {leave.totalDays === 1 ? 'day' : 'days'}
                      </span>
                    </div>
                  </div>

                  <div className="text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="font-semibold text-slate-900 block text-xs uppercase tracking-wider mb-1">
                      Reason for Leave:
                    </span>
                    <p className="text-slate-700">{leave.reason}</p>
                  </div>

                  {leave.status === 'REJECTED' && leave.rejectionReason && (
                    <div className="text-sm bg-rose-50/70 p-3 rounded-xl border border-rose-100 text-rose-800">
                      <span className="font-bold text-xs uppercase tracking-wider block text-rose-900 mb-0.5">
                        Rejection Reason Provided:
                      </span>
                      <p>{leave.rejectionReason}</p>
                    </div>
                  )}
                </div>

                {/* Action Buttons for Pending Requests */}
                <div className="flex items-center gap-3 lg:flex-col lg:items-stretch lg:w-44 flex-shrink-0">
                  {leave.status === 'PENDING' ? (
                    <>
                      <button
                        onClick={() => handleApprove(leave.id, leave.employeeName)}
                        disabled={actionLoading}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve Leave
                      </button>

                      <button
                        onClick={() => openRejectModal(leave)}
                        disabled={actionLoading}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject with Note
                      </button>
                    </>
                  ) : (
                    <div className="text-xs text-slate-400 italic text-center py-2">
                      Request already resolved
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mandatory Rejection Reason Modal */}
      <Modal
        isOpen={rejectionModalOpen}
        onClose={() => setRejectionModalOpen(false)}
        title="Reject Leave Request"
      >
        {selectedLeave && (
          <form onSubmit={handleConfirmReject} className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 space-y-1">
              <div><strong>Employee:</strong> {selectedLeave.employeeName}</div>
              <div><strong>Dates:</strong> {selectedLeave.startDate} → {selectedLeave.endDate} ({selectedLeave.totalDays} days)</div>
              <div><strong>Reason:</strong> {selectedLeave.reason}</div>
            </div>

            {rejectionError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{rejectionError}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Mandatory Rejection Reason *
              </label>
              <textarea
                required
                rows={3}
                value={rejectionReason}
                onChange={(e) => {
                  setRejectionReason(e.target.value);
                  if (rejectionError) setRejectionError('');
                }}
                placeholder="Explain why this request is being rejected (e.g. conflicting critical deadlines, team capacity constraint)..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
              />
              <p className="text-xs text-slate-500 mt-1">
                The employee will be able to see this explanation in their request history.
              </p>
            </div>

            <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRejectionModalOpen(false)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading || !rejectionReason.trim()}
                className="px-5 py-2 rounded-xl text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow transition disabled:opacity-50 flex items-center gap-1.5"
              >
                {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
