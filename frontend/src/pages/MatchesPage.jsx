import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { loadMutualMatches, loadSuggestions, selectMutualMatches, selectSuggestions } from '../redux/matchSlice.js';

const MatchesPage = () => {
  const dispatch = useDispatch();
  const mutualMatches = useSelector(selectMutualMatches);
  const suggestions = useSelector(selectSuggestions);
  const status = useSelector((state) => state.match.status);
  const [filters, setFilters] = useState({ city: '', gender: '' });

  useEffect(() => {
    dispatch(loadMutualMatches());
    dispatch(loadSuggestions());
  }, [dispatch]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilterSubmit = (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => Boolean(value))
    );
    dispatch(loadSuggestions(payload));
  };

  const activeMatches = mutualMatches?.results ?? mutualMatches ?? [];
  const suggestionItems = suggestions?.results ?? suggestions ?? [];

  return (
    <div className="surface-grid" style={{ gap: '32px' }}>
      <header className="section-header">
        <div>
          <div className="badge">Discovery</div>
          <h1 style={{ margin: '12px 0 0' }}>Match intelligence hub</h1>
          <p style={{ margin: '6px 0 0', color: 'rgba(203,213,225,0.75)' }}>
            Fine-tune your preferences and meet curated matches.
          </p>
        </div>
      </header>
      <section className="surface-card" style={{ display: 'grid', gap: '16px' }}>
        <header className="section-header">
          <div>
            <div className="badge">Filters</div>
            <h2 style={{ margin: '12px 0 0' }}>Personalize suggestions</h2>
          </div>
        </header>
        <form className="form-grid form-grid--two" onSubmit={handleFilterSubmit}>
          <label className="field-group" htmlFor="filter-city">
            <span>City</span>
            <input
              id="filter-city"
              name="city"
              value={filters.city}
              onChange={handleFilterChange}
              placeholder="Any city"
            />
          </label>
          <label className="field-group" htmlFor="filter-gender">
            <span>Gender</span>
            <select id="filter-gender" name="gender" value={filters.gender} onChange={handleFilterChange}>
              <option value="">Any</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </label>
          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '12px' }}>
            <button type="submit" className="button" disabled={status === 'loading'}>
              {status === 'loading' ? 'Filtering…' : 'Apply filters'}
            </button>
            <button
              type="button"
              className="button button--ghost"
              onClick={() => {
                setFilters({ city: '', gender: '' });
                dispatch(loadSuggestions());
              }}
            >
              Reset
            </button>
          </div>
        </form>
      </section>
      <section className="surface-card" style={{ display: 'grid', gap: '16px' }}>
        <header className="section-header">
          <div>
            <div className="badge">Mutual matches</div>
            <h2 style={{ margin: '12px 0 0' }}>Your strongest connections</h2>
          </div>
        </header>
        <div className="surface-grid surface-grid--two">
          {activeMatches.length === 0 && (
            <div className="empty-state">No mutual matches just yet — keep exploring!</div>
          )}
          {activeMatches.map((match) => (
            <article key={match.id ?? match.profile?.id} className="surface-card">
              <h3 style={{ margin: '0 0 8px' }}>{match.profile?.name ?? match.name ?? 'Match'}</h3>
              <p style={{ margin: 0, color: 'rgba(203,213,225,0.75)' }}>
                {match.profile?.city ?? match.city ?? '—'} · {match.profile?.profession ?? match.profession ?? '—'}
              </p>
            </article>
          ))}
        </div>
      </section>
      <section className="surface-card" style={{ display: 'grid', gap: '16px' }}>
        <header className="section-header">
          <div>
            <div className="badge">Suggested profiles</div>
            <h2 style={{ margin: '12px 0 0' }}>Curated for you</h2>
          </div>
        </header>
        <div className="surface-grid surface-grid--two">
          {suggestionItems.length === 0 && (
            <div className="empty-state">No suggestions with the current filters.</div>
          )}
          {suggestionItems.map((suggestion) => (
            <article key={suggestion.id} className="surface-card">
              <h3 style={{ margin: '0 0 8px' }}>{suggestion.name ?? 'Potential match'}</h3>
              <p style={{ margin: 0, color: 'rgba(203,213,225,0.75)' }}>
                {suggestion.city ?? '—'} · {suggestion.religion ?? '—'}
              </p>
              <p style={{ margin: '12px 0 0', color: 'rgba(203,213,225,0.6)' }}>
                {suggestion.bio?.slice(0, 140) ?? 'Introduce yourself to unlock a personalised feed.'}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default MatchesPage;
