import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth', {          // ✅ FIXED: was /api/auth/index
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }), // ✅ FIXED: was email
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/dashboard');
      } else {
        setError(data.error || 'Invalid login credentials');
      }
    } catch (err) {
      setError('Cannot connect to server. Check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoArea}>
          <div style={styles.logoBox}>V</div>
          <div>
            <div style={styles.logoText}>F &amp; S VELASCO</div>
            <div style={styles.logoSub}>ADMIN PORTAL — STAFF ACCESS ONLY</div>
          </div>
        </div>

        {/* Error message */}
        {error && <div style={styles.errorBox}>{error}</div>}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>USERNAME</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={styles.input}
              placeholder="e.g. rosa"
              autoComplete="username"
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'SIGNING IN...' : 'ACCESS ADMIN PORTAL'}
          </button>
        </form>

        {/* Demo hint */}
        <div style={styles.hint}>
          <strong>Demo credentials:</strong><br />
          Username: <strong>rosa</strong> &nbsp;|&nbsp; Password: <strong>bk2024</strong><br />
          Username: <strong>carlo</strong> &nbsp;|&nbsp; Password: <strong>bk2024</strong>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#0a0f1e',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'sans-serif',
  },
  card: {
    background: '#111827',
    border: '1px solid rgba(201,168,76,0.25)',
    width: '100%',
    maxWidth: '400px',
    padding: '36px',
    borderRadius: '2px',
  },
  logoArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '28px',
    paddingBottom: '20px',
    borderBottom: '1px solid rgba(201,168,76,0.15)',
  },
  logoBox: {
    width: '36px',
    height: '36px',
    background: '#c9a84c',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    color: '#0a0f1e',
    fontSize: '14px',
    flexShrink: 0,
  },
  logoText: {
    fontSize: '13px',
    letterSpacing: '2px',
    color: '#d4dce8',
    fontWeight: '600',
  },
  logoSub: {
    fontSize: '9px',
    letterSpacing: '1.5px',
    color: '#c9a84c',
    marginTop: '2px',
  },
  errorBox: {
    background: 'rgba(192,57,43,0.15)',
    border: '1px solid rgba(192,57,43,0.4)',
    color: '#e57373',
    padding: '10px 14px',
    fontSize: '13px',
    marginBottom: '18px',
    borderRadius: '2px',
  },
  fieldGroup: {
    marginBottom: '18px',
  },
  label: {
    display: 'block',
    fontSize: '10px',
    letterSpacing: '1.5px',
    color: '#c9a84c',
    marginBottom: '6px',
  },
  input: {
    width: '100%',
    background: '#1b2440',
    border: '1px solid rgba(201,168,76,0.2)',
    color: '#d4dce8',
    padding: '10px 14px',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    borderRadius: '2px',
  },
  button: {
    width: '100%',
    background: '#c9a84c',
    color: '#0a0f1e',
    border: 'none',
    padding: '13px',
    fontSize: '11px',
    letterSpacing: '2px',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '8px',
    borderRadius: '2px',
  },
  hint: {
    marginTop: '24px',
    padding: '12px',
    background: 'rgba(201,168,76,0.06)',
    border: '1px solid rgba(201,168,76,0.15)',
    fontSize: '12px',
    color: '#b8c4d4',
    lineHeight: '1.8',
    borderRadius: '2px',
  },
};
