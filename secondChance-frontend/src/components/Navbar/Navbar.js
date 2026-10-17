import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

export default function Navbar() {
  const { isLoggedIn, setIsLoggedIn, userName, setUserName } = useAppContext();
  const navigate = useNavigate();
  const handleLogout = () => {
    sessionStorage.removeItem('auth-token');
    sessionStorage.removeItem('name');
    sessionStorage.removeItem('email');
    setIsLoggedIn(false);
    setUserName('');
    navigate('/app');
  };

  return (
    <header className="site-header">
      <nav className="navbar site-nav" aria-label="Main navigation">
        <Link className="brand-lockup" to="/app" aria-label="SecondChance home">
          <span className="brand-mark">s</span>
          <span>second<span className="brand-light">chance</span></span>
        </Link>
        <div className="nav-links">
          <NavLink to="/app" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Discover</NavLink>
          <NavLink to="/app/search" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Find an item</NavLink>
          {isLoggedIn && <Link className="nav-link" to="/app/addItem">Give an item</Link>}
        </div>
        <div className="nav-account">
          {isLoggedIn ? (
            <>
              <Link to="/app/profile" className="welcome-link"><span className="avatar-dot">{(userName || 'U').charAt(0).toUpperCase()}</span> Hi, {userName}</Link>
              <button className="button button-outline button-small" onClick={handleLogout}>Log out</button>
            </>
          ) : (
            <>
              <Link className="nav-login" to="/app/login">Log in</Link>
              <Link className="button button-dark button-small" to="/app/register">Join the community</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}