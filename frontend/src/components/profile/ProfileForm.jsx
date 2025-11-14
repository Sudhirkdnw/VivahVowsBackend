import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

const defaultProfile = {
  name: '',
  dob: '',
  gender: '',
  city: '',
  religion: '',
  education: '',
  profession: '',
  interests: [],
  bio: '',
  preferred_gender: '',
  preferred_age_min: '',
  preferred_age_max: '',
  preferred_city: '',
  preferred_religion: ''
};

const ProfileForm = ({ profile, interests, onSubmit, onCancel, submitting, error }) => {
  const [formState, setFormState] = useState(defaultProfile);
  const [removedPhotoIds, setRemovedPhotoIds] = useState([]);
  const [newPhotos, setNewPhotos] = useState([]);

  useEffect(() => {
    if (!profile) {
      return;
    }
    setFormState({
      ...defaultProfile,
      ...profile,
      interests: profile.interests ?? []
    });
    setRemovedPhotoIds([]);
    setNewPhotos([]);
  }, [profile]);

  useEffect(() => () => {
    newPhotos.forEach((photo) => URL.revokeObjectURL(photo.preview));
  }, [newPhotos]);

  const interestOptions = useMemo(() => interests ?? [], [interests]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleInterestsChange = (event) => {
    const values = Array.from(event.target.selectedOptions).map((option) => Number(option.value));
    setFormState((prev) => ({ ...prev, interests: values }));
  };

  const handlePhotoUpload = (event) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) {
      return;
    }
    const uploads = files.map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
      file,
      preview: URL.createObjectURL(file)
    }));
    setNewPhotos((prev) => [...prev, ...uploads]);
    event.target.value = '';
  };

  const handleRemoveExistingPhoto = (photoId) => {
    setRemovedPhotoIds((prev) => (prev.includes(photoId) ? prev : [...prev, photoId]));
  };

  const handleRestoreExistingPhoto = (photoId) => {
    setRemovedPhotoIds((prev) => prev.filter((id) => id !== photoId));
  };

  const handleRemoveNewPhoto = (id) => {
    const photo = newPhotos.find((item) => item.id === id);
    if (photo) {
      URL.revokeObjectURL(photo.preview);
    }
    setNewPhotos((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const payload = new FormData();
    Object.entries(formState).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        return;
      }
      if (key === 'interests') {
        if ((value ?? []).length === 0) {
          payload.append('clear_interests', 'true');
        } else {
          value.forEach((interestId) => payload.append('interests', interestId));
        }
        return;
      }
      payload.append(key, value);
    });
    removedPhotoIds.forEach((photoId) => payload.append('remove_photo_ids', photoId));
    newPhotos.forEach((photo) => payload.append('new_photos', photo.file));
    onSubmit(payload, { removedPhotoIds, newPhotos });
  };

  return (
    <form className="surface-card" style={{ display: 'grid', gap: '24px' }} onSubmit={handleSubmit}>
      <header className="section-header">
        <div>
          <div className="badge">Edit profile</div>
          <h2 style={{ margin: '12px 0 0' }}>Craft your VivahVows presence</h2>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button type="button" className="button button--ghost" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="button" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </header>
      {error && (
        <div className="surface-card" style={{ border: '1px solid rgba(248,113,113,0.5)', background: 'rgba(248,113,113,0.1)' }}>
          <div style={{ fontWeight: 600 }}>We couldn’t save your changes</div>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(error, null, 2)}</pre>
        </div>
      )}
      <section className="form-grid form-grid--two">
        <div className="field-group">
          <label htmlFor="name">Full name</label>
          <input id="name" name="name" value={formState.name} onChange={handleChange} />
        </div>
        <div className="field-group">
          <label htmlFor="dob">Birth date</label>
          <input id="dob" type="date" name="dob" value={formState.dob ?? ''} onChange={handleChange} />
        </div>
        <div className="field-group">
          <label htmlFor="gender">Gender</label>
          <select id="gender" name="gender" value={formState.gender ?? ''} onChange={handleChange}>
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="field-group">
          <label htmlFor="city">City</label>
          <input id="city" name="city" value={formState.city ?? ''} onChange={handleChange} />
        </div>
        <div className="field-group">
          <label htmlFor="profession">Profession</label>
          <input
            id="profession"
            name="profession"
            value={formState.profession ?? ''}
            onChange={handleChange}
          />
        </div>
        <div className="field-group">
          <label htmlFor="education">Education</label>
          <input
            id="education"
            name="education"
            value={formState.education ?? ''}
            onChange={handleChange}
          />
        </div>
        <div className="field-group">
          <label htmlFor="religion">Religion</label>
          <input id="religion" name="religion" value={formState.religion ?? ''} onChange={handleChange} />
        </div>
        <div className="field-group" style={{ gridColumn: '1 / -1' }}>
          <label htmlFor="bio">Story</label>
          <textarea id="bio" name="bio" value={formState.bio ?? ''} onChange={handleChange} />
        </div>
      </section>
      <section className="surface-card" style={{ display: 'grid', gap: '16px' }}>
        <header className="section-header">
          <div>
            <div className="badge">Match preferences</div>
            <h3 style={{ margin: '12px 0 0' }}>Help us personalize your recommendations</h3>
          </div>
        </header>
        <div className="form-grid form-grid--two">
          <div className="field-group">
            <label htmlFor="preferred_gender">Preferred gender</label>
            <select
              id="preferred_gender"
              name="preferred_gender"
              value={formState.preferred_gender ?? ''}
              onChange={handleChange}
            >
              <option value="">No preference</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="field-group">
            <label htmlFor="preferred_city">Preferred city</label>
            <input
              id="preferred_city"
              name="preferred_city"
              value={formState.preferred_city ?? ''}
              onChange={handleChange}
            />
          </div>
          <div className="field-group">
            <label htmlFor="preferred_religion">Preferred religion</label>
            <input
              id="preferred_religion"
              name="preferred_religion"
              value={formState.preferred_religion ?? ''}
              onChange={handleChange}
            />
          </div>
          <div className="field-group">
            <label htmlFor="preferred_age_min">Minimum age</label>
            <input
              id="preferred_age_min"
              name="preferred_age_min"
              type="number"
              min="18"
              value={formState.preferred_age_min ?? ''}
              onChange={handleChange}
            />
          </div>
          <div className="field-group">
            <label htmlFor="preferred_age_max">Maximum age</label>
            <input
              id="preferred_age_max"
              name="preferred_age_max"
              type="number"
              min="18"
              value={formState.preferred_age_max ?? ''}
              onChange={handleChange}
            />
          </div>
        </div>
      </section>
      <section className="surface-card" style={{ display: 'grid', gap: '16px' }}>
        <header className="section-header">
          <div>
            <div className="badge">Interests</div>
            <h3 style={{ margin: '12px 0 0' }}>Pick the passions that define you</h3>
          </div>
        </header>
        <div className="field-group">
          <label htmlFor="interest-select">Select interests</label>
          <select
            id="interest-select"
            multiple
            value={(formState.interests ?? []).map(String)}
            onChange={handleInterestsChange}
            style={{ minHeight: '140px' }}
          >
            {interestOptions.map((interest) => (
              <option key={interest.id} value={interest.id}>
                {interest.name}
              </option>
            ))}
          </select>
        </div>
      </section>
      <section className="surface-card" style={{ display: 'grid', gap: '16px' }}>
        <header className="section-header">
          <div>
            <div className="badge">Photos</div>
            <h3 style={{ margin: '12px 0 0' }}>Show your best self</h3>
          </div>
          <label className="button" htmlFor="photo-upload">
            Upload photos
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={handlePhotoUpload}
            />
          </label>
        </header>
        <div className="photo-grid">
          {(profile?.photos ?? []).map((photo) => {
            const markedForRemoval = removedPhotoIds.includes(photo.id);
            return (
              <article key={photo.id} className="photo-card">
                <img src={photo.image ?? photo.image_path} alt="Profile" style={{ filter: markedForRemoval ? 'grayscale(1)' : 'none', opacity: markedForRemoval ? 0.35 : 1 }} />
                <div className="photo-card__actions">
                  {markedForRemoval ? (
                    <button type="button" className="button" onClick={() => handleRestoreExistingPhoto(photo.id)}>
                      Undo remove
                    </button>
                  ) : (
                    <button type="button" className="button button--danger" onClick={() => handleRemoveExistingPhoto(photo.id)}>
                      Remove
                    </button>
                  )}
                </div>
              </article>
            );
          })}
          {newPhotos.map((photo) => (
            <article key={photo.id} className="photo-card">
              <img src={photo.preview} alt="New upload" />
              <div className="photo-card__actions">
                <button type="button" className="button button--ghost" onClick={() => handleRemoveNewPhoto(photo.id)}>
                  Remove
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </form>
  );
};

ProfileForm.propTypes = {
  profile: PropTypes.object,
  interests: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.number, name: PropTypes.string })),
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
  error: PropTypes.any
};

ProfileForm.defaultProps = {
  profile: null,
  interests: [],
  submitting: false,
  error: null
};

export default ProfileForm;
