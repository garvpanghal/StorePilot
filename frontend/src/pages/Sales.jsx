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
  
  // Details and Delete states
  const [selectedSaleDetails, setSelectedSaleDetails] = useState(null);

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

  const openSaleDetails = async (sale) => {
    try {
      const fullSale = await salesAPI.get(sale.id);
      setSelectedSaleDetails(fullSale);
    } catch (err) {
      showToast(err.message || 'Failed to load sale details', 'error');
    }
  };

  const handleDeleteSale = async (id) => {
    if (!confirm('Are you sure you want to delete this sale? This action is permanent and will reverse the inventory changes for all products sold, adding them back into stock.')) return;
    try {
      await salesAPI.delete(id);
      showToast('Sale deleted successfully and inventory restored.', 'success');
      fetchSales();
    } catch (err) {
      showToast(err.message || 'Failed to delete sale', 'error');
    }
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
          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Date</th>
                  <th style={{ width: 80 }} />
                </tr>
              </thead>
              <tbody>
                {sales.map(s => (
                  <tr key={s.id}>
                    <td><strong>{s.invoice_number}</strong></td>
                    <td>{s.customer_name}</td>
                    <td>{s.item_count} items</td>
                    <td>₹{Number(s.total).toLocaleString('en-IN')}</td>
                    <td><span className={`badge ${s.payment_method === 'Cash' ? 'green' : s.payment_method === 'UPI' ? 'amber' : 'green'}`}>{s.payment_method}</span></td>
                    <td>{new Date(s.created_at).toLocaleString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <button className="secondary" onClick={() => openSaleDetails(s)} style={{ fontSize: '0.78rem', padding: '4px 8px', height: 'auto', borderRadius: '6px', cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text)' }}>Details</button>
                        <button className="rowBtn" onClick={() => handleDeleteSale(s.id)} style={{ color: 'var(--danger)', padding: 4 }} title="Delete Sale"><Trash size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {sales.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', color: 'var(--muted)', padding: 32 }}>
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
        </div>
      )}

      {showCreate && createPortal(
        <div className="modalBackdrop">
          <div className="modal" style={{ width: 'min(520px, 100%)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h2 style={{ margin: 0 }}>New Sale</h2>
              <button type="button" onClick={() => setShowCreate(false)} style={{ border: 0, background: 'transparent', color: 'var(--muted)', cursor: 'pointer', padding: 4 }}><X size={18} /></button>
            </div>
            {error && <div className="loginError" style={{ marginBottom: 12 }}>{error}</div>}
            <form onSubmit={handleCreate}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted)', display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12, textAlign: 'left' }}>
                Customer
                <input placeholder="Customer name" value={form.customer_name} onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))} style={{ margin: 0 }} />
              </label>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted)', display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16, textAlign: 'left' }}>
                Payment Method
                <select value={form.payment_method} onChange={e => setForm(f => ({ ...f, payment_method: e.target.value }))} style={{ margin: 0 }}>
                  <option>Cash</option>
                  <option>UPI</option>
                  <option>Card</option>
                </select>
              </label>
              
              <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '8px', textAlign: 'left' }}>Items</div>
              
              <div className="modalItemHeaders" style={{ fontWeight: 650, fontSize: '0.78rem', color: 'var(--muted)', marginBottom: 4, textAlign: 'left' }}>
                <div>Product</div>
                <div>Quantity</div>
                <div>Price (₹)</div>
                <div style={{ width: 28 }} />
              </div>

              {form.items.map((it, i) => (
                <div key={i} className="modalItemRow" style={{ marginBottom: 8 }}>
                  <select value={it.product_id} onChange={e => updateItem(i, 'product_id', e.target.value)} style={{ margin: 0 }} required>
                    <option value="">Select Product</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.current_stock} in stock)</option>)}
                  </select>
                  <input type="number" min="1" placeholder="Qty" value={it.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)} style={{ margin: 0, height: '42px' }} required />
                  <input type="number" placeholder="Price" value={it.unit_price} onChange={e => updateItem(i, 'unit_price', e.target.value)} style={{ margin: 0, height: '42px' }} required />
                  {form.items.length > 1 ? (
                    <button type="button" onClick={() => removeItem(i)} className="rowBtn" style={{ alignSelf: 'center', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '32px', width: '28px', fontSize: '1.25rem', color: 'var(--danger)', background: 'transparent', border: 0, cursor: 'pointer' }} title="Remove Item">×</button>
                  ) : (
                    <div style={{ width: 28 }} />
                  )}
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

      {selectedSaleDetails && createPortal(
        <div className="modalBackdrop">
          <div className="modal" style={{ width: 'min(480px, 100%)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ margin: 0 }}>Sale Details: {selectedSaleDetails.invoice_number}</h2>
              <button type="button" onClick={() => setSelectedSaleDetails(null)} style={{ border: 0, background: 'transparent', color: 'var(--muted)', cursor: 'pointer', padding: 4 }}><X size={18} /></button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, fontSize: '0.88rem', marginBottom: 20, textAlign: 'left' }}>
              <div>
                <div style={{ color: 'var(--muted)', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase' }}>Customer</div>
                <div style={{ fontWeight: 600, marginTop: 2 }}>{selectedSaleDetails.customer_name}</div>
              </div>
              <div>
                <div style={{ color: 'var(--muted)', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase' }}>Date</div>
                <div style={{ fontWeight: 600, marginTop: 2 }}>{new Date(selectedSaleDetails.created_at).toLocaleString()}</div>
              </div>
              <div>
                <div style={{ color: 'var(--muted)', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase' }}>Payment Method</div>
                <div style={{ fontWeight: 600, marginTop: 2 }}>{selectedSaleDetails.payment_method}</div>
              </div>
              <div>
                <div style={{ color: 'var(--muted)', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase' }}>Status</div>
                <div style={{ fontWeight: 600, marginTop: 2 }}><span className="badge green">{selectedSaleDetails.status}</span></div>
              </div>
            </div>

            <div style={{ fontWeight: 650, fontSize: '0.85rem', color: 'var(--muted)', borderBottom: '1px solid var(--border)', paddingBottom: 6, marginBottom: 10, textAlign: 'left' }}>Items Sold</div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20, maxHeight: '200px', overflowY: 'auto' }}>
              {selectedSaleDetails.items && selectedSaleDetails.items.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                  <div style={{ textAlign: 'left' }}>
                    <strong style={{ display: 'block', color: 'var(--text)' }}>{item.product_name || `Product #${item.product_id}`}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>₹{Number(item.unit_price).toLocaleString('en-IN')} × {item.quantity}</span>
                  </div>
                  <strong style={{ alignSelf: 'center' }}>₹{Number(item.subtotal).toLocaleString('en-IN')}</strong>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', fontWeight: 700, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
              <span>Total Amount</span>
              <span style={{ color: 'var(--primary)' }}>₹{Number(selectedSaleDetails.total).toLocaleString('en-IN')}</span>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '24px' }}>
              <button type="button" className="secondary" onClick={() => setSelectedSaleDetails(null)} style={{ flex: 1, height: '42px', border: '1px solid var(--border)', borderRadius: '10px', background: 'transparent', color: 'var(--text)', fontWeight: 600, cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
