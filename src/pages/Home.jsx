/**
 * @fileoverview Home page — landing page with hero section and feature overview.
 * @module pages/Home
 */

import { Link } from 'react-router-dom';
import { useCarbon } from '../contexts/CarbonContext.jsx';
import Card from '../components/common/Card.jsx';
import { getContextualTip } from '../services/insightsEngine.js';
import { formatEmissions } from '../utils/formatters.js';

/**
 * Home page component.
 * @returns {JSX.Element}
 */
function Home() {
  const { hasCalculated, footprintResult, streak } = useCarbon();
  const tip = getContextualTip();

  return (
    <div className="page page--home">
      {/* Hero Section */}
      <section className="hero" aria-labelledby="hero-heading">
        <div className="hero__content">
          <h1 id="hero-heading" className="hero__title">
            Understand. Track.{' '}
            <span className="hero__title-accent">Reduce.</span>
          </h1>
          <p className="hero__subtitle">
            Your personal carbon footprint companion. Make informed choices,
            track your impact, and take meaningful action for a sustainable future.
          </p>
          <div className="hero__actions">
            <Link
              to="/calculator"
              className="btn btn--primary btn--large"
              id="hero-cta-calculator"
            >
              <span aria-hidden="true">🧮</span> Calculate Your Footprint
            </Link>
            {hasCalculated && (
              <Link
                to="/dashboard"
                className="btn btn--outline btn--large"
                id="hero-cta-dashboard"
              >
                <span aria-hidden="true">📊</span> View Dashboard
              </Link>
            )}
          </div>
        </div>
        <div className="hero__visual" aria-hidden="true">
          <div className="hero__globe">
            <div className="hero__globe-ring hero__globe-ring--1" />
            <div className="hero__globe-ring hero__globe-ring--2" />
            <div className="hero__globe-ring hero__globe-ring--3" />
            <span className="hero__globe-emoji">🌍</span>
          </div>
        </div>
      </section>

      {/* Quick Stats (if user has calculated) */}
      {hasCalculated && footprintResult && (
        <section className="quick-stats" aria-labelledby="quick-stats-heading">
          <h2 id="quick-stats-heading" className="sr-only">Your Quick Stats</h2>
          <div className="quick-stats__grid">
            <Card variant="stat" id="stat-footprint">
              <div className="stat">
                <span className="stat__icon" aria-hidden="true">🌡️</span>
                <span className="stat__value">{footprintResult.totalTonnes}</span>
                <span className="stat__label">tonnes CO₂e/year</span>
              </div>
            </Card>
            <Card variant="stat" id="stat-streak">
              <div className="stat">
                <span className="stat__icon" aria-hidden="true">🔥</span>
                <span className="stat__value">{streak}</span>
                <span className="stat__label">day streak</span>
              </div>
            </Card>
            <Card variant="stat" id="stat-daily">
              <div className="stat">
                <span className="stat__icon" aria-hidden="true">📅</span>
                <span className="stat__value">
                  {formatEmissions(footprintResult.total / 365, { short: true })}
                </span>
                <span className="stat__label">daily average</span>
              </div>
            </Card>
          </div>
        </section>
      )}

      {/* Contextual Tip */}
      <section className="tip-banner" aria-labelledby="tip-heading">
        <Card variant="highlight" id="contextual-tip-card">
          <div className="tip-banner__content">
            <span className="tip-banner__icon" aria-hidden="true">{tip.icon}</span>
            <div>
              <h3 id="tip-heading" className="tip-banner__title">{tip.title}</h3>
              <p className="tip-banner__text">{tip.text}</p>
            </div>
          </div>
        </Card>
      </section>

      {/* Features Grid */}
      <section className="features" aria-labelledby="features-heading">
        <h2 id="features-heading" className="section-title">
          How CarbonWise Helps You
        </h2>
        <div className="features__grid">
          <Card
            title="Understand Your Impact"
            icon="🧮"
            variant="feature"
            id="feature-understand"
          >
            <p>
              Calculate your carbon footprint across 5 categories using
              scientifically-backed emission factors from EPA and DEFRA.
            </p>
            <Link to="/calculator" className="card__link">
              Start Calculating →
            </Link>
          </Card>

          <Card
            title="Track Your Progress"
            icon="📊"
            variant="feature"
            id="feature-track"
          >
            <p>
              Log daily activities, monitor trends with interactive charts,
              and maintain your green streak.
            </p>
            <Link to="/tracking" className="card__link">
              Begin Tracking →
            </Link>
          </Card>

          <Card
            title="Get Personalized Insights"
            icon="💡"
            variant="feature"
            id="feature-insights"
          >
            <p>
              Receive tailored recommendations based on your unique
              footprint profile to maximise your reduction impact.
            </p>
            <Link to="/insights" className="card__link">
              View Insights →
            </Link>
          </Card>

          <Card
            title="Set Reduction Goals"
            icon="🎯"
            variant="feature"
            id="feature-goals"
          >
            <p>
              Define personal targets, track milestones, and earn
              achievement badges as you reduce your footprint.
            </p>
            <Link to="/dashboard" className="card__link">
              Set Goals →
            </Link>
          </Card>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="impact-section" aria-labelledby="impact-heading">
        <h2 id="impact-heading" className="section-title">Why It Matters</h2>
        <div className="impact-section__grid">
          <div className="impact-card" id="impact-world-avg">
            <span className="impact-card__value">4.8</span>
            <span className="impact-card__unit">tonnes</span>
            <span className="impact-card__label">World Average per Capita</span>
          </div>
          <div className="impact-card" id="impact-india-avg">
            <span className="impact-card__value">1.9</span>
            <span className="impact-card__unit">tonnes</span>
            <span className="impact-card__label">India Average per Capita</span>
          </div>
          <div className="impact-card" id="impact-target">
            <span className="impact-card__value">2.0</span>
            <span className="impact-card__unit">tonnes</span>
            <span className="impact-card__label">Paris Agreement Target</span>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
