import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { urlConfig } from '../../config';

const categories = ['Bedroom', 'Bathroom', 'Kitchen', 'Living', 'Living Room', 'Office', 'Office Furniture'];
const conditions = ['New', 'Like New', 'Older'];

function SearchPage() {
  const [filters, setFilters] = useState({ name: '', category: '', condition: '', age_years: '' });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const search = React.useCallback(async (nextFilters) => {
    setLoading(true);
    setError('');
    const params = new URLSearchParams();
    Object.entries(nextFilters).forEach(([key, value]) => { if (value !== '') params.set(key, value); });
    try {
      const response = await fetch(urlConfig.backendUrl + '/api/secondchance/search?' + params.toString());
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Search failed. Please try again.');
      setResults(data);
    } catch (searchError) {
      setError(searchError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { search({ name: '', category: '', condition: '', age_years: '' }); }, [search]);
  const update = (field, value) => setFilters((current) => ({ ...current, [field]: value }));
  const handleSubmit = (event) => { event.preventDefault(); search(filters); };
  const reset = () => {
    const empty = { name: '', category: '', condition: '', age_years: '' };
    setFilters(empty);
    search(empty);
  };

  return (
    <main className="page-wrap search-page">
      <div className="page-intro"><p className="eyebrow">A SECOND LIFE, NEAR YOU</p><h1>Find the thing<br /><em>you didn’t know you needed.</em></h1><p>Search the community collection and meet your next well-loved favorite.</p></div>
      <div className="search-layout">
        <form className="filter-panel" onSubmit={handleSubmit}>
          <div className="filter-title"><h2>Refine your search</h2><button type="button" onClick={reset} className="reset-button">Clear all</button></div>
          <label htmlFor="search-name">What are you looking for?</label><input id="search-name" type="search" value={filters.name} onChange={(event) => update('name', event.target.value)} placeholder="Try “bookshelf”" />
          <label htmlFor="categorySelect">Room or category</label>
          <select id="categorySelect" value={filters.category} onChange={(event) => update('category', event.target.value)}><option value="">Any category</option>{categories.map((value) => <option key={value} value={value}>{value}</option>)}</select>
          <label htmlFor="conditionSelect">Condition</label>
          <select id="conditionSelect" value={filters.condition} onChange={(event) => update('condition', event.target.value)}><option value="">Any condition</option>{conditions.map((value) => <option key={value} value={value}>{value}</option>)}</select>
          <label htmlFor="ageRange">Item age <span>{filters.age_years ? 'Up to ' + filters.age_years + ' years' : 'Any age'}</span></label>
          <input id="ageRange" type="range" min="0" max="10" value={filters.age_years || 10} onChange={(event) => update('age_years', event.target.value === '10' ? '' : event.target.value)} />
          <button className="button button-dark filter-submit" type="submit">Show matching finds <span aria-hidden="true">→</span></button>
        </form>
        <section className="results-panel" aria-live="polite">
          <div className="results-heading"><div><p className="eyebrow">THE COLLECTION</p><h2>{loading ? 'Finding your match…' : results.length + ' community finds'}</h2></div><span>Sorted by newest</span></div>
          {error && <p className="status-message error-message" role="alert">{error}</p>}
          {loading ? <p className="status-message">Searching the collection…</p> : (
            <div className="listing-grid search-results">
              {results.map((item, index) => (
                <article className="listing-card" key={item.id || item._id} style={{ '--card-index': index }}>
                  <button className="listing-image-button" onClick={() => navigate('/app/item/' + item.id)} aria-label={'View ' + item.name}>
                    {item.image ? <img className="listing-image" src={urlConfig.backendUrl + item.image} alt={item.name} loading="lazy" /> : <span className="image-fallback">A new home awaits</span>}
                    <span className="image-badge">{item.condition || 'Pre-loved'}</span><span className="image-arrow" aria-hidden="true">↗</span>
                  </button>
                  <div className="listing-info"><div><p className="listing-category">{item.category}</p><h3>{item.name}</h3></div><p className="listing-meta">{item.zipcode ? 'Near ' + item.zipcode : 'Community find'} <span aria-hidden="true">·</span> {item.age_years ? Number(item.age_years).toFixed(1) + ' yrs old' : 'Ready to use'}</p></div>
                </article>
              ))}
              {!results.length && <div className="empty-state"><span className="empty-icon">⌕</span><h3>No matches just yet</h3><p>Try widening your filters. There are new finds all the time.</p><button className="text-link" onClick={reset}>Clear filters <span aria-hidden="true">→</span></button></div>}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
export default SearchPage;