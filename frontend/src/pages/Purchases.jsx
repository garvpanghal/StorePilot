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
  const [form, setForm] = useState({ supplier_id: '', notes: '', items: [{ product_id: '', quantity: 1, unit_cost: '' }] });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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
            <thead><tr><th>ID</th><th>Supplier</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {purchases.map(p => (
                <tr key={p.id}>
                  <td><strong>PO-{p.id}</strong></td>
                  <td>{p.supplier_name || '—'}</td>
                  <td>{p.item_count}</td>
                  <td>₹{Number(p.total).toLocaleString('en-IN')}</td>
                  <td><span className="badge green">{p.status}</span></td>
                  <td>{new Date(p.created_at).toLocaleString()}</td>
                </tr>
              ))}
              {purchases.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--muted)', padding: 32 }}>
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
          <div className="modal" style={{ maxWidth: 520 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h2 style={{ margin: 0 }}>New Purchase Order</h2>
              <button type="button" onClick={() => setShowCreate(false)} style={{ border: 0, background: 'transparent', color: 'var(--muted)', cursor: 'pointer', padding: 4 }}><X size={18} /></button>
            </div>
            {error && <div className="loginError" style={{ marginBottom: 12 }}>{error}</div>}
            <form onSubmit={handleCreate}>
              <select value={form.supplier_id} onChange={e => setForm(f => ({ ...f, supplier_id: e.target.value }))} required>
                <option value="">Select Supplier</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', margin: '12px 0 8px' }}>Items</div>
              {form.items.map((it, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 8, marginBottom: 8 }}>
                  <select value={it.product_id} onChange={e => updateItem(i, 'product_id', e.target.value)} required>
                    <option value="">Select Product</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <input type="number" min="1" placeholder="Qty" value={it.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)} required />
                  <input type="number" placeholder="Cost" value={it.unit_cost} onChange={e => updateItem(i, 'unit_cost', e.target.value)} required />
                  {form.items.length > 1 && <button type="button" onClick={() => removeItem(i)} className="rowBtn" style={{ alignSelf: 'center' }}>×</button>}
                </div>
              ))}
              <button type="button" onClick={addItem} style={{ background: 'none', border: '1px dashed var(--border)', borderRadius: 8, padding: '8px 14px', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.82rem', width: '100%', marginBottom: 12 }}>+ Add Item</button>
              <input placeholder="Notes (optional)" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
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
    </div>
  );
}
