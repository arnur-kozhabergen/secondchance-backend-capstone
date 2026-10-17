import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { urlConfig } from '../../config';

function DetailsPage() {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    window.scrollTo(0, 0);
    fetch(urlConfig.backendUrl + '/api/secondchance/items/' + encodeURIComponent(itemId))
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'This item could not be found.');
        return data;
      })
      .then((data) => { if (active) setItem(data); })
      .catch((fetchError) => { if (active) setError(fetchError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [itemId]);

  if (loading) return <main className="page-wrap"><p className="status-message">Opening this find…</p></main>;
  if (error) return <main className="page-wrap"><p className="status-message error-message" role="alert">{error}</p><Link className="text-link" to="/app">Back to the collection →</Link></main>;
  if (!item) return null;

  const comments = Array.isArray(item.comments) ? item.comments : [];
  return (
    <main className="page-wrap detail-page">
      <button className="back-link" onClick={() => navigate(-1)}><span aria-hidden="true">←</span> Back to the collection</button>
      <section className="detail-layout">
        <div className="detail-image-wrap">
          {item.image ? <img src={urlConfig.backendUrl + item.image} alt={item.name} className="detail-image" /> : <div className="image-fallback detail-fallback">A new home awaits</div>}
          <span className="image-badge">{item.condition || 'Pre-loved'}</span>
        </div>
        <div className="detail-copy">
          <p className="eyebrow">{item.category || 'COMMUNITY FIND'} <span>·</span> SHARED WITH CARE</p>
          <h1>{item.name}</h1>
          <p className="detail-description">{item.description || 'A useful find ready for another chapter.'}</p>
          <div className="detail-facts">
            <div><span>Condition</span><strong>{item.condition || 'Pre-loved'}</strong></div>
            <div><span>Item age</span><strong>{item.age_years ? Number(item.age_years).toFixed(1) + ' years' : 'Not listed'}</strong></div>
            <div><span>Location</span><strong>{item.zipcode || 'Community'}</strong></div>
          </div>
          <div className="detail-share-note"><span>✳</span><p>Every shared item keeps useful things in circulation and helps make a lighter footprint.</p></div>
          <Link to="/app/search" className="button button-green">Find another good thing <span aria-hidden="true">→</span></Link>
        </div>
      </section>
      <section className="comments-section">
        <div className="section-heading"><div><p className="eyebrow">A LITTLE CONVERSATION</p><h2>Notes from the community</h2></div><span className="comment-count">{comments.length} notes</span></div>
        {comments.length ? <div className="comment-grid">{comments.map((comment, index) => (
          <article className="comment-card" key={index}><span className="comment-mark">“</span><p>{comment.comment}</p><strong>{comment.author}</strong></article>
        ))}</div> : <p className="status-message">No notes yet. Be the first to connect around this find.</p>}
      </section>
    </main>
  );
}
export default DetailsPage;