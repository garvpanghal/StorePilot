import React, { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDownRight, HeartPulse, Package, IndianRupee, ShoppingBag, AlertTriangle, Clock3, TrendingUp, CalendarDays } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { dashboardAPI, aiAPI } from '../api/api';

const PIE_COLORS = ['var(--primary)', '#8b5cf6', '#f59e0b', '#ef6461', '#98a2b3', '#3b82f6', '#10b981', '#f43f5e'];
const PERIODS = [
  ['7d', 'Last 7 days'], ['30d', 'Last 30 days'], ['this_month', 'This Month'], ['last_month', 'Last Month'],
];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [period, setPeriod] = useState('30d');
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (data) {
      setUpdating(true);
    } else {
      setLoading(true);
    }
    setError('');
    dashboardAPI.get(period)
      .then(setData)
      .catch((err) => {
        setError(err.message || 'Failed to load dashboard data');
      })
      .finally(() => {
        setLoading(false);
        setUpdating(false);
      });
  }, [period]);

  useEffect(() => {
    aiAPI.recommendations().then(r => setRecommendations(r.recommendations || [])).catch(() => {});
  }, []);

  const handleRetry = () => {
    if (data) {
      setUpdating(true);
    } else {
      setLoading(true);
    }
    setError('');
    dashboardAPI.get(period)
      .then(setData)
      .catch((err) => {
        setError(err.message || 'Failed to load dashboard data');
      })
      .finally(() => {
        setLoading(false);
        setUpdating(false);
      });
  };

  if (loading && !data) {
    return (
      <div className="page dash">
        <div className="dashHead">
          <div>
            <div className="eyebrow skeleton" style={{ width: 80, height: 12 }}></div>
            <h1 className="pageTitle skeleton" style={{ width: 180, height: 32, display: 'block', marginTop: 8 }}></h1>
            <p className="pageDesc skeleton" style={{ width: 280, height: 16, display: 'block', marginTop: 8 }}></p>
          </div>
          <div className="dateControls">
            <div className="skeleton" style={{ width: 100, height: 40, borderRadius: 10 }}></div>
            <div className="skeleton" style={{ width: 100, height: 40, borderRadius: 10, marginLeft: 8 }}></div>
            <div className="skeleton" style={{ width: 100, height: 40, borderRadius: 10, marginLeft: 8 }}></div>
          </div>
        </div>

        <div className="stats" style={{ marginTop: 20 }}>
          <div className="skeleton skeletonKpi"></div>
          <div className="skeleton skeletonKpi"></div>
          <div className="skeleton skeletonKpi"></div>
          <div className="skeleton skeletonKpi"></div>
          <div className="skeleton skeletonKpi"></div>
        </div>

        <div className="dashGrid" style={{ marginTop: 20 }}>
          <div className="skeleton skeletonChart"></div>
          <div className="skeleton skeletonChart"></div>
        </div>
      </div>
    );
  }

  // Use fallback values if data is temporarily null or request fails but we have no data
  const stats = data?.stats || { total_revenue: 0, total_profit: 0, total_orders: 0, inventory_value: 0, inventory_health: 0 };
  const sales_overview = data?.sales_overview || [];
  const top_products = data?.top_products || [];
  const category_sales = data?.category_sales || [];
  const recent_sales = data?.recent_sales || [];

  const statCards = [
    ['Total Revenue', `₹${Number(stats.total_revenue).toLocaleString('en-IN')}`, stats.revenue_change, 'Revenue', IndianRupee],
    ['Total Profit', `₹${Number(stats.total_profit).toLocaleString('en-IN')}`, stats.profit_change, 'Profit', TrendingUp],
    ['Total Orders', stats.total_orders.toLocaleString(), stats.orders_change, 'Orders', ShoppingBag],
    ['Inventory Value', `₹${Number(stats.inventory_value).toLocaleString('en-IN')}`, null, 'Inventory', Package],
    ['Inventory Health', `${stats.inventory_health}%`, stats.inventory_health >= 80 ? 'Excellent' : stats.inventory_health >= 60 ? 'Good' : 'Needs Attention', 'Health', HeartPulse],
  ];

  const recIcons = { danger: AlertTriangle, warning: ShoppingBag, info: Clock3, success: TrendingUp, reorder: ShoppingBag, investigate: Clock3, opportunity: TrendingUp };

  return (
    <div className="page dash">
      {error && (
        <div className="loginError" style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{error}</span>
          <button className="primary" onClick={handleRetry} style={{ padding: '6px 14px', fontSize: '0.8rem', height: 'auto', minHeight: 'unset', width: 'auto', background: 'var(--primary)', color: '#fff', border: 0, borderRadius: '8px', cursor: 'pointer' }}>Retry</button>
        </div>
      )}
      <div style={{ opacity: updating ? 0.6 : 1, transition: 'opacity 0.2s ease', display: 'flex', flexDirection: 'column', gap: 'var(--gap)' }}>
      <div className="dashHead">
        <div>
          <div className="eyebrow">OVERVIEW</div>
          <h1 className="pageTitle">Dashboard</h1>
          <p className="pageDesc">Here's what's happening with your store.</p>
        </div>
        <div className="dateControls">
          {PERIODS.map(([val, label]) => (
            <button key={val} className={period === val ? 'period' : ''} onClick={() => setPeriod(val)}>{label}</button>
          ))}
        </div>
      </div>

      <div className="stats">
        {statCards.map(([label, value, trend, sub, Icon]) => (
          <div className="panel stat interactive" key={label}>
            <div className="statTop">
              <span className="statIcon"><Icon size={19} /></span>
              {trend === 'Excellent' || trend === 'Good' || trend === 'Needs Attention' ? (
                <span className={trend === 'Needs Attention' ? 'trend' : 'good'}>{trend}</span>
              ) : trend != null ? (
                <span className="trend">
                  {trend >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {Math.abs(trend)}%
                </span>
              ) : null}
            </div>
            <strong>{value}</strong>
            <span>{label}</span>
            <small>{trend === 'Excellent' || trend === 'Good' || trend === 'Needs Attention' ? 'Based on stock levels' : 'vs previous period'}</small>
          </div>
        ))}
      </div>

      <div className="dashGrid">
        <section className="panel chartCard">
          <div className="cardHead">
            <div><h2>Sales Overview</h2><p>Revenue performance over the selected period</p></div>
            <div className="legend"><span><i className="current" />Current</span><span><i />Previous</span></div>
          </div>
          <div className="chart">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sales_overview}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 4" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: 'var(--muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text)' }} />
                <Line type="monotone" dataKey="current" stroke="var(--primary)" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="previous" stroke="var(--muted)" strokeWidth={1.7} dot={false} strokeDasharray="4 4" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="panel category">
          <div className="cardHead"><h2>Category Sales</h2></div>
          <div className="pieWrap">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={category_sales} innerRadius={48} outerRadius={75} paddingAngle={3} dataKey="value" nameKey="name">
                  {category_sales.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pieLegend">
              {category_sales.map((c, i) => (
                <span key={c.name}><i style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} /> {c.name}<b>{c.percentage}%</b></span>
              ))}
            </div>
          </div>
        </section>

        <section className="panel listCard">
          <div className="cardHead"><h2>Top Selling Products</h2></div>
          {top_products.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--muted)', fontSize: '0.85rem' }}>No sales data yet</div>
          ) : top_products.map((p, i) => (
            <div className="rank" key={p.id}>
              <b>{i + 1}</b>
              <span className="prodDot">{p.name.slice(0, 1)}</span>
              <strong>{p.name}</strong>
              <small>{p.total_sold.toLocaleString()} units</small>
            </div>
          ))}
        </section>

        <section className="panel listCard">
          <div className="cardHead"><h2>AI Recommendations</h2></div>
          {recommendations.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--muted)', fontSize: '0.85rem' }}>No recommendations available</div>
          ) : recommendations.map((r, i) => {
            const Icon = recIcons[r.type] || recIcons[r.severity] || AlertTriangle;
            return (
              <div className="recommend" key={i}>
                <span className={r.severity || 'info'}><Icon size={14} /></span>
                <p>{r.message}</p>
              </div>
            );
          })}
        </section>

        <section className="panel salesTable">
          <div className="cardHead"><h2>Recent Sales</h2></div>
          <div className="tableWrap">
            <table>
              <thead><tr><th>Invoice No.</th><th>Customer</th><th>Items</th><th>Amount</th><th>Payment</th><th>Date</th></tr></thead>
              <tbody>
                {recent_sales.map(r => (
                  <tr key={r.invoice_number}>
                    <td>{r.invoice_number}</td>
                    <td>{r.customer_name}</td>
                    <td>{r.item_count}</td>
                    <td>₹{Number(r.total).toLocaleString('en-IN')}</td>
                    <td>{r.payment_method}</td>
                    <td>{r.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
      </div>
    </div>
  );
}
