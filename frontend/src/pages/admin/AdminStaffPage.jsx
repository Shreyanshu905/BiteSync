import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import AdminSidebar from '../../components/admin/AdminSidebar';
import toast from 'react-hot-toast';
import { Users, Plus, ShieldCheck, ChefHat, UserX, UserCheck, X } from 'lucide-react';

const AdminStaffPage = () => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStaff, setNewStaff] = useState({
    name: '',
    email: '',
    password: '',
    role: 'kitchen',
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users/staff');
      if (res.data.success) {
        setStaffList(res.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load staff list');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id) => {
    try {
      const res = await api.patch(`/users/staff/${id}/toggle-active`);
      if (res.data.success) {
        toast.success(res.data.message);
        fetchStaff();
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/users/staff', newStaff);
      if (res.data.success) {
        toast.success(res.data.message);
        setIsModalOpen(false);
        setNewStaff({ name: '', email: '', password: '', role: 'kitchen' });
        fetchStaff();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create staff');
    }
  };

  return (
    <div className="flex">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-8 space-y-6 max-w-7xl mx-auto overflow-x-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              Canteen Staff & Permissions 👥
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Manage kitchen operators, authorize QR scanner counter terminals and assign roles.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 self-start"
          >
            <Plus className="w-4 h-4" />
            <span>Add Staff Account</span>
          </button>
        </div>

        {/* Staff Table */}
        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-soft overflow-hidden">
          {loading ? (
            <div className="py-20 text-center text-xs text-stone-400">Loading staff accounts...</div>
          ) : staffList.length === 0 ? (
            <div className="py-16 text-center text-xs text-stone-400">No staff accounts registered.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-100 text-stone-500 uppercase tracking-wider font-bold">
                  <tr>
                    <th className="py-3 px-4">Staff Member</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {staffList.map((staff) => (
                    <tr key={staff._id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 font-bold flex items-center justify-center shrink-0">
                          {staff.role === 'admin' ? <ShieldCheck className="w-4 h-4" /> : <ChefHat className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="font-bold text-stone-900 text-sm">{staff.name}</p>
                          <span className="text-[10px] text-stone-400 font-mono">
                            Added {new Date(staff.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                            staff.role === 'admin'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {staff.role}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-stone-600 font-medium">
                        {staff.email}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            staff.isActive !== false
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-stone-100 text-stone-500'
                          }`}
                        >
                          {staff.isActive !== false ? 'Active' : 'Deactivated'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleToggleActive(staff._id)}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors ${
                            staff.isActive !== false
                              ? 'text-red-600 hover:bg-red-50'
                              : 'text-emerald-700 hover:bg-emerald-50'
                          }`}
                        >
                          {staff.isActive !== false ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create Staff Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-stone-100">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <h3 className="font-bold text-base text-stone-900">Add Staff Account</h3>
                <button onClick={() => setIsModalOpen(false)}>
                  <X className="w-5 h-5 text-stone-400" />
                </button>
              </div>

              <form onSubmit={handleCreateStaff} className="space-y-3 mt-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1">
                    Staff Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newStaff.name}
                    onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                    placeholder="e.g. Raju Cook"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={newStaff.email}
                    onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                    placeholder="staff@bitesync.com"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    minLength="6"
                    value={newStaff.password}
                    onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1">
                    Role & Permissions
                  </label>
                  <select
                    value={newStaff.role}
                    onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold"
                  >
                    <option value="kitchen">Kitchen Staff (Queue, QR Scanner)</option>
                    <option value="admin">Canteen Manager / Admin</option>
                  </select>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-xs"
                  >
                    Create Account
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminStaffPage;

