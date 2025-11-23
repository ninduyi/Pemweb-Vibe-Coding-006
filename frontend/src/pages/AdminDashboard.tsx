import { useState, useEffect } from 'react';
import { laundryAPI } from '../services/api';
import Navbar from '../components/Navbar';
import LaundryFormModal from '../components/LaundryFormModal';
import LoadingSpinner from '../components/LoadingSpinner';

interface LaundryItem {
  _id: string;
  code: string;
  tenantName: string;
  packageType: string;
  quantity: number;
  status: string;
  notes: string;
  image: string;
  createdAt: string;
  updatedAt: string;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  'on-process': 'bg-blue-100 text-blue-800',
  done: 'bg-success text-white',
  delivered: 'bg-purple-100 text-purple-800',
};

export default function AdminDashboard() {
  const [laundries, setLaundries] = useState<LaundryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [showModal, setShowModal] = useState(false);
  const [selectedLaundry, setSelectedLaundry] = useState<LaundryItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    onProcess: 0,
    done: 0,
    delivered: 0,
  });

  useEffect(() => {
    fetchLaundries();
  }, [currentPage, search, statusFilter, sortBy, order]);

  const fetchLaundries = async () => {
    setLoading(true);
    try {
      const response = await laundryAPI.getAll({
        page: currentPage,
        limit: 10,
        search,
        status: statusFilter,
        sortBy,
        order,
      });
      setLaundries(response.data.data);
      setTotalPages(response.data.totalPages);
      
      // Calculate stats
      const allResponse = await laundryAPI.getAll({ limit: 1000 });
      const allData = allResponse.data.data;
      setStats({
        total: allData.length,
        pending: allData.filter((item: LaundryItem) => item.status === 'pending').length,
        onProcess: allData.filter((item: LaundryItem) => item.status === 'on-process').length,
        done: allData.filter((item: LaundryItem) => item.status === 'done').length,
        delivered: allData.filter((item: LaundryItem) => item.status === 'delivered').length,
      });
    } catch (error) {
      console.error('Failed to fetch laundries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await laundryAPI.delete(id);
      fetchLaundries();
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const handleEdit = (laundry: LaundryItem) => {
    setSelectedLaundry(laundry);
    setShowModal(true);
  };

  const handleAddNew = () => {
    setSelectedLaundry(null);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedLaundry(null);
    fetchLaundries();
  };

  if (loading && laundries.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-lightGray">
      <Navbar onAddNew={handleAddNew} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Orders</p>
                <p className="text-2xl font-bold text-navy">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-navy rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">In Process</p>
                <p className="text-2xl font-bold text-blue-600">{stats.onProcess}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Done</p>
                <p className="text-2xl font-bold text-success">{stats.done}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Delivered</p>
                <p className="text-2xl font-bold text-purple-600">{stats.delivered}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search by name, code..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
            />

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="on-process">On Process</option>
              <option value="done">Done</option>
              <option value="delivered">Delivered</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
            >
              <option value="createdAt">Created Date</option>
              <option value="tenantName">Tenant Name</option>
              <option value="quantity">Quantity</option>
            </select>

            <select
              value={order}
              onChange={(e) => setOrder(e.target.value as 'asc' | 'desc')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading...</p>
          </div>
        )}

        {/* Laundry Cards */}
        {!loading && laundries.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-600">No laundries found</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {laundries.map((laundry) => (
            <div key={laundry._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
              {laundry.image ? (
                <img
                  src={`http://localhost:5000${laundry.image}`}
                  alt={laundry.tenantName}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-navy via-navy-soft to-navy/80 flex items-center justify-center relative overflow-hidden">
                  {/* Decorative elements */}
                  <div className="absolute top-4 right-4 w-16 h-16 bg-gold/10 rounded-full blur-xl"></div>
                  <div className="absolute bottom-4 left-4 w-20 h-20 bg-gold/10 rounded-full blur-xl"></div>
                  
                  {/* T-shirt icon */}
                  <svg className="w-32 h-32 text-gold/30" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16,4L9,4L9,2C9,1.45 8.55,1 8,1L6,1C5.45,1 5,1.45 5,2L5,4L4,4C2.9,4 2,4.9 2,6L2,8C2,9.1 2.9,10 4,10L4,20C4,21.1 4.9,22 6,22L18,22C19.1,22 20,21.1 20,20L20,10C21.1,10 22,9.1 22,8L22,6C22,4.9 21.1,4 20,4L19,4L19,2C19,1.45 18.55,1 18,1L16,1C15.45,1 15,1.45 15,2L15,4M7,4L7,3L8,3L8,4M16,3L17,3L17,4L16,4M18,20L6,20L6,10.97L7.17,10.39L9.5,11.4C11.28,12.14 13.72,12.14 15.5,11.4L17.83,10.39L19,10.97L19,20Z"/>
                  </svg>
                </div>
              )}

              <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-navy">{laundry.code}</h3>
                    <p className="text-gray-600">{laundry.tenantName}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      statusColors[laundry.status] || 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {laundry.status}
                  </span>
                </div>

                <div className="text-sm text-gray-600 mb-3 space-y-1">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <span>Package: <strong>{laundry.packageType}</strong></span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                    </svg>
                    <span>Quantity: <strong>{laundry.quantity} kg</strong></span>
                  </div>
                </div>

                {laundry.notes && (
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2 italic">{laundry.notes}</p>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(laundry)}
                    className="flex-1 bg-gold hover:bg-yellow-500 text-navy font-semibold py-2 rounded-lg transition flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(laundry._id)}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-lg transition flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="px-4 py-2 bg-white rounded-lg border border-gray-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-white rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-navy mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this laundry item?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showModal && (
        <LaundryFormModal
          laundry={selectedLaundry}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}
