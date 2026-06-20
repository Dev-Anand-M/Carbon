/**
 * @fileoverview Reusable Card component for content sections.
 * @module components/common/Card
 */

import PropTypes from 'prop-types';

/**
 * A flexible card container component.
 * @param {Object} props
 * @param {React.ReactNode} props.children - Card content.
 * @param {string} [props.title] - Optional card title.
 * @param {string} [props.icon] - Optional emoji icon.
 * @param {string} [props.className] - Additional CSS classes.
 * @param {string} [props.variant='default'] - Card style variant.
 * @param {string} [props.id] - Unique identifier for the card.
 * @returns {JSX.Element}
 */
function Card({ children, title, icon, className = '', variant = 'default', id }) {
  return (
    <article
      className={`card card--${variant} ${className}`.trim()}
      id={id}
      aria-label={title || undefined}
    >
      {title && (
        <header className="card__header">
          {icon && <span className="card__icon" aria-hidden="true">{icon}</span>}
          <h3 className="card__title">{title}</h3>
        </header>
      )}
      <div className="card__body">{children}</div>
    </article>
  );
}

Card.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  icon: PropTypes.string,
  className: PropTypes.string,
  variant: PropTypes.string,
  id: PropTypes.string,
};

export default Card;
