import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { loadProfile, selectProfile } from '../redux/profileSlice.js';
import { loadMutualMatches, loadSuggestions, selectMutualMatches, selectSuggestions } from '../redux/matchSlice.js';
import { loadNotifications, selectNotifications } from '../redux/notificationSlice.js';

const DashboardPage = () => {
  const dispatch = useDispatch();
  const profile = useSelector(selectProfile);
  const mutualMatches = useSelector(selectMutualMatches);
  const suggestions = useSelector(selectSuggestions);
  const notifications = useSelector(selectNotifications);

  useEffect(() => {
    dispatch(loadProfile());
    dispatch(loadMutualMatches());
    dispatch(loadSuggestions());
    dispatch(loadNotifications());
  }, [dispatch]);

  const activeMatches = mutualMatches?.results ?? mutualMatches ?? [];
  const suggestionItems = suggestions?.results ?? suggestions ?? [];
  const notificationItems = Array.isArray(notifications?.results)
    ? notifications.results
    : notifications ?? [];
  const recentNotifications = notificationItems.slice(0, 4);

  return (
    <div className="surface-grid" style={{ gap: '32px' }}>
      <header className="section-header">
        <div>
          <div className="badge">Command center</div>
          <h1 style={{ margin: '12px 0 0' }}>Welcome back{profile?.name ? `, ${profile.name}` : ''}!</h1>
          <p style={{ margin: '6px 0 0', color: 'rgba(203,213,225,0.75)' }}>
            Here’s a snapshot of your VivahVows presence today.
          </p>
        </div>
      </header>
      <section className="surface-grid surface-grid--three">
        <article className="stat-card">
          <div className="stat-card__label">Live matches</div>
          <div className="stat-card__value">{activeMatches.length}</div>
          <div className="stat-card__delta">+2 new this week</div>
        </article>
        <article className="stat-card">
          <div className="stat-card__label">Fresh suggestions</div>
          <div className="stat-card__value">{suggestionItems.length}</div>
          <div className="stat-card__delta">Curated for your preferences</div>
        </article>
        <article className="stat-card">
          <div className="stat-card__label">Unread updates</div>
          <div className="stat-card__value">{recentNotifications.filter((item) => !item.is_read).length}</div>
          <div className="stat-card__delta">Stay on top of invites</div>
        </article>
      </section>
      <section className="surface-card" style={{ display: 'grid', gap: '16px' }}>
        <div className="section-header">
          <div>
            <div className="badge">Matches</div>
            <h2 style={{ margin: '12px 0 0' }}>Your mutual connections</h2>
          </div>
        </div>
        <table className="table-card">
          <thead>
            <tr>
              <th align="left">Name</th>
              <th align="left">City</th>
              <th align="left">Status</th>
            </tr>
          </thead>
          <tbody>
            {activeMatches.length === 0 && (
              <tr>
                <td colSpan={3}>
                  <div className="empty-state">No mutual matches yet — keep your profile updated!</div>
                </td>
              </tr>
            )}
            {activeMatches.map((match) => (
              <tr key={match.id ?? match.profile?.id}>
                <td>{match.profile?.name ?? match.name ?? 'Anonymous match'}</td>
                <td>{match.profile?.city ?? match.city ?? '—'}</td>
                <td>
                  <span className="badge">Active</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section className="surface-card" style={{ display: 'grid', gap: '16px' }}>
        <div className="section-header">
          <div>
            <div className="badge">Suggestions</div>
            <h2 style={{ margin: '12px 0 0' }}>Fresh profiles to explore</h2>
          </div>
        </div>
        <div className="surface-grid surface-grid--two">
          {suggestionItems.length === 0 && (
            <div className="empty-state">We’re gathering new suggestions for you. Check back soon!</div>
          )}
          {suggestionItems.map((suggestion) => (
            <article key={suggestion.id} className="surface-card">
              <div className="badge" style={{ marginBottom: '12px' }}>{suggestion.city ?? 'Across India'}</div>
              <h3 style={{ margin: '0 0 8px' }}>{suggestion.name ?? 'New connection'}</h3>
              <p style={{ margin: 0, color: 'rgba(203,213,225,0.75)' }}>
                {suggestion.profession ?? 'Profession TBD'} · {suggestion.religion ?? '—'}
              </p>
            </article>
          ))}
        </div>
      </section>
      <section className="surface-card" style={{ display: 'grid', gap: '16px' }}>
        <div className="section-header">
          <div>
            <div className="badge">Activity feed</div>
            <h2 style={{ margin: '12px 0 0' }}>Latest notifications</h2>
          </div>
        </div>
        <ul className="list-reset" style={{ display: 'grid', gap: '12px' }}>
          {recentNotifications.length === 0 && (
            <li className="empty-state">All caught up! We’ll notify you when there’s activity.</li>
          )}
          {recentNotifications.map((notification) => (
            <li key={notification.id} className="surface-card" style={{ padding: '16px' }}>
              <div style={{ fontSize: '0.8rem', opacity: 0.65, textTransform: 'uppercase' }}>
                {notification.event ?? 'Update'}
              </div>
              <div style={{ fontWeight: 600 }}>{notification.payload?.message ?? notification.detail}</div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default DashboardPage;
