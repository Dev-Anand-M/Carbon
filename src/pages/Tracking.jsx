/**
 * @fileoverview Activity tracking page for logging daily carbon activities.
 * @module pages/Tracking
 */

import { useState, useCallback, useMemo } from 'react';
import { useCarbon } from '../contexts/CarbonContext.jsx';
import { useAccessibility } from '../hooks/useAccessibility.js';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import {
  TRANSPORT_FACTORS,
  ENERGY_FACTORS,
  SHOPPING_FACTORS,
  WASTE_FACTORS,
  CATEGORIES,
} from '../utils/constants.js';
import { calculateTransportEmissions, calculateEnergyEmissions, calculateShoppingEmissions, calculateWasteEmissions } from '../utils/carbonCalculations.js';
import { formatEmissions, formatRelativeTime, formatStreak } from '../utils/formatters.js';
import { validateActivityEntry } from '../utils/validators.js';

/**
 * Activity type options keyed by category.
 */
const ACTIVITY_OPTIONS = {
  transport: TRANSPORT_FACTORS,
  energy: ENERGY_FACTORS,
  shopping: SHOPPING_FACTORS,
  waste: WASTE_FACTORS,
};

/**
 * Tracking page component.
 * @returns {JSX.Element}
 */
function Tracking() {
  const { activities, addActivity, removeActivity, streak } = useCarbon();
  const { announce } = useAccessibility();

  const [category, setCategory] = useState('transport');
  const [activityType, setActivityType] = useState('');
  const [value, setValue] = useState('');
  const [note, setNote] = useState('');
  const [formErrors, setFormErrors] = useState([]);
  const [filterCategory, setFilterCategory] = useState('all');

  /* Get available types for selected category */
  const availableTypes = useMemo(() => {
    return ACTIVITY_OPTIONS[category] || {};
  }, [category]);

  /* Filtered activities */
  const filteredActivities = useMemo(() => {
    if (filterCategory === 'all') return activities;
    return activities.filter((a) => a.category === filterCategory);
  }, [activities, filterCategory]);

  /* Today's total emissions */
  const todayTotal = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return activities
      .filter((a) => new Date(a.timestamp) >= today)
      .reduce((sum, a) => sum + (a.emissions || 0), 0);
  }, [activities]);

  /**
   * Handle form submission for new activity.
   */
  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();

      const entry = {
        category,
        type: activityType,
        value: Number(value),
        date: new Date().toISOString(),
      };

      const validation = validateActivityEntry(entry);
      if (!validation.valid) {
        setFormErrors(validation.errors);
        return;
      }

      /* Calculate emissions for this activity */
      let emissions = 0;
      try {
        switch (category) {
          case 'transport':
            emissions = calculateTransportEmissions(activityType, Number(value));
            break;
          case 'energy':
            emissions = calculateEnergyEmissions(activityType, Number(value));
            break;
          case 'shopping':
            emissions = calculateShoppingEmissions(activityType, Number(value));
            break;
          case 'waste':
            emissions = calculateWasteEmissions(activityType, Number(value));
            break;
          default:
            break;
        }
      } catch (calcError) {
        console.warn('[Tracking] Emission calculation failed:', calcError.message);
        emissions = 0;
      }

      const typeInfo = availableTypes[activityType];
      addActivity({
        ...entry,
        emissions,
        label: typeInfo?.label || activityType,
        icon: typeInfo?.icon || CATEGORIES[category]?.icon,
        note: note.trim(),
      });

      /* Reset form */
      setActivityType('');
      setValue('');
      setNote('');
      setFormErrors([]);
      announce(`Activity logged: ${typeInfo?.label || activityType}, ${formatEmissions(emissions)}`);
    },
    [category, activityType, value, note, availableTypes, addActivity, announce]
  );

  /**
   * Handle activity deletion.
   */
  const handleDelete = useCallback(
    (id, label) => {
      removeActivity(id);
      announce(`Removed activity: ${label}`);
    },
    [removeActivity, announce]
  );

  return (
    <div className="page page--tracking">
      <h1 className="page__title" id="tracking-heading">Activity Tracking</h1>
      <p className="page__subtitle">
        Log your daily activities to track your carbon footprint over time.
      </p>

      {/* Quick Stats */}
      <div className="tracking-stats">
        <Card variant="stat" id="tracking-today-total">
          <div className="stat">
            <span className="stat__icon" aria-hidden="true">📅</span>
            <span className="stat__value">{formatEmissions(todayTotal, { short: true })}</span>
            <span className="stat__label">today</span>
          </div>
        </Card>
        <Card variant="stat" id="tracking-streak">
          <div className="stat">
            <span className="stat__icon" aria-hidden="true">🔥</span>
            <span className="stat__value">{formatStreak(streak)}</span>
            <span className="stat__label">current streak</span>
          </div>
        </Card>
        <Card variant="stat" id="tracking-total-logs">
          <div className="stat">
            <span className="stat__icon" aria-hidden="true">📝</span>
            <span className="stat__value">{activities.length}</span>
            <span className="stat__label">total entries</span>
          </div>
        </Card>
      </div>

      {/* Log Activity Form */}
      <section aria-labelledby="log-heading">
        <h2 id="log-heading" className="section-title">Log an Activity</h2>
        <Card id="log-activity-card">
          <form onSubmit={handleSubmit} noValidate className="log-form">
            {/* Error display */}
            {formErrors.length > 0 && (
              <div className="log-form__errors" role="alert" aria-live="assertive">
                <ul>
                  {formErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="log-form__grid">
              {/* Category */}
              <div className="log-form__field">
                <label htmlFor="log-category" className="log-form__label">
                  Category
                </label>
                <select
                  id="log-category"
                  className="log-form__select"
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setActivityType('');
                  }}
                >
                  {Object.entries(CATEGORIES)
                    .filter(([key]) => key !== 'diet')
                    .map(([key, info]) => (
                      <option key={key} value={key}>
                        {info.icon} {info.label}
                      </option>
                    ))}
                </select>
              </div>

              {/* Activity Type */}
              <div className="log-form__field">
                <label htmlFor="log-type" className="log-form__label">
                  Activity Type
                </label>
                <select
                  id="log-type"
                  className="log-form__select"
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value)}
                  required
                  aria-required="true"
                >
                  <option value="">Select activity...</option>
                  {Object.entries(availableTypes).map(([key, info]) => (
                    <option key={key} value={key}>
                      {info.icon} {info.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Value */}
              <div className="log-form__field">
                <label htmlFor="log-value" className="log-form__label">
                  Amount
                  {activityType && availableTypes[activityType] && (
                    <span className="log-form__unit">
                      ({availableTypes[activityType].unit})
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  id="log-value"
                  className="log-form__input"
                  min="0"
                  step="0.1"
                  placeholder="0"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  required
                  aria-required="true"
                />
              </div>

              {/* Note */}
              <div className="log-form__field">
                <label htmlFor="log-note" className="log-form__label">
                  Note <span className="log-form__optional">(optional)</span>
                </label>
                <input
                  type="text"
                  id="log-note"
                  className="log-form__input"
                  maxLength={200}
                  placeholder="e.g., Daily commute to office"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              id="log-submit-btn"
              icon="+"
              disabled={!activityType || !value}
            >
              Log Activity
            </Button>
          </form>
        </Card>
      </section>

      {/* Activity Log */}
      <section aria-labelledby="history-heading">
        <div className="section-header">
          <h2 id="history-heading" className="section-title">Activity History</h2>
          <div className="filter-group" role="group" aria-label="Filter activities by category">
            <label htmlFor="filter-category" className="sr-only">Filter by category</label>
            <select
              id="filter-category"
              className="log-form__select log-form__select--small"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {Object.entries(CATEGORIES)
                .filter(([key]) => key !== 'diet')
                .map(([key, info]) => (
                  <option key={key} value={key}>{info.label}</option>
                ))}
            </select>
          </div>
        </div>

        {filteredActivities.length === 0 ? (
          <Card id="no-activities-card">
            <div className="empty-state">
              <span className="empty-state__icon" aria-hidden="true">📝</span>
              <p className="empty-state__text">
                No activities logged yet. Start by logging your first activity above!
              </p>
            </div>
          </Card>
        ) : (
          <ul className="activity-list" aria-label="Activity log entries">
            {filteredActivities.slice(0, 50).map((activity) => (
              <li key={activity.id} className="activity-item" id={`activity-${activity.id}`}>
                <span className="activity-item__icon" aria-hidden="true">
                  {activity.icon}
                </span>
                <div className="activity-item__info">
                  <span className="activity-item__label">{activity.label}</span>
                  <span className="activity-item__meta">
                    {activity.value} {ACTIVITY_OPTIONS[activity.category]?.[activity.type]?.unit || 'units'}
                    {activity.note && ` — ${activity.note}`}
                  </span>
                  <span className="activity-item__time">
                    {formatRelativeTime(activity.timestamp)}
                  </span>
                </div>
                <div className="activity-item__emissions">
                  <span className="activity-item__co2">
                    {formatEmissions(activity.emissions, { short: true })}
                  </span>
                  <button
                    className="activity-item__delete"
                    onClick={() => handleDelete(activity.id, activity.label)}
                    aria-label={`Remove ${activity.label} activity`}
                    type="button"
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {filteredActivities.length > 50 && (
          <p className="activity-list__more" aria-live="polite">
            Showing 50 of {filteredActivities.length} entries.
          </p>
        )}
      </section>
    </div>
  );
}

export default Tracking;
