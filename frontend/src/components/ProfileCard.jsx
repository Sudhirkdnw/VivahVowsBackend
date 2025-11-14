import { format } from 'date-fns';

function ProfileCard({ profile, onLike, onReject, onBlock, actionLoading }) {
  const age = profile.age ?? (profile.dob ? format(new Date(profile.dob), 'yyyy') : null);
  const photos = profile.photos || [];
  const coverPhoto = photos[0]?.image;

  return (
    <div className="profile-card">
      {coverPhoto ? (
        <img className="profile-photo" src={coverPhoto} alt={`${profile.name}'s profile`} />
      ) : (
        <div className="profile-photo placeholder">{profile.name?.[0] || 'P'}</div>
      )}
      <div className="profile-card-body">
        <div className="profile-card-header">
          <h3>
            {profile.name || 'Mystery Match'}
            {profile.city ? <span className="pill">{profile.city}</span> : null}
          </h3>
          {age ? <span className="age">{age} yrs</span> : null}
        </div>
        <p className="profile-bio">{profile.bio || 'No bio provided yet.'}</p>
        <dl className="profile-meta">
          {profile.gender ? (
            <div>
              <dt>Gender</dt>
              <dd>{profile.gender}</dd>
            </div>
          ) : null}
          {profile.religion ? (
            <div>
              <dt>Religion</dt>
              <dd>{profile.religion}</dd>
            </div>
          ) : null}
          {profile.education ? (
            <div>
              <dt>Education</dt>
              <dd>{profile.education}</dd>
            </div>
          ) : null}
          {profile.profession ? (
            <div>
              <dt>Profession</dt>
              <dd>{profile.profession}</dd>
            </div>
          ) : null}
        </dl>
        {profile.interests?.length ? (
          <div className="tag-grid" aria-label="Interests">
            {profile.interests.map((interest) => (
              <span key={interest} className="tag">
                #{interest}
              </span>
            ))}
          </div>
        ) : null}
        <div className="profile-card-actions">
          <button className="btn secondary" onClick={() => onReject(profile)} disabled={actionLoading}>
            Pass
          </button>
          <button className="btn" onClick={() => onLike(profile)} disabled={actionLoading}>
            Like
          </button>
          <button className="btn danger" onClick={() => onBlock(profile)} disabled={actionLoading}>
            Block
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfileCard;
