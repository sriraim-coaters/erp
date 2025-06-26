import React, { useState, useEffect } from 'react';
import { X, Loader2, IndianRupee } from 'lucide-react';
import { Payment, ScrapSale } from '../../types'; // ScrapSale for context, Payment for new payment
import { addPaymentToSale, NewPaymentData } from '../../services/scrapService';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  scrapSale: ScrapSale | null; // Pass the whole sale object for context if needed (e.g. display sale id/details)
  onPaymentAddSuccess: () => void; // Callback to trigger refetch or update in parent
}

const initialFormData: NewPaymentData = {
  date_of_payment: new Date().toISOString().split('T')[0],
  amount_paid: 0,
};

export default function PaymentModal({ isOpen, onClose, scrapSale, onPaymentAddSuccess }: PaymentModalProps) {
  const [formData, setFormData] = useState<NewPaymentData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setFormData(initialFormData);
      setError(null);
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scrapSale || !scrapSale.id) {
      setError("No sale selected or sale ID is missing.");
      return;
    }
    if (formData.amount_paid <= 0) {
      setError("Amount paid must be a positive value.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await addPaymentToSale(scrapSale.id, formData);
      onPaymentAddSuccess(); // Notify parent to refetch/update
      onClose(); // Close modal on success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add payment.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !scrapSale) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Add Payment for Sale ID: {scrapSale.id}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
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

          <div className="mb-4 p-3 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-700">
                Sale Date: <span className="font-medium">{new Date(scrapSale.date_of_sale).toLocaleDateString()}</span>
            </p>
            <p className="text-sm text-gray-700">
                Total Value: <span className="font-medium">₹{scrapSale.total_value.toLocaleString()}</span>
            </p>
            <p className="text-sm text-gray-700">
                Amount Pending: <span className="font-medium text-orange-600">₹{scrapSale.amount_pending.toLocaleString()}</span>
            </p>
          </div>


          <div>
            <label htmlFor="date_of_payment" className="block text-sm font-medium text-gray-700 mb-1">
              Date of Payment *
            </label>
            <input
              type="date"
              id="date_of_payment"
              required
              value={formData.date_of_payment}
              onChange={(e) => setFormData({ ...formData, date_of_payment: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="amount_paid" className="block text-sm font-medium text-gray-700 mb-1">
              Amount Paid (₹) *
            </label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IndianRupee className="h-5 w-5 text-gray-400" />
                </div>
                <input
                type="number"
                id="amount_paid"
                required
                min="0.01"
                step="0.01"
                value={formData.amount_paid}
                onChange={(e) => setFormData({ ...formData, amount_paid: parseFloat(e.target.value) || 0 })}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="0.00"
                />
            </div>
          </div>

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
              {isLoading ? 'Saving Payment...' : 'Add Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
