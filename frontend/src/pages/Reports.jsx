import React, { useState, useEffect } from 'react';
import { BarChart3, Download, Calendar } from 'lucide-react';
import { reportsAPI } from '../api/api';
import { useToast } from '../context/ToastContext';

const REPORTS = [
  { id: 'sales', title: 'Sales Report', method: reportsAPI.sales },
  { id: 'products', title: 'Product Performance', method: reportsAPI.products },
  { id: 'inventory', title: 'Inventory Health', method: reportsAPI.inventory, noDates: true },
  { id: 'purchases', title: 'Purchase Orders', method: reportsAPI.purchases },
  { id: 'profit', title: 'Profit & Loss', method: reportsAPI.profit },
];

const isMonetary = (keyOrCol, val) => {
  if (typeof val !== 'number') return false;
  const name = keyOrCol.toLowerCase();
  
  // Explicitly non-monetary metrics
  if (
    name.includes('count') || 
    name.includes('quantity') || 
    name.includes('items') || 
    name.includes('units') || 
    name.includes('margin') || 
    name.includes('pages') || 
    name.includes('id') || 
    name.includes('sku') || 
    name.includes('reorder') || 
    name.includes('products') || 
    name.includes('purchases') || 
    name.includes('sales') ||
    (name.includes('stock') && !name.includes('value') && !name.includes('price'))
  ) {
    return false;
  }
  
  // Explicitly monetary metrics
  return (
    name.includes('₹') ||
    name.includes('price') ||
    name.includes('value') ||
    name.includes('total') ||
    name.includes('revenue') ||
    name.includes('cost') ||
    name.includes('profit') ||
    name.includes('spent')
  );
};

const formatValue = (keyOrCol, val) => {
  if (typeof val !== 'number') return val?.toString() || '—';
  
  const name = keyOrCol.toLowerCase();
  
  // 1. Currency formatting
  if (isMonetary(keyOrCol, val)) {
    return `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  
  // 2. Quantity/Units formatting
  if (
    name.includes('stock') || 
    name.includes('units') || 
    name.includes('quantity')
  ) {
    return `${val.toLocaleString()} units`;
  }
  
  // 3. Margin formatting (percentages)
  if (name.includes('margin')) {
    return `${val.toLocaleString()}%`;
  }
  
  // 4. Counts / Numbers
  return val.toLocaleString();
};

export default function Reports() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('sales');
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [error, setError] = useState('');

  const currentReport = REPORTS.find(r => r.id === activeTab);

  const fetchReport = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (dateFrom && !currentReport.noDates) params.date_from = dateFrom;
      if (dateTo && !currentReport.noDates) params.date_to = dateTo;
      
      const data = await currentReport.method(params);
      setReportData(data);
    } catch (err) {
      setError(err.message || 'Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [activeTab]);

  const handleApplyDates = (e) => {
    e.preventDefault();
    fetchReport();
  };

  const handleExportCSV = () => {
    if (!reportData || !reportData.rows.length) return;
    
    // Build CSV Content
    const headers = reportData.columns.join(',');
    const rows = reportData.rows.map(row => 
      reportData.columns.map(col => {
        const val = Object.values(row)[reportData.columns.indexOf(col)];
        const cleanVal = typeof val === 'string' && val.includes(',') ? `"${val}"` : val;
        return cleanVal ?? '';
      }).join(',')
    );
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${currentReport.id}_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Report exported to CSV successfully.', 'success');
  };

  return (
    <div className="page">
      <div className="pageTop">
        <div>
          <div className="eyebrow">BUSINESS REPORTING</div>
          <h1 className="pageTitle">Reports</h1>
          <p className="pageDesc">Explore sales, profit, category and inventory reports.</p>
        </div>
        {reportData && reportData.rows && reportData.rows.length > 0 && (
          <button className="primary" onClick={handleExportCSV}>
            <Download size={16} /> Export CSV
          </button>
        )}
      </div>

      <div className="panel productToolbar" style={{ gap: '10px' }}>
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', flex: 1 }}>
          {REPORTS.map(r => (
            <button
              key={r.id}
              onClick={() => setActiveTab(r.id)}
              style={{
                padding: '10px 16px',
                border: 'none',
                background: activeTab === r.id ? 'var(--primary-soft)' : 'transparent',
                color: activeTab === r.id ? 'var(--primary)' : 'var(--muted)',
                fontWeight: 600,
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: '0.85rem'
              }}
            >
              {r.title}
            </button>
          ))}
        </div>

        {!currentReport.noDates && (
          <form onSubmit={handleApplyDates} style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
              <input
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                style={{
                  height: '36px',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '0 8px',
                  background: 'var(--surface)',
                  color: 'var(--text)',
                  fontSize: '0.8rem'
                }}
              />
              <span style={{ color: 'var(--muted)' }}>to</span>
              <input
                type="date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                style={{
                  height: '36px',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '0 8px',
                  background: 'var(--surface)',
                  color: 'var(--text)',
                  fontSize: '0.8rem'
                }}
              />
            </div>
            <button
              type="submit"
              style={{
                height: '36px',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '0 12px',
                background: 'var(--surface2)',
                color: 'var(--text)',
                fontWeight: '600',
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              Filter
            </button>
          </form>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="skeleton skeletonRow"></div>
          <div className="skeleton skeletonRow"></div>
          <div className="skeleton skeletonRow"></div>
          <div className="skeleton skeletonRow"></div>
          <div className="skeleton skeletonRow"></div>
        </div>
      ) : error ? (
        <div className="panel" style={{ padding: 48, textAlign: 'center', color: 'var(--danger)' }}>{error}</div>
      ) : !reportData || !reportData.rows || reportData.rows.length === 0 ? (
        <div className="panel placeholder">
          <div className="placeholderIcon"><BarChart3 size={28} /></div>
          <h2>No report data available</h2>
          <p>We couldn't find any transaction or catalog logs matching the selected dates. Try choosing a different range or active report categories.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap)' }}>
          {/* Aggregated Summaries if present */}
          {reportData.summary && Object.keys(reportData.summary).length > 0 && (
            <div style={{ display: 'flex', gap: 'var(--gap)', flexWrap: 'wrap' }}>
              {Object.entries(reportData.summary).map(([key, val]) => (
                <div className="panel" key={key} style={{ padding: '16px 20px', flex: '1 1 200px' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>
                    {key.replace(/_/g, ' ')}
                  </div>
                  <strong style={{ fontSize: '1.4rem', fontWeight: '700', marginTop: '6px', display: 'block' }}>
                    {formatValue(key, val)}
                  </strong>
                </div>
              ))}
            </div>
          )}

          {/* Tabular data */}
          <div className="panel productTable">
            <table>
              <thead>
                <tr>
                  {reportData.columns.map((col, idx) => (
                    <th key={idx}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reportData.rows.map((row, rowIdx) => (
                  <tr key={rowIdx}>
                    {/* Access object properties in order */}
                    {Object.values(row).map((val, colIdx) => (
                      <td key={colIdx}>
                        {formatValue(reportData.columns[colIdx], val)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
