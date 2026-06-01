import { useRouter } from 'next/router';

export default function Dashboard() {
  const router = useRouter();

  const handleLogout = async () => {
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
        <h1 style={styles.title}>Welcome Back, Admin</h1>
        <p style={styles.subtitle}>Here is the current overview for your building operations.</p>
        
        <div style={styles.grid}>
          <div style={styles.card}><h3>Total Spaces</h3><p style={styles.statNumber}>--</p></div>
          <div style={styles.card}><h3>Active Tenants</h3><p style={styles.statNumber}>--</p></div>
          <div style={styles.card}><h3>Pending Inquiries</h3><p style={styles.statNumber}>--</p></div>
        </div>
      </div>
    </div>
  );
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