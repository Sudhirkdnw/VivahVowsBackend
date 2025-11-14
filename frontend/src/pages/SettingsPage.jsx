import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  logout,
  selectAccountUpdateError,
  selectAccountUpdateStatus,
  selectCurrentUser,
  updateAccount
} from '../redux/authSlice.js';

const SettingsPage = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const updateStatus = useSelector(selectAccountUpdateStatus);
  const updateError = useSelector(selectAccountUpdateError);
  const [preferences, setPreferences] = useState({ emailUpdates: true, smsAlerts: false });
  const [accountForm, setAccountForm] = useState({ username: '', first_name: '', last_name: '' });
  const [accountSaved, setAccountSaved] = useState(false);

  useEffect(() => {
    setAccountForm({
      username: user?.username ?? '',
      first_name: user?.first_name ?? '',
      last_name: user?.last_name ?? ''
    });
  }, [user]);

  const handleAccountChange = (event) => {
    const { name, value } = event.target;
    setAccountForm((prev) => ({ ...prev, [name]: value }));
    setAccountSaved(false);
  };

  const handleAccountSubmit = async (event) => {
    event.preventDefault();
    setAccountSaved(false);
    try {
      await dispatch(updateAccount(accountForm)).unwrap();
      setAccountSaved(true);
    } catch (error) {
      // error state handled via Redux slice
    }
  };

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
        <form onSubmit={handleAccountSubmit} style={{ display: 'grid', gap: '16px' }}>
          <div className="field-group">
            <label htmlFor="account-email">Email</label>
            <input id="account-email" value={user?.email ?? ''} readOnly />
          </div>
          <div className="field-group">
            <label htmlFor="account-username">Username</label>
            <input
              id="account-username"
              name="username"
              value={accountForm.username}
              onChange={handleAccountChange}
            />
          </div>
          <div className="field-group">
            <label htmlFor="account-first-name">First name</label>
            <input
              id="account-first-name"
              name="first_name"
              value={accountForm.first_name}
              onChange={handleAccountChange}
            />
          </div>
          <div className="field-group">
            <label htmlFor="account-last-name">Last name</label>
            <input
              id="account-last-name"
              name="last_name"
              value={accountForm.last_name}
              onChange={handleAccountChange}
            />
          </div>
          {updateError && (
            <div
              className="surface-card"
              style={{ border: '1px solid rgba(248,113,113,0.5)', background: 'rgba(248,113,113,0.1)' }}
            >
              <div style={{ fontWeight: 600 }}>Unable to update account</div>
              <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(updateError, null, 2)}</pre>
            </div>
          )}
          {accountSaved && updateStatus === 'succeeded' && (
            <div
              className="surface-card"
              style={{ border: '1px solid rgba(59,130,246,0.4)', background: 'rgba(59,130,246,0.1)' }}
            >
              <div style={{ fontWeight: 600 }}>Account details updated</div>
              <p style={{ margin: '4px 0 0', color: 'rgba(148,163,184,0.9)' }}>
                Your profile information has been refreshed.
              </p>
            </div>
          )}
          <button type="submit" className="button" disabled={updateStatus === 'loading'}>
            {updateStatus === 'loading' ? 'Saving…' : 'Save changes'}
          </button>
        </form>
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
