import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';

function MutualMatchesPage() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMatches() {
      try {
        const response = await apiClient.get('/api/match/mutual/');
        setMatches(response.data);
      } catch (error) {
        console.error('Failed to load matches', error);
      } finally {
        setLoading(false);
      }
    }

    fetchMatches();
  }, []);

  return (
    <section className="card">
      <header className="card-header">
        <div>
          <h1>Mutual matches</h1>
          <p className="helper-text">Celebrate the connections you've both liked.</p>
        </div>
      </header>
      {loading ? (
        <p>Loading matches…</p>
      ) : matches.length === 0 ? (
        <p>You don't have mutual matches yet. Keep exploring suggestions!</p>
      ) : (
        <div className="match-grid">
          {matches.map((match) => (
            <article key={match.id} className="match-card">
              <div className="match-header">
                <div className="avatar" aria-hidden>
                  {match.partner_profile?.name?.[0]?.toUpperCase() || 'M'}
                </div>
                <div>
                  <h3>{match.partner_profile?.name || 'New match'}</h3>
                  <p>{match.partner_profile?.bio || 'No bio yet.'}</p>
                </div>
              </div>
              <div className="tag-grid">
                {match.partner_profile?.city ? (
                  <span className="pill">{match.partner_profile.city}</span>
                ) : null}
                {match.partner_profile?.profession ? (
                  <span className="tag">{match.partner_profile.profession}</span>
                ) : null}
              </div>
              <Link className="btn secondary" to="/chat">
                Open chat
              </Link>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default MutualMatchesPage;
