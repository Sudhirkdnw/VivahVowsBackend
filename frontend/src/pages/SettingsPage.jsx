import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { logout, selectCurrentUser } from '../redux/authSlice.js';

const SettingsPage = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const [preferences, setPreferences] = useState({ emailUpdates: true, smsAlerts: false });

  return (
    <div className="surface-grid" style={{ gap: '24px' }}>
      <header className="section-header">
        <div>
          <div className="badge">Account</div>
          <h1 style={{ margin: '12px 0 0' }}>Settings</h1>
          <p style={{ margin: '6px 0 0', color: 'rgba(203,213,225,0.75)' }}>
            Configure notifications and security preferences.
          </p>
        </div>
      </header>
      <section className="surface-card" style={{ display: 'grid', gap: '16px', maxWidth: '520px' }}>
        <header className="section-header">
          <div>
            <div className="badge">Profile</div>
            <h2 style={{ margin: '12px 0 0' }}>Account overview</h2>
          </div>
        </header>
        <div className="field-group">
          <label>Email</label>
          <div>{user?.email ?? '—'}</div>
        </div>
        <div className="field-group">
          <label>Member since</label>
          <div>{user?.date_joined ? new Date(user.date_joined).toLocaleDateString() : '—'}</div>
        </div>
        <button type="button" className="button button--ghost" onClick={() => dispatch(logout())}>
          Log out
        </button>
      </section>
      <section className="surface-card" style={{ display: 'grid', gap: '16px', maxWidth: '520px' }}>
        <header className="section-header">
          <div>
            <div className="badge">Preferences</div>
            <h2 style={{ margin: '12px 0 0' }}>Communication</h2>
          </div>
        </header>
        <label className="field-group" htmlFor="email-updates" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>Email updates</span>
          <input
            id="email-updates"
            type="checkbox"
            checked={preferences.emailUpdates}
            onChange={(event) => setPreferences((prev) => ({ ...prev, emailUpdates: event.target.checked }))}
          />
        </label>
        <label className="field-group" htmlFor="sms-alerts" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>SMS alerts</span>
          <input
            id="sms-alerts"
            type="checkbox"
            checked={preferences.smsAlerts}
            onChange={(event) => setPreferences((prev) => ({ ...prev, smsAlerts: event.target.checked }))}
          />
        </label>
        <button type="button" className="button" onClick={() => window.alert('Preferences saved!')}>
          Save preferences
        </button>
      </section>
    </div>
  );
};

export default SettingsPage;
