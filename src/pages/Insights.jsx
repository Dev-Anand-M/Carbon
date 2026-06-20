/**
 * @fileoverview Personalized Insights page with recommendations and action plans.
 * @module pages/Insights
 */

import { useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useCarbon } from '../contexts/CarbonContext.jsx';
import { useAccessibility } from '../hooks/useAccessibility.js';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import { generateInsights, calculateCompletedImpact, getContextualTip } from '../services/insightsEngine.js';
import { formatEmissions, formatNumber } from '../utils/formatters.js';
import { CATEGORIES } from '../utils/constants.js';

/**
 * Insights page component.
 * @returns {JSX.Element}
 */
function Insights() {
  const { carbonData, hasCalculated, completedActions, toggleAction, footprintResult } = useCarbon();
  const { announce } = useAccessibility();

  /* Generate insights */
  const insights = useMemo(() => {
    if (!hasCalculated) return null;
    return generateInsights(carbonData, completedActions);
  }, [carbonData, completedActions, hasCalculated]);

  /* Completed actions impact */
  const completedImpact = useMemo(() => {
    return calculateCompletedImpact(completedActions);
  }, [completedActions]);

  /* Contextual tip */
  const tip = getContextualTip();

  /**
   * Handle action toggle.
   */
  const handleToggleAction = useCallback(
    (actionId, actionTitle) => {
      toggleAction(actionId);
      const isCompleting = !completedActions.includes(actionId);
      announce(
        isCompleting
          ? `Marked "${actionTitle}" as completed`
          : `Unmarked "${actionTitle}"`,
        'assertive'
      );
    },
    [toggleAction, completedActions, announce]
  );

  /* No data state */
  if (!hasCalculated || !insights) {
    return (
      <div className="page page--insights">
        <section className="empty-state" aria-labelledby="empty-heading">
          <div className="empty-state__content">
            <span className="empty-state__icon" aria-hidden="true">💡</span>
            <h1 id="empty-heading" className="empty-state__title">
              Get Personalized Insights
            </h1>
            <p className="empty-state__text">
              Calculate your carbon footprint first, and we'll generate tailored recommendations just for you.
            </p>
            <Link to="/calculator" className="btn btn--primary btn--large" id="insights-empty-cta">
              🧮 Calculate Now
            </Link>
          </div>
        </section>
      </div>
    );
  }

  const { summary, recommendations, sortedCategories, potentialSavingsTonnes, equivalencies } = insights;

  return (
    <div className="page page--insights">
      <h1 className="page__title" id="insights-heading">Personalized Insights</h1>
      <p className="page__subtitle">
        Smart recommendations tailored to your carbon footprint profile.
      </p>

      {/* Summary Card */}
      <section aria-labelledby="summary-msg-heading">
        <Card variant={`summary-${summary.level}`} id="insights-summary-card">
          <div className="insight-summary">
            <span className="insight-summary__emoji" aria-hidden="true">{summary.emoji}</span>
            <div>
              <h2 id="summary-msg-heading" className="insight-summary__heading">
                {summary.level === 'excellent' ? 'Outstanding!' : 
                 summary.level === 'good' ? 'Good Job!' :
                 summary.level === 'average' ? 'Room for Improvement' : 'Let\'s Take Action'}
              </h2>
              <p className="insight-summary__message">{summary.message}</p>
            </div>
          </div>
        </Card>
      </section>

      {/* Contextual Tip */}
      <section aria-labelledby="ctx-tip-heading">
        <Card variant="highlight" id="contextual-tip">
          <div className="tip-banner__content">
            <span className="tip-banner__icon" aria-hidden="true">{tip.icon}</span>
            <div>
              <h3 id="ctx-tip-heading" className="tip-banner__title">{tip.title}</h3>
              <p className="tip-banner__text">{tip.text}</p>
            </div>
          </div>
        </Card>
      </section>

      {/* Your Biggest Impact Areas */}
      <section aria-labelledby="areas-heading">
        <h2 id="areas-heading" className="section-title">Your Biggest Impact Areas</h2>
        <div className="impact-areas">
          {sortedCategories.filter((c) => c.value > 0).map((cat, index) => (
            <div
              key={cat.key}
              className="impact-area"
              id={`impact-area-${cat.key}`}
              style={{ '--area-color': CATEGORIES[cat.key]?.color }}
            >
              <span className="impact-area__rank">#{index + 1}</span>
              <span className="impact-area__icon" aria-hidden="true">{cat.icon}</span>
              <div className="impact-area__info">
                <span className="impact-area__label">{cat.label}</span>
                <span className="impact-area__value">
                  {formatEmissions(cat.value, { short: true })}
                </span>
              </div>
              <span className="impact-area__percent">{cat.percentage}%</span>
            </div>
          ))}
        </div>
      </section>

      {/* Recommended Actions */}
      <section aria-labelledby="reco-heading">
        <h2 id="reco-heading" className="section-title">
          Recommended Actions
          <span className="section-title__subtitle">
            Potential savings: {potentialSavingsTonnes} tonnes CO₂e/year
          </span>
        </h2>
        <div className="actions-grid">
          {recommendations.map((action) => {
            const isCompleted = completedActions.includes(action.id);
            return (
              <Card
                key={action.id}
                className={`action-card ${isCompleted ? 'action-card--completed' : ''}`}
                id={`action-card-${action.id}`}
              >
                <div className="action-card__header">
                  <span className="action-card__icon" aria-hidden="true">{action.icon}</span>
                  <div className="action-card__title-group">
                    <h3 className="action-card__title">{action.title}</h3>
                    <span className={`action-card__difficulty action-card__difficulty--${action.difficulty}`}>
                      {action.difficulty}
                    </span>
                  </div>
                </div>
                <p className="action-card__desc">{action.description}</p>
                <div className="action-card__impact">
                  <span className="action-card__impact-label">Annual Impact:</span>
                  <span className="action-card__impact-value">
                    -{formatEmissions(action.impact_kg_per_year, { short: true })}
                  </span>
                </div>
                <div className="action-card__tip">
                  <span aria-hidden="true">💡</span> {action.tip}
                </div>
                <Button
                  variant={isCompleted ? 'secondary' : 'primary'}
                  size="small"
                  onClick={() => handleToggleAction(action.id, action.title)}
                  id={`action-toggle-${action.id}`}
                  ariaLabel={
                    isCompleted
                      ? `Mark "${action.title}" as not completed`
                      : `Mark "${action.title}" as completed`
                  }
                  icon={isCompleted ? '✓' : ''}
                >
                  {isCompleted ? 'Completed' : 'Mark as Done'}
                </Button>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Completed Actions Summary */}
      {completedImpact.completedCount > 0 && (
        <section aria-labelledby="completed-heading">
          <h2 id="completed-heading" className="section-title">Your Impact So Far</h2>
          <Card variant="highlight" id="completed-impact-card">
            <div className="completed-impact">
              <div className="completed-impact__stat">
                <span className="completed-impact__value">
                  {completedImpact.completedCount}/{completedImpact.totalAvailable}
                </span>
                <span className="completed-impact__label">actions completed</span>
              </div>
              <div className="completed-impact__stat">
                <span className="completed-impact__value">
                  -{formatEmissions(completedImpact.totalImpact, { short: true })}
                </span>
                <span className="completed-impact__label">potential annual reduction</span>
              </div>
              <div className="completed-impact__stat">
                <span className="completed-impact__value">
                  🌳 {formatNumber(completedImpact.equivalencies.treesNeeded)}
                </span>
                <span className="completed-impact__label">trees equivalent</span>
              </div>
            </div>
          </Card>
        </section>
      )}
    </div>
  );
}

export default Insights;
