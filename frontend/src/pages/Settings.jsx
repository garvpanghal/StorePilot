import React, { useState } from 'react';
import { Settings as SettingsIcon, Store, Bell, Eye, Database } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Settings() {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [storeInfo, setStoreInfo] = useState({
    name: 'Demo Store',
    phone: '+91 9876543210',
    email: 'store@storepilot.com',
    currency: 'INR (₹)',
  });
  const [notifications, setNotifications] = useState({
    lowStock: true,
    purchaseCompleted: true,
    weeklyReport: false,
  });

  const handleSaveStore = (e) => {
    e.preventDefault();
    showToast('Store preferences saved! (Demo mode)', 'success');
  };

  return (
    <div className="page">
      <div className="pageTop">
        <div>
          <div className="eyebrow">SYSTEM</div>
          <h1 className="pageTitle">Settings</h1>
          <p className="pageDesc">Manage store preferences, appearance and notifications.</p>
        </div>
      </div>

      <div className="genericGrid">
        <section className="panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <span className="productIcon" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}><Store size={18} /></span>
            <h2 style={{ fontSize: '1.1rem', margin: 0, fontWeight: '650' }}>Store Profile</h2>
          </div>
          <form onSubmit={handleSaveStore} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--muted)' }}>
              Store Name
              <input
                style={{ width: '100%', height: '40px', border: '1px solid var(--border)', borderRadius: '10px', padding: '0 12px', background: 'var(--surface2)', color: 'var(--text)', outline: 'none', marginTop: '6px' }}
                value={storeInfo.name}
                onChange={e => setStoreInfo({ ...storeInfo, name: e.target.value })}
                required
              />
            </label>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--muted)' }}>
              Phone Number
              <input
                style={{ width: '100%', height: '40px', border: '1px solid var(--border)', borderRadius: '10px', padding: '0 12px', background: 'var(--surface2)', color: 'var(--text)', outline: 'none', marginTop: '6px' }}
                value={storeInfo.phone}
                onChange={e => setStoreInfo({ ...storeInfo, phone: e.target.value })}
                required
              />
            </label>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--muted)' }}>
              Store Email
              <input
                type="email"
                style={{ width: '100%', height: '40px', border: '1px solid var(--border)', borderRadius: '10px', padding: '0 12px', background: 'var(--surface2)', color: 'var(--text)', outline: 'none', marginTop: '6px' }}
                value={storeInfo.email}
                onChange={e => setStoreInfo({ ...storeInfo, email: e.target.value })}
                required
              />
            </label>
            <button className="primary" type="submit" style={{ marginTop: '8px' }}>Save Changes</button>
          </form>
        </section>

        <section className="panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <span className="productIcon" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}><Bell size={18} /></span>
              <h2 style={{ fontSize: '1.1rem', margin: 0, fontWeight: '650' }}>Notification Preferences</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={notifications.lowStock}
                  onChange={e => setNotifications({ ...notifications, lowStock: e.target.checked })}
                  style={{ width: '17px', height: '17px', accentColor: 'var(--primary)' }}
                />
                <span>Low stock alerts</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={notifications.purchaseCompleted}
                  onChange={e => setNotifications({ ...notifications, purchaseCompleted: e.target.checked })}
                  style={{ width: '17px', height: '17px', accentColor: 'var(--primary)' }}
                />
                <span>Purchase completion alerts</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={notifications.weeklyReport}
                  onChange={e => setNotifications({ ...notifications, weeklyReport: e.target.checked })}
                  style={{ width: '17px', height: '17px', accentColor: 'var(--primary)' }}
                />
                <span>Weekly summary email reports</span>
              </label>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <span className="productIcon" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}><Eye size={18} /></span>
              <h2 style={{ fontSize: '1.1rem', margin: 0, fontWeight: '650' }}>User Profile</h2>
            </div>
            {user && (
              <div style={{ fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div>Name: <strong>{user.full_name}</strong></div>
                <div>Email: <strong>{user.email}</strong></div>
                <div>Role: <span className="badge green" style={{ textTransform: 'capitalize' }}>{user.role}</span></div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
