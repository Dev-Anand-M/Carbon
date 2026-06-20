/**
 * @fileoverview 404 Not Found page.
 * @module pages/NotFound
 */

import { Link } from 'react-router-dom';

/**
 * 404 page component.
 * @returns {JSX.Element}
 */
function NotFound() {
  return (
    <div className="page page--not-found" role="main">
      <section className="empty-state" aria-labelledby="notfound-heading">
        <div className="empty-state__content">
          <span className="empty-state__icon empty-state__icon--large" aria-hidden="true">
            🌿
          </span>
          <h1 id="notfound-heading" className="empty-state__title">
            404 — Page Not Found
          </h1>
          <p className="empty-state__text">
            This path doesn't lead anywhere — but your sustainability journey does!
          </p>
          <Link
            to="/"
            className="btn btn--primary btn--large"
            id="notfound-cta"
          >
            🏠 Go Home
          </Link>
        </div>
      </section>
    </div>
  );
}

export default NotFound;
