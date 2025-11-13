import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import {
  loadProfile,
  removeAccount,
  saveProfile,
  selectInterests,
  selectProfile
} from '../redux/profileSlice.js';
import { selectCurrentUser } from '../redux/authSlice.js';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const profile = useSelector(selectProfile);
  const interests = useSelector(selectInterests);
  const currentUser = useSelector(selectCurrentUser);
  const [form, setForm] = useState(null);
  const [message, setMessage] = useState(null);
  const [errors, setErrors] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const normalizeDate = (value) => {
    if (!value) {
      return '';
    }
    return typeof value === 'string' && value.length > 10 ? value.slice(0, 10) : value;
  };

  const buildFormState = (data) => ({
    ...data,
    dob: normalizeDate(data?.dob),
    interests: data?.interests ?? [],
    new_photos: [],
    remove_photo_ids: []
  });

  useEffect(() => {
    dispatch(loadProfile());
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      setForm(buildFormState(profile));
    }
  }, [profile]);

  const interestLookup = useMemo(() => {
    return new Map(interests.map((interest) => [interest.id, interest.name]));
  }, [interests]);

  if (!form) {
    return (
      <div className="container">
        <div className="card">Loading profile...</div>
      </div>
    );
  }

  const startEditing = () => {
    if (!profile) {
      return;
    }
    setErrors(null);
    setMessage(null);
    setForm(buildFormState(profile));
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (!profile) {
      setIsEditing(false);
      return;
    }
    setErrors(null);
    setMessage(null);
    setForm(buildFormState(profile));
    setIsEditing(false);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setMessage(null);
    setErrors(null);
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleInterestToggle = (interestId) => {
    setMessage(null);
    setErrors(null);
    setForm((prev) => {
      const existing = new Set(prev.interests || []);
      if (existing.has(interestId)) {
        existing.delete(interestId);
      } else {
        existing.add(interestId);
      }
      return { ...prev, interests: Array.from(existing) };
    });
  };

  const handlePhotoChange = (event) => {
    const files = Array.from(event.target.files || []);
    setMessage(null);
    setErrors(null);
    setForm((prev) => ({
      ...prev,
      new_photos: [...(prev.new_photos ?? []), ...files]
    }));
  };

  const handleExistingPhotoToggle = (photoId) => {
    setMessage(null);
    setErrors(null);
    setForm((prev) => {
      const pendingRemoval = new Set(prev.remove_photo_ids ?? []);
      if (pendingRemoval.has(photoId)) {
        pendingRemoval.delete(photoId);
      } else {
        pendingRemoval.add(photoId);
      }
      return { ...prev, remove_photo_ids: Array.from(pendingRemoval) };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        return;
      }
      if (key === 'photos' || key === 'age' || key === 'user' || key === 'created_at' || key === 'updated_at' || key === 'is_email_verified') {
        return;
      }
      if (['preferred_age_min', 'preferred_age_max'].includes(key) && value === '') {
        return;
      }
      if (key === 'interests' && Array.isArray(value)) {
        if (value.length === 0) {
          payload.append('clear_interests', 'true');
        } else {
          value.forEach((interestId) => payload.append('interests', interestId));
        }
        return;
      }
      if (key === 'new_photos' && Array.isArray(value) && value.length) {
        value.forEach((file) => payload.append('new_photos', file));
        return;
      }
      if (key === 'remove_photo_ids' && Array.isArray(value) && value.length) {
        value.forEach((photoId) => payload.append('remove_photo_ids', photoId));
        return;
      }
      payload.append(key, value);
    });

    const result = await dispatch(saveProfile(payload));
    if (saveProfile.fulfilled.match(result)) {
      const updated = result.payload;
      setForm(buildFormState(updated));
      setMessage('Profile updated successfully');
      setErrors(null);
      setIsEditing(false);
    } else {
      setMessage('Unable to save profile');
      setErrors(result.payload ?? result.error?.message ?? result.error);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmation = window.confirm(
      'Deleting your account will remove your profile, matches, and conversations. This cannot be undone. Are you sure you want to continue?'
    );
    if (!confirmation) {
      return;
    }
    setIsDeleting(true);
    setMessage(null);
    setErrors(null);
    const result = await dispatch(removeAccount());
    if (removeAccount.fulfilled.match(result)) {
      setMessage('Your account has been deleted.');
      navigate('/login', { replace: true });
    } else {
      setErrors(result.payload ?? result.error?.message ?? result.error);
    }
    setIsDeleting(false);
  };

  const selectedInterests = (profile?.interests ?? [])
    .map((interestId) => ({ id: interestId, name: interestLookup.get(interestId) }))
    .filter((interest) => Boolean(interest.name));

  const otherPhotos = profile?.photos?.slice(1) ?? [];

  return (
    <div className="container" style={{ display: 'grid', gap: '1.5rem' }}>
      <div className="card" style={{ display: 'grid', gap: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <div>
            <h2 style={{ marginBottom: '0.25rem' }}>Your Profile</h2>
            <p style={{ margin: 0, color: 'var(--color-muted, #6b7280)' }}>
              Review your information and keep it up to date to get the best matches.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <button type="button" className="button-secondary" onClick={isEditing ? handleCancelEdit : startEditing}>
              {isEditing ? 'Close editor' : 'Edit profile'}
            </button>
            <button
              type="button"
              className="button-secondary"
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              style={{
                color: 'var(--color-danger, #b91c1c)',
                borderColor: 'var(--color-danger, #b91c1c)',
                backgroundColor: 'transparent'
              }}
            >
              {isDeleting ? 'Deleting…' : 'Delete account'}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ flex: '0 0 160px', display: 'grid', gap: '0.75rem' }}>
            {profile?.photos?.length ? (
              <img
                src={profile.photos[0].image}
                alt="Primary profile"
                style={{ width: '160px', height: '160px', objectFit: 'cover', borderRadius: '12px' }}
              />
            ) : (
              <div
                style={{
                  width: '160px',
                  height: '160px',
                  borderRadius: '12px',
                  display: 'grid',
                  placeItems: 'center',
                  background: 'var(--color-muted-bg, #f3f4f6)',
                  color: 'var(--color-muted, #6b7280)',
                  textAlign: 'center',
                  padding: '0.75rem'
                }}
              >
                No photos yet
              </div>
            )}
            {otherPhotos.length ? (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {otherPhotos.map((photo) => (
                  <img
                    key={photo.id}
                    src={photo.image}
                    alt="Profile"
                    style={{ width: '72px', height: '72px', objectFit: 'cover', borderRadius: '8px' }}
                  />
                ))}
              </div>
            ) : null}
          </div>

          <div style={{ flex: '1 1 280px', display: 'grid', gap: '1rem' }}>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              <h3 style={{ margin: 0 }}>{profile?.name || 'Add your full name'}</h3>
              <p style={{ margin: 0, color: 'var(--color-muted, #6b7280)' }}>
                {profile?.bio || 'Tell other members a little about yourself.'}
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gap: '0.75rem',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))'
              }}
            >
              <div>
                <strong>Full name</strong>
                <p>{profile?.name || 'Not provided'}</p>
              </div>
              <div>
                <strong>Email</strong>
                <p>{currentUser?.email || 'Not provided'}</p>
              </div>
              <div>
                <strong>Date of birth</strong>
                <p>{profile?.dob ? normalizeDate(profile.dob) : 'Not provided'}</p>
              </div>
              <div>
                <strong>Age</strong>
                <p>{profile?.age ?? 'Not available'}</p>
              </div>
              <div>
                <strong>Gender</strong>
                <p>{profile?.gender || 'Not provided'}</p>
              </div>
              <div>
                <strong>City</strong>
                <p>{profile?.city || 'Not provided'}</p>
              </div>
              <div>
                <strong>Religion</strong>
                <p>{profile?.religion || 'Not provided'}</p>
              </div>
              <div>
                <strong>Education</strong>
                <p>{profile?.education || 'Not provided'}</p>
              </div>
              <div>
                <strong>Profession</strong>
                <p>{profile?.profession || 'Not provided'}</p>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <h3 style={{ marginBottom: '0.5rem' }}>Interests</h3>
            {selectedInterests.length ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {selectedInterests.map((interest) => (
                  <span
                    key={interest.id}
                    style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      background: 'var(--color-muted-bg, #f3f4f6)',
                      color: 'var(--color-muted-strong, #374151)',
                      fontSize: '0.875rem'
                    }}
                  >
                    {interest.name}
                  </span>
                ))}
              </div>
            ) : (
              <p style={{ margin: 0, color: 'var(--color-muted, #6b7280)' }}>
                You have not selected any interests yet.
              </p>
            )}
          </div>

          <div>
            <h3 style={{ marginBottom: '0.5rem' }}>Match preferences</h3>
            <div
              style={{
                display: 'grid',
                gap: '0.75rem',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))'
              }}
            >
              <div>
                <strong>Preferred gender</strong>
                <p>{profile?.preferred_gender || 'Any'}</p>
              </div>
              <div>
                <strong>Preferred city</strong>
                <p>{profile?.preferred_city || 'Any'}</p>
              </div>
              <div>
                <strong>Preferred religion</strong>
                <p>{profile?.preferred_religion || 'Any'}</p>
              </div>
              <div>
                <strong>Preferred age</strong>
                <p>
                  {profile?.preferred_age_min || profile?.preferred_age_max
                    ? `${profile?.preferred_age_min ?? '18'} - ${profile?.preferred_age_max ?? '100'}`
                    : 'Any'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isEditing ? (
        <div className="card">
          <h2>Update profile</h2>
          <form onSubmit={handleSubmit} className="form">
          <label htmlFor="name">Full name</label>
          <input id="name" name="name" value={form.name ?? ''} onChange={handleChange} />

          <label htmlFor="dob">Date of birth</label>
          <input id="dob" name="dob" type="date" value={form.dob ?? ''} onChange={handleChange} />

          <label htmlFor="gender">Gender</label>
          <select id="gender" name="gender" value={form.gender ?? ''} onChange={handleChange}>
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="non_binary">Non-binary</option>
          </select>

          <label htmlFor="bio">Bio</label>
          <textarea id="bio" name="bio" rows={4} value={form.bio ?? ''} onChange={handleChange} />

          <label htmlFor="city">City</label>
          <input id="city" name="city" value={form.city ?? ''} onChange={handleChange} />

          <label htmlFor="religion">Religion</label>
          <input id="religion" name="religion" value={form.religion ?? ''} onChange={handleChange} />

          <label htmlFor="education">Education</label>
          <input id="education" name="education" value={form.education ?? ''} onChange={handleChange} />

          <label htmlFor="profession">Profession</label>
          <input id="profession" name="profession" value={form.profession ?? ''} onChange={handleChange} />

          <div>
            <strong>Photos</strong>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', margin: '0.75rem 0' }}>
              {form.photos?.length
                ? form.photos.map((photo) => {
                    const markedForRemoval = form.remove_photo_ids?.includes(photo.id);
                    return (
                      <div
                        key={photo.id}
                        style={{
                          position: 'relative',
                          width: '110px',
                          display: 'grid',
                          gap: '0.5rem',
                          justifyItems: 'center'
                        }}
                      >
                        <img
                          src={photo.image}
                          alt="Profile"
                          style={{
                            width: '100px',
                            height: '100px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            opacity: markedForRemoval ? 0.35 : 1,
                            outline: markedForRemoval ? '2px solid var(--color-danger, #b91c1c)' : 'none'
                          }}
                        />
                        <button
                          type="button"
                          className={markedForRemoval ? 'button-secondary' : 'button-primary'}
                          onClick={() => handleExistingPhotoToggle(photo.id)}
                          style={{ width: '100%' }}
                        >
                          {markedForRemoval ? 'Keep photo' : 'Remove photo'}
                        </button>
                      </div>
                    );
                  })
                : <span>No photos uploaded yet.</span>}
            </div>
            <input
              id="new_photos"
              name="new_photos"
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoChange}
            />
            {form.new_photos?.length ? (
              <ul style={{ marginTop: '0.5rem' }}>
                {form.new_photos.map((file) => (
                  <li key={file.name}>{file.name}</li>
                ))}
              </ul>
            ) : null}
            {form.new_photos?.length ? (
              <button
                type="button"
                className="button-secondary"
                style={{ marginTop: '0.5rem' }}
                onClick={() => setForm((prev) => ({ ...prev, new_photos: [] }))}
              >
                Clear new uploads
              </button>
            ) : null}
            {form.remove_photo_ids?.length ? (
              <p style={{ marginTop: '0.5rem', color: 'var(--color-danger, #b91c1c)' }}>
                {form.remove_photo_ids.length} photo{form.remove_photo_ids.length > 1 ? 's' : ''} will be deleted when you save.
              </p>
            ) : null}
          </div>

          <label htmlFor="preferred_gender">Preferred gender</label>
          <select
            id="preferred_gender"
            name="preferred_gender"
            value={form.preferred_gender ?? ''}
            onChange={handleChange}
          >
            <option value="">Any</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="non_binary">Non-binary</option>
          </select>

          <label htmlFor="preferred_city">Preferred city</label>
          <input
            id="preferred_city"
            name="preferred_city"
            value={form.preferred_city ?? ''}
            onChange={handleChange}
          />

          <label htmlFor="preferred_religion">Preferred religion</label>
          <input
            id="preferred_religion"
            name="preferred_religion"
            value={form.preferred_religion ?? ''}
            onChange={handleChange}
          />

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div>
              <label htmlFor="preferred_age_min">Min age</label>
              <input
                id="preferred_age_min"
                name="preferred_age_min"
                type="number"
                min="18"
                max="100"
                value={form.preferred_age_min ?? ''}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="preferred_age_max">Max age</label>
              <input
                id="preferred_age_max"
                name="preferred_age_max"
                type="number"
                min="18"
                max="100"
                value={form.preferred_age_max ?? ''}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <strong>Interests</strong>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
              {interests.map((interest) => {
                const selected = form.interests?.includes(interest.id);
                return (
                  <button
                    key={interest.id}
                    type="button"
                    className={selected ? 'button-primary' : 'button-secondary'}
                    onClick={() => handleInterestToggle(interest.id)}
                  >
                    {interest.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="submit" className="button-primary" style={{ width: '200px' }}>
              Save changes
            </button>
            <button type="button" className="button-secondary" onClick={handleCancelEdit}>
              Cancel
            </button>
          </div>
        </form>
      </div>
      ) : null}

      {(message || errors) && (
        <div className="card" style={{ color: errors ? 'var(--color-danger, #b91c1c)' : 'inherit' }}>
          {message && <p style={{ margin: 0 }}>{message}</p>}
          {errors ? (
            typeof errors === 'string' ? (
              <p style={{ margin: errors ? '0.25rem 0 0' : 0 }}>{errors}</p>
            ) : Array.isArray(errors) ? (
              errors.map((error, index) => (
                <p key={index} style={{ margin: '0.25rem 0 0' }}>
                  {error}
                </p>
              ))
            ) : (
              Object.entries(errors).map(([field, value]) => (
                <p key={field} style={{ margin: '0.25rem 0 0' }}>
                  <strong>{field}:</strong> {Array.isArray(value) ? value.join(', ') : value}
                </p>
              ))
            )
          ) : null}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
