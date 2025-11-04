import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { loadMutualMatches, selectMutualMatches } from '../redux/matchSlice.js';
import { loadProfile, selectProfile } from '../redux/profileSlice.js';

const DashboardPage = () => {
  const dispatch = useDispatch();
  const profile = useSelector(selectProfile);
  const mutualMatches = useSelector(selectMutualMatches);

  useEffect(() => {
    dispatch(loadProfile());
    dispatch(loadMutualMatches());
  }, [dispatch]);

  if (!profile) {
    return (
      <div className="container">
        <div className="card">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <h2>Welcome back, {profile.name || profile.user}</h2>
        <p>{profile.bio || 'Complete your profile to get better matches.'}</p>
        <p>
          City: <strong>{profile.city || 'Not specified'}</strong>
        </p>
        <p>Interests selected: {profile.interests?.length ?? 0}</p>
      </div>
      <div className="card">
        <h3>Mutual matches</h3>
        <p>You have {mutualMatches.length} mutual match{mutualMatches.length !== 1 ? 'es' : ''}.</p>
      </div>
    </div>
  );
};

export default DashboardPage;
