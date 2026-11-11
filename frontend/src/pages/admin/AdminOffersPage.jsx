import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import AdminSidebar from '../../components/admin/AdminSidebar';
import toast from 'react-hot-toast';
import { Tag, Plus, Trash2, Building2, X } from 'lucide-react';

const AdminOffersPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newNotice, setNewNotice] = useState({
    title: '',
    description: '',
    type: 'offer',
    discountPercent: 10,
    couponCode: '',
    maxDiscountAmount: 50,
    minOrderAmount: 50,
    hostelSpecific: '',
    badgeText: 'Offer',
    bannerColor: 'orange',
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await api.get('/announcements');
      if (res.data.success) {
        setAnnouncements(res.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load notices');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNotice = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newNotice,
        couponCode: newNotice.couponCode ? newNotice.couponCode.trim().toUpperCase() : undefined,
        hostelSpecific: newNotice.hostelSpecific
          ? newNotice.hostelSpecific.split(',').map((h) => h.trim())
          : [],
      };

      const res = await api.post('/announcements', payload);
      if (res.data.success) {
        toast.success(res.data.message);
        setIsModalOpen(false);
        fetchAnnouncements();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to publish');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement / offer?')) return;
    try {
      const res = await api.delete(`/announcements/${id}`);
      if (res.data.success) {
        toast.success(res.data.message);
        fetchAnnouncements();
      }
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="flex">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-8 space-y-6 max-w-7xl mx-auto overflow-x-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              Announcements & Hostel Offers 🏷️
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Create coupon codes, publish meal notices and target hostel-specific specials.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 self-start"
          >
            <Plus className="w-4 h-4" />
            <span>Publish Notice / Coupon</span>
          </button>
        </div>

        {/* Notices Grid */}
        {loading ? (
          <div className="py-20 text-center text-xs text-stone-400">Loading notices...</div>
        ) : announcements.length === 0 ? (
          <div className="py-16 text-center text-xs text-stone-400 bg-white rounded-3xl border border-stone-200">
            No active announcements published.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {announcements.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-soft flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-brand-50 text-brand-700 px-2.5 py-0.5 rounded-full">
                      {item.badgeText || item.type}
                    </span>
                    {item.couponCode && (
                      <span className="text-xs font-mono font-bold bg-stone-100 text-stone-800 px-2 py-0.5 rounded">
                        {item.couponCode}
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-base text-stone-900 mt-3">{item.title}</h3>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">{item.description}</p>

                  {item.hostelSpecific?.length > 0 && (
                    <div className="mt-3 flex items-center gap-1.5 text-[11px] text-amber-700 font-semibold bg-amber-50 px-2.5 py-1 rounded-lg">
                      <Building2 className="w-3.5 h-3.5" />
                      Target: {item.hostelSpecific.join(', ')}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-[10px] text-stone-400">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-100">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <h3 className="font-bold text-base text-stone-900">Publish Announcement / Offer</h3>
                <button onClick={() => setIsModalOpen(false)}>
                  <X className="w-5 h-5 text-stone-400" />
                </button>
              </div>

              <form onSubmit={handleCreateNotice} className="space-y-3 mt-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newNotice.title}
                    onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                    placeholder="e.g. Wednesday Biryani Feast"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1">
                    Description *
                  </label>
                  <textarea
                    rows="2"
                    required
                    value={newNotice.description}
                    onChange={(e) => setNewNotice({ ...newNotice, description: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                  ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1">
                      Coupon Code
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. SPECIAL15"
                      value={newNotice.couponCode}
                      onChange={(e) => setNewNotice({ ...newNotice, couponCode: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono font-bold uppercase"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1">
                      Discount %
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={newNotice.discountPercent}
                      onChange={(e) => setNewNotice({ ...newNotice, discountPercent: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1">
                    Hostel Targeting (Comma separated or leave empty for all)
                  </label>
                  <input
                    type="text"
                    placeholder="Aryabhata Bhavan, Ramanujan Bhavan"
                    value={newNotice.hostelSpecific}
                    onChange={(e) => setNewNotice({ ...newNotice, hostelSpecific: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                  />
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
                    Publish
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

export default AdminOffersPage;
