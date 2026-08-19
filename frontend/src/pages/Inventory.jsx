import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Boxes, AlertTriangle, ArrowDown, ArrowUp, RefreshCw, X } from 'lucide-react';
import { inventoryAPI, productsAPI } from '../api/api';
import { useToast } from '../context/ToastContext';

export default function Inventory() {
  const { showToast } = useToast();
  const [overview, setOverview] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [history, setHistory] = useState([]);
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [showAdjust, setShowAdjust] = useState(false);
  const [products, setProducts] = useState([]);
  const [adjForm, setAdjForm] = useState({ product_id: '', quantity: '', notes: '' });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ov, ls, hist, prodData] = await Promise.all([
        inventoryAPI.overview(),
        inventoryAPI.lowStock(),
        inventoryAPI.history(),
        productsAPI.list({ page_size: 200 })
      ]);
      setOverview(ov);
      setLowStock(ls);
      setHistory(hist);
      setProducts(prodData.items || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (!showAdjust) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setShowAdjust(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAdjust]);

  const openAdjust = async () => {
    try { const d = await productsAPI.list({ page_size: 200 }); setProducts(d.items || []); } catch {}
    setShowAdjust(true);
  };

  const handleAdjust = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await inventoryAPI.adjust({ product_id: Number(adjForm.product_id), quantity: Number(adjForm.quantity), notes: adjForm.notes });
      showToast('Stock adjusted successfully.', 'success');
      setShowAdjust(false);
      setAdjForm({ product_id: '', quantity: '', notes: '' });
      fetchData();
    } catch (err) {
      showToast(err.message || 'Failed to adjust stock', 'error');
    }
    setSaving(false);
  };

  if (loading && !overview) {
    return (
      <div className="page">
        <div className="pageTop">
          <div>
            <div className="eyebrow skeleton" style={{ width: 80, height: 12 }}></div>
            <h1 className="pageTitle skeleton" style={{ width: 180, height: 32, display: 'block', marginTop: 8 }}></h1>
            <p className="pageDesc skeleton" style={{ width: 280, height: 16, display: 'block', marginTop: 8 }}></p>
          </div>
          <div className="skeleton" style={{ width: 130, height: 40, borderRadius: 10 }}></div>
        </div>

        <div className="stats" style={{ marginTop: 20 }}>
          <div className="skeleton skeletonKpi"></div>
          <div className="skeleton skeletonKpi"></div>
          <div className="skeleton skeletonKpi"></div>
        </div>

        <div className="skeleton skeletonChart" style={{ marginTop: 20 }}></div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="pageTop">
        <div>
          <div className="eyebrow">STOCK CONTROL</div>
          <h1 className="pageTitle">Inventory</h1>
          <p className="pageDesc">Monitor stock levels, reorder points and inventory health.</p>
        </div>
        <button className="primary" onClick={openAdjust}><RefreshCw size={16} />Adjust Stock</button>
      </div>

      {overview && (
        <div className="stats">
          {[
            ['Total Products', overview.total_products, Boxes],
            ['Stock Value', `₹${overview.total_stock_value.toLocaleString('en-IN')}`, Boxes],
            ['Healthy', overview.healthy_count, Boxes],
            ['Low Stock', overview.low_stock_count, AlertTriangle],
            ['Critical', overview.critical_stock_count, AlertTriangle],
            ['Out of Stock', overview.out_of_stock_count, AlertTriangle],
          ].map(([label, val, Icon]) => (
            <div className="panel stat" key={label}>
              <div className="statTop"><span className="statIcon"><Icon size={19} /></span></div>
              <strong>{val}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
      )}

      <div className="panel productToolbar" style={{ gap: 0 }}>
        {['overview', 'low-stock', 'history'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '10px 18px', border: 'none', background: tab === t ? 'var(--primary-soft)' : 'transparent', color: tab === t ? 'var(--primary)' : 'var(--muted)', fontWeight: 600, borderRadius: 8, cursor: 'pointer', fontSize: '0.85rem' }}>
            {t === 'overview' ? 'All Products' : t === 'low-stock' ? `Low Stock (${lowStock.length})` : 'Transaction History'}
          </button>
        ))}
      </div>

      {tab === 'low-stock' && (
        <div className="panel productTable">
          <div className="tableWrap">
            <table>
              <thead><tr><th>Product</th><th>SKU</th><th>Category</th><th>Stock</th><th>Reorder Level</th><th>Status</th></tr></thead>
              <tbody>
                {lowStock.map(p => (
                  <tr key={p.id}>
                    <td><strong>{p.name}</strong></td>
                    <td>{p.sku}</td>
                    <td>{p.category_name || '—'}</td>
                    <td>{p.current_stock}</td>
                    <td>{p.reorder_level}</td>
                    <td><span className={`badge ${p.stock_status === 'Critical' || p.stock_status === 'Out of Stock' ? 'red' : 'amber'}`}>{p.stock_status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'history' && (
        <div className="panel productTable">
          <div className="tableWrap">
            <table>
              <thead><tr><th>Date</th><th>Product</th><th>Type</th><th>Qty</th><th>Reference</th><th>Notes</th></tr></thead>
              <tbody>
                {history.slice(0, 100).map(t => (
                  <tr key={t.id}>
                    <td>{new Date(t.created_at).toLocaleString()}</td>
                    <td>{t.product_name}</td>
                    <td><span className={`badge ${t.transaction_type === 'stock_in' ? 'green' : t.transaction_type === 'stock_out' ? 'red' : 'amber'}`}>
                      {t.transaction_type === 'stock_in' ? '↑ Stock In' : t.transaction_type === 'stock_out' ? '↓ Stock Out' : '⟳ Adjustment'}
                    </span></td>
                    <td>{t.quantity}</td>
                    <td>{t.reference_type || '—'}</td>
                    <td>{t.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'overview' && (
        <div className="panel productTable">
          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Stock</th>
                  <th>Reorder Level</th>
                  <th>Status</th>
                  <th>Stock Value</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}>
                    <td><strong>{p.name}</strong></td>
                    <td>{p.sku}</td>
                    <td>{p.category_name || '—'}</td>
                    <td>{p.current_stock}</td>
                    <td>{p.reorder_level}</td>
                    <td>
                      <span className={`badge ${p.stock_status === 'Critical' || p.stock_status === 'Out of Stock' ? 'red' : p.stock_status === 'Low Stock' ? 'amber' : 'green'}`}>
                        {p.stock_status}
                      </span>
                    </td>
                    <td>₹{(p.current_stock * p.cost_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', color: 'var(--muted)', padding: 32 }}>
                      No products found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showAdjust && createPortal(
        <div className="modalBackdrop">
          <div className="modal">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h2 style={{ margin: 0 }}>Adjust Stock</h2>
              <button type="button" onClick={() => setShowAdjust(false)} style={{ border: 0, background: 'transparent', color: 'var(--muted)', cursor: 'pointer', padding: 4 }}><X size={18} /></button>
            </div>
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: -6 }}>Positive number = increase, negative = decrease</p>
            <form onSubmit={handleAdjust}>
              <select value={adjForm.product_id} onChange={e => setAdjForm(f => ({ ...f, product_id: e.target.value }))} required>
                <option value="">Select Product</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.current_stock})</option>)}
              </select>
              <input type="number" placeholder="Quantity (+/-)" value={adjForm.quantity} onChange={e => setAdjForm(f => ({ ...f, quantity: e.target.value }))} required />
              <input placeholder="Notes (optional)" value={adjForm.notes} onChange={e => setAdjForm(f => ({ ...f, notes: e.target.value }))} />
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <button type="button" className="secondary" onClick={() => setShowAdjust(false)} style={{ flex: 1, height: '42px', border: '1px solid var(--border)', borderRadius: '10px', background: 'transparent', color: 'var(--text)', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button className="primary" type="submit" disabled={saving} style={{ flex: 1, height: '42px', marginTop: 0 }}>{saving ? 'Saving...' : 'Apply Adjustment'}</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
