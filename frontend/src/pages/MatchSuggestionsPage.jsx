import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { blockProfile, likeProfile, rejectProfile } from '../api/match.js';
import { loadMutualMatches, loadSuggestions, selectSuggestions } from '../redux/matchSlice.js';
import { selectAuthTokens } from '../redux/authSlice.js';
import MatchCard from '../components/MatchCard.jsx';

const MatchSuggestionsPage = () => {
  const dispatch = useDispatch();
  const suggestions = useSelector(selectSuggestions);
  const tokens = useSelector(selectAuthTokens);
  const [localSuggestions, setLocalSuggestions] = useState([]);
  const [filters, setFilters] = useState({ city: '', gender: '' });

  useEffect(() => {
    dispatch(loadSuggestions());
  }, [dispatch]);

  useEffect(() => {
    setLocalSuggestions(suggestions);
  }, [suggestions]);

  const handleFilterChange = (event) => {
    setFilters((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const applyFilters = () => {
    dispatch(loadSuggestions(filters));
  };

  const handleAction = async (profile, action) => {
    if (!tokens.access) return;
    const handler = { like: likeProfile, reject: rejectProfile, block: blockProfile }[action];
    await handler(tokens.access, profile.user);
    setLocalSuggestions((prev) => prev.filter((item) => item.user !== profile.user));
    if (action === 'like') {
      dispatch(loadMutualMatches());
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Discover matches</h2>
        <div className="form" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <div>
            <label htmlFor="city">City</label>
            <input id="city" name="city" value={filters.city} onChange={handleFilterChange} />
          </div>
          <div>
            <label htmlFor="gender">Gender</label>
            <select id="gender" name="gender" value={filters.gender} onChange={handleFilterChange}>
              <option value="">Any</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="non_binary">Non-binary</option>
            </select>
          </div>
          <button type="button" className="button-primary" onClick={applyFilters}>
            Apply filters
          </button>
        </div>
      </div>
      {localSuggestions.length === 0 ? (
        <div className="card">No suggestions right now. Update your profile for more matches.</div>
      ) : (
        localSuggestions.map((profile) => (
          <MatchCard
            key={profile.user}
            profile={profile}
            onLike={() => handleAction(profile, 'like')}
            onReject={() => handleAction(profile, 'reject')}
            onBlock={() => handleAction(profile, 'block')}
          />
        ))
      )}
    </div>
  );
};

export default MatchSuggestionsPage;
