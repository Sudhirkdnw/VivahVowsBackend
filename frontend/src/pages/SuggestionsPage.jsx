import { useEffect, useMemo, useState } from 'react';
import apiClient from '../api/client';
import ProfileCard from '../components/ProfileCard';
import MatchFilters from '../components/MatchFilters';

function SuggestionsPage() {
  const [filters, setFilters] = useState({
    gender: '',
    city: '',
    religion: '',
    age_min: '',
    age_max: '',
    interests: []
  });
  const [profiles, setProfiles] = useState([]);
  const [interestOptions, setInterestOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    async function fetchInterests() {
      try {
        const response = await apiClient.get('/api/interests/');
        setInterestOptions(response.data);
      } catch (error) {
        console.error('Failed to load interests', error);
      }
    }
    fetchInterests();
  }, []);

  const fetchSuggestions = useMemo(
    () =>
      async (currentFilters) => {
        setLoading(true);
        setStatus(null);
        try {
          const params = new URLSearchParams();
          Object.entries(currentFilters).forEach(([key, value]) => {
            if (!value) return;
            if (Array.isArray(value)) {
              value.forEach((entry) => params.append(key, entry));
            } else {
              params.append(key, value);
            }
          });
          const response = await apiClient.get(`/api/match/suggestions/?${params.toString()}`);
          setProfiles(response.data);
        } catch (error) {
          console.error('Failed to load suggestions', error);
          setStatus({ ok: false, message: 'Unable to load suggestions.' });
        } finally {
          setLoading(false);
        }
      },
    []
  );

  useEffect(() => {
    fetchSuggestions(filters);
  }, [filters, fetchSuggestions]);

  const interestLookup = useMemo(() => {
    const map = new Map();
    interestOptions.forEach((interest) => map.set(interest.id, interest.name));
    return map;
  }, [interestOptions]);

  const enhanceProfile = (profile) => ({
    ...profile,
    interests: (profile.interests || []).map((id) => interestLookup.get(id) || id)
  });

  const performAction = async (profile, action) => {
    setActionLoading(true);
    setStatus(null);
    try {
      const endpoint = `/api/match/${action}/${profile.user}/`;
      const response = await apiClient.post(endpoint);
      if (response.data.match) {
        setStatus({ ok: true, message: `🎉 It's a match with ${profile.name || 'a new connection'}!` });
      }
      setProfiles((prev) => prev.filter((item) => item.id !== profile.id));
    } catch (error) {
      console.error('Match action failed', error);
      setStatus({ ok: false, message: error.response?.data?.detail || 'Unable to perform action.' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="page">
      <MatchFilters filters={filters} onChange={setFilters} interestOptions={interestOptions} />
      {status ? (
        <div className={status.ok ? 'success-banner' : 'error-banner'}>{status.message}</div>
      ) : null}
      {loading ? (
        <div className="card">
          <p>Loading suggestions…</p>
        </div>
      ) : profiles.length === 0 ? (
        <div className="card">
          <p>No suggestions match your filters yet. Try adjusting preferences.</p>
        </div>
      ) : (
        profiles.map((profile) => (
          <ProfileCard
            key={profile.id}
            profile={enhanceProfile(profile)}
            actionLoading={actionLoading}
            onLike={(item) => performAction(item, 'like')}
            onReject={(item) => performAction(item, 'reject')}
            onBlock={(item) => performAction(item, 'block')}
          />
        ))
      )}
    </div>
  );
}

export default SuggestionsPage;
