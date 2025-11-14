import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import ProfileForm from '../components/profile/ProfileForm.jsx';
import ProfileOverview from '../components/profile/ProfileOverview.jsx';
import { loadProfile, removeAccount, saveProfile, selectInterests, selectProfile } from '../redux/profileSlice.js';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const profile = useSelector(selectProfile);
  const interests = useSelector(selectInterests);
  const status = useSelector((state) => state.profile.status);
  const error = useSelector((state) => state.profile.error);
  const [editing, setEditing] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [dangerConfirm, setDangerConfirm] = useState('');

  useEffect(() => {
    dispatch(loadProfile());
  }, [dispatch]);

  const handleSubmit = async (formData) => {
    setLocalError(null);
    try {
      await dispatch(saveProfile(formData)).unwrap();
      await dispatch(loadProfile());
      setEditing(false);
    } catch (submitError) {
      setLocalError(submitError);
    }
  };

  const handleDeleteAccount = async (event) => {
    event.preventDefault();
    if (dangerConfirm.trim().toLowerCase() !== 'delete') {
      setLocalError({ detail: 'Type DELETE to confirm account removal.' });
      return;
    }
    await dispatch(removeAccount());
  };

  const isLoading = useMemo(() => status === 'loading', [status]);

  return (
    <div className="surface-grid" style={{ gap: '32px' }}>
      <div className="section-header">
        <div>
          <div className="badge">Profile command center</div>
          <h1 style={{ margin: '12px 0 0' }}>Manage your story</h1>
          <p style={{ margin: '6px 0 0', color: 'rgba(203,213,225,0.75)' }}>
            Keep your VivahVows profile polished and ready for meaningful matches.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {!editing && (
            <button type="button" className="button" onClick={() => setEditing(true)}>
              Edit profile
            </button>
          )}
        </div>
      </div>
      {(localError || error) && (
        <div
          className="surface-card"
          style={{ border: '1px solid rgba(248,113,113,0.5)', background: 'rgba(248,113,113,0.08)' }}
        >
          <div style={{ fontWeight: 600 }}>Heads up!</div>
          <pre style={{ whiteSpace: 'pre-wrap' }}>
            {JSON.stringify(localError ?? error, null, 2)}
          </pre>
        </div>
      )}
      {!editing && <ProfileOverview profile={profile} interests={interests} />}
      {editing && (
        <ProfileForm
          profile={profile}
          interests={interests}
          onSubmit={handleSubmit}
          onCancel={() => setEditing(false)}
          submitting={status === 'loading'}
          error={error}
        />
      )}
      <section className="surface-card" style={{ border: '1px solid rgba(248,113,113,0.35)', display: 'grid', gap: '16px' }}>
        <header>
          <div className="badge" style={{ background: 'rgba(248,113,113,0.25)', borderColor: 'rgba(248,113,113,0.45)' }}>
            Danger zone
          </div>
          <h2 style={{ margin: '12px 0 0' }}>Delete account</h2>
          <p style={{ margin: '4px 0 0', color: 'rgba(248, 250, 252, 0.6)' }}>
            This will permanently remove your profile, matches, and conversations.
          </p>
        </header>
        <form onSubmit={handleDeleteAccount} style={{ display: 'grid', gap: '12px', maxWidth: '420px' }}>
          <label className="field-group" htmlFor="confirm-delete">
            <span>Type DELETE to continue</span>
            <input
              id="confirm-delete"
              value={dangerConfirm}
              onChange={(event) => setDangerConfirm(event.target.value)}
              placeholder="DELETE"
            />
          </label>
          <button type="submit" className="button button--danger" disabled={status === 'deleting'}>
            {status === 'deleting' ? 'Deleting…' : 'Delete my account'}
          </button>
        </form>
      </section>
      {isLoading && !profile && <div className="empty-state">Fetching your profile…</div>}
    </div>
  );
};

export default ProfilePage;
