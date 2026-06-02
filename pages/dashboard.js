// pages/dashboard.js

import { useRouter } from 'next/router';
import { getSession } from '../utils/session';  // ✅ correct path
import { query } from '../utils/db';            // ✅ correct path

export default function Dashboard({ user, stats }) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' });
    router.push('/');
  };

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarTop}>
          <div style={styles.logoBox}>V</div>
          <div>
            <div style={styles.logoText}>F &amp; S VELASCO</div>
            <div style={styles.logoSub}>BOOKKEEPER PORTAL</div>
          </div>
        </div>

        <hr style={styles.divider} />

        <nav style={styles.nav}>
          <a href="/dashboard" style={{ ...styles.navLink, ...styles.active }}>Dashboard</a>
          <a href="/spaces"    style={styles.navLink}>Spaces &amp; Units</a>
          <a href="/tenants"   style={styles.navLink}>Tenants</a>
          <a href="/contracts" style={styles.navLink}>Contracts</a>
          <a href="/payments"  style={styles.navLink}>Payments</a>
          <a href="/reports"   style={styles.navLink}>Reports</a>
        </nav>

        <div style={{ marginTop: 'auto' }}>
          <div style={styles.userTag}>Logged in as: <strong>{user?.name}</strong></div>
          <button onClick={handleLogout} style={styles.logoutBtn}>Sign Out</button>
        </div>
      </div>

      {/* Main content */}
      <div style={styles.main}>
        <h1 style={styles.title}>Welcome back, {user?.name || 'Admin'}</h1>
        <p style={styles.subtitle}>Here is the current overview of your building operations.</p>

        {/* Stats grid */}
        <div style={styles.grid}>
          <div style={styles.card}>
            <div style={styles.cardLabel}>TOTAL SPACES</div>
            <div style={styles.cardNum}>{stats.totalSpaces}</div>
          </div>
          <div style={styles.card}>
            <div style={styles.cardLabel}>ACTIVE TENANTS</div>
            <div style={styles.cardNum}>{stats.activeTenants}</div>
          </div>
          <div style={styles.card}>
            <div style={styles.cardLabel}>PENDING INQUIRIES</div>
            <div style={{ ...styles.cardNum, color: '#c9a84c' }}>{stats.pendingInquiries}</div>
          </div>
          <div style={styles.card}>
            <div style={styles.cardLabel}>AVAILABLE UNITS</div>
            <div style={{ ...styles.cardNum, color: '#1a7a4a' }}>{stats.availableSpaces}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Server-side: protect the page + load data ────────────────────────────────
export async function getServerSideProps({ req, res }) {
  const session = await getSession(req, res);

  // If not logged in → redirect to login page
  if (!session?.bookkeeper) {
    return {
      redirect: { destination: '/', permanent: false },
    };
  }

  try {
    const [spacesRes, tenantsRes, inquiriesRes, availRes] = await Promise.all([
      query('SELECT COUNT(*) FROM spaces'),
      query("SELECT COUNT(*) FROM tenants"),
      query("SELECT COUNT(*) FROM inquirers WHERE status = 'New'"),
      query("SELECT COUNT(*) FROM spaces WHERE status = 'Available'"),
    ]);

    return {
      props: {
        user: session.bookkeeper,
        stats: {
          totalSpaces:      parseInt(spacesRes[0]?.count)     || 0,
          activeTenants:    parseInt(tenantsRes[0]?.count)    || 0,
          pendingInquiries: parseInt(inquiriesRes[0]?.count)  || 0,
          availableSpaces:  parseInt(availRes[0]?.count)      || 0,
        },
      },
    };
  } catch (err) {
    console.error('Dashboard query error:', err.message);
    return {
      props: {
        user: session.bookkeeper,
        stats: { totalSpaces: 0, activeTenants: 0, pendingInquiries: 0, availableSpaces: 0 },
      },
    };
  }
}

// ── Styles ───────────────────────────────────────────────────────────────────
const styles = {
  container:  { display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif', background: '#0d1117' },
  sidebar:    { width: '240px', background: '#070c18', borderRight: '1px solid rgba(201,168,76,0.15)', padding: '24px 16px', display: 'flex', flexDirection: 'column', flexShrink: 0 },
  sidebarTop: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' },
  logoBox:    { width: '30px', height: '30px', background: '#c9a84c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#0a0f1e', fontSize: '12px', flexShrink: 0 },
  logoText:   { fontSize: '11px', letterSpacing: '2px', color: '#d4dce8', fontWeight: '600' },
  logoSub:    { fontSize: '9px', letterSpacing: '1.5px', color: '#c9a84c' },
  divider:    { border: 'none', borderTop: '1px solid rgba(201,168,76,0.12)', margin: '0 0 16px 0' },
  nav:        { display: 'flex', flexDirection: 'column', gap: '2px', flexGrow: 1 },
  navLink:    { color: '#b8c4d4', textDecoration: 'none', padding: '9px 12px', fontSize: '12px', letterSpacing: '1px', borderRadius: '2px', transition: 'all .15s' },
  active:     { background: 'rgba(201,168,76,0.1)', color: '#c9a84c', borderLeft: '2px solid #c9a84c' },
  userTag:    { fontSize: '11px', color: '#5a6070', marginBottom: '8px', lineHeight: '1.5' },
  logoutBtn:  { width: '100%', background: 'transparent', border: '1px solid rgba(192,57,43,0.4)', color: '#e88080', padding: '8px', fontSize: '11px', letterSpacing: '1.5px', cursor: 'pointer', borderRadius: '2px' },
  main:       { flex: 1, padding: '36px 40px' },
  title:      { color: '#e8edf5', fontSize: '24px', fontWeight: '300', letterSpacing: '1px', margin: '0 0 6px 0' },
  subtitle:   { color: '#5a6878', fontSize: '13px', margin: '0 0 32px 0' },
  grid:       { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' },
  card:       { background: '#111827', border: '1px solid rgba(201,168,76,0.1)', padding: '20px 24px', borderRadius: '2px' },
  cardLabel:  { fontSize: '10px', letterSpacing: '1.5px', color: '#5a6878', marginBottom: '10px' },
  cardNum:    { fontSize: '32px', color: '#d4dce8', fontWeight: '300' },
};
