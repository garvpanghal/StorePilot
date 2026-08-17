import React, { useState, useEffect, useRef, useCallback } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Search, Sun, Moon, Bell, ChevronDown, LayoutDashboard, Boxes, Package, ShoppingCart, Truck, BarChart3, Settings, ChevronLeft, ChevronRight, LogOut, X } from 'lucide-react';
import AIAssistant from '../components/AIAssistant';
import { useAuth } from '../context/AuthContext';
import { notificationsAPI, searchAPI } from '../api/api';
import styles from '../styles/shell.module.css';

/* Sidebar nav — AI Assistant removed from here */
const main = [
  ['/dashboard', 'Dashboard', LayoutDashboard],
  ['/inventory', 'Inventory', Boxes],
  ['/products', 'Products', Package],
  ['/sales', 'Sales', ShoppingCart],
  ['/purchases', 'Purchases', Truck],
  ['/suppliers', 'Suppliers', Truck],
  ['/reports', 'Reports', BarChart3],
];

/* Breakpoint: below this width we switch to mobile AI experience */
const MOBILE_BP = 768;

export default function Shell({ children, theme, onTheme }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const loc = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [profile, setProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= MOBILE_BP);
  const [unreadCount, setUnreadCount] = useState(0);
  const aiTriggerRef = useRef(null);

  const popoverRef = useRef(null);
  const bellRef = useRef(null);
  const profileMenuRef = useRef(null);
  const profileBtnRef = useRef(null);

  // Search states & refs
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState({ products: [], sales: [], purchases: [], suppliers: [], customers: [] });
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const searchContainerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Navigation indicator state & ref
  const navRef = useRef(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ transform: 'translateY(0)', height: 0, opacity: 0 });

  // Fetch unread notifications count
  useEffect(() => {
    if (!user) return;
    notificationsAPI.unreadCount()
      .then(res => setUnreadCount(res.unread))
      .catch(() => {});

    // Basic polling for notifications every 30s
    const timer = setInterval(() => {
      notificationsAPI.unreadCount()
        .then(res => setUnreadCount(res.unread))
        .catch(() => {});
    }, 30000);

    return () => clearInterval(timer);
  }, [user]);

  // Handle click outside & escape for notifications popover
  useEffect(() => {
    if (!showNotifications) return;
    const onClick = (e) => {
      if (
        popoverRef.current && !popoverRef.current.contains(e.target) &&
        bellRef.current && !bellRef.current.contains(e.target)
      ) {
        setShowNotifications(false);
      }
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setShowNotifications(false);
    };
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [showNotifications]);

  // Handle click outside & escape for profile menu
  useEffect(() => {
    if (!profile) return;
    const onClick = (e) => {
      if (
        profileMenuRef.current && !profileMenuRef.current.contains(e.target) &&
        profileBtnRef.current && !profileBtnRef.current.contains(e.target)
      ) {
        setProfile(false);
      }
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setProfile(false);
    };
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [profile]);

  const fetchNotifications = async () => {
    setLoadingNotifications(true);
    try {
      const data = await notificationsAPI.list();
      setNotifications(data || []);
    } catch {}
    setLoadingNotifications(false);
  };

  const toggleNotifications = () => {
    const next = !showNotifications;
    setShowNotifications(next);
    if (next) {
      setProfile(false); // Close profile dropdown
      fetchNotifications();
    }
  };

  const toggleProfile = () => {
    const next = !profile;
    setProfile(next);
    if (next) {
      setShowNotifications(false); // Close notifications popover
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markAllRead();
      setUnreadCount(0);
      fetchNotifications();
    } catch {}
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationsAPI.markRead(id);
      notificationsAPI.unreadCount().then(res => setUnreadCount(res.unread)).catch(() => {});
      fetchNotifications();
    } catch {}
  };

  // 1. Debounce logic for search query
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setDebouncedQuery('');
      setResults({ products: [], sales: [], purchases: [], suppliers: [], customers: [] });
      setShowResults(false);
      return;
    }
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (!debouncedQuery) return;
    setLoadingSearch(true);
    searchAPI.query(debouncedQuery)
      .then(res => {
        setResults(res || { products: [], sales: [], purchases: [], suppliers: [], customers: [] });
        setActiveIndex(-1);
        setShowResults(true);
      })
      .catch(() => {})
      .finally(() => setLoadingSearch(false));
  }, [debouncedQuery]);

  // 2. Outside click handling for search popover
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 3. Search category configuration & list flattening
  const categories = [
    { key: 'products', label: 'Products', route: (id) => `/products` },
    { key: 'sales', label: 'Sales', route: (id) => `/sales` },
    { key: 'purchases', label: 'Purchases', route: (id) => `/purchases` },
    { key: 'suppliers', label: 'Suppliers', route: (id) => `/suppliers` },
    { key: 'customers', label: 'Customers', route: (id) => `/settings` }
  ];

  const flatResults = [];
  categories.forEach(cat => {
    const items = results[cat.key] || [];
    items.forEach(item => {
      flatResults.push({
        ...item,
        category: cat.key,
        route: cat.route(item.id),
        displayTitle: item.name || item.invoice_number || `Purchase #${item.id}`
      });
    });
  });

  // 4. Keyboard navigation handlers
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowResults(false);
      searchInputRef.current?.blur();
      e.preventDefault();
      return;
    }

    if (!showResults || flatResults.length === 0) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter') {
        setShowResults(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev + 1) % flatResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev - 1 + flatResults.length) % flatResults.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < flatResults.length) {
        const item = flatResults[activeIndex];
        navigate(item.route);
        setShowResults(false);
        setSearchQuery('');
        searchInputRef.current?.blur();
      }
    }
  };

  // 5. Global ⌘K focus listener
  useEffect(() => {
    const handleGlobalKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, []);

  // 6. Navigation indicator placement listener
  useEffect(() => {
    if (!navRef.current) return;

    const updateIndicator = () => {
      const activeEl = navRef.current.querySelector(`.${styles.active}`);
      if (activeEl) {
        const parentRect = navRef.current.getBoundingClientRect();
        const activeRect = activeEl.getBoundingClientRect();
        const relativeTop = activeRect.top - parentRect.top;
        setIndicatorStyle({
          transform: `translateY(${relativeTop}px)`,
          height: `${activeRect.height}px`,
          opacity: 1
        });
      } else {
        setIndicatorStyle(prev => ({ ...prev, opacity: 0 }));
      }
    };

    updateIndicator();

    const timer = setTimeout(updateIndicator, 300);

    window.addEventListener('resize', updateIndicator);
    return () => {
      window.removeEventListener('resize', updateIndicator);
      clearTimeout(timer);
    };
  }, [loc.pathname, collapsed]);

  // Single source of truth for sidebar width → CSS custom property
  useEffect(() => {
    const w = collapsed ? 72 : 240;
    document.documentElement.style.setProperty('--sidebar-w', w + 'px');
  }, [collapsed]);

  // Track viewport width for mobile/desktop AI mode
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BP}px)`);
    const onChange = (e) => {
      setIsMobile(e.matches);
      // Close AI when crossing the breakpoint to avoid stale UI
      setAiOpen(false);
    };
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  const closeAi = useCallback(() => {
    setAiOpen(false);
  }, []);

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'SP';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  // Hide sidebar/header on public pages (landing page and login page)
  const isPublicPage = loc.pathname === '/' || loc.pathname === '/login';

  if (isPublicPage) {
    return <div className={styles.app} style={{ display: 'block', minHeight: '100vh' }}>{children}</div>;
  }

  return (
    <div className={styles.app}>
      <header className={styles.topbar}>
        <button className={styles.mobileMenu} onClick={() => setMobile(true)} aria-label="Open menu"><Menu size={20} /></button>
        <div className={styles.topTitle}>{loc.pathname.split('/')[1]?.replace(/-/g, ' ') || 'Dashboard'}</div>
        <div ref={searchContainerRef} className={styles.search}>
          <Search size={16} />
          <input 
            ref={searchInputRef}
            type="search"
            placeholder="Search for products, invoices, reports..." 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowResults(true);
            }}
            onKeyDown={handleSearchKeyDown}
            onFocus={() => setShowResults(true)}
            aria-label="Global search"
            aria-autocomplete="list"
            aria-controls="global-search-results"
            aria-expanded={showResults}
          />
          <kbd>⌘K</kbd>
          {showResults && searchQuery.trim().length >= 2 && (
            <div 
              id="global-search-results" 
              className={styles.searchResultsDropdown}
              role="listbox"
              aria-label="Search results"
            >
              {loadingSearch ? (
                <div className={styles.searchLoading}>Loading...</div>
              ) : flatResults.length === 0 ? (
                <div className={styles.searchEmpty}>No results found for "{searchQuery}"</div>
              ) : (() => {
                let globalIdx = 0;
                return categories.map(cat => {
                  const items = results[cat.key] || [];
                  if (items.length === 0) return null;
                  return (
                    <div key={cat.key} className={styles.searchCategoryGroup}>
                      <div className={styles.searchCategoryHeader}>{cat.label}</div>
                      {items.map(item => {
                        const currentIdx = globalIdx++;
                        const isSelected = currentIdx === activeIndex;
                        return (
                          <div 
                            key={item.id} 
                            className={`${styles.searchResultItem} ${isSelected ? styles.selectedResultItem : ''}`}
                            onClick={() => {
                              navigate(cat.route(item.id));
                              setShowResults(false);
                              setSearchQuery('');
                            }}
                            onMouseEnter={() => setActiveIndex(currentIdx)}
                            role="option"
                            aria-selected={isSelected}
                          >
                            {cat.key === 'products' && (
                              <div className={styles.searchItemContent}>
                                <strong>{item.name}</strong>
                                <small>SKU: {item.sku} • Stock: {item.current_stock} units • ₹{item.selling_price.toLocaleString('en-IN')}</small>
                              </div>
                            )}
                            {cat.key === 'sales' && (
                              <div className={styles.searchItemContent}>
                                <strong>{item.invoice_number}</strong>
                                <small>{item.customer_name} • Total: ₹{item.total.toLocaleString('en-IN')}</small>
                              </div>
                            )}
                            {cat.key === 'purchases' && (
                              <div className={styles.searchItemContent}>
                                <strong>Purchase Order #{item.id}</strong>
                                <small>{item.supplier_name} • Total: ₹{item.total.toLocaleString('en-IN')}</small>
                              </div>
                            )}
                            {cat.key === 'suppliers' && (
                              <div className={styles.searchItemContent}>
                                <strong>{item.name}</strong>
                                <small>Contact: {item.contact_person || 'N/A'} • Phone: {item.phone || 'N/A'}</small>
                              </div>
                            )}
                            {cat.key === 'customers' && (
                              <div className={styles.searchItemContent}>
                                <strong>{item.name}</strong>
                                <small>Email: {item.email || 'N/A'} • Phone: {item.phone || 'N/A'}</small>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                });
              })()}
            </div>
          )}
        </div>
        <div className={styles.topActions}>
          <button onClick={onTheme} className={styles.iconButton} aria-label="Toggle theme">{theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}</button>
          <div style={{ position: 'relative' }}>
            <button ref={bellRef} className={styles.iconButton} aria-label="Notifications" onClick={toggleNotifications}>
              <Bell size={17} />
              {unreadCount > 0 && <i />}
            </button>
            {showNotifications && (
              <div ref={popoverRef} className={styles.notificationPopover}>
                <div className={styles.popoverHeader}>
                  <h3>Notifications</h3>
                  {unreadCount > 0 && (
                    <button onClick={handleMarkAllRead}>Mark all read</button>
                  )}
                </div>
                <div className={styles.popoverList}>
                  {loadingNotifications ? (
                    <div className={styles.popoverLoading}>Loading...</div>
                  ) : notifications.length === 0 ? (
                    <div className={styles.popoverEmpty}>No notifications</div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className={`${styles.notificationItem} ${!n.is_read ? styles.unread : ''}`} onClick={() => !n.is_read && handleMarkRead(n.id)}>
                        <div className={styles.notificationTitle}>{n.title}</div>
                        <div className={styles.notificationMessage}>{n.message}</div>
                        <div className={styles.notificationTime}>{new Date(n.created_at).toLocaleString()}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          <div className={styles.profileWrap}>
            <button ref={profileBtnRef} className={styles.profileButton} onClick={toggleProfile}>
              <span>{getInitials(user?.full_name)}</span>
              <ChevronDown size={13} />
            </button>
            {profile && (
              <div ref={profileMenuRef} className={styles.profileMenu}>
                <div className={styles.profileHeader}>
                  <span className={styles.profileAvatar}>{getInitials(user?.full_name)}</span>
                  <div className={styles.profileMeta}>
                    <strong>{user?.full_name || 'Demo Store'}</strong>
                    <small>{user?.role || 'Super Admin'}</small>
                    {user?.email && <span className={styles.profileEmail}>{user.email}</span>}
                  </div>
                </div>
                <div className={styles.profileDivider} />
                <button onClick={() => { setProfile(false); navigate('/settings'); }}>My Profile</button>
                <button onClick={() => { setProfile(false); navigate('/settings'); }}>Account Settings</button>
                <button onClick={() => { setProfile(false); navigate('/settings'); }}>Store Settings</button>
                <div className={styles.profileDivider} />
                <button onClick={handleSignOut} className={styles.signOutBtn}><LogOut size={14} /> Sign out</button>
              </div>
            )}
          </div>
        </div>
      </header>

      <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''} ${mobile ? styles.mobileOpen : ''}`}>
        <div className={styles.brand}>
          <img className={styles.wordmark} src={theme === 'dark' ? '/assets/logo-light.png' : '/assets/logo-dark.png'} alt="StorePilot" />
          <img className={styles.mark} src={theme === 'dark' ? '/assets/mark-light.png' : '/assets/mark-dark.png'} alt="StorePilot" />
        </div>
        <nav ref={navRef}>
          <div className={styles.navIndicator} style={indicatorStyle} />
          <div className={styles.groupLabel}>MAIN</div>
          {main.map(([to, label, Icon]) => (
            <NavLink key={to} to={to} className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`} onClick={() => setMobile(false)}>
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
          <div className={styles.groupLabel}>SYSTEM</div>
          <NavLink to="/settings" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`} onClick={() => setMobile(false)}>
            <Settings size={18} />
            <span>Settings</span>
          </NavLink>
        </nav>
        <div className={styles.sideBottom}>
          <button className={styles.collapse} onClick={() => setCollapsed(v => !v)}>
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            <span>Collapse</span>
          </button>
        </div>
      </aside>

      {mobile && <div className={styles.backdrop} onClick={() => setMobile(false)} />}

      {/* Desktop Workspace Region: side-by-side flex container on desktop */}
      <div className={styles.workspace}>
        <main className={`${styles.main} ${styles.pageTransition}`} key={loc.pathname}>
          {children}
        </main>

        {!isMobile && (
          <AIAssistant
            isOpen={aiOpen}
            onClose={closeAi}
            mode="desktop"
          />
        )}
      </div>

      {/* ===== Desktop AI Edge Trigger — built into the right edge, acts as open/close toggle ===== */}
      {!isMobile && (
        <button
          ref={aiTriggerRef}
          className={`${styles.aiTrigger} ${aiOpen ? styles.aiTriggerOpen : ''}`}
          onClick={() => setAiOpen(v => !v)}
          aria-label={aiOpen ? "Close AI Assistant" : "Open AI Assistant"}
          aria-expanded={aiOpen}
        >
          {aiOpen ? <X size={14} /> : <span className={styles.aiTriggerIcon} aria-hidden="true">✦</span>}
          <span className={styles.aiTriggerText}>AI</span>
        </button>
      )}

      {/* ===== Mobile AI FAB ===== */}
      {isMobile && !aiOpen && (
        <button
          className={styles.aiFab}
          onClick={() => setAiOpen(true)}
          aria-label="Open AI Assistant"
          aria-expanded={false}
        >
          <span aria-hidden="true">✦</span>
        </button>
      )}

      {/* ===== Mobile AI Assistant Component ===== */}
      {isMobile && (
        <AIAssistant
          isOpen={aiOpen}
          onClose={closeAi}
          mode="mobile"
        />
      )}
    </div>
  );
}