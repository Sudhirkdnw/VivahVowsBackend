import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { loadProfile, saveProfile, selectInterests, selectProfile } from '../redux/profileSlice.js';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const profile = useSelector(selectProfile);
  const interests = useSelector(selectInterests);
  const [form, setForm] = useState(null);
  const [message, setMessage] = useState(null);
  const [errors, setErrors] = useState(null);

  useEffect(() => {
    dispatch(loadProfile());
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      setForm({
        ...profile,
        interests: profile.interests ?? [],
        new_photos: []
      });
    }
  }, [profile]);

  if (!form) {
    return (
      <div className="container">
        <div className="card">Loading profile...</div>
      </div>
    );
  }

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
    setForm((prev) => ({ ...prev, new_photos: files }));
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
      if (key === 'new_photos' && Array.isArray(value)) {
        value.forEach((file) => payload.append('new_photos', file));
        return;
      }
      if (key === 'remove_photo_ids' && Array.isArray(value)) {
        value.forEach((photoId) => payload.append('remove_photo_ids', photoId));
        return;
      }
      payload.append(key, value);
    });

    const result = await dispatch(saveProfile(payload));
    if (saveProfile.fulfilled.match(result)) {
      const updated = result.payload;
      setForm({
        ...updated,
        interests: updated.interests ?? [],
        new_photos: []
      });
      setMessage('Profile updated successfully');
      setErrors(null);
    } else {
      setMessage('Unable to save profile');
      setErrors(result.payload ?? result.error?.message ?? result.error);
    }
  };

  return (
    <div className="container" style={{ display: 'grid', gap: '1.5rem' }}>
      <div className="card">
        <h2>Your Profile</h2>
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
                ? form.photos.map((photo) => (
                    <img
                      key={photo.id}
                      src={photo.image}
                      alt="Profile"
                      style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }}
                    />
                  ))
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

          <button type="submit" className="button-primary" style={{ width: '200px' }}>
            Save changes
          </button>
        </form>
        {message && <p style={{ marginTop: '1rem' }}>{message}</p>}
        {errors && (
          <div style={{ marginTop: '1rem', color: 'var(--color-danger, #b91c1c)' }}>
            {typeof errors === 'string' ? (
              <p>{errors}</p>
            ) : Array.isArray(errors) ? (
              errors.map((error, index) => <p key={index}>{error}</p>)
            ) : (
              Object.entries(errors).map(([field, value]) => (
                <p key={field}>
                  <strong>{field}:</strong> {Array.isArray(value) ? value.join(', ') : value}
                </p>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
