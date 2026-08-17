import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Truck, Plus, Mail, Phone, MapPin, User, Trash2, Edit3, X } from 'lucide-react';
import { suppliersAPI } from '../api/api';
import { useToast } from '../context/ToastContext';

export default function Suppliers() {
  const { showToast } = useToast();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: '', contact_person: '', email: '', phone: '', address: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const data = await suppliersAPI.list();
      setSuppliers(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

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
    setForm({ name: '', contact_person: '', email: '', phone: '', address: '' });
    setError('');
    setShowAdd(true);
  };

  const openEdit = (s) => {
    setEditItem(s);
    setForm({
      name: s.name,
      contact_person: s.contact_person || '',
      email: s.email || '',
      phone: s.phone || '',
      address: s.address || '',
    });
    setError('');
    setShowAdd(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editItem) {
        await suppliersAPI.update(editItem.id, form);
        showToast('Supplier updated successfully.', 'success');
      } else {
        await suppliersAPI.create(form);
        showToast('Supplier added successfully.', 'success');
      }
      setShowAdd(false);
      fetchSuppliers();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this supplier?')) return;
    try {
      await suppliersAPI.delete(id);
      showToast('Supplier deleted successfully.', 'success');
      fetchSuppliers();
    } catch (err) {
      showToast(err.message || 'Failed to delete supplier', 'error');
    }
  };

  return (
    <div className="page">
      <div className="pageTop">
        <div>
          <div className="eyebrow">SUPPLIER MANAGEMENT</div>
          <h1 className="pageTitle">Suppliers</h1>
          <p className="pageDesc">Keep supplier relationships, pricing and terms organized.</p>
        </div>
        <button className="primary" onClick={openAdd}><Plus size={16} />Add Supplier</button>
      </div>

      {loading ? (
        <div className="productGrid">
          <div className="skeleton skeletonCard"></div>
          <div className="skeleton skeletonCard"></div>
          <div className="skeleton skeletonCard"></div>
        </div>
      ) : suppliers.length === 0 ? (
        <div className="panel placeholder">
          <div className="placeholderIcon"><Truck size={28} /></div>
          <h2>No suppliers registered</h2>
          <p>Register external suppliers and vendors to raise procurement purchase orders.</p>
          <button className="primary" onClick={openAdd} style={{ marginTop: 14 }}><Plus size={16} />Add First Supplier</button>
        </div>
      ) : (
        <div className="productGrid">
          {suppliers.map(s => (
            <div className="panel productCard" key={s.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span className="productIcon big" style={{ color: 'var(--primary)', background: 'var(--primary-soft)' }}><Truck size={22} /></span>
              <h3 style={{ margin: '10px 0 2px' }}>{s.name}</h3>
              {s.contact_person && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--muted)' }}>
                  <User size={13} /> {s.contact_person}
                </div>
              )}
              {s.phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--muted)' }}>
                  <Phone size={13} /> {s.phone}
                </div>
              )}
              {s.email && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--muted)', wordBreak: 'break-all' }}>
                  <Mail size={13} /> {s.email}
                </div>
              )}
              {s.address && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--muted)' }}>
                  <MapPin size={13} /> {s.address}
                </div>
              )}
              <div style={{ marginTop: 'auto', paddingTop: '12px', display: 'flex', gap: '8px', justifyContent: 'flex-end', borderTop: '1px solid var(--border)' }}>
                <button className="rowBtn" onClick={() => openEdit(s)} title="Edit"><Edit3 size={14} /></button>
                <button className="rowBtn" onClick={() => handleDelete(s.id)} title="Delete"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && createPortal(
        <div className="modalBackdrop">
          <div className="modal">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h2 style={{ margin: 0 }}>{editItem ? 'Edit Supplier' : 'Add Supplier'}</h2>
              <button type="button" onClick={() => setShowAdd(false)} style={{ border: 0, background: 'transparent', color: 'var(--muted)', cursor: 'pointer', padding: 4 }}><X size={18} /></button>
            </div>
            {error && <div className="loginError" style={{ marginBottom: 12 }}>{error}</div>}
            <form onSubmit={handleSave}>
              <input placeholder="Supplier name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              <input placeholder="Contact Person" value={form.contact_person} onChange={e => setForm(f => ({ ...f, contact_person: e.target.value }))} />
              <input type="email" placeholder="Email Address" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              <input placeholder="Phone Number" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              <input placeholder="Address" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <button type="button" className="secondary" onClick={() => setShowAdd(false)} style={{ flex: 1, height: '42px', border: '1px solid var(--border)', borderRadius: '10px', background: 'transparent', color: 'var(--text)', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button className="primary" type="submit" disabled={saving} style={{ flex: 1, height: '42px', marginTop: 0 }}>{saving ? 'Saving...' : editItem ? 'Update Supplier' : 'Add Supplier'}</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
