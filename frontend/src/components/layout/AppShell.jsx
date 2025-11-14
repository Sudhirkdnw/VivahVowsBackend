import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

import '../../styles/theme.css';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';

const getInitialSidebarState = () => true;

const AppShell = ({ children }) => {
  const [sidebarPinned, setSidebarPinned] = useState(getInitialSidebarState);
  const [sidebarVisible, setSidebarVisible] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 960) {
        setSidebarPinned(true);
        setSidebarVisible(false);
      } else {
        setSidebarPinned(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const className = useMemo(() => {
    const classes = ['app-shell'];
    if (!sidebarPinned) {
      classes.push('app-shell--sidebar-collapsed');
    }
    if (sidebarVisible) {
      classes.push('app-shell--sidebar-open');
    }
    return classes.join(' ');
  }, [sidebarPinned, sidebarVisible]);

  return (
    <div className={className}>
      <Sidebar
        pinned={sidebarPinned}
        onToggle={() => setSidebarPinned((value) => !value)}
        onClose={() => setSidebarVisible(false)}
        onMobileToggle={() => setSidebarVisible((value) => !value)}
      />
      <div className="app-shell__content">
        <Topbar
          sidebarPinned={sidebarPinned}
          onToggleSidebar={() => setSidebarPinned((value) => !value)}
          onMobileToggle={() => setSidebarVisible((value) => !value)}
        />
        {children}
      </div>
    </div>
  );
};

AppShell.propTypes = {
  children: PropTypes.node
};

export default AppShell;
