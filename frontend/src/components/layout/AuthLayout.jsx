import PropTypes from 'prop-types';

import '../../styles/theme.css';

const AuthLayout = ({ title, subtitle, children }) => {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: '40px 16px',
        background:
          'radial-gradient(circle at 20% 20%, rgba(59,130,246,0.25), transparent 55%), radial-gradient(circle at 80% 20%, rgba(139,92,246,0.25), transparent 50%), radial-gradient(circle at bottom, rgba(236,72,153,0.25), transparent 55%), #020617'
      }}
    >
      <div
        className="surface-card surface-card--glow"
        style={{
          width: 'min(420px, 100%)',
          padding: '36px',
          display: 'grid',
          gap: '24px'
        }}
      >
        <div style={{ display: 'grid', gap: '8px', textAlign: 'center' }}>
          <div className="badge" style={{ justifySelf: 'center' }}>
            VivahVows OS
          </div>
          <h1 style={{ margin: 0, fontSize: '1.75rem' }}>{title}</h1>
          {subtitle && (
            <p style={{ margin: 0, color: 'rgba(203,213,225,0.75)' }}>{subtitle}</p>
          )}
        </div>
        {children}
      </div>
    </div>
  );
};

AuthLayout.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  children: PropTypes.node
};

export default AuthLayout;
