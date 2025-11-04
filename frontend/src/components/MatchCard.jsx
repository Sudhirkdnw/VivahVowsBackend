import React from 'react';

const MatchCard = ({ profile, onLike, onReject, onBlock }) => {
  return (
    <div className="card">
      <div className="card__header">
        <h3>{profile.name || profile.user}</h3>
        <p>{profile.city}</p>
      </div>
      <p>{profile.bio}</p>
      <div className="card__footer">
        <button type="button" className="button-primary" onClick={() => onLike(profile)}>
          Like
        </button>
        <button type="button" className="button-secondary" onClick={() => onReject(profile)}>
          Pass
        </button>
        <button type="button" className="button-secondary" onClick={() => onBlock(profile)}>
          Block
        </button>
      </div>
    </div>
  );
};

export default MatchCard;
