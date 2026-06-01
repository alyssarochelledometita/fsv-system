import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      // Login successful! Redirect to the admin dashboard
      router.push('/dashboard');
    } else {
      const data = await res.json();
      setError(data.error || 'Invalid login credentials');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>F&S Velasco</h1>
        <p style={styles.subtitle}>Property Management System</p>
        
        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              style={styles.input}
              placeholder="admin@fsvelasco.com"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              style={styles.input}
              placeholder="••••••••"
            />
          </div>

          <button type="submit" style={styles.button}>Sign In as Bookkeeper</button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f4f8', fontFamily: 'sans-serif' },
  card: { backgroundColor: '#ffffff', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px', textAlign: 'center' },
  title: { color: '#0B2545', margin: '0 0 5px 0', fontSize: '28px', fontWeight: 'bold' },
  subtitle: { color: '#8c96a3', margin: '0 0 30px 0', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' },
  form: { textAlign: 'left' },
  inputGroup: { marginBottom: '20px' },
  label: { display: 'block', marginBottom: '5px', color: '#134074', fontSize: '14px', fontWeight: '600' },
  input: { width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '16px' },
  button: { width: '100%', padding: '12px', backgroundColor: '#0B2545', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s', marginTop: '10px' },
  error: { backgroundColor: '#ffebe9', color: '#ea4a3a', padding: '10px', borderRadius: '4px', marginBottom: '20px', fontSize: '14px', border: '1px solid #ffceca' }
};