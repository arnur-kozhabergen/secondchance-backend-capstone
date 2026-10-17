import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { urlConfig } from '../../config';
import { useAppContext } from '../../context/AppContext';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const { setIsLoggedIn, setUserName } = useAppContext();

  const handleLogin = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const response = await fetch(urlConfig.backendUrl + '/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not sign in.');
      sessionStorage.setItem('auth-token', data.authtoken);
      sessionStorage.setItem('name', data.user.firstName);
      sessionStorage.setItem('email', data.user.email);
      setIsLoggedIn(true);
      setUserName(data.user.firstName);
      navigate('/app');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-art"><div className="auth-art-mark">✳</div><p>Good things<br /><em>find their way.</em></p><span>More room for what comes next.</span></section>
      <section className="auth-content">
        <div className="auth-form-wrap">
          <p className="eyebrow">WELCOME BACK</p><h1>Pick up where<br />you left off.</h1><p className="auth-lede">Your next good find is waiting.</p>
          <form onSubmit={handleLogin}>
            <label htmlFor="email">Email address</label><input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            <label htmlFor="password">Password</label><input id="password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="button button-dark auth-submit" disabled={busy}>{busy ? 'Signing in…' : 'Log in'} <span aria-hidden="true">→</span></button>
          </form>
          <p className="auth-switch">New to SecondChance? <Link to="/app/register">Create an account</Link></p>
        </div>
      </section>
    </main>
  );
}
export default LoginPage;