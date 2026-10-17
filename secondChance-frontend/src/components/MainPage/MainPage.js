import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { urlConfig } from '../../config';
import { useAppContext } from '../../context/AppContext';

const imageUrl = (image) => image ? urlConfig.backendUrl + image : '';

function MainPage() {
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { isLoggedIn } = useAppContext();

  useEffect(() => {
    let active = true;
    fetch(urlConfig.backendUrl + '/api/secondchance/items')
      .then((response) => {
        if (!response.ok) throw new Error('The listings could not be loaded.');
        return response.json();
      })
      .then((data) => { if (active) setItems(data); })
      .catch((fetchError) => { if (active) setError(fetchError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const categories = ['All', ...Array.from(new Set(items.map((item) => item.category).filter(Boolean)))];
  const visibleItems = useMemo(
    () => category === 'All' ? items : items.filter((item) => item.category === category),
    [items, category]
  );

  return (
    <main>
      <section className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-line" /> A little less waste. A lot more possibility.</p>
          <h1>Make room for<br /><em>another story.</em></h1>
          <p className="hero-description">Find useful things looking for a new home, or pass along something you no longer need.</p>
          <div className="hero-actions">
          <Link to="/app/search" className="button button-green">Get Started <span aria-hidden="true">↗</span></Link>
            {isLoggedIn && <button className="button button-light" onClick={() => navigate('/app/addItem')}>Give an item</button>}
          </div>
          <div className="hero-note"><span className="note-icon">✳</span><span>Every item shared is one more thing kept in use.</span></div>
        </div>
        <div className="hero-art" aria-label="A thoughtfully furnished living room">
          <div className="hero-image-frame"><img src={imageUrl('/images/coffee-table.jpeg')} alt="A reclaimed coffee table ready for a new home" /></div>
          <div className="hero-sticker"><span>GOOD<br />FINDS</span><span className="sticker-star">✳</span></div>
          <div className="hero-caption"><span>Objects with a past.</span><span>Room for a future.</span></div>
          <div className="hero-arc" aria-hidden="true" />
        </div>
      </section>

      <section className="collection-section" id="collection">
        <div className="section-heading">
          <div><p className="eyebrow">THE COMMUNITY COLLECTION</p><h2>Find your next <em>favorite.</em></h2></div>
          <Link className="text-link" to="/app/search">See everything <span aria-hidden="true">→</span></Link>
        </div>
        <div className="category-strip" aria-label="Filter by category">
          {categories.map((name) => <button key={name} className={category === name ? 'category-chip selected' : 'category-chip'} onClick={() => setCategory(name)}>{name}</button>)}
        </div>
        {loading && <p className="status-message">Gathering the latest finds…</p>}
        {error && <p className="status-message error-message" role="alert">{error}</p>}
        {!loading && !error && (
          <div className="listing-grid">
            {visibleItems.slice(0, 8).map((item, index) => (
              <article className="listing-card" key={item.id || item._id} style={{ '--card-index': index }}>
                <button className="listing-image-button" onClick={() => navigate('/app/item/' + item.id)} aria-label={'View ' + item.name}>
                  {item.image ? <img className="listing-image" src={imageUrl(item.image)} alt={item.name} loading="lazy" /> : <span className="image-fallback">A new home awaits</span>}
                  <span className="image-badge">{item.condition || 'Pre-loved'}</span><span className="image-arrow" aria-hidden="true">↗</span>
                </button>
                <div className="listing-info">
                  <div><p className="listing-category">{item.category || 'Community find'}</p><h3>{item.name}</h3></div>
                  <p className="listing-meta">{item.zipcode ? 'Near ' + item.zipcode : 'Shared with care'} <span aria-hidden="true">·</span> {item.age_years ? Number(item.age_years).toFixed(1) + ' yrs old' : 'Ready to use'}</p>
                </div>
              </article>
            ))}
            {!visibleItems.length && <p className="status-message">No listings in this category yet. Try another filter.</p>}
          </div>
        )}
        <div className="collection-cta"><span>Have something good to pass along?</span><Link to={isLoggedIn ? '/app/addItem' : '/app/register'} className="text-link">{isLoggedIn ? 'Share an item' : 'Join SecondChance'} <span aria-hidden="true">→</span></Link></div>
      </section>

      <section className="purpose-band"><div className="purpose-mark">↗</div><p>Good things keep going.</p><span>Browse locally. Share generously. Give useful things a second chance.</span></section>
    </main>
  );
}
export default MainPage;
