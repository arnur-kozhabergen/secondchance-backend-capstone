import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { urlConfig } from '../../config';
import { useAppContext } from '../../context/AppContext';

function RegisterPage() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const { setIsLoggedIn, setUserName } = useAppContext();

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const handleRegister = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const response = await fetch(urlConfig.backendUrl + '/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not create your account.');
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
      <section className="auth-art"><div className="auth-art-mark">↗</div><p>Pass it on.<br /><em>Keep it going.</em></p><span>A community built around a better kind of giving.</span></section>
      <section className="auth-content">
        <div className="auth-form-wrap">
          <p className="eyebrow">JOIN THE COMMUNITY</p><h1>Make a little<br />room for good.</h1><p className="auth-lede">Create an account to share finds and meet your neighbors.</p>
          <form onSubmit={handleRegister}>
            <div className="form-row">
              <div><label htmlFor="firstName">First name</label><input id="firstName" autoComplete="given-name" value={form.firstName} onChange={(event) => update('firstName', event.target.value)} required /></div>
              <div><label htmlFor="lastName">Last name</label><input id="lastName" autoComplete="family-name" value={form.lastName} onChange={(event) => update('lastName', event.target.value)} required /></div>
            </div>
            <label htmlFor="email">Email address</label><input id="email" type="email" autoComplete="email" value={form.email} onChange={(event) => update('email', event.target.value)} required />
            <label htmlFor="password">Password</label><input id="password" type="password" minLength="8" autoComplete="new-password" value={form.password} onChange={(event) => update('password', event.target.value)} required />
            <p className="field-hint">Use at least 8 characters.</p>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="button button-dark auth-submit" disabled={busy}>{busy ? 'Creating account…' : 'Create account'} <span aria-hidden="true">→</span></button>
          </form>
          <p className="auth-switch">Already a member? <Link to="/app/login">Log in</Link></p>
        </div>
      </section>
    </main>
  );
}
export default RegisterPage;