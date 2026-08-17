import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ShoppingCart, Plus, X, Trash } from 'lucide-react';
import { salesAPI, productsAPI, customersAPI } from '../api/api';
import { useToast } from '../context/ToastContext';

export default function Sales() {
  const { showToast } = useToast();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({ customer_name: 'Walk-in Customer', payment_method: 'Cash', items: [{ product_id: '', quantity: 1, unit_price: '' }] });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchSales = () => {
    setLoading(true);
    salesAPI.list({ page_size: 100 }).then(d => setSales(d.items || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchSales(); }, []);

  useEffect(() => {
    if (!showCreate) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setShowCreate(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showCreate]);

  const openCreate = async () => {
    try {
      const [pd, cd] = await Promise.all([productsAPI.list({ page_size: 200 }), customersAPI.list()]);
      setProducts(pd.items || []);
      setCustomers(cd || []);
    } catch {}
    setForm({ customer_name: 'Walk-in Customer', payment_method: 'Cash', items: [{ product_id: '', quantity: 1, unit_price: '' }] });
    setError('');
    setShowCreate(true);
  };

  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { product_id: '', quantity: 1, unit_price: '' }] }));
  const removeItem = (i) => setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));

  const updateItem = (i, field, val) => {
    setForm(f => {
      const items = [...f.items];
      items[i] = { ...items[i], [field]: val };
      if (field === 'product_id') {
        const prod = products.find(p => p.id === Number(val));
        if (prod) items[i].unit_price = prod.selling_price;
      }
      return { ...f, items };
    });
  };

  const total = form.items.reduce((s, it) => s + (Number(it.quantity) * Number(it.unit_price || 0)), 0);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await salesAPI.create({
        customer_name: form.customer_name,
        payment_method: form.payment_method,
        items: form.items.filter(it => it.product_id).map(it => ({
          product_id: Number(it.product_id),
          quantity: Number(it.quantity),
          unit_price: Number(it.unit_price),
        })),
      });
      showToast('Sale recorded successfully.', 'success');
      setShowCreate(false);
      fetchSales();
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  };

  return (
    <div className="page">
      <div className="pageTop">
        <div>
          <div className="eyebrow">SALES MANAGEMENT</div>
          <h1 className="pageTitle">Sales</h1>
          <p className="pageDesc">Track transactions, revenue and sales performance.</p>
        </div>
        <button className="primary" onClick={openCreate}><Plus size={16} />New Sale</button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="skeleton skeletonRow"></div>
          <div className="skeleton skeletonRow"></div>
          <div className="skeleton skeletonRow"></div>
          <div className="skeleton skeletonRow"></div>
        </div>
      ) : (
        <div className="panel productTable">
          <table>
            <thead><tr><th>Invoice</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Date</th></tr></thead>
            <tbody>
              {sales.map(s => (
                <tr key={s.id}>
                  <td><strong>{s.invoice_number}</strong></td>
                  <td>{s.customer_name}</td>
                  <td>{s.item_count}</td>
                  <td>₹{Number(s.total).toLocaleString('en-IN')}</td>
                  <td><span className={`badge ${s.payment_method === 'Cash' ? 'green' : s.payment_method === 'UPI' ? 'amber' : 'green'}`}>{s.payment_method}</span></td>
                  <td>{new Date(s.created_at).toLocaleString()}</td>
                </tr>
              ))}
              {sales.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--muted)', padding: 32 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                      <ShoppingCart size={32} style={{ stroke: 'var(--muted)', opacity: 0.5 }} />
                      <span>No sales recorded yet. Use the action button above to record your first sale.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && createPortal(
        <div className="modalBackdrop">
          <div className="modal" style={{ maxWidth: 520 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h2 style={{ margin: 0 }}>New Sale</h2>
              <button type="button" onClick={() => setShowCreate(false)} style={{ border: 0, background: 'transparent', color: 'var(--muted)', cursor: 'pointer', padding: 4 }}><X size={18} /></button>
            </div>
            {error && <div className="loginError" style={{ marginBottom: 12 }}>{error}</div>}
            <form onSubmit={handleCreate}>
              <input placeholder="Customer name" value={form.customer_name} onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))} />
              <select value={form.payment_method} onChange={e => setForm(f => ({ ...f, payment_method: e.target.value }))}>
                <option>Cash</option><option>UPI</option><option>Card</option>
              </select>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', margin: '12px 0 8px' }}>Items</div>
              {form.items.map((it, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 8, marginBottom: 8 }}>
                  <select value={it.product_id} onChange={e => updateItem(i, 'product_id', e.target.value)} required>
                    <option value="">Select Product</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.current_stock} in stock)</option>)}
                  </select>
                  <input type="number" min="1" placeholder="Qty" value={it.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)} required />
                  <input type="number" placeholder="Price" value={it.unit_price} onChange={e => updateItem(i, 'unit_price', e.target.value)} required />
                  {form.items.length > 1 && <button type="button" onClick={() => removeItem(i)} className="rowBtn" style={{ alignSelf: 'center' }}>×</button>}
                </div>
              ))}
              <button type="button" onClick={addItem} style={{ background: 'none', border: '1px dashed var(--border)', borderRadius: 8, padding: '8px 14px', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.82rem', width: '100%', marginBottom: 12 }}>+ Add Item</button>
              <div style={{ textAlign: 'right', fontWeight: 700, fontSize: '1.1rem', margin: '12px 0' }}>Total: ₹{total.toLocaleString('en-IN')}</div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <button type="button" className="secondary" onClick={() => setShowCreate(false)} style={{ flex: 1, height: '42px', border: '1px solid var(--border)', borderRadius: '10px', background: 'transparent', color: 'var(--text)', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button className="primary" type="submit" disabled={saving} style={{ flex: 1, height: '42px', marginTop: 0 }}>{saving ? 'Processing...' : 'Complete Sale'}</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
