import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Calendar, Scale, IndianRupee, TrendingUp, Package, Edit3, Eye, Loader2 } from 'lucide-react';
import { ScrapSale } from '../../types';
import ScrapSaleModal from './ScrapSaleModal';
import PaymentModal from './PaymentModal'; // New modal for adding payments
import { fetchScrapSales } from '../../services/scrapService';

export default function ScrapSellTracker() {
  const [scrapSales, setScrapSales] = useState<ScrapSale[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isScrapSaleModalOpen, setIsScrapSaleModalOpen] = useState(false);
  // const [editingSale, setEditingSale] = useState<ScrapSale | null>(null); // Editing existing sale details is out of scope for now

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedSaleForPayment, setSelectedSaleForPayment] = useState<ScrapSale | null>(null);

  const [dateFilter, setDateFilter] = useState({ from: '', to: '' });

  const loadScrapSales = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const filters = {
        start_date: dateFilter.from || undefined,
        end_date: dateFilter.to || undefined,
      };
      const sales = await fetchScrapSales(filters);
      setScrapSales(sales);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch scrap sales.');
    } finally {
      setIsLoading(false);
    }
  }, [dateFilter.from, dateFilter.to]);

  useEffect(() => {
    loadScrapSales();
  }, [loadScrapSales]);

  // The filteredSales logic is now handled by the backend via query params,
  // but if client-side filtering on already fetched data is still desired for some reason,
  // it could be re-implemented here. For now, assuming backend does the filtering.
  const displayedSales = scrapSales; // Or apply further client-side filtering if needed

  const stats = {
    totalKgSold: displayedSales.reduce((sum, sale) => sum + sale.material_kg, 0),
    totalReceived: displayedSales.reduce((sum, sale) => sum + sale.amount_received, 0),
    totalPending: displayedSales.reduce((sum, sale) => sum + sale.amount_pending, 0),
    totalSales: displayedSales.length,
    avgRate: displayedSales.length > 0
      ? displayedSales.reduce((sum, sale) => sum + sale.rate_per_kg, 0) / displayedSales.length
      : 0,
  };

  const handleAddNewSale = () => {
    // setEditingSale(null); // Not using editingSale for add anymore
    setIsScrapSaleModalOpen(true);
  };

  const handleOpenPaymentModal = (sale: ScrapSale) => {
    setSelectedSaleForPayment(sale);
    setIsPaymentModalOpen(true);
  };

  const handleSaveSaleSuccess = (newSale: ScrapSale) => {
    // Add to local state or refetch. Refetching is simpler for consistency.
    loadScrapSales();
    setIsScrapSaleModalOpen(false);
  };

  const handlePaymentAddSuccess = () => {
    loadScrapSales(); // Refetch sales to get updated payment info and totals
    setIsPaymentModalOpen(false);
    setSelectedSaleForPayment(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Scrap Sell Tracker</h2>
          <p className="text-gray-600">Track scrap metal sales and revenue</p>
        </div>
        <button
          onClick={handleAddNewSale}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>New Scrap Sale</span>
        </button>
      </div>

      {/* Stats Cards - ensure stats object uses new field names */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sales</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalSales}</p>
            </div>
            <Package className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total KG Sold</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalKgSold.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1})}</p>
            </div>
            <Scale className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Amount Received</p>
              <p className="text-2xl font-bold text-green-600">₹{stats.totalReceived.toLocaleString()}</p>
            </div>
            <IndianRupee className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Amount Pending</p>
              <p className="text-2xl font-bold text-orange-600">₹{stats.totalPending.toLocaleString()}</p>
            </div>
            <Calendar className="h-8 w-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Rate</p>
              <p className="text-2xl font-bold text-teal-600">₹{stats.avgRate.toFixed(2)}/kg</p>
            </div>
            <TrendingUp className="h-8 w-8 text-teal-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-end">
          <div>
            <label htmlFor="dateFrom" className="block text-sm font-medium text-gray-700 mb-1">
              Date From
            </label>
            <input
              type="date"
              id="dateFrom"
              value={dateFilter.from}
              onChange={(e) => setDateFilter(prev => ({ ...prev, from: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="dateTo" className="block text-sm font-medium text-gray-700 mb-1">
              Date To
            </label>
            <input
              type="date"
              id="dateTo"
              value={dateFilter.to}
              onChange={(e) => setDateFilter(prev => ({ ...prev, to: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
           {/* Button to trigger loadScrapSales manually if useEffect on dateFilter is not desired for immediate refilter */}
           {/* <button
              onClick={loadScrapSales}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Apply Filters
            </button> */}
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-12 w-12 text-green-600 animate-spin" />
          <p className="ml-3 text-gray-600">Loading scrap sales...</p>
        </div>
      )}

      {!isLoading && !error && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sale Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Material (KG)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rate (₹/kg)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Received
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pending
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayedSales.map((sale) => (
                  <React.Fragment key={sale.id}>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(sale.date_of_sale).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {sale.material_kg} kg
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{sale.rate_per_kg.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ₹{sale.total_value.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                      ₹{sale.amount_received.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600 font-medium">
                      ₹{sale.amount_pending.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        sale.amount_pending === 0
                          ? 'bg-green-100 text-green-800'
                          : sale.amount_received > 0 ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800' // If no payment received yet
                      }`}>
                        {sale.amount_pending === 0 ? 'Fully Paid'
                         : sale.amount_received > 0 ? 'Partially Paid'
                         : 'Unpaid'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleOpenPaymentModal(sale)}
                        className="text-green-600 hover:text-green-900 transition-colors flex items-center"
                        title="Add Payment"
                      >
                        <IndianRupee className="h-4 w-4 mr-1" /> Add Payment
                      </button>
                      {/* Add button/icon to view payments if needed */}
                      {sale.payments && sale.payments.length > 0 && (
                         <button
                            onClick={() => {
                                // Basic alert for now. A proper expandable row or modal would be better.
                                alert(`Payments for Sale ID ${sale.id}:\n${sale.payments.map(p =>
                                    `${new Date(p.date_of_payment).toLocaleDateString()}: ₹${p.amount_paid.toLocaleString()}`
                                ).join('\n')}`);
                            }}
                            className="text-blue-600 hover:text-blue-900 transition-colors flex items-center"
                            title="View Payments"
                         >
                            <Eye className="h-4 w-4 mr-1" /> View Payments ({sale.payments.length})
                         </button>
                      )}
                    </td>
                  </tr>
                  {/* Placeholder for expandable row content - not fully implemented here */}
                  {/* {expandedRow === sale.id && (
                    <tr>
                      <td colSpan={8} className="p-4 bg-gray-100">
                        <h4 className="font-semibold mb-2">Payment History:</h4>
                        {sale.payments && sale.payments.length > 0 ? (
                          <ul className="list-disc pl-5">
                            {sale.payments.map(p => (
                              <li key={p.id} className="text-sm">
                                {new Date(p.date_of_payment).toLocaleDateString()}: ₹{p.amount_paid.toLocaleString()}
                              </li>
                            ))}
                          </ul>
                        ) : <p className="text-sm text-gray-500">No payments recorded yet.</p>}
                      </td>
                    </tr>
                  )} */}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {displayedSales.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <Scale className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No scrap sales found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Adjust filters or get started by adding a new scrap sale.
              </p>
              <div className="mt-6">
                <button
                  onClick={handleAddNewSale}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Scrap Sale
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      {/* Scrap Sale Modal */}
      <ScrapSaleModal
        isOpen={isScrapSaleModalOpen}
        onClose={() => {
          setIsScrapSaleModalOpen(false);
          // setEditingSale(null); // Not using editingSale for add
        }}
        // sale={editingSale} // Not passing sale for add mode
        onSaveSuccess={handleSaveSaleSuccess}
      />

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
            setIsPaymentModalOpen(false);
            setSelectedSaleForPayment(null);
        }}
        scrapSale={selectedSaleForPayment}
        onPaymentAddSuccess={handlePaymentAddSuccess}
      />
    </div>
  );
}
