import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';

function DashboardPage() {
  const { user, profile, refreshProfile } = useAuth();
  const [stats, setStats] = useState({ matches: 0, chats: 0, notifications: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [matchesResponse, roomsResponse, notificationsResponse] = await Promise.all([
          apiClient.get('/api/match/mutual/'),
          apiClient.get('/api/chat/rooms/'),
          apiClient.get('/api/notifications/')
        ]);
        setStats({
          matches: matchesResponse.data.length,
          chats: roomsResponse.data.length,
          notifications: notificationsResponse.data.filter((n) => !n.is_read).length
        });
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const handleRefreshProfile = async () => {
    setLoading(true);
    await refreshProfile();
    setLoading(false);
  };

  return (
    <div className="page">
      <section className="card">
        <header className="card-header">
          <div>
            <h1>Hello {profile?.name || user?.first_name || 'there'} 👋</h1>
            <p className="helper-text">Here's a snapshot of your VivahVows journey.</p>
          </div>
          <button type="button" className="btn secondary" onClick={handleRefreshProfile}>
            Refresh profile
          </button>
        </header>
        <div className="tag-grid">
          <span className={`tag ${profile?.is_email_verified ? 'selectable active' : ''}`}>
            {profile?.is_email_verified ? 'Email verified ✅' : 'Email verification pending'}
          </span>
          {profile?.preferred_gender ? <span className="tag">Prefers {profile.preferred_gender}</span> : null}
          {profile?.preferred_city ? <span className="tag">City {profile.preferred_city}</span> : null}
        </div>
      </section>

      <section className="card">
        <header className="card-header">
          <h2>Insights</h2>
          <p className="helper-text">Quick overview of your interactions.</p>
        </header>
        <div className="stats-grid">
          <div className="stat-card">
            <h3>{loading ? '…' : stats.matches}</h3>
            <p>Mutual matches</p>
            <Link to="/matches">View matches →</Link>
          </div>
          <div className="stat-card">
            <h3>{loading ? '…' : stats.chats}</h3>
            <p>Active chat rooms</p>
            <Link to="/chat">Open chat →</Link>
          </div>
          <div className="stat-card">
            <h3>{loading ? '…' : stats.notifications}</h3>
            <p>Unread notifications</p>
            <Link to="/notifications">See notifications →</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default DashboardPage;
