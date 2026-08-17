import React, { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Search, Plus, LayoutGrid, List, Trash2, Edit3, Package, X } from 'lucide-react';
import { productsAPI, categoriesAPI } from '../api/api';
import { useToast } from '../context/ToastContext';

export default function Products() {
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [view, setView] = useState('table');
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: '', sku: '', category_id: '', supplier_id: '', selling_price: '', cost_price: '', current_stock: '', reorder_level: '10', description: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = { search: q, page_size: 200 };
      if (catFilter) params.category_id = catFilter;
      if (statusFilter) params.status = statusFilter;
      const data = await productsAPI.list(params);
      setItems(data.items || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, [q, catFilter, statusFilter]);
  useEffect(() => { categoriesAPI.list().then(setCategories).catch(() => {}); }, []);

  useEffect(() => {
    if (!showAdd) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setShowAdd(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAdd]);

  const openAdd = () => {
    setEditItem(null);
    setForm({ name: '', sku: '', category_id: '', supplier_id: '', selling_price: '', cost_price: '', current_stock: '0', reorder_level: '10', description: '' });
    setShowAdd(true);
    setError('');
  };

  const openEdit = (p) => {
    setEditItem(p);
    setForm({ name: p.name, sku: p.sku, category_id: p.category_id || '', supplier_id: p.supplier_id || '', selling_price: p.selling_price, cost_price: p.cost_price, current_stock: p.current_stock, reorder_level: p.reorder_level, description: p.description || '' });
    setShowAdd(true);
    setError('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const data = {
        name: form.name,
        sku: form.sku,
        category_id: form.category_id ? Number(form.category_id) : null,
        supplier_id: form.supplier_id ? Number(form.supplier_id) : null,
        selling_price: Number(form.selling_price),
        cost_price: Number(form.cost_price),
        current_stock: Number(form.current_stock),
        reorder_level: Number(form.reorder_level),
        description: form.description,
      };
      if (editItem) {
        await productsAPI.update(editItem.id, data);
        showToast('Product updated successfully.', 'success');
      } else {
        await productsAPI.create(data);
        showToast('Product created successfully.', 'success');
      }
      setShowAdd(false);
      fetchProducts();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await productsAPI.delete(id);
      if (res && res.action === 'archived') {
        showToast('Product has transaction history and was archived instead.', 'warning');
      } else {
        showToast('Product deleted successfully.', 'success');
      }
      fetchProducts();
    } catch (err) {
      showToast(err.message || 'Failed to delete product', 'error');
    }
  };

  return (
    <div className="page">
      <div className="pageTop">
        <div>
          <div className="eyebrow">CATALOG</div>
          <h1 className="pageTitle">Products</h1>
          <p className="pageDesc">Manage your products, stock and pricing.</p>
        </div>
        <button className="primary" onClick={openAdd}><Plus size={16} />Add Product</button>
      </div>

      <div className="panel productToolbar">
        <div className="productSearch">
          <Search size={15} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search products..." />
        </div>
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="filterSelect">
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="filterSelect">
          <option value="">All Status</option>
          <option value="In Stock">In Stock</option>
          <option value="Low Stock">Low Stock</option>
          <option value="Critical">Critical</option>
          <option value="Out of Stock">Out of Stock</option>
        </select>
        <div className="viewToggle">
          <button className={view === 'table' ? 'selected' : ''} onClick={() => setView('table')}><List size={16} /></button>
          <button className={view === 'grid' ? 'selected' : ''} onClick={() => setView('grid')}><LayoutGrid size={16} /></button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="skeleton skeletonRow"></div>
          <div className="skeleton skeletonRow"></div>
          <div className="skeleton skeletonRow"></div>
          <div className="skeleton skeletonRow"></div>
          <div className="skeleton skeletonRow"></div>
        </div>
      ) : items.length === 0 ? (
        <div className="panel placeholder">
          <div className="placeholderIcon"><Package size={28} /></div>
          <h2>No products found</h2>
          <p>
            {q || catFilter || statusFilter 
              ? "We couldn't find any products matching your active filters. Try adjusting your search query or filters."
              : "Start building your store inventory catalog by adding your first retail product."}
          </p>
          {!q && !catFilter && !statusFilter && (
            <button className="primary" onClick={openAdd} style={{ marginTop: 14 }}><Plus size={16} />Add First Product</button>
          )}
        </div>
      ) : view === 'table' ? (
        <div className="panel productTable">
          <table>
            <thead>
              <tr><th>Product</th><th>Category</th><th>Price</th><th>Cost</th><th>Stock</th><th>Status</th><th /></tr>
            </thead>
            <tbody>
              {items.map(p => (
                <tr key={p.id}>
                  <td><span className="productName"><span className="productIcon"><Package size={15} /></span>{p.name}</span></td>
                  <td>{p.category_name || '—'}</td>
                  <td>₹{Number(p.selling_price).toLocaleString('en-IN')}</td>
                  <td>₹{Number(p.cost_price).toLocaleString('en-IN')}</td>
                  <td>{p.current_stock}</td>
                  <td><span className={`badge ${p.stock_status === 'Critical' || p.stock_status === 'Out of Stock' ? 'red' : p.stock_status === 'Low Stock' ? 'amber' : 'green'}`}>{p.stock_status}</span></td>
                  <td>
                    <button className="rowBtn" onClick={() => openEdit(p)} title="Edit"><Edit3 size={14} /></button>
                    <button className="rowBtn" onClick={() => handleDelete(p.id)} title="Delete"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="productGrid">
          {items.map(p => (
            <div className="panel productCard" key={p.id}>
              <span className="productIcon big"><Package size={22} /></span>
              <h3>{p.name}</h3>
              <p>{p.category_name || 'Uncategorized'}</p>
              <strong>₹{Number(p.selling_price).toLocaleString('en-IN')}</strong>
              <small>{p.current_stock} units in stock</small>
              <span className={`badge ${p.stock_status === 'Critical' || p.stock_status === 'Out of Stock' ? 'red' : p.stock_status === 'Low Stock' ? 'amber' : 'green'}`}>{p.stock_status}</span>
              <button className="rowBtn" onClick={() => handleDelete(p.id)}><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      )}

      {showAdd && createPortal(
        <div className="modalBackdrop">
          <div className="modal">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h2 style={{ margin: 0 }}>{editItem ? 'Edit Product' : 'Add Product'}</h2>
              <button type="button" onClick={() => setShowAdd(false)} style={{ border: 0, background: 'transparent', color: 'var(--muted)', cursor: 'pointer', padding: 4 }}><X size={18} /></button>
            </div>
            {error && <div className="loginError" style={{ marginBottom: 12 }}>{error}</div>}
            <form onSubmit={handleSave}>
              <input placeholder="Product name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              <input placeholder="SKU" value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} required />
              <select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}>
                <option value="">Select Category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <input type="number" placeholder="Selling Price" value={form.selling_price} onChange={e => setForm(f => ({ ...f, selling_price: e.target.value }))} required />
                <input type="number" placeholder="Cost Price" value={form.cost_price} onChange={e => setForm(f => ({ ...f, cost_price: e.target.value }))} required />
              </div>
              {!editItem && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <input type="number" placeholder="Initial Stock" value={form.current_stock} onChange={e => setForm(f => ({ ...f, current_stock: e.target.value }))} />
                  <input type="number" placeholder="Reorder Level" value={form.reorder_level} onChange={e => setForm(f => ({ ...f, reorder_level: e.target.value }))} />
                </div>
              )}
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <button type="button" className="secondary" onClick={() => setShowAdd(false)} style={{ flex: 1, height: '42px', border: '1px solid var(--border)', borderRadius: '10px', background: 'transparent', color: 'var(--text)', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button className="primary" type="submit" disabled={saving} style={{ flex: 1, height: '42px', marginTop: 0 }}>{saving ? 'Saving...' : editItem ? 'Update Product' : 'Add Product'}</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
