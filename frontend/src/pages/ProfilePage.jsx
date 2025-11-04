import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { loadProfile, saveProfile, selectInterests, selectProfile } from '../redux/profileSlice.js';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const profile = useSelector(selectProfile);
  const interests = useSelector(selectInterests);
  const [form, setForm] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    dispatch(loadProfile());
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      setForm(profile);
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
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleInterestToggle = (interestId) => {
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await dispatch(saveProfile(form));
    if (saveProfile.fulfilled.match(result)) {
      setMessage('Profile updated successfully');
    } else {
      setMessage('Unable to save profile');
    }
  };

  return (
    <div className="container" style={{ display: 'grid', gap: '1.5rem' }}>
      <div className="card">
        <h2>Your Profile</h2>
        <form onSubmit={handleSubmit} className="form">
          <label htmlFor="name">Full name</label>
          <input id="name" name="name" value={form.name ?? ''} onChange={handleChange} />
          <label htmlFor="bio">Bio</label>
          <textarea id="bio" name="bio" rows={4} value={form.bio ?? ''} onChange={handleChange} />
          <label htmlFor="city">City</label>
          <input id="city" name="city" value={form.city ?? ''} onChange={handleChange} />
          <label htmlFor="profession">Profession</label>
          <input
            id="profession"
            name="profession"
            value={form.profession ?? ''}
            onChange={handleChange}
          />
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
      </div>
    </div>
  );
};

export default ProfilePage;
