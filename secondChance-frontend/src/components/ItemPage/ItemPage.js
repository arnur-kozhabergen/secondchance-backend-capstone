import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { urlConfig } from '../../config';

function ItemPage() {
  const [form, setForm] = useState({ name: '', category: 'Living', condition: 'Like New', zipcode: '', age_days: '', description: '' });
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const handleSubmit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => payload.append(key, value));
    if (file) payload.append('file', file);
    try {
      const response = await fetch(urlConfig.backendUrl + '/api/secondchance/items', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + sessionStorage.getItem('auth-token') },
        body: payload
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not share your item.');
      navigate('/app/item/' + data.id);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="page-wrap form-page">
      <Link to="/app" className="back-link"><span aria-hidden="true">←</span> Back to the collection</Link>
      <div className="form-page-heading"><p className="eyebrow">PASS IT ALONG</p><h1>Give a good thing<br /><em>a new beginning.</em></h1><p>Add a few details so someone nearby can find it.</p></div>
      <form className="item-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div><label htmlFor="name">What are you sharing?</label><input id="name" value={form.name} onChange={(event) => update('name', event.target.value)} placeholder="e.g. Oak side table" required /></div>
          <div><label htmlFor="category">Room or category</label><select id="category" value={form.category} onChange={(event) => update('category', event.target.value)}><option>Living</option><option>Living Room</option><option>Bedroom</option><option>Bathroom</option><option>Kitchen</option><option>Office</option></select></div>
        </div>
        <div className="form-row">
          <div><label htmlFor="condition">Condition</label><select id="condition" value={form.condition} onChange={(event) => update('condition', event.target.value)}><option>New</option><option>Like New</option><option>Older</option></select></div>
          <div><label htmlFor="zipcode">ZIP code</label><input id="zipcode" value={form.zipcode} onChange={(event) => update('zipcode', event.target.value)} placeholder="Your neighborhood" /></div>
        </div>
        <label htmlFor="age_days">How long have you had it? <span className="label-note">in days</span></label><input id="age_days" type="number" min="0" value={form.age_days} onChange={(event) => update('age_days', event.target.value)} placeholder="e.g. 365" />
        <label htmlFor="description">A few words about it</label><textarea id="description" rows="4" value={form.description} onChange={(event) => update('description', event.target.value)} placeholder="What should its next owner know?" required />
        <label htmlFor="file">Add a photo <span className="label-note">JPG, PNG or GIF · max 5 MB</span></label><input id="file" type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={(event) => setFile(event.target.files[0] || null)} />
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="button button-green auth-submit" disabled={busy}>{busy ? 'Sharing your find…' : 'Share this item'} <span aria-hidden="true">→</span></button>
      </form>
    </main>
  );
}
export default ItemPage;