import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { laundryAPI } from '../services/api';

interface LaundryItem {
  _id: string;
  code: string;
  tenantName: string;
  packageType: string;
  quantity: number;
  price: number;
  totalPrice: number;
  status: string;
  notes: string;
  image: string;
}

interface LaundryFormModalProps {
  laundry: LaundryItem | null;
  onClose: () => void;
}

// Price list based on package type
const PRICE_LIST = {
  'kiloan': 8000,
  'satuan': 12000,
  'express': 15000,
  'dry-cleaning': 25000,
  'cuci-lipat': 10000,
  'cuci-setrika': 12000,
};

export default function LaundryFormModal({ laundry, onClose }: LaundryFormModalProps) {
  const [formData, setFormData] = useState({
    tenantName: '',
    packageType: 'kiloan',
    quantity: '',
    price: '',
    notes: '',
    status: 'pending',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (laundry) {
      setFormData({
        tenantName: laundry.tenantName,
        packageType: laundry.packageType,
        quantity: laundry.quantity.toString(),
        price: (laundry.price || 0).toString(),
        notes: laundry.notes || '',
        status: laundry.status,
      });
      if (laundry.image) {
        setImagePreview(`http://localhost:5000${laundry.image}`);
      }
    }
  }, [laundry]);

  // Auto-update price when package type changes
  const handlePackageTypeChange = (packageType: string) => {
    const newPrice = PRICE_LIST[packageType as keyof typeof PRICE_LIST] || 0;
    setFormData({ 
      ...formData, 
      packageType, 
      price: newPrice.toString() 
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Basic validation
      if (!formData.tenantName || !formData.quantity || !formData.price) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      const quantity = Number(formData.quantity);
      if (quantity <= 0) {
        setError('Quantity must be greater than 0');
        setLoading(false);
        return;
      }

      // Check minimum 3kg for kiloan package
      if (formData.packageType === 'kiloan' && quantity < 3) {
        setError('Minimum 3kg untuk paket kiloan');
        setLoading(false);
        return;
      }

      if (Number(formData.price) < 0) {
        setError('Price must be 0 or greater');
        setLoading(false);
        return;
      }

      // Debug logging
      console.log('Frontend - Form data before submit:', {
        quantity: formData.quantity,
        price: formData.price,
        quantityType: typeof formData.quantity,
        priceType: typeof formData.price
      });

      const data = new FormData();
      data.append('tenantName', formData.tenantName);
      data.append('packageType', formData.packageType);
      data.append('quantity', formData.quantity);
      data.append('price', formData.price);
      data.append('notes', formData.notes);
      data.append('status', formData.status);

      if (imageFile) {
        data.append('image', imageFile);
      }

      if (laundry) {
        await laundryAPI.update(laundry._id, data);
      } else {
        await laundryAPI.create(data);
      }

      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save laundry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-2xl font-bold text-navy mb-6">
          {laundry ? 'Edit Laundry' : 'Add New Laundry'}
        </h3>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tenant Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tenant Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.tenantName}
              onChange={(e) => setFormData({ ...formData, tenantName: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
              placeholder="Enter tenant name"
            />
          </div>

          {/* Package Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Package Type
            </label>
            <select
              value={formData.packageType}
              onChange={(e) => handlePackageTypeChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
            >
              <option value="kiloan">Kiloan</option>
              <option value="satuan">Satuan</option>
              <option value="express">Express</option>
              <option value="dry-cleaning">Dry Cleaning</option>
              <option value="cuci-lipat">Cuci Lipat</option>
              <option value="cuci-setrika">Cuci Setrika</option>
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity (kg) <span className="text-red-500">*</span>
              {formData.packageType === 'kiloan' && (
                <span className="text-xs text-blue-600 ml-2">(min. 3kg)</span>
              )}
            </label>
            <input
              type="text"
              required
              value={formData.quantity}
              onChange={(e) => {
                // Only allow numbers for quantity
                const value = e.target.value.replace(/[^0-9]/g, '');
                setFormData({ ...formData, quantity: value });
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
              placeholder="Enter quantity"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price per Kg (Rp) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={formData.price}
                readOnly
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
                placeholder="Auto-filled based on package type"
              />
              <div className="absolute right-3 top-3 text-sm text-gray-500">
                Auto
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Harga otomatis berdasarkan jenis paket
            </p>
          </div>

          {/* Status (only for edit) */}
          {laundry && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
              >
                <option value="pending">Pending</option>
                <option value="on-process">On Process</option>
                <option value="done">Done</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none resize-none"
              placeholder="Enter any notes..."
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gold transition-colors cursor-pointer bg-gray-50">
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <div className="flex flex-col items-center">
                  <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700 mb-1">
                    {imageFile ? imageFile.name : 'Click to upload image'}
                  </span>
                  <span className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</span>
                </div>
              </label>
            </div>
            {imagePreview && (
              <div className="mt-4 relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg shadow-md"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview('');
                  }}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gold hover:bg-yellow-500 text-navy font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : laundry ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
