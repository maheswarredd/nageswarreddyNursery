import React, { useState } from 'react';
import { BarChart3, Download, FileSpreadsheet, Loader2 } from 'lucide-react';
import api from '../../utils/api';

const AdminReports = () => {
  const [downloading, setDownloading] = useState(null);

  const handleExportCSV = async (type) => {
    try {
      setDownloading(type);
      const token = localStorage.getItem('nnp_token');
      const response = await fetch(`/api/reports/export-csv?type=${type}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to generate CSV export.');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nageswarreddy_${type}_report_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert(err.message || 'Export failed.');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold font-heading text-gray-900">
          Executive Reports & Data Export (CSV)
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Export full audit trails, sales records, customer lists, and live botanical inventory for accounting and reporting.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        
        {/* Orders Report */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-forest-100 text-forest-700 flex items-center justify-center">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-gray-900">Orders & Deliveries Report</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Includes Order ID, Customer details, District, PIN code, Order Status, Payment Method, and Total Amounts.
          </p>
          <button
            onClick={() => handleExportCSV('orders')}
            disabled={downloading === 'orders'}
            className="w-full py-2.5 px-4 bg-forest-700 hover:bg-forest-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
          >
            {downloading === 'orders' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>Export Orders CSV</span>
          </button>
        </div>

        {/* Plants Inventory */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-gray-900">Plant Inventory & Stock</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Complete inventory report with botanical variety names, category, unit prices, available stock, and Sold-Out statuses.
          </p>
          <button
            onClick={() => handleExportCSV('plants')}
            disabled={downloading === 'plants'}
            className="w-full py-2.5 px-4 bg-forest-700 hover:bg-forest-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
          >
            {downloading === 'plants' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>Export Plants Stock CSV</span>
          </button>
        </div>

        {/* UPI Payments */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-gray-900">UPI Payments & UTR Audit</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Record of all customer UPI transactions, UTR numbers, Payer names, Verification status, and submission dates.
          </p>
          <button
            onClick={() => handleExportCSV('payments')}
            disabled={downloading === 'payments'}
            className="w-full py-2.5 px-4 bg-forest-700 hover:bg-forest-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
          >
            {downloading === 'payments' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>Export Payments CSV</span>
          </button>
        </div>

        {/* Customers */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-gray-900">Customers Directory</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Export registered customers, email addresses, phone numbers, and account registration dates.
          </p>
          <button
            onClick={() => handleExportCSV('customers')}
            disabled={downloading === 'customers'}
            className="w-full py-2.5 px-4 bg-forest-700 hover:bg-forest-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
          >
            {downloading === 'customers' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>Export Customers CSV</span>
          </button>
        </div>

      </div>

    </div>
  );
};

export default AdminReports;
