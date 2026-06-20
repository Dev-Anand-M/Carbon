/**
 * @fileoverview Dashboard page with charts, goals, and achievements.
 * @module pages/Dashboard
 */

import { useMemo, useState, useCallback } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { useCarbon } from '../contexts/CarbonContext.jsx';
import { useAccessibility } from '../hooks/useAccessibility.js';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import ProgressBar from '../components/common/ProgressBar.jsx';
import { CATEGORIES, CHART_COLORS, BENCHMARKS } from '../utils/constants.js';
import { formatEmissions, formatNumber, formatPercentage } from '../utils/formatters.js';
import { getEquivalencies, compareToBenchmarks, calculateGoalProgress } from '../utils/carbonCalculations.js';
import { Link } from 'react-router-dom';

/**
 * Dashboard page component.
 * @returns {JSX.Element}
 */
function Dashboard() {
  const {
    footprintResult,
    hasCalculated,
    goal,
    setGoal,
    completedActions,
    earnedAchievements,
    streak,
  } = useCarbon();
  const { announce } = useAccessibility();

  const [goalInput, setGoalInput] = useState(goal?.targetReduction || 20);
  const [showGoalForm, setShowGoalForm] = useState(false);

  /* Pie chart data */
  const pieData = useMemo(() => {
    if (!footprintResult) return [];
    return Object.entries(footprintResult.breakdown)
      .filter(([, value]) => value > 0)
      .map(([key, value]) => ({
        name: CATEGORIES[key]?.label || key,
        value: Math.round(value),
        icon: CATEGORIES[key]?.icon,
      }));
  }, [footprintResult]);

  /* Benchmark comparison data */
  const benchmarkData = useMemo(() => {
    if (!footprintResult) return [];
    return [
      { name: 'You', value: footprintResult.totalTonnes, fill: '#0d9488' },
      { name: 'India Avg', value: BENCHMARKS.india_average, fill: '#3b82f6' },
      { name: 'World Avg', value: BENCHMARKS.world_average, fill: '#f59e0b' },
      { name: 'Paris Target', value: BENCHMARKS.paris_target, fill: '#10b981' },
      { name: 'USA Avg', value: BENCHMARKS.usa_average, fill: '#ef4444' },
    ];
  }, [footprintResult]);

  /* Detailed benchmark analysis */
  const benchmarkAnalysis = useMemo(() => {
    if (!footprintResult) return [];
    return compareToBenchmarks(footprintResult.totalTonnes);
  }, [footprintResult]);

  /* Equivalencies */
  const equivalencies = useMemo(() => {
    if (!footprintResult) return null;
    return getEquivalencies(footprintResult.total);
  }, [footprintResult]);

  /* Goal progress */
  const goalProgress = useMemo(() => {
    if (!goal || !footprintResult) return null;
    return calculateGoalProgress(
      goal.baseline || footprintResult.total,
      footprintResult.total,
      goal.targetReduction
    );
  }, [goal, footprintResult]);

  const handleSetGoal = useCallback(() => {
    const newGoal = {
      targetReduction: goalInput,
      baseline: footprintResult.total,
      createdAt: new Date().toISOString(),
    };
    setGoal(newGoal);
    setShowGoalForm(false);
    announce(`Goal set: reduce emissions by ${goalInput}%`, 'assertive');
  }, [goalInput, footprintResult, setGoal, announce]);

  /* No data state */
  if (!hasCalculated || !footprintResult) {
    return (
      <div className="page page--dashboard">
        <section className="empty-state" aria-labelledby="empty-heading">
          <div className="empty-state__content">
            <span className="empty-state__icon" aria-hidden="true">📊</span>
            <h1 id="empty-heading" className="empty-state__title">
              No Data Yet
            </h1>
            <p className="empty-state__text">
              Calculate your carbon footprint first to see your personalized dashboard.
            </p>
            <Link to="/calculator" className="btn btn--primary btn--large" id="empty-cta">
              🧮 Calculate Now
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="page page--dashboard">
      <h1 className="page__title" id="dashboard-heading">Your Carbon Dashboard</h1>
      <p className="page__subtitle">
        A comprehensive view of your environmental impact and progress.
      </p>

      {/* Summary Cards */}
      <section className="dashboard-summary" aria-labelledby="summary-heading">
        <h2 id="summary-heading" className="sr-only">Footprint Summary</h2>
        <div className="dashboard-summary__grid">
          <Card variant="stat" id="dash-total-footprint">
            <div className="stat stat--large">
              <span className="stat__icon" aria-hidden="true">🌡️</span>
              <span className="stat__value">{footprintResult.totalTonnes}</span>
              <span className="stat__label">tonnes CO₂e/year</span>
              <span className={`stat__badge stat__badge--${
                footprintResult.totalTonnes <= BENCHMARKS.india_average ? 'good' : 'warning'
              }`}>
                {footprintResult.totalTonnes <= BENCHMARKS.india_average
                  ? '✓ Below Indian Average'
                  : '↑ Above Indian Average'}
              </span>
            </div>
          </Card>

          <Card variant="stat" id="dash-daily-avg">
            <div className="stat stat--large">
              <span className="stat__icon" aria-hidden="true">📅</span>
              <span className="stat__value">
                {formatNumber(footprintResult.total / 365, 1)}
              </span>
              <span className="stat__label">kg CO₂e/day</span>
            </div>
          </Card>

          <Card variant="stat" id="dash-streak">
            <div className="stat stat--large">
              <span className="stat__icon" aria-hidden="true">🔥</span>
              <span className="stat__value">{streak}</span>
              <span className="stat__label">day streak</span>
            </div>
          </Card>

          <Card variant="stat" id="dash-actions">
            <div className="stat stat--large">
              <span className="stat__icon" aria-hidden="true">✅</span>
              <span className="stat__value">{completedActions.length}</span>
              <span className="stat__label">actions completed</span>
            </div>
          </Card>
        </div>
      </section>

      {/* Charts Section */}
      <section className="dashboard-charts" aria-labelledby="charts-heading">
        <h2 id="charts-heading" className="section-title">Emissions Breakdown</h2>
        <div className="dashboard-charts__grid">
          {/* Pie Chart */}
          <Card title="By Category" icon="🥧" id="chart-pie">
            <div className="chart-container" role="img" aria-label="Pie chart showing carbon emissions by category">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={50}
                    paddingAngle={2}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatEmissions(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              {/* Accessible table alternative */}
              <table className="sr-only" aria-label="Emissions breakdown by category">
                <thead>
                  <tr><th>Category</th><th>Emissions (kg CO₂e)</th><th>Percentage</th></tr>
                </thead>
                <tbody>
                  {pieData.map((item) => {
                    const catKey = Object.entries(CATEGORIES).find(([, v]) => v.label === item.name)?.[0];
                    const pct = footprintResult.percentages[catKey] || 0;
                    return (
                      <tr key={item.name}>
                        <td>{item.name}</td>
                        <td>{formatEmissions(item.value)}</td>
                        <td>{formatPercentage(pct)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Benchmark Comparison */}
          <Card title="How You Compare" icon="📏" id="chart-benchmark">
            <div className="chart-container" role="img" aria-label="Bar chart comparing your footprint to global averages">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={benchmarkData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis type="number" unit=" t" />
                  <YAxis type="category" dataKey="name" width={90} />
                  <Tooltip formatter={(value) => `${value} tonnes CO₂e/year`} />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                    {benchmarkData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              {/* Accessible benchmark comparison table */}
              <table className="sr-only" aria-label="Benchmark comparison details">
                <thead>
                  <tr><th>Benchmark</th><th>Value (tonnes)</th><th>Your Status</th><th>Difference</th></tr>
                </thead>
                <tbody>
                  {benchmarkAnalysis.map((b) => (
                    <tr key={b.key}>
                      <td>{b.label}</td>
                      <td>{b.value}</td>
                      <td>{b.status === 'below' ? 'Below' : 'Above'}</td>
                      <td>{b.difference > 0 ? '+' : ''}{b.difference} tonnes ({b.percentDifference}%)</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </section>

      {/* Equivalencies */}
      {equivalencies && (
        <section className="equivalencies" aria-labelledby="equiv-heading">
          <h2 id="equiv-heading" className="section-title">What Your Footprint Equals</h2>
          <div className="equivalencies__grid">
            <Card variant="equiv" id="equiv-trees">
              <div className="equiv-item">
                <span className="equiv-item__icon" aria-hidden="true">🌳</span>
                <span className="equiv-item__value">{formatNumber(equivalencies.treesNeeded)}</span>
                <span className="equiv-item__label">trees needed to offset for one year</span>
              </div>
            </Card>
            <Card variant="equiv" id="equiv-charges">
              <div className="equiv-item">
                <span className="equiv-item__icon" aria-hidden="true">📱</span>
                <span className="equiv-item__value">{formatNumber(equivalencies.smartphoneCharges)}</span>
                <span className="equiv-item__label">smartphone charges</span>
              </div>
            </Card>
            <Card variant="equiv" id="equiv-driving">
              <div className="equiv-item">
                <span className="equiv-item__icon" aria-hidden="true">🚗</span>
                <span className="equiv-item__value">{formatNumber(equivalencies.kmDriven)}</span>
                <span className="equiv-item__label">km driven in an average car</span>
              </div>
            </Card>
            <Card variant="equiv" id="equiv-flights">
              <div className="equiv-item">
                <span className="equiv-item__icon" aria-hidden="true">✈️</span>
                <span className="equiv-item__value">{equivalencies.flightsDelMum}</span>
                <span className="equiv-item__label">Delhi↔Mumbai flights</span>
              </div>
            </Card>
          </div>
        </section>
      )}

      {/* Goal Setting */}
      <section className="goal-section" aria-labelledby="goal-heading">
        <h2 id="goal-heading" className="section-title">Reduction Goal</h2>
        {goal && goalProgress ? (
          <Card variant="goal" id="goal-progress-card">
            <div className="goal-display">
              <p className="goal-display__text">
                Target: Reduce emissions by <strong>{goal.targetReduction}%</strong>
              </p>
              <ProgressBar
                value={goalProgress.progress}
                variant={goalProgress.onTrack ? 'success' : 'warning'}
                label={`${goalProgress.progress}% towards goal`}
                ariaLabel={`Goal progress: ${goalProgress.progress}%`}
                id="goal-progress-bar"
              />
              <div className="goal-display__stats">
                <span>Reduced: {formatEmissions(goalProgress.reduced, { short: true })}</span>
                <span>Remaining: {formatEmissions(goalProgress.remaining, { short: true })}</span>
              </div>
              <Button
                variant="ghost"
                size="small"
                onClick={() => setShowGoalForm(true)}
                id="goal-update-btn"
              >
                Update Goal
              </Button>
            </div>
          </Card>
        ) : (
          <Card id="goal-set-card">
            {showGoalForm ? (
              <div className="goal-form">
                <label htmlFor="goal-reduction-input" className="goal-form__label">
                  Reduction target (%)
                </label>
                <div className="goal-form__row">
                  <input
                    type="range"
                    id="goal-reduction-input"
                    min="5"
                    max="50"
                    step="5"
                    value={goalInput}
                    onChange={(e) => setGoalInput(Number(e.target.value))}
                    aria-valuemin={5}
                    aria-valuemax={50}
                    aria-valuenow={goalInput}
                    aria-label="Reduction target percentage"
                  />
                  <span className="goal-form__value" aria-live="polite">{goalInput}%</span>
                </div>
                <p className="goal-form__impact">
                  This means reducing {formatEmissions(footprintResult.total * goalInput / 100, { short: true })} per year.
                </p>
                <div className="goal-form__actions">
                  <Button variant="primary" onClick={handleSetGoal} id="goal-confirm-btn">
                    Set Goal
                  </Button>
                  <Button variant="ghost" onClick={() => setShowGoalForm(false)} id="goal-cancel-btn">
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="goal-empty">
                <p>Set a reduction goal to track your progress towards a lower carbon footprint.</p>
                <Button variant="primary" onClick={() => setShowGoalForm(true)} id="goal-set-btn" icon="🎯">
                  Set a Goal
                </Button>
              </div>
            )}
          </Card>
        )}
      </section>

      {/* Achievements */}
      <section className="achievements" aria-labelledby="achieve-heading">
        <h2 id="achieve-heading" className="section-title">Achievements</h2>
        <div className="achievements__grid">
          {[
            { id: 'first_calc', title: 'First Step', icon: '🎯', description: 'Complete your first calculation' },
            { id: 'week_streak', title: 'Week Warrior', icon: '🔥', description: '7-day logging streak' },
            { id: 'month_streak', title: 'Green Champion', icon: '🏆', description: '30-day logging streak' },
            { id: 'first_action', title: 'Action Taker', icon: '✅', description: 'Complete a reduction action' },
            { id: 'five_actions', title: 'Eco Warrior', icon: '🌍', description: 'Complete 5 actions' },
            { id: 'below_average', title: 'Below Average', icon: '📉', description: 'Below national average' },
          ].map((achievement) => (
            <div
              key={achievement.id}
              className={`achievement ${earnedAchievements.includes(achievement.id) ? 'achievement--earned' : 'achievement--locked'}`}
              id={`achievement-${achievement.id}`}
              aria-label={`${achievement.title}: ${earnedAchievements.includes(achievement.id) ? 'Earned' : 'Locked'}. ${achievement.description}`}
            >
              <span className="achievement__icon" aria-hidden="true">
                {earnedAchievements.includes(achievement.id) ? achievement.icon : '🔒'}
              </span>
              <span className="achievement__title">{achievement.title}</span>
              <span className="achievement__desc">{achievement.description}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
