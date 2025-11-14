import PropTypes from 'prop-types';

const ProfileOverview = ({ profile, interests }) => {
  if (!profile) {
    return (
      <div className="surface-card">
        <div className="empty-state">Your profile is loading...</div>
      </div>
    );
  }

  const interestLookup = new Map(interests.map((interest) => [interest.id, interest.name]));

  return (
    <div className="surface-grid surface-grid--two">
      <section className="surface-card surface-card--glow" style={{ display: 'grid', gap: '24px' }}>
        <header className="section-header">
          <div>
            <div className="badge">Identity</div>
            <h2 style={{ margin: '12px 0 0' }}>{profile.name ?? 'Unnamed member'}</h2>
            <p style={{ margin: '4px 0 0', color: 'rgba(203,213,225,0.75)' }}>
              {profile.city ? `${profile.city} · ` : ''}
              {profile.profession ?? 'Profession TBD'}
            </p>
          </div>
        </header>
        <div className="surface-grid surface-grid--two">
          <div>
            <div className="field-group">
              <label>Age</label>
              <div>{profile.age ?? '—'}</div>
            </div>
            <div className="field-group">
              <label>Education</label>
              <div>{profile.education ?? '—'}</div>
            </div>
            <div className="field-group">
              <label>Religion</label>
              <div>{profile.religion ?? '—'}</div>
            </div>
          </div>
          <div>
            <div className="field-group">
              <label>Preferred match</label>
              <div>
                {profile.preferred_gender ?? 'Any'} · {profile.preferred_age_min ?? '—'}-
                {profile.preferred_age_max ?? '—'} · {profile.preferred_city ?? 'Any city'} ·
                {profile.preferred_religion ?? 'Any belief'}
              </div>
            </div>
            <div className="field-group">
              <label>Email verification</label>
              <div className="badge">
                {profile.is_email_verified ? 'Verified ✅' : 'Pending ⚠️'}
              </div>
            </div>
          </div>
        </div>
        <div className="field-group">
          <label>About</label>
          <p style={{ margin: 0, color: 'rgba(226,232,240,0.85)', whiteSpace: 'pre-line' }}>
            {profile.bio || 'Tell the community about yourself to unlock more matches.'}
          </p>
        </div>
        <div className="field-group" style={{ gap: '12px' }}>
          <label>Interests</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {(profile.interests ?? []).length === 0 && <span className="badge">No interests set</span>}
            {(profile.interests ?? []).map((interestId) => (
              <span key={interestId} className="badge">
                {interestLookup.get(interestId) ?? `Interest #${interestId}`}
              </span>
            ))}
          </div>
        </div>
      </section>
      <section className="surface-card" style={{ display: 'grid', gap: '16px' }}>
        <div className="section-header">
          <div>
            <div className="badge">Gallery</div>
            <h2 style={{ margin: '12px 0 0' }}>Profile photos</h2>
          </div>
        </div>
        <div className="photo-grid">
          {(profile.photos ?? []).length === 0 && (
            <div className="empty-state">Upload your first photo to personalize your profile.</div>
          )}
          {(profile.photos ?? []).map((photo) => (
            <article key={photo.id} className="photo-card">
              <img src={photo.image ?? photo.image_path} alt="Profile" />
              <div className="photo-card__actions">
                <span className="badge">
                  Uploaded{' '}
                  {photo.uploaded_at ? new Date(photo.uploaded_at).toLocaleDateString() : 'recently'}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

ProfileOverview.propTypes = {
  profile: PropTypes.object,
  interests: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.number, name: PropTypes.string }))
};

ProfileOverview.defaultProps = {
  profile: null,
  interests: []
};

export default ProfileOverview;
