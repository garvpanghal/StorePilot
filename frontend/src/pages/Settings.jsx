import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { usersAPI } from '../api/api';
import { User, ShieldAlert, Store, KeyRound, Trash2, Eye, EyeOff } from 'lucide-react';

export default function Settings() {
  const { user, checkAuth, logout, updateOnboardingState } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const activeTab = searchParams.get('tab') || 'profile';

  // User Profile inputs
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Password inputs
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [showPwd, setShowPwd] = useState({ current: false, new: false, confirm: false });

  // Store inputs
  const [storeName, setStoreName] = useState('');
  const [storePhone, setStorePhone] = useState('');
  const [storeEmail, setStoreEmail] = useState('');
  const [storeAddress, setStoreAddress] = useState('');
  const [businessType, setBusinessType] = useState('Retail');
  const [updatingStore, setUpdatingStore] = useState(false);

  // Deletion inputs
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);

  const handleReplayTour = async () => {
    try {
      await usersAPI.updateOnboarding(false);
      updateOnboardingState(false);
      showToast('Restarting product tour...', 'info');
      navigate('/dashboard');
    } catch (err) {
      showToast(err.message || 'Failed to restart tour', 'error');
    }
  };

  // Sync inputs from user context
  useEffect(() => {
    if (user) {
      setProfileName(user.full_name || '');
      setProfileEmail(user.email || '');
      setProfilePhone(user.phone || '');
      
      if (user.store) {
        setStoreName(user.store.name || '');
        setStorePhone(user.store.phone || '');
        setStoreEmail(user.store.email || '');
        setStoreAddress(user.store.address || '');
        setBusinessType(user.store.business_type || 'Retail');
      }
    }
  }, [user]);

  const handleTabChange = (tabName) => {
    setSearchParams({ tab: tabName });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    try {
      await usersAPI.updateProfile(profileName, profileEmail, profilePhone || null);
      await checkAuth();
      showToast('Personal profile updated successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }
    setUpdatingPassword(true);
    try {
      await usersAPI.changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      showToast('Password changed successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to change password', 'error');
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleSaveStore = async (e) => {
    e.preventDefault();
    setUpdatingStore(true);
    try {
      await usersAPI.updateStore(
        storeName,
        businessType,
        storePhone || null,
        storeEmail || null,
        storeAddress || null
      );
      await checkAuth();
      showToast('Store settings updated successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update store settings', 'error');
    } finally {
      setUpdatingStore(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      showToast('Please type DELETE to confirm', 'error');
      return;
    }
    setDeletingAccount(true);
    try {
      await usersAPI.deleteAccount();
      logout();
      showToast('Your account and store workspace have been permanently deleted.', 'success');
      navigate('/login');
    } catch (err) {
      showToast(err.message || 'Failed to delete account', 'error');
    } finally {
      setDeletingAccount(false);
      setShowDeleteModal(false);
      setDeleteConfirmText('');
    }
  };

  return (
    <div className="page" style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      <div className="pageTop">
        <div>
          <div className="eyebrow">SYSTEM</div>
          <h1 className="pageTitle">Settings</h1>
          <p className="pageDesc">Manage store profiles, personal accounts, and security preferences.</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '30px', marginTop: '24px', flexWrap: 'wrap' }}>
        {/* Left Tabs Menu */}
        <div className="settingsTabs">
          <button
            onClick={() => handleTabChange('profile')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '10px',
              background: activeTab === 'profile' ? 'var(--primary)' : 'var(--surface)',
              color: activeTab === 'profile' ? '#fff' : 'var(--text)',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.92rem',
              textAlign: 'left',
              transition: 'all 0.2s',
            }}
          >
            <User size={17} />
            <span>My Profile</span>
          </button>

          <button
            onClick={() => handleTabChange('security')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '10px',
              background: activeTab === 'security' ? 'var(--primary)' : 'var(--surface)',
              color: activeTab === 'security' ? '#fff' : 'var(--text)',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.92rem',
              textAlign: 'left',
              transition: 'all 0.2s',
            }}
          >
            <KeyRound size={17} />
            <span>Account Security</span>
          </button>

          <button
            onClick={() => handleTabChange('store')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '10px',
              background: activeTab === 'store' ? 'var(--primary)' : 'var(--surface)',
              color: activeTab === 'store' ? '#fff' : 'var(--text)',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.92rem',
              textAlign: 'left',
              transition: 'all 0.2s',
            }}
          >
            <Store size={17} />
            <span>Store Settings</span>
          </button>
        </div>

        {/* Right Active Tab Content */}
        <div className="panel settingsPanel">
          
          {/* TAB 1: User Profile */}
          {activeTab === 'profile' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <span className="productIcon" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}><User size={18} /></span>
                <h2 style={{ fontSize: '1.2rem', margin: 0, fontWeight: '700' }}>My Profile Details</h2>
              </div>
              
              <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '550px' }}>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <label style={{ flex: '1 1 200px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>
                    Full Name
                    <input
                      style={{ width: '100%', height: '40px', border: '1px solid var(--border)', borderRadius: '10px', padding: '0 12px', background: 'var(--bg-body)', color: 'var(--text-main)', outline: 'none', marginTop: '6px' }}
                      value={profileName}
                      onChange={e => setProfileName(e.target.value)}
                      required
                    />
                  </label>
                  <label style={{ flex: '1 1 200px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>
                    Phone Number
                    <input
                      style={{ width: '100%', height: '40px', border: '1px solid var(--border)', borderRadius: '10px', padding: '0 12px', background: 'var(--bg-body)', color: 'var(--text-main)', outline: 'none', marginTop: '6px' }}
                      value={profilePhone}
                      onChange={e => setProfilePhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                    />
                  </label>
                </div>

                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>
                  Email Address
                  <input
                    type="email"
                    style={{ width: '100%', height: '40px', border: '1px solid var(--border)', borderRadius: '10px', padding: '0 12px', background: 'var(--bg-body)', color: 'var(--text-main)', outline: 'none', marginTop: '6px' }}
                    value={profileEmail}
                    onChange={e => setProfileEmail(e.target.value)}
                    required
                  />
                </label>

                <div style={{ background: 'var(--surface)', padding: '16px', borderRadius: '10px', marginTop: '10px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Permission Role</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                    <strong style={{ fontSize: '1.05rem', color: 'var(--text-main)', textTransform: 'capitalize' }}>{user?.role || 'User'}</strong>
                    <span className="badge green" style={{ fontSize: '0.75rem', padding: '4px 8px', textTransform: 'uppercase' }}>Active Account</span>
                  </div>
                </div>

                <button className="primary settingsSaveBtn" type="submit" disabled={updatingProfile}>
                  {updatingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </form>

              {/* Onboarding Section */}
              <div style={{ marginTop: '35px', borderTop: '1px solid var(--border)', paddingTop: '25px' }}>
                <h3 style={{ fontSize: '1.05rem', margin: 0, fontWeight: '700', color: 'var(--text)' }}>Onboarding Tour</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--muted)', marginBottom: '16px', marginTop: '6px', lineHeight: '1.4' }}>
                  If you want to review the interface walkthrough, you can restart the interactive onboarding tour at any time.
                </p>
                <button
                  type="button"
                  onClick={handleReplayTour}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '8px',
                    background: 'var(--surface2)',
                    color: 'var(--text)',
                    border: '1px solid var(--border)',
                    cursor: 'pointer',
                    fontSize: '0.88rem',
                    fontWeight: '600',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'var(--primary)';
                    e.currentTarget.style.color = '#07090d';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'var(--surface2)';
                    e.currentTarget.style.color = 'var(--text)';
                  }}
                >
                  Take Product Tour Again
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Security & Password/Deletion */}
          {activeTab === 'security' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <span className="productIcon" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}><KeyRound size={18} /></span>
                <h2 style={{ fontSize: '1.2rem', margin: 0, fontWeight: '700' }}>Password & Security Settings</h2>
              </div>

              <form onSubmit={handleSavePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '550px', borderBottom: '1px solid var(--border)', paddingBottom: '30px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', position: 'relative' }}>
                  Current Password
                  <input
                    type={showPwd.current ? "text" : "password"}
                    style={{ width: '100%', height: '40px', border: '1px solid var(--border)', borderRadius: '10px', padding: '0 40px 0 12px', background: 'var(--bg-body)', color: 'var(--text-main)', outline: 'none', marginTop: '6px' }}
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    required
                  />
                  <button type="button" onClick={() => setShowPwd({ ...showPwd, current: !showPwd.current })} style={{ position: 'absolute', right: '12px', top: '34px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    {showPwd.current ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </label>

                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <label style={{ flex: '1 1 200px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', position: 'relative' }}>
                    New Password
                    <input
                      type={showPwd.new ? "text" : "password"}
                      style={{ width: '100%', height: '40px', border: '1px solid var(--border)', borderRadius: '10px', padding: '0 40px 0 12px', background: 'var(--bg-body)', color: 'var(--text-main)', outline: 'none', marginTop: '6px' }}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      required
                    />
                    <button type="button" onClick={() => setShowPwd({ ...showPwd, new: !showPwd.new })} style={{ position: 'absolute', right: '12px', top: '34px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                      {showPwd.new ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </label>

                  <label style={{ flex: '1 1 200px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', position: 'relative' }}>
                    Confirm New Password
                    <input
                      type={showPwd.confirm ? "text" : "password"}
                      style={{ width: '100%', height: '40px', border: '1px solid var(--border)', borderRadius: '10px', padding: '0 40px 0 12px', background: 'var(--bg-body)', color: 'var(--text-main)', outline: 'none', marginTop: '6px' }}
                      value={confirmNewPassword}
                      onChange={e => setConfirmNewPassword(e.target.value)}
                      required
                    />
                    <button type="button" onClick={() => setShowPwd({ ...showPwd, confirm: !showPwd.confirm })} style={{ position: 'absolute', right: '12px', top: '34px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                      {showPwd.confirm ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </label>
                </div>

                <button className="primary settingsSaveBtn" type="submit" disabled={updatingPassword}>
                  {updatingPassword ? 'Changing...' : 'Update Password'}
                </button>
              </form>

              {/* Danger Zone: Delete Account */}
              <div style={{ marginTop: '30px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <Trash2 size={18} style={{ color: 'var(--danger)' }} />
                  <h3 style={{ fontSize: '1.05rem', margin: 0, fontWeight: '700', color: 'var(--danger)' }}>Danger Zone</h3>
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.4' }}>
                  Permanently delete your account and all associated workspace records. This operation cannot be undone.
                </p>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '8px',
                    background: 'transparent',
                    color: 'var(--danger)',
                    border: '1px solid var(--danger)',
                    fontWeight: '600',
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.target.style.background = 'var(--danger-soft)'; }}
                  onMouseLeave={e => { e.target.style.background = 'transparent'; }}
                >
                  Delete Account...
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: Store Settings */}
          {activeTab === 'store' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <span className="productIcon" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}><Store size={18} /></span>
                <h2 style={{ fontSize: '1.2rem', margin: 0, fontWeight: '700' }}>Store & Business Settings</h2>
              </div>

              <form onSubmit={handleSaveStore} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '550px' }}>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <label style={{ flex: '1 1 200px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>
                    Store / Shop Name
                    <input
                      style={{ width: '100%', height: '40px', border: '1px solid var(--border)', borderRadius: '10px', padding: '0 12px', background: 'var(--bg-body)', color: 'var(--text-main)', outline: 'none', marginTop: '6px' }}
                      value={storeName}
                      onChange={e => setStoreName(e.target.value)}
                      required
                    />
                  </label>

                  <label style={{ flex: '1 1 200px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>
                    Business Type
                    <select
                      value={businessType}
                      onChange={e => setBusinessType(e.target.value)}
                      style={{ width: '100%', height: '40px', border: '1px solid var(--border)', borderRadius: '10px', padding: '0 12px', background: 'var(--bg-body)', color: 'var(--text-main)', outline: 'none', marginTop: '6px' }}
                    >
                      <option value="Retail">Retail</option>
                      <option value="Grocery">Grocery</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Clothing">Clothing</option>
                      <option value="Restaurant">Restaurant</option>
                      <option value="Wholesale">Wholesale</option>
                      <option value="Other">Other</option>
                    </select>
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <label style={{ flex: '1 1 200px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>
                    Store Contact Phone
                    <input
                      style={{ width: '100%', height: '40px', border: '1px solid var(--border)', borderRadius: '10px', padding: '0 12px', background: 'var(--bg-body)', color: 'var(--text-main)', outline: 'none', marginTop: '6px' }}
                      value={storePhone}
                      onChange={e => setStorePhone(e.target.value)}
                    />
                  </label>

                  <label style={{ flex: '1 1 200px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>
                    Store Contact Email
                    <input
                      type="email"
                      style={{ width: '100%', height: '40px', border: '1px solid var(--border)', borderRadius: '10px', padding: '0 12px', background: 'var(--bg-body)', color: 'var(--text-main)', outline: 'none', marginTop: '6px' }}
                      value={storeEmail}
                      onChange={e => setStoreEmail(e.target.value)}
                    />
                  </label>
                </div>

                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>
                  Business Address
                  <textarea
                    rows={3}
                    style={{ width: '100%', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px', background: 'var(--bg-body)', color: 'var(--text-main)', outline: 'none', marginTop: '6px', resize: 'none', fontFamily: 'inherit' }}
                    value={storeAddress}
                    onChange={e => setStoreAddress(e.target.value)}
                  />
                </label>

                <button className="primary settingsSaveBtn" type="submit" disabled={updatingStore}>
                  {updatingStore ? 'Saving...' : 'Save Settings'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Delete Account confirmation modal wrapper */}
      {showDeleteModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(4px)',
        }}>
          <div className="panel settingsPanel" style={{ maxWidth: '500px' }}>
            <h2 style={{ fontSize: '1.25rem', margin: '0 0 16px 0', fontWeight: '700', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldAlert size={22} />
              <span>Delete Your Account?</span>
            </h2>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '16px', fontWeight: '600' }}>
              This action is permanent and cannot be undone.
            </p>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: '1.5' }}>
              Deleting your account will permanently remove:
              <ul style={{ paddingLeft: '20px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <li>Your personal account credentials & phone</li>
                <li>Your business/store workspace profile</li>
                <li>Your products & categories data</li>
                <li>Your stock ledgers & inventory metrics</li>
                <li>Your customer databases & supplier contacts</li>
                <li>Your sales reports & invoices</li>
                <li>Your notification histories</li>
              </ul>
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
              <label htmlFor="confirmDeleteInput" style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-main)' }}>
                To confirm, please type <strong style={{ color: 'var(--danger)' }}>DELETE</strong> below:
              </label>
              <input
                id="confirmDeleteInput"
                type="text"
                style={{
                  width: '100%',
                  height: '42px',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '0 12px',
                  background: 'var(--bg-body)',
                  color: 'var(--text-main)',
                  outline: 'none',
                  fontSize: '0.95rem',
                }}
                placeholder="DELETE"
                value={deleteConfirmText}
                onChange={e => setDeleteConfirmText(e.target.value)}
                autoFocus
              />
            </div>

            <div className="modalFooterButtons">
              <button
                type="button"
                className="secondary"
                onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); }}
                disabled={deletingAccount}
                style={{ padding: '10px 18px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '600' }}
              >
                Cancel
              </button>
              
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE' || deletingAccount}
                style={{
                  padding: '10px 18px',
                  borderRadius: '8px',
                  background: deleteConfirmText === 'DELETE' ? 'var(--danger)' : 'var(--border)',
                  color: '#fff',
                  border: 'none',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: deleteConfirmText === 'DELETE' ? 'pointer' : 'not-allowed',
                  transition: 'background 0.2s',
                }}
              >
                {deletingAccount ? 'Deleting...' : 'Permanently Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
