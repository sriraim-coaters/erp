import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { ScrapSale } from '../../types';
import { addScrapSale, NewScrapSaleData } from '../../services/scrapService';

interface ScrapSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  // sale: ScrapSale | null; // Simplifying: This modal will only handle ADDING new sales for now.
                           // Editing or adding payments to existing sales will need separate handling/modal.
  onSaveSuccess: (newSale: ScrapSale) => void;
}

// Initial form data structure for adding a new sale
const initialFormData: NewScrapSaleData = {
  date_of_sale: new Date().toISOString().split('T')[0],
  material_kg: 0,
  rate_per_kg: 0,
};

export default function ScrapSaleModal({ isOpen, onClose, onSaveSuccess }: ScrapSaleModalProps) {
  const [formData, setFormData] = useState<NewScrapSaleData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset form when modal is opened or closed
    if (!isOpen) {
      setFormData(initialFormData);
      setError(null);
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const newSale = await addScrapSale(formData);
      onSaveSuccess(newSale);
      onClose(); // Close modal on success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add scrap sale.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Add New Scrap Sale
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          <div>
            <label htmlFor="date_of_sale" className="block text-sm font-medium text-gray-700 mb-1">
              Date of Sale *
            </label>
            <input
              type="date"
              id="date_of_sale"
              required
              value={formData.date_of_sale}
              onChange={(e) => setFormData({ ...formData, date_of_sale: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="material_kg" className="block text-sm font-medium text-gray-700 mb-1">
              Material KG *
            </label>
            <input
              type="number"
              id="material_kg"
              required
              min="0"
              step="0.1"
              value={formData.material_kg}
              onChange={(e) => setFormData({ ...formData, material_kg: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter weight in kg"
            />
          </div>

          <div>
            <label htmlFor="rate_per_kg" className="block text-sm font-medium text-gray-700 mb-1">
              Rate (₹/kg) *
            </label>
            <input
              type="number"
              id="rate_per_kg"
              required
              min="0"
              step="0.01"
              value={formData.rate_per_kg}
              onChange={(e) => setFormData({ ...formData, rate_per_kg: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter rate per kg"
            />
          </div>

          {/* Fields for Total Amount, Amount Received, Amount Pending are removed.
              These are calculated and managed by the backend.
              The main ScrapSellTracker component will display these values from fetched data.
           */}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
              {isLoading ? 'Saving...' : 'Add Sale'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}