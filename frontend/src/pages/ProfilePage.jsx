import { useEffect, useMemo, useState } from 'react';
import apiClient from '../api/client';
import FormField from '../components/FormField';
import { useAuth } from '../context/AuthContext';

function ProfilePage() {
  const { profile, updateProfile, user, updateUser } = useAuth();
  const [form, setForm] = useState(null);
  const [interestOptions, setInterestOptions] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [newPhotos, setNewPhotos] = useState([]);
  const [removePhotoIds, setRemovePhotoIds] = useState(new Set());
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);
  const [userForm, setUserForm] = useState({ first_name: '', last_name: '', username: '' });

  useEffect(() => {
    async function loadInterests() {
      try {
        const response = await apiClient.get('/api/interests/');
        setInterestOptions(response.data);
      } catch (error) {
        console.error('Failed to load interests', error);
      }
    }
    loadInterests();
  }, []);

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name || '',
        bio: profile.bio || '',
        gender: profile.gender || '',
        dob: profile.dob || '',
        city: profile.city || '',
        religion: profile.religion || '',
        education: profile.education || '',
        profession: profile.profession || '',
        preferred_gender: profile.preferred_gender || '',
        preferred_age_min: profile.preferred_age_min || 21,
        preferred_age_max: profile.preferred_age_max || 40,
        preferred_city: profile.preferred_city || '',
        preferred_religion: profile.preferred_religion || ''
      });
      setSelectedInterests((profile.interests || []).map(String));
      setNewPhotos([]);
      setRemovePhotoIds(new Set());
    }
  }, [profile]);

  useEffect(() => {
    if (user) {
      setUserForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        username: user.username || ''
      });
    }
  }, [user]);

  const interestLookup = useMemo(() => {
    const map = new Map();
    interestOptions.forEach((interest) => {
      map.set(String(interest.id), interest.name);
    });
    return map;
  }, [interestOptions]);

  if (!form) {
    return (
      <div className="card">
        <p>Loading profile…</p>
      </div>
    );
  }

  const toggleInterest = (interestId) => {
    setSelectedInterests((current) => {
      const set = new Set(current);
      if (set.has(interestId)) {
        set.delete(interestId);
      } else {
        set.add(interestId);
      }
      return Array.from(set);
    });
  };

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUserChange = (event) => {
    const { name, value } = event.target;
    setUserForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = (event) => {
    const files = Array.from(event.target.files || []);
    setNewPhotos((prev) => [...prev, ...files]);
  };

  const markForRemoval = (photoId) => {
    setRemovePhotoIds((prev) => {
      const next = new Set(prev);
      if (next.has(photoId)) {
        next.delete(photoId);
      } else {
        next.add(photoId);
      }
      return next;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          payload.append(key, value);
        }
      });
      if (selectedInterests.length === 0) {
        payload.append('clear_interests', 'true');
      } else {
        selectedInterests.forEach((interestId) => payload.append('interests', interestId));
      }
      removePhotoIds.forEach((photoId) => payload.append('remove_photo_ids', photoId));
      newPhotos.forEach((file) => payload.append('new_photos', file));
      await updateProfile(payload);
      if (userForm.username !== user.username || userForm.first_name !== user.first_name || userForm.last_name !== user.last_name) {
        await updateUser(userForm);
      }
      setStatus({ ok: true, message: 'Profile updated successfully.' });
    } catch (error) {
      console.error('Failed to update profile', error);
      const detail = error.response?.data?.detail || 'Could not save profile.';
      setStatus({ ok: false, message: detail });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="card" onSubmit={handleSubmit} encType="multipart/form-data">
      <header className="card-header">
        <div>
          <h1>Profile</h1>
          <p className="helper-text">Update your personal details, preferences, and gallery.</p>
        </div>
        <button className="btn" type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </header>
      {status ? (
        <div className={status.ok ? 'success-banner' : 'error-banner'}>{status.message}</div>
      ) : null}
      <section className="form-section">
        <h2>Account basics</h2>
        <div className="filter-grid">
          <FormField label="First name" id="first_name" name="first_name" value={userForm.first_name} onChange={handleUserChange} required />
          <FormField label="Last name" id="last_name" name="last_name" value={userForm.last_name} onChange={handleUserChange} required />
          <FormField label="Username" id="username" name="username" value={userForm.username} onChange={handleUserChange} required />
          <FormField label="Email" id="email" value={user.email} disabled />
        </div>
      </section>
      <section className="form-section">
        <h2>About you</h2>
        <div className="filter-grid">
          <FormField label="Display name" id="name" name="name" value={form.name} onChange={handleProfileChange} />
          <FormField label="Date of birth" id="dob" name="dob" type="date" value={form.dob} onChange={handleProfileChange} />
          <FormField label="Gender" id="gender">
            <select id="gender" name="gender" value={form.gender} onChange={handleProfileChange}>
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="non_binary">Non-binary</option>
            </select>
          </FormField>
          <FormField label="City" id="city" name="city" value={form.city} onChange={handleProfileChange} />
          <FormField label="Religion" id="religion" name="religion" value={form.religion} onChange={handleProfileChange} />
          <FormField label="Education" id="education" name="education" value={form.education} onChange={handleProfileChange} />
          <FormField label="Profession" id="profession" name="profession" value={form.profession} onChange={handleProfileChange} />
        </div>
        <FormField label="Bio" id="bio">
          <textarea id="bio" name="bio" value={form.bio} onChange={handleProfileChange} />
        </FormField>
      </section>
      <section className="form-section">
        <h2>Match preferences</h2>
        <div className="filter-grid">
          <FormField label="Preferred gender" id="preferred_gender">
            <select
              id="preferred_gender"
              name="preferred_gender"
              value={form.preferred_gender}
              onChange={handleProfileChange}
            >
              <option value="">Any</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="non_binary">Non-binary</option>
            </select>
          </FormField>
          <FormField label="Preferred city" id="preferred_city" name="preferred_city" value={form.preferred_city} onChange={handleProfileChange} />
          <FormField
            label="Preferred religion"
            id="preferred_religion"
            name="preferred_religion"
            value={form.preferred_religion}
            onChange={handleProfileChange}
          />
          <FormField label="Age from" id="preferred_age_min" name="preferred_age_min">
            <input
              id="preferred_age_min"
              name="preferred_age_min"
              type="number"
              min="18"
              max="100"
              value={form.preferred_age_min}
              onChange={handleProfileChange}
            />
          </FormField>
          <FormField label="Age to" id="preferred_age_max" name="preferred_age_max">
            <input
              id="preferred_age_max"
              name="preferred_age_max"
              type="number"
              min="18"
              max="100"
              value={form.preferred_age_max}
              onChange={handleProfileChange}
            />
          </FormField>
        </div>
      </section>
      <section className="form-section">
        <h2>Interests</h2>
        <div className="tag-grid">
          {interestOptions.map((interest) => {
            const id = String(interest.id);
            const selected = selectedInterests.includes(id);
            return (
              <button
                key={id}
                type="button"
                className={`tag selectable ${selected ? 'active' : ''}`}
                onClick={() => toggleInterest(id)}
              >
                #{interest.name}
              </button>
            );
          })}
        </div>
        <p className="helper-text">
          Selected: {selectedInterests.map((id) => interestLookup.get(id)).filter(Boolean).join(', ') || 'None'}
        </p>
      </section>
      <section className="form-section">
        <h2>Photos</h2>
        <div className="photo-grid">
          {profile.photos?.map((photo) => {
            const marked = removePhotoIds.has(photo.id);
            return (
              <div key={photo.id} className={`photo-tile ${marked ? 'marked' : ''}`}>
                <img src={photo.image} alt="Profile" />
                <button type="button" className="btn secondary" onClick={() => markForRemoval(photo.id)}>
                  {marked ? 'Marked for removal' : 'Remove'}
                </button>
              </div>
            );
          })}
          {newPhotos.map((file, index) => (
            <div key={`${file.name}-${index}`} className="photo-tile preview">
              <span>{file.name}</span>
            </div>
          ))}
        </div>
        <label className="btn secondary">
          Upload photos
          <input type="file" multiple hidden accept="image/*" onChange={handlePhotoUpload} />
        </label>
      </section>
    </form>
  );
}

export default ProfilePage;
