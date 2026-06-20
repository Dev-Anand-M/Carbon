/**
 * @fileoverview Application header with navigation and theme toggle.
 * Implements responsive navigation with keyboard accessibility.
 * @module components/layout/Header
 */

import { useState, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext.jsx';

/**
 * Navigation link configuration.
 * @type {Array<{path: string, label: string, icon: string}>}
 */
const NAV_LINKS = [
  { path: '/', label: 'Home', icon: '🏠' },
  { path: '/calculator', label: 'Calculator', icon: '🧮' },
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/tracking', label: 'Tracking', icon: '📝' },
  { path: '/insights', label: 'Insights', icon: '💡' },
];

/**
 * Application header with responsive navigation.
 * @returns {JSX.Element}
 */
function Header() {
  const { isDark, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleToggleMenu = useCallback(() => {
    setMenuOpen((prev) => !prev);
  }, []);

  const handleNavClick = useCallback(() => {
    setMenuOpen(false);
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      setMenuOpen(false);
    }
  }, []);

  return (
    <header className="header" role="banner" onKeyDown={handleKeyDown}>
      {/* Skip Navigation Link — WCAG 2.4.1 */}
      <a href="#main-content" className="skip-link" id="skip-nav-link">
        Skip to main content
      </a>

      <div className="header__container">
        <NavLink to="/" className="header__logo" aria-label="CarbonWise Home" onClick={handleNavClick}>
          <span className="header__logo-icon" aria-hidden="true">🌍</span>
          <span className="header__logo-text">
            Carbon<span className="header__logo-accent">Wise</span>
          </span>
        </NavLink>

        <nav
          className={`header__nav ${menuOpen ? 'header__nav--open' : ''}`}
          role="navigation"
          aria-label="Main navigation"
          id="main-navigation"
        >
          <ul className="header__nav-list" role="menubar">
            {NAV_LINKS.map(({ path, label, icon }) => (
              <li key={path} role="none">
                <NavLink
                  to={path}
                  end={path === '/'}
                  className={({ isActive }) =>
                    `header__nav-link ${isActive ? 'header__nav-link--active' : ''}`
                  }
                  role="menuitem"
                  onClick={handleNavClick}
                  id={`nav-link-${label.toLowerCase()}`}
                >
                  <span className="header__nav-icon" aria-hidden="true">{icon}</span>
                  <span>{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="header__actions">
          <button
            className="header__theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            type="button"
            id="theme-toggle-btn"
          >
            <span aria-hidden="true">{isDark ? '☀️' : '🌙'}</span>
          </button>

          <button
            className={`header__menu-toggle ${menuOpen ? 'header__menu-toggle--open' : ''}`}
            onClick={handleToggleMenu}
            aria-expanded={menuOpen}
            aria-controls="main-navigation"
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            type="button"
            id="menu-toggle-btn"
          >
            <span className="header__menu-bar" aria-hidden="true" />
            <span className="header__menu-bar" aria-hidden="true" />
            <span className="header__menu-bar" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
