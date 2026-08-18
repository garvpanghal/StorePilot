import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Truck, Plus, X } from 'lucide-react';
import { purchasesAPI, productsAPI, suppliersAPI } from '../api/api';
import { useToast } from '../context/ToastContext';

export default function Purchases() {
  const { showToast } = useToast();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState({ supplier_id: '', notes: '', items: [{ product_id: '', quantity: 10, unit_cost: '' }] });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Details and Delete states
  const [selectedPurchaseDetails, setSelectedPurchaseDetails] = useState(null);

  const fetchPurchases = () => {
    setLoading(true);
    purchasesAPI.list({ page_size: 100 }).then(d => setPurchases(d.items || [])).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { fetchPurchases(); }, []);

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
      const [pd, sd] = await Promise.all([productsAPI.list({ page_size: 200 }), suppliersAPI.list()]);
      setProducts(pd.items || []);
      setSuppliers(sd || []);
    } catch {}
    setForm({ supplier_id: '', notes: '', items: [{ product_id: '', quantity: 10, unit_cost: '' }] });
    setError('');
    setShowCreate(true);
  };

  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { product_id: '', quantity: 10, unit_cost: '' }] }));
  const removeItem = (i) => setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));
  const updateItem = (i, field, val) => {
    setForm(f => {
      const items = [...f.items];
      items[i] = { ...items[i], [field]: val };
      if (field === 'product_id') {
        const prod = products.find(p => p.id === Number(val));
        if (prod) items[i].unit_cost = prod.cost_price;
      }
      return { ...f, items };
    });
  };

  const total = form.items.reduce((s, it) => s + (Number(it.quantity) * Number(it.unit_cost || 0)), 0);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await purchasesAPI.create({
        supplier_id: Number(form.supplier_id),
        notes: form.notes,
        items: form.items.filter(it => it.product_id).map(it => ({
          product_id: Number(it.product_id),
          quantity: Number(it.quantity),
          unit_cost: Number(it.unit_cost),
        })),
      });
      showToast('Purchase recorded successfully.', 'success');
      setShowCreate(false);
      fetchPurchases();
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  };

  const openPurchaseDetails = async (purchase) => {
    try {
      const fullPurchase = await purchasesAPI.get(purchase.id);
      setSelectedPurchaseDetails(fullPurchase);
    } catch (err) {
      showToast(err.message || 'Failed to load purchase details', 'error');
    }
  };

  const handleDeletePurchase = async (id) => {
    if (!confirm('Are you sure you want to delete this purchase? This action is permanent and will reverse the inventory changes, subtracting the purchased items from stock.')) return;
    try {
      await purchasesAPI.delete(id);
      showToast('Purchase deleted successfully and inventory restored.', 'success');
      fetchPurchases();
    } catch (err) {
      showToast(err.message || 'Failed to delete purchase', 'error');
    }
  };

  return (
    <div className="page">
      <div className="pageTop">
        <div>
          <div className="eyebrow">PROCUREMENT</div>
          <h1 className="pageTitle">Purchases</h1>
          <p className="pageDesc">Manage purchase orders and supplier activity.</p>
        </div>
        <button className="primary" onClick={openCreate}><Plus size={16} />New Purchase</button>
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
            <thead>
              <tr>
                <th>ID</th>
                <th>Supplier</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th style={{ width: 80 }} />
              </tr>
            </thead>
            <tbody>
              {purchases.map(p => (
                <tr key={p.id}>
                  <td><strong>PO-{p.id}</strong></td>
                  <td>{p.supplier_name || '—'}</td>
                  <td>{p.item_count} items</td>
                  <td>₹{Number(p.total).toLocaleString('en-IN')}</td>
                  <td><span className="badge green">{p.status}</span></td>
                  <td>{new Date(p.created_at).toLocaleString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <button className="secondary" onClick={() => openPurchaseDetails(p)} style={{ fontSize: '0.78rem', padding: '4px 8px', height: 'auto', borderRadius: '6px', cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text)' }}>Details</button>
                      <button className="rowBtn" onClick={() => handleDeletePurchase(p.id)} style={{ color: 'var(--danger)', padding: 4 }} title="Delete Purchase"><X size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {purchases.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: 'var(--muted)', padding: 32 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                      <Truck size={32} style={{ stroke: 'var(--muted)', opacity: 0.5 }} />
                      <span>No purchases recorded yet. Start recording purchase orders above.</span>
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
          <div className="modal" style={{ width: '520px', maxWidth: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h2 style={{ margin: 0 }}>New Purchase Order</h2>
              <button type="button" onClick={() => setShowCreate(false)} style={{ border: 0, background: 'transparent', color: 'var(--muted)', cursor: 'pointer', padding: 4 }}><X size={18} /></button>
            </div>
            {error && <div className="loginError" style={{ marginBottom: 12 }}>{error}</div>}
            <form onSubmit={handleCreate}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted)', display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12, textAlign: 'left' }}>
                Supplier
                <select value={form.supplier_id} onChange={e => setForm(f => ({ ...f, supplier_id: e.target.value }))} style={{ margin: 0 }} required>
                  <option value="">Select Supplier</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </label>

              <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '8px', textAlign: 'left' }}>Items</div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 8, fontWeight: 650, fontSize: '0.78rem', color: 'var(--muted)', marginBottom: 4, textAlign: 'left' }}>
                <div>Product</div>
                <div>Quantity</div>
                <div>Cost (₹)</div>
                <div style={{ width: 28 }} />
              </div>

              {form.items.map((it, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                  <select value={it.product_id} onChange={e => updateItem(i, 'product_id', e.target.value)} style={{ margin: 0 }} required>
                    <option value="">Select Product</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <input type="number" min="1" placeholder="Qty" value={it.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)} style={{ margin: 0, height: '42px' }} required />
                  <input type="number" placeholder="Cost" value={it.unit_cost} onChange={e => updateItem(i, 'unit_cost', e.target.value)} style={{ margin: 0, height: '42px' }} required />
                  {form.items.length > 1 ? (
                    <button type="button" onClick={() => removeItem(i)} className="rowBtn" style={{ alignSelf: 'center', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '32px', width: '28px', fontSize: '1.25rem', color: 'var(--danger)', background: 'transparent', border: 0, cursor: 'pointer' }} title="Remove Item">×</button>
                  ) : (
                    <div style={{ width: 28 }} />
                  )}
                </div>
              ))}

              <button type="button" onClick={addItem} style={{ background: 'none', border: '1px dashed var(--border)', borderRadius: 8, padding: '8px 14px', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.82rem', width: '100%', marginBottom: 12 }}>+ Add Item</button>
              
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted)', display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12, textAlign: 'left' }}>
                Notes
                <input placeholder="Notes (optional)" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={{ margin: 0 }} />
              </label>

              <div style={{ textAlign: 'right', fontWeight: 700, fontSize: '1.1rem', margin: '12px 0' }}>Total: ₹{total.toLocaleString('en-IN')}</div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <button type="button" className="secondary" onClick={() => setShowCreate(false)} style={{ flex: 1, height: '42px', border: '1px solid var(--border)', borderRadius: '10px', background: 'transparent', color: 'var(--text)', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button className="primary" type="submit" disabled={saving} style={{ flex: 1, height: '42px', marginTop: 0 }}>{saving ? 'Processing...' : 'Complete Purchase'}</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {selectedPurchaseDetails && createPortal(
        <div className="modalBackdrop">
          <div className="modal" style={{ width: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ margin: 0 }}>Purchase Details: PO-{selectedPurchaseDetails.id}</h2>
              <button type="button" onClick={() => setSelectedPurchaseDetails(null)} style={{ border: 0, background: 'transparent', color: 'var(--muted)', cursor: 'pointer', padding: 4 }}><X size={18} /></button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, fontSize: '0.88rem', marginBottom: 20, textAlign: 'left' }}>
              <div>
                <div style={{ color: 'var(--muted)', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase' }}>Supplier</div>
                <div style={{ fontWeight: 600, marginTop: 2 }}>{selectedPurchaseDetails.supplier_name || '—'}</div>
              </div>
              <div>
                <div style={{ color: 'var(--muted)', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase' }}>Date</div>
                <div style={{ fontWeight: 600, marginTop: 2 }}>{new Date(selectedPurchaseDetails.created_at).toLocaleString()}</div>
              </div>
              <div>
                <div style={{ color: 'var(--muted)', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase' }}>Status</div>
                <div style={{ fontWeight: 600, marginTop: 2 }}><span className="badge green">{selectedPurchaseDetails.status}</span></div>
              </div>
              {selectedPurchaseDetails.notes && (
                <div style={{ gridColumn: 'span 2' }}>
                  <div style={{ color: 'var(--muted)', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase' }}>Notes</div>
                  <div style={{ fontWeight: 400, marginTop: 2 }}>{selectedPurchaseDetails.notes}</div>
                </div>
              )}
            </div>

            <div style={{ fontWeight: 650, fontSize: '0.85rem', color: 'var(--muted)', borderBottom: '1px solid var(--border)', paddingBottom: 6, marginBottom: 10, textAlign: 'left' }}>Items Purchased</div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20, maxHeight: '200px', overflowY: 'auto' }}>
              {selectedPurchaseDetails.items && selectedPurchaseDetails.items.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                  <div style={{ textAlign: 'left' }}>
                    <strong style={{ display: 'block', color: 'var(--text)' }}>{item.product_name || `Product #${item.product_id}`}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>₹{Number(item.unit_cost).toLocaleString('en-IN')} × {item.quantity}</span>
                  </div>
                  <strong style={{ alignSelf: 'center' }}>₹{Number(item.subtotal).toLocaleString('en-IN')}</strong>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', fontWeight: 700, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
              <span>Total Amount</span>
              <span style={{ color: 'var(--primary)' }}>₹{Number(selectedPurchaseDetails.total).toLocaleString('en-IN')}</span>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '24px' }}>
              <button type="button" className="secondary" onClick={() => setSelectedPurchaseDetails(null)} style={{ flex: 1, height: '42px', border: '1px solid var(--border)', borderRadius: '10px', background: 'transparent', color: 'var(--text)', fontWeight: 600, cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
