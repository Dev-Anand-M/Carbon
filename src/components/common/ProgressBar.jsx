/**
 * @fileoverview Reusable ProgressBar component with accessibility.
 * @module components/common/ProgressBar
 */

import PropTypes from 'prop-types';

/**
 * An accessible progress bar with label and animated fill.
 * @param {Object} props
 * @param {number} props.value - Current progress value (0-100).
 * @param {number} [props.max=100] - Maximum value.
 * @param {string} [props.label] - Visible label text.
 * @param {string} [props.ariaLabel] - Screen reader label.
 * @param {string} [props.variant='default'] - Visual variant.
 * @param {boolean} [props.showValue=true] - Whether to display the value text.
 * @param {string} [props.id] - Unique identifier.
 * @returns {JSX.Element}
 */
function ProgressBar({
  value,
  max = 100,
  label,
  ariaLabel,
  variant = 'default',
  showValue = true,
  id,
}) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const displayValue = `${Math.round(percentage)}%`;

  return (
    <div className={`progress progress--${variant}`} id={id}>
      {label && <span className="progress__label">{label}</span>}
      <div
        className="progress__track"
        role="progressbar"
        aria-valuenow={Math.round(percentage)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={ariaLabel || label || 'Progress'}
      >
        <div
          className="progress__fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showValue && (
        <span className="progress__value" aria-hidden="true">
          {displayValue}
        </span>
      )}
    </div>
  );
}

ProgressBar.propTypes = {
  value: PropTypes.number.isRequired,
  max: PropTypes.number,
  label: PropTypes.string,
  ariaLabel: PropTypes.string,
  variant: PropTypes.string,
  showValue: PropTypes.bool,
  id: PropTypes.string,
};

export default ProgressBar;
