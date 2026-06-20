/**
 * @fileoverview Reusable Button component with variants and accessibility.
 * @module components/common/Button
 */

/**
 * An accessible button component with loading state and variants.
 * @param {Object} props
 * @param {React.ReactNode} props.children - Button label.
 * @param {string} [props.variant='primary'] - Button style: 'primary', 'secondary', 'outline', 'danger', 'ghost'.
 * @param {string} [props.size='medium'] - Button size: 'small', 'medium', 'large'.
 * @param {boolean} [props.loading=false] - Show loading spinner.
 * @param {boolean} [props.disabled=false] - Disable the button.
 * @param {string} [props.type='button'] - HTML button type.
 * @param {Function} [props.onClick] - Click handler.
 * @param {string} [props.ariaLabel] - Accessible label.
 * @param {string} [props.id] - Unique identifier.
 * @param {string} [props.className] - Additional CSS classes.
 * @param {string} [props.icon] - Optional leading icon (emoji).
 * @returns {JSX.Element}
 */
function Button({
  children,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  type = 'button',
  onClick,
  ariaLabel,
  id,
  className = '',
  icon,
}) {
  const classes = [
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    loading ? 'btn--loading' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      className={classes}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={ariaLabel || undefined}
      aria-busy={loading || undefined}
      aria-disabled={disabled || loading || undefined}
      id={id}
    >
      {loading && (
        <span className="btn__spinner" aria-hidden="true">
          <svg
            className="btn__spinner-svg"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
          >
            <circle
              cx="12" cy="12" r="10"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="60"
              strokeDashoffset="20"
            />
          </svg>
        </span>
      )}
      {icon && !loading && <span className="btn__icon" aria-hidden="true">{icon}</span>}
      <span className="btn__label">{children}</span>
    </button>
  );
}

export default Button;
