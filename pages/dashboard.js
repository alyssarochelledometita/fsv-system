import { useRouter } from 'next/router';
import { getSession } from '../utils/session'; 
import { query } from '../utils/db';       

export default function Dashboard({ user, stats }) {
  const router = useRouter();

  const handleLogout = async () => {
    // Hits your auth route to destroy the cookie session
    const res = await fetch('/api/auth', { method: 'DELETE' });
    if (res.ok) {
      router.push('/');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <h2 style={styles.logo}>F&S Velasco</h2>
        <p style={styles.role}>Bookkeeper Portal</p>
        <hr style={styles.divider} />
        <nav style={styles.nav}>
          <a href="#" style={{...styles.navLink, ...styles.active}}>Dashboard</a>
          <a href="#" style={styles.navLink}>Spaces & Units</a>
          <a href="#" style={styles.navLink}>Tenants</a>
          <a href="#" style={styles.navLink}>Contracts</a>
          <a href="#" style={styles.navLink}>Payments</a>
        </nav>
        <button onClick={handleLogout} style={styles.logoutButton}>Sign Out</button>
      </div>
      <div style={styles.main}>
        {/* Uses the logged-in user name sent from the server session */}
        <h1 style={styles.title}>Welcome Back, {user?.name || 'Admin'}</h1>
        <p style={styles.subtitle}>Here is the current overview for your building operations.</p>
        
        <div style={styles.grid}>
          {/* Real data counts are cleanly printed here now! */}
          <div style={styles.card}>
            <h3>Total Spaces</h3>
            <p style={styles.statNumber}>{stats.totalSpaces}</p>
          </div>
          <div style={styles.card}>
            <h3>Active Tenants</h3>
            <p style={styles.statNumber}>{stats.activeTenants}</p>
          </div>
          <div style={styles.card}>
            <h3>Pending Inquiries</h3>
            <p style={styles.statNumber}>{stats.pendingInquiries}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// THIS SECURES THE PAGE AND GRABS SUPABASE DATA BEFORE RENDERING
export async function getServerSideProps({ req, res }) {
  const session = await getSession(req, res);

  // Guard Rail: If the cookie is dead or user isn't logged in, instantly bounce back to login
  if (!session?.bookkeeper) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  try {
    // Gather statistics from your Supabase tables simultaneously
    const spacesResult = await query("SELECT COUNT(*) FROM spaces");
    const tenantsResult = await query("SELECT COUNT(*) FROM tenants WHERE status = 'active'");
    const inquiriesResult = await query("SELECT COUNT(*) FROM inquiries WHERE status = 'pending'");

    return {
      props: {
        user: session.bookkeeper,
        stats: {
          totalSpaces: spacesResult[0]?.count || 0,
          activeTenants: tenantsResult[0]?.count || 0,
          pendingInquiries: inquiriesResult[0]?.count || 0
        }
      }
    };
  } catch (err) {
    console.error("Dashboard data extraction error: ", err);
    return {
      props: {
        user: session.bookkeeper,
        stats: { totalSpaces: 0, activeTenants: 0, pendingInquiries: 0 }
      }
    };
  }
}

const styles = {
  container: { display: 'flex', height: '100vh', backgroundColor: '#f8fafc', fontFamily: 'sans-serif' },
  sidebar: { width: '260px', backgroundColor: '#0B2545', color: '#fff', padding: '30px 20px', display: 'flex', flexDirection: 'column' },
  logo: { margin: '0 0 5px 0', fontSize: '22px', fontWeight: 'bold', color: '#fff' },
  role: { margin: '0 0 20px 0', fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' },
  divider: { border: '0', height: '1px', backgroundColor: '#1e3a8a', marginBottom: '20px' },
  nav: { display: 'flex', flexDirection: 'column', gap: '10px', flexGrow: 1 },
  navLink: { color: '#cbd5e1', textDecoration: 'none', padding: '12px', borderRadius: '6px', fontSize: '15px', fontWeight: '500' },
  active: { backgroundColor: '#134074', color: '#fff' },
  logoutButton: { padding: '12px', backgroundColor: '#1e293b', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
  main: { flexGrow: 1, padding: '40px' },
  title: { color: '#0B2545', margin: '0 0 10px 0' },
  subtitle: { color: '#64748b', margin: '0 0 30px 0' },
  grid: { display: 'flex', gap: '20px' },
  card: { backgroundColor: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', flex: 1 },
  statNumber: { fontSize: '32px', fontWeight: 'bold', color: '#134074', margin: '10px 0 0 0' }
};