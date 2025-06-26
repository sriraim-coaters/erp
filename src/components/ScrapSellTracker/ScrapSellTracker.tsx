import React, { useState } from 'react';
import { Plus, Calendar, Scale, IndianRupee, TrendingUp, Package } from 'lucide-react';
import { ScrapSale } from '../../types';
import ScrapSaleModal from './ScrapSaleModal';

const mockScrapSales: ScrapSale[] = [
  {
    id: '1',
    date: '2024-01-15',
    kgSold: 150,
    rate: 45,
    amountReceived: 5500,
    amountPending: 1250,
    totalAmount: 6750
  },
  {
    id: '2',
    date: '2024-01-10',
    kgSold: 200,
    rate: 42,
    amountReceived: 8400,
    amountPending: 0,
    totalAmount: 8400
  },
  {
    id: '3',
    date: '2024-01-05',
    kgSold: 75,
    rate: 48,
    amountReceived: 2000,
    amountPending: 1600,
    totalAmount: 3600
  },
  {
    id: '4',
    date: '2023-12-28',
    kgSold: 300,
    rate: 40,
    amountReceived: 12000,
    amountPending: 0,
    totalAmount: 12000
  }
];

export default function ScrapSellTracker() {
  const [scrapSales, setScrapSales] = useState<ScrapSale[]>(mockScrapSales);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<ScrapSale | null>(null);
  const [dateFilter, setDateFilter] = useState({ from: '', to: '' });

  const filteredSales = scrapSales.filter(sale => {
    const matchesDate = (!dateFilter.from || sale.date >= dateFilter.from) &&
                       (!dateFilter.to || sale.date <= dateFilter.to);
    return matchesDate;
  });

  const stats = {
    totalKgSold: filteredSales.reduce((sum, sale) => sum + sale.kgSold, 0),
    totalReceived: filteredSales.reduce((sum, sale) => sum + sale.amountReceived, 0),
    totalPending: filteredSales.reduce((sum, sale) => sum + sale.amountPending, 0),
    totalSales: filteredSales.length,
    avgRate: filteredSales.length > 0 
      ? filteredSales.reduce((sum, sale) => sum + sale.rate, 0) / filteredSales.length 
      : 0
  };

  const handleAddSale = () => {
    setEditingSale(null);
    setIsModalOpen(true);
  };

  const handleEditSale = (sale: ScrapSale) => {
    setEditingSale(sale);
    setIsModalOpen(true);
  };

  const handleSaveSale = (sale: ScrapSale) => {
    if (editingSale) {
      setScrapSales(scrapSales.map(s => s.id === sale.id ? sale : s));
    } else {
      setScrapSales([...scrapSales, { ...sale, id: Date.now().toString() }]);
    }
    setIsModalOpen(false);
    setEditingSale(null);
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
          onClick={handleAddSale}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>New Scrap Sale</span>
        </button>
      </div>

      {/* Stats Cards */}
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
              <p className="text-2xl font-bold text-purple-600">{stats.totalKgSold}</p>
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
              <p className="text-2xl font-bold text-teal-600">₹{stats.avgRate.toFixed(0)}/kg</p>
            </div>
            <TrendingUp className="h-8 w-8 text-teal-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date From
            </label>
            <input
              type="date"
              value={dateFilter.from}
              onChange={(e) => setDateFilter({ ...dateFilter, from: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date To
            </label>
            <input
              type="date"
              value={dateFilter.to}
              onChange={(e) => setDateFilter({ ...dateFilter, to: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Scrap Sales Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date of Sale
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  KG Sold
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rate (₹/kg)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount Received
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount Pending
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSales.map((sale) => (
                <tr 
                  key={sale.id} 
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleEditSale(sale)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(sale.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {sale.kgSold} kg
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{sale.rate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ₹{sale.totalAmount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                    ₹{sale.amountReceived.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600 font-medium">
                    ₹{sale.amountPending.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      sale.amountPending === 0
                        ? 'bg-green-100 text-green-800'
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {sale.amountPending === 0 ? 'Fully Paid' : 'Pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSales.length === 0 && (
          <div className="text-center py-12">
            <Scale className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No scrap sales</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by adding a new scrap sale.</p>
            <div className="mt-6">
              <button
                onClick={handleAddSale}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Scrap Sale
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Scrap Sale Modal */}
      <ScrapSaleModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSale(null);
        }}
        sale={editingSale}
        onSave={handleSaveSale}
      />
    </div>
  );
}