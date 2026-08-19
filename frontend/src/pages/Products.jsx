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

  // Category Management states
  const [showManageCats, setShowManageCats] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [editingCatId, setEditingCatId] = useState(null);
  const [editingCatName, setEditingCatName] = useState('');
  const [showInlineAddCat, setShowInlineAddCat] = useState(false);
  const [inlineCatName, setInlineCatName] = useState('');

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

  const fetchCategories = async () => {
    try {
      const data = await categoriesAPI.list();
      setCategories(data || []);
    } catch {}
  };

  useEffect(() => { fetchProducts(); }, [q, catFilter, statusFilter]);
  useEffect(() => { fetchCategories(); }, []);

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
    setShowInlineAddCat(false);
    setInlineCatName('');
    setError('');
  };

  const openEdit = (p) => {
    setEditItem(p);
    setForm({ name: p.name, sku: p.sku, category_id: p.category_id || '', supplier_id: p.supplier_id || '', selling_price: p.selling_price, cost_price: p.cost_price, current_stock: p.current_stock, reorder_level: p.reorder_level, description: p.description || '' });
    setShowAdd(true);
    setShowInlineAddCat(false);
    setInlineCatName('');
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

  // Category CRUD Handlers
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      await categoriesAPI.create({ name: newCatName.trim() });
      showToast('Category created successfully.', 'success');
      setNewCatName('');
      fetchCategories();
    } catch (err) {
      showToast(err.message || 'Failed to create category', 'error');
    }
  };

  const handleCreateCategoryInline = async (e) => {
    e.preventDefault();
    if (!inlineCatName.trim()) return;
    try {
      const newCat = await categoriesAPI.create({ name: inlineCatName.trim() });
      showToast('Category created successfully.', 'success');
      setInlineCatName('');
      setShowInlineAddCat(false);
      
      // Refresh categories list
      const updatedCats = await categoriesAPI.list();
      setCategories(updatedCats || []);
      
      // Auto select newly created category
      setForm(f => ({ ...f, category_id: String(newCat.id) }));
    } catch (err) {
      showToast(err.message || 'Failed to create category', 'error');
    }
  };

  const startEditCategory = (c) => {
    setEditingCatId(c.id);
    setEditingCatName(c.name);
  };

  const handleRenameCategory = async (e, id) => {
    e.preventDefault();
    if (!editingCatName.trim()) return;
    try {
      await categoriesAPI.update(id, { name: editingCatName.trim() });
      showToast('Category renamed successfully.', 'success');
      setEditingCatId(null);
      fetchCategories();
    } catch (err) {
      showToast(err.message || 'Failed to rename category', 'error');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await categoriesAPI.delete(id);
      showToast('Category deleted successfully.', 'success');
      fetchCategories();
    } catch (err) {
      showToast(err.message || 'Failed to delete category', 'error');
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
        <div className="pageTopActions">
          <button className="secondary" onClick={() => { setShowManageCats(true); setError(''); }} style={{ height: '40px', display: 'flex', alignItems: 'center', gap: '6px', padding: '0 16px', borderRadius: '10px', background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)', cursor: 'pointer', fontWeight: '600' }}><Edit3 size={15} />Manage Categories</button>
          <button className="primary" onClick={openAdd}>
            <Plus size={16} />
            <span className="btnText">Add Product</span>
          </button>
        </div>
      </div>

      <div className="panel productToolbar">
        <div className="productSearch">
          <Search size={15} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search products..." />
        </div>
        <div className="productFilters">
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
        </div>
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
          <div className="tableWrap">
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
          <div className="modal" style={{ width: 'min(480px, 100%)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h2 style={{ margin: 0 }}>{editItem ? 'Edit Product' : 'Add Product'}</h2>
              <button type="button" onClick={() => setShowAdd(false)} style={{ border: 0, background: 'transparent', color: 'var(--muted)', cursor: 'pointer', padding: 4 }}><X size={18} /></button>
            </div>
            {error && <div className="loginError" style={{ marginBottom: 12 }}>{error}</div>}
            <form onSubmit={handleSave}>
              <input placeholder="Product name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              <input placeholder="SKU" value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} required />
              
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', margin: '0 0 14px 0' }}>
                <select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))} style={{ flex: 1, margin: 0 }}>
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <button type="button" className="secondary" onClick={() => { setShowInlineAddCat(true); setInlineCatName(''); }} style={{ height: '42px', padding: '0 12px', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--surface2)', color: 'var(--text)', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}><Plus size={15} /> Add Category</button>
              </div>

              {showInlineAddCat && (
                <div style={{ display: 'flex', gap: '8px', margin: '-6px 0 14px 0', padding: '10px', background: 'var(--surface2)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <input 
                    placeholder="New category name" 
                    value={inlineCatName} 
                    onChange={e => setInlineCatName(e.target.value)} 
                    style={{ flex: 1, margin: 0, height: '34px' }} 
                  />
                  <button type="button" className="primary" onClick={handleCreateCategoryInline} style={{ height: '34px', marginTop: 0, padding: '0 12px', fontSize: '0.8rem' }}>Save</button>
                  <button type="button" className="secondary" onClick={() => setShowInlineAddCat(false)} style={{ height: '34px', marginTop: 0, padding: '0 12px', fontSize: '0.8rem', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text)' }}>Cancel</button>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                <input type="number" placeholder="Selling Price" value={form.selling_price} onChange={e => setForm(f => ({ ...f, selling_price: e.target.value }))} required style={{ margin: 0 }} />
                <input type="number" placeholder="Cost Price" value={form.cost_price} onChange={e => setForm(f => ({ ...f, cost_price: e.target.value }))} required style={{ margin: 0 }} />
              </div>
              
              {!editItem && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted)', display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                    Initial Stock
                    <input type="number" value={form.current_stock} onChange={e => setForm(f => ({ ...f, current_stock: e.target.value }))} style={{ margin: '6px 0 0 0' }} />
                    <span style={{ fontSize: '0.7rem', fontWeight: 400, color: 'var(--muted)', marginTop: 4, lineHeight: 1.3 }}>Quantity currently available when this product is created.</span>
                  </label>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted)', display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                    Restock Level
                    <input type="number" value={form.reorder_level} onChange={e => setForm(f => ({ ...f, reorder_level: e.target.value }))} style={{ margin: '6px 0 0 0' }} />
                    <span style={{ fontSize: '0.7rem', fontWeight: 400, color: 'var(--muted)', marginTop: 4, lineHeight: 1.3 }}>Alert me when available stock reaches this level.</span>
                  </label>
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

      {showManageCats && createPortal(
        <div className="modalBackdrop">
          <div className="modal" style={{ width: 'min(480px, 100%)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h2 style={{ margin: 0 }}>Manage Categories</h2>
              <button type="button" onClick={() => setShowManageCats(false)} style={{ border: 0, background: 'transparent', color: 'var(--muted)', cursor: 'pointer', padding: 4 }}><X size={18} /></button>
            </div>
            
            <form onSubmit={handleCreateCategory} style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              <input 
                placeholder="New category name" 
                value={newCatName} 
                onChange={e => setNewCatName(e.target.value)} 
                style={{ flex: 1, margin: 0, height: '38px' }} 
                required 
              />
              <button type="submit" className="primary" style={{ height: '38px', marginTop: 0, padding: '0 16px' }}><Plus size={16} />Add</button>
            </form>

            <div style={{ maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {categories.length === 0 ? (
                <p style={{ color: 'var(--muted)', fontSize: '0.85rem', textAlign: 'center', margin: '20px 0' }}>No categories created yet.</p>
              ) : (
                categories.map(c => (
                  <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--surface2)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    {editingCatId === c.id ? (
                      <form onSubmit={(e) => handleRenameCategory(e, c.id)} style={{ display: 'flex', gap: 6, flex: 1, margin: 0 }}>
                        <input 
                          value={editingCatName} 
                          onChange={e => setEditingCatName(e.target.value)} 
                          style={{ flex: 1, margin: 0, height: '32px', padding: '0 8px', fontSize: '0.85rem' }} 
                          required 
                        />
                        <button type="submit" className="primary" style={{ height: '32px', marginTop: 0, padding: '0 10px', fontSize: '0.78rem' }}>Save</button>
                        <button type="button" className="secondary" onClick={() => setEditingCatId(null)} style={{ height: '32px', padding: '0 10px', fontSize: '0.78rem', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                      </form>
                    ) : (
                      <>
                        <span style={{ fontSize: '0.88rem', fontWeight: '500' }}>{c.name}</span>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button type="button" className="rowBtn" onClick={() => startEditCategory(c)} title="Rename" style={{ border: 0, background: 'transparent', cursor: 'pointer', padding: 4, color: 'var(--muted)' }}><Edit3 size={13} /></button>
                          <button type="button" className="rowBtn" onClick={() => handleDeleteCategory(c.id)} title="Delete" style={{ border: 0, background: 'transparent', cursor: 'pointer', padding: 4, color: 'var(--muted)' }}><Trash2 size={13} /></button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
