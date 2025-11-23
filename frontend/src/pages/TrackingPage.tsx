import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { laundryAPI } from '../services/api';

interface LaundryData {
  code: string;
  tenantName: string;
  status: string;
  image: string;
  packageType: string;
  quantity: number;
  price: number;
  totalPrice: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  'on-process': 'bg-blue-100 text-blue-800',
  done: 'bg-success text-white',
  delivered: 'bg-purple-100 text-purple-800',
};

export default function TrackingPage() {
  const [code, setCode] = useState('');
  const [laundry, setLaundry] = useState<LaundryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [imageError, setImageError] = useState(false);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  const saveRecentSearch = (searchCode: string) => {
    const updated = [searchCode, ...recentSearches.filter(c => c !== searchCode)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setError('');
    setLoading(true);
    setLaundry(null);

    try {
      const response = await laundryAPI.trackByCode(code);
      setLaundry(response.data.data);
      setImageError(false); // Reset image error for new search
      saveRecentSearch(code);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Laundry not found');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy to-navy-soft">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-navy">LaundryTrack</h1>
          <Link
            to="/login"
            className="px-6 py-2 bg-gold hover:bg-yellow-500 text-navy font-semibold rounded-lg transition duration-200"
          >
            Login
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Track Your Laundry</h2>
          <p className="text-gray-300">Enter your laundry code to check status</p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-3">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter laundry code (e.g., LD-001)"
              className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-gold hover:bg-yellow-500 text-navy font-semibold px-8 py-3 rounded-lg transition duration-200 disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Track'}
            </button>
          </div>
        </form>

        {/* Recent Searches */}
        {recentSearches.length > 0 && !laundry && (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-8">
            <h3 className="text-white font-semibold mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Recent Searches
            </h3>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((recentCode) => (
                <button
                  key={recentCode}
                  onClick={() => {
                    setCode(recentCode);
                    handleSearch({ preventDefault: () => {} } as any);
                  }}
                  className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white rounded-full text-sm transition"
                >
                  {recentCode}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Pricelist Section */}
        {!laundry && (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-8">
            <h3 className="text-white font-bold text-xl mb-4 flex items-center">
              <svg className="w-6 h-6 mr-3 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              Pricelist Laundry
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-white">Kiloan</span>
                  <span className="text-gold font-bold">Rp 8.000/kg</span>
                </div>
                <p className="text-gray-300 text-sm">Cuci kering lipat standar (min. 3kg)</p>
              </div>
              
              <div className="bg-white/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-white">Satuan</span>
                  <span className="text-gold font-bold">Rp 12.000/kg</span>
                </div>
                <p className="text-gray-300 text-sm">Per kg pakaian satuan</p>
              </div>
              
              <div className="bg-white/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-white">Express</span>
                  <span className="text-gold font-bold">Rp 15.000/kg</span>
                </div>
                <p className="text-gray-300 text-sm">Selesai dalam 6 jam</p>
              </div>
              
              <div className="bg-white/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-white">Dry Cleaning</span>
                  <span className="text-gold font-bold">Rp 25.000/kg</span>
                </div>
                <p className="text-gray-300 text-sm">Untuk pakaian khusus</p>
              </div>
              
              <div className="bg-white/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-white">Cuci Lipat</span>
                  <span className="text-gold font-bold">Rp 10.000/kg</span>
                </div>
                <p className="text-gray-300 text-sm">Cuci dan lipat rapi</p>
              </div>
              
              <div className="bg-white/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-white">Cuci Setrika</span>
                  <span className="text-gold font-bold">Rp 12.000/kg</span>
                </div>
                <p className="text-gray-300 text-sm">Cuci + setrika premium</p>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-gold/20 rounded-lg">
              <h4 className="text-gold font-semibold mb-2">🎯 Special Offers:</h4>
               <ul className="text-white text-sm space-y-1">
                 <li>• Minimum order 3kg untuk kiloan</li>
                 <li>• Gratis pickup & delivery untuk order di atas Rp 50.000</li>
                 <li>• Member discount 10% untuk customer tetap</li>
               </ul>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-500 text-white px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Laundry Details */}
        {laundry && (
          <div className="bg-white rounded-lg shadow-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-navy">{laundry.code}</h3>
                <p className="text-gray-600">{laundry.tenantName}</p>
              </div>
              <span
                className={`px-4 py-2 rounded-full font-semibold ${
                  statusColors[laundry.status] || 'bg-gray-100 text-gray-800'
                }`}
              >
                {laundry.status.toUpperCase()}
              </span>
            </div>

            {laundry.image && !imageError ? (
              <div className="mb-6">
                <img
                  src={`http://localhost:5000${laundry.image}`}
                  alt="Laundry"
                  className="w-full h-64 object-cover rounded-lg shadow-lg"
                  onError={() => setImageError(true)}
                />
              </div>
            ) : (
              <div className="mb-6 bg-gradient-to-br from-navy via-navy-soft to-navy/90 rounded-lg h-64 flex items-center justify-center relative overflow-hidden shadow-lg">
                {/* Decorative elements */}
                <div className="absolute top-8 right-8 w-20 h-20 bg-gold/10 rounded-full blur-2xl"></div>
                <div className="absolute bottom-8 left-8 w-24 h-24 bg-gold/10 rounded-full blur-2xl"></div>
                
                {/* T-shirt icon with text */}
                <div className="text-center">
                  <svg className="w-24 h-24 mx-auto text-gold mb-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16,4L9,4L9,2C9,1.45 8.55,1 8,1L6,1C5.45,1 5,1.45 5,2L5,4L4,4C2.9,4 2,4.9 2,6L2,8C2,9.1 2.9,10 4,10L4,20C4,21.1 4.9,22 6,22L18,22C19.1,22 20,21.1 20,20L20,10C21.1,10 22,9.1 22,8L22,6C22,4.9 21.1,4 20,4L19,4L19,2C19,1.45 18.55,1 18,1L16,1C15.45,1 15,1.45 15,2L15,4M7,4L7,3L8,3L8,4M16,3L17,3L17,4L16,4M18,20L6,20L6,10.97L7.17,10.39L9.5,11.4C11.28,12.14 13.72,12.14 15.5,11.4L17.83,10.39L19,10.97L19,20Z"/>
                  </svg>
                  <p className="text-gold font-semibold text-lg">Image Not Available</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-600">Package Type</p>
                <p className="font-semibold text-navy">{laundry.packageType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Quantity</p>
                <p className="font-semibold text-navy">{laundry.quantity} kg</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Price per Kg</p>
                <p className="font-semibold text-navy">Rp {(laundry.price || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Price</p>
                <p className="font-bold text-gold text-lg">Rp {(laundry.totalPrice || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Created At</p>
                <p className="font-semibold text-navy">
                  {new Date(laundry.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Updated</p>
                <p className="font-semibold text-navy">
                  {new Date(laundry.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {laundry.notes && (
              <div>
                <p className="text-sm text-gray-600 mb-1">Notes</p>
                <p className="text-navy">{laundry.notes}</p>
              </div>
            )}

            {/* Progress Timeline */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="font-semibold text-navy mb-4">Status Timeline</h4>
              <div className="space-y-3">
                <div className={`flex items-center ${laundry.status === 'pending' || laundry.status === 'on-process' || laundry.status === 'done' || laundry.status === 'delivered' ? 'text-success' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${laundry.status === 'pending' || laundry.status === 'on-process' || laundry.status === 'done' || laundry.status === 'delivered' ? 'bg-success text-white' : 'bg-gray-200'}`}>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                    </svg>
                  </div>
                  <span className="ml-3 font-medium">Order Received</span>
                </div>
                <div className={`flex items-center ${laundry.status === 'on-process' || laundry.status === 'done' || laundry.status === 'delivered' ? 'text-success' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${laundry.status === 'on-process' || laundry.status === 'done' || laundry.status === 'delivered' ? 'bg-success text-white' : 'bg-gray-200'}`}>
                    {laundry.status === 'on-process' || laundry.status === 'done' || laundry.status === 'delivered' ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                      </svg>
                    ) : (
                      <span className="text-sm">2</span>
                    )}
                  </div>
                  <span className="ml-3 font-medium">In Process</span>
                </div>
                <div className={`flex items-center ${laundry.status === 'done' || laundry.status === 'delivered' ? 'text-success' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${laundry.status === 'done' || laundry.status === 'delivered' ? 'bg-success text-white' : 'bg-gray-200'}`}>
                    {laundry.status === 'done' || laundry.status === 'delivered' ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                      </svg>
                    ) : (
                      <span className="text-sm">3</span>
                    )}
                  </div>
                  <span className="ml-3 font-medium">Cleaning Done</span>
                </div>
                <div className={`flex items-center ${laundry.status === 'delivered' ? 'text-success' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${laundry.status === 'delivered' ? 'bg-success text-white' : 'bg-gray-200'}`}>
                    {laundry.status === 'delivered' ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                      </svg>
                    ) : (
                      <span className="text-sm">4</span>
                    )}
                  </div>
                  <span className="ml-3 font-medium">Delivered</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
