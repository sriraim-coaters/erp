import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { ScrapSale } from '../../types';

interface ScrapSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: ScrapSale | null;
  onSave: (sale: ScrapSale) => void;
}

export default function ScrapSaleModal({ isOpen, onClose, sale, onSave }: ScrapSaleModalProps) {
  const [formData, setFormData] = useState<Partial<ScrapSale>>({
    date: new Date().toISOString().split('T')[0],
    kgSold: 0,
    rate: 0,
    amountReceived: 0,
    amountPending: 0,
    totalAmount: 0
  });

  useEffect(() => {
    if (sale) {
      setFormData(sale);
    } else {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        kgSold: 0,
        rate: 0,
        amountReceived: 0,
        amountPending: 0,
        totalAmount: 0
      });
    }
  }, [sale]);

  useEffect(() => {
    const kgSold = formData.kgSold || 0;
    const rate = formData.rate || 0;
    const totalAmount = kgSold * rate;
    const amountReceived = formData.amountReceived || 0;
    const amountPending = totalAmount - amountReceived;
    
    setFormData(prev => ({ 
      ...prev, 
      totalAmount,
      amountPending: Math.max(0, amountPending)
    }));
  }, [formData.kgSold, formData.rate, formData.amountReceived]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as ScrapSale);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            {sale ? 'Edit Scrap Sale' : 'Add New Scrap Sale'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Sale *
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              KG Sold *
            </label>
            <input
              type="number"
              required
              min="0"
              step="0.1"
              value={formData.kgSold}
              onChange={(e) => setFormData({ ...formData, kgSold: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter weight in kg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rate (₹/kg) *
            </label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.rate}
              onChange={(e) => setFormData({ ...formData, rate: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter rate per kg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Amount (₹)
            </label>
            <input
              type="number"
              value={formData.totalAmount}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">Automatically calculated: KG Sold × Rate</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount Received (₹) *
            </label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.amountReceived}
              onChange={(e) => setFormData({ ...formData, amountReceived: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter amount received"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount Pending (₹)
            </label>
            <input
              type="number"
              value={formData.amountPending}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">Automatically calculated: Total Amount - Amount Received</p>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              {sale ? 'Update' : 'Add'} Sale
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}