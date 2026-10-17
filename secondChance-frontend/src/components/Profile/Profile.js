import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { urlConfig } from '../../config';
import { useAppContext } from '../../context/AppContext';

function Profile() {
  const [name, setName] = useState(sessionStorage.getItem('name') || '');
  const [email, setEmail] = useState(sessionStorage.getItem('email') || '');
  const [editName, setEditName] = useState(name);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const navigate = useNavigate();
  const { setUserName } = useAppContext();

  useEffect(() => {
    const token = sessionStorage.getItem('auth-token');
    if (!token) navigate('/app/login');
    else {
      fetch(urlConfig.backendUrl + '/api/auth/me', { headers: { Authorization: 'Bearer ' + token } })
        .then((response) => response.ok ? response.json() : null)
        .then((data) => {
          if (data && data.user) {
            setName(data.user.firstName);
            setEditName(data.user.firstName);
            setEmail(data.user.email);
          }
        }).catch(() => {});
    }
  }, [navigate]);

  const save = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const response = await fetch(urlConfig.backendUrl + '/api/auth/update', {
        method: 'PUT',
        headers: { Authorization: 'Bearer ' + sessionStorage.getItem('auth-token'), 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not update your profile.');
      setName(data.user.firstName);
      setEditName(data.user.firstName);
      sessionStorage.setItem('name', data.user.firstName);
      setUserName(data.user.firstName);
      setEditing(false);
      setMessage('Your name has been updated.');
      window.setTimeout(() => setMessage(''), 2500);
    } catch (saveError) {
      setError(saveError.message);
    }
  };

  return (
    <main className="page-wrap profile-page">
      <Link to="/app" className="back-link"><span aria-hidden="true">←</span> Back to the collection</Link>
      <p className="eyebrow">YOUR SECONDCHANCE</p><h1>Good to see you, <em>{name}.</em></h1>
      <section className="profile-card">
        <div className="profile-avatar">{(name || 'U').charAt(0).toUpperCase()}</div>
        <div className="profile-fields">
          <p><span>Email</span><strong>{email}</strong></p>
          {editing ? (
            <form onSubmit={save}>
              <label htmlFor="profile-name">First name</label><input id="profile-name" value={editName} onChange={(event) => setEditName(event.target.value)} required />
              <div className="profile-actions"><button className="button button-dark button-small">Save changes</button><button type="button" className="button button-outline button-small" onClick={() => setEditing(false)}>Cancel</button></div>
            </form>
          ) : <p><span>First name</span><strong>{name}</strong></p>}
        </div>
        {!editing && <button className="button button-outline button-small" onClick={() => setEditing(true)}>Edit profile</button>}
        {message && <p className="success-message" role="status">{message}</p>}
        {error && <p className="form-error" role="alert">{error}</p>}
      </section>
    </main>
  );
}
export default Profile;