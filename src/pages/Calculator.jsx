/**
 * @fileoverview Carbon Footprint Calculator page.
 * Multi-step form for calculating emissions across 5 categories.
 * @module pages/Calculator
 */

import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCarbon } from '../contexts/CarbonContext.jsx';
import { useAccessibility } from '../hooks/useAccessibility.js';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import ProgressBar from '../components/common/ProgressBar.jsx';
import {
  TRANSPORT_FACTORS,
  ENERGY_FACTORS,
  DIET_FACTORS,
  SHOPPING_FACTORS,
  WASTE_FACTORS,
  CATEGORIES,
} from '../utils/constants.js';
import { validateNumber } from '../utils/validators.js';
import { formatEmissions } from '../utils/formatters.js';

const STEPS = ['transport', 'energy', 'diet', 'shopping', 'waste'];
const STEP_LABELS = {
  transport: 'Transportation',
  energy: 'Home Energy',
  diet: 'Diet & Food',
  shopping: 'Shopping & Consumption',
  waste: 'Waste & Recycling',
};

/**
 * Calculator page component with multi-step form.
 * @returns {JSX.Element}
 */
function Calculator() {
  const { carbonData, setCarbonData, calculateFootprint } = useCarbon();
  const { announce } = useAccessibility();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    transport: { ...carbonData.transport },
    energy: { ...carbonData.energy },
    diet: carbonData.diet || 'medium_meat',
    shopping: { ...carbonData.shopping },
    waste: { ...carbonData.waste },
  });
  const [errors, setErrors] = useState({});
  const [isCalculating, setIsCalculating] = useState(false);

  const stepKey = STEPS[currentStep];
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  /**
   * Handle input change for numeric fields.
   */
  const handleNumberChange = useCallback((category, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value,
      },
    }));
    /* Clear error on change */
    setErrors((prev) => {
      const next = { ...prev };
      delete next[`${category}.${field}`];
      return next;
    });
  }, []);

  /**
   * Handle transport mode data change.
   */
  const handleTransportChange = useCallback((mode, field, value) => {
    setFormData((prev) => ({
      ...prev,
      transport: {
        ...prev.transport,
        [mode]: {
          ...prev.transport[mode],
          [field]: value,
        },
      },
    }));
  }, []);

  /**
   * Handle diet selection.
   */
  const handleDietChange = useCallback((dietType) => {
    setFormData((prev) => ({
      ...prev,
      diet: dietType,
    }));
  }, []);

  /**
   * Navigate to next step.
   */
  const handleNext = useCallback(() => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
      announce(`Step ${currentStep + 2} of ${STEPS.length}: ${STEP_LABELS[STEPS[currentStep + 1]]}`);
    }
  }, [currentStep, announce]);

  /**
   * Navigate to previous step.
   */
  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      announce(`Step ${currentStep} of ${STEPS.length}: ${STEP_LABELS[STEPS[currentStep - 1]]}`);
    }
  }, [currentStep, announce]);

  /**
   * Submit and calculate.
   */
  const handleCalculate = useCallback(() => {
    setIsCalculating(true);
    /* Simulate brief calculation time for UX feel */
    setTimeout(() => {
      setCarbonData(formData);
      const result = calculateFootprint(formData);
      setIsCalculating(false);
      announce(`Calculation complete. Your annual carbon footprint is ${result.totalTonnes} tonnes CO2 equivalent.`, 'assertive');
      navigate('/dashboard');
    }, 800);
  }, [formData, setCarbonData, calculateFootprint, navigate, announce]);

  /**
   * Render the transport step.
   */
  const renderTransportStep = useMemo(() => {
    return (
      <div className="calc-step" role="group" aria-labelledby="step-transport-heading">
        <h3 id="step-transport-heading" className="calc-step__title">
          {CATEGORIES.transport.icon} How do you get around?
        </h3>
        <p className="calc-step__desc">
          Enter your typical weekly travel distances for each mode of transport you use.
        </p>
        <div className="calc-step__fields">
          {Object.entries(TRANSPORT_FACTORS).map(([key, info]) => (
            <div key={key} className="calc-field" id={`transport-field-${key}`}>
              <label className="calc-field__label" htmlFor={`transport-${key}`}>
                <span aria-hidden="true">{info.icon}</span> {info.label}
                <span className="calc-field__unit">({info.unit}/week)</span>
              </label>
              <input
                type="number"
                id={`transport-${key}`}
                className="calc-field__input"
                min="0"
                max="10000"
                step="1"
                placeholder="0"
                value={formData.transport[key]?.distance || ''}
                onChange={(e) => handleTransportChange(key, 'distance', e.target.value)}
                aria-describedby={`transport-${key}-desc`}
              />
              <span id={`transport-${key}-desc`} className="sr-only">
                Enter weekly distance in {info.unit} for {info.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }, [formData.transport, handleTransportChange]);

  /**
   * Render the energy step.
   */
  const renderEnergyStep = useMemo(() => {
    return (
      <div className="calc-step" role="group" aria-labelledby="step-energy-heading">
        <h3 id="step-energy-heading" className="calc-step__title">
          {CATEGORIES.energy.icon} Your Home Energy Usage
        </h3>
        <p className="calc-step__desc">
          Enter your average monthly energy consumption. Check your utility bills for accurate numbers.
        </p>
        <div className="calc-step__fields">
          {Object.entries(ENERGY_FACTORS).map(([key, info]) => (
            <div key={key} className="calc-field" id={`energy-field-${key}`}>
              <label className="calc-field__label" htmlFor={`energy-${key}`}>
                <span aria-hidden="true">{info.icon}</span> {info.label}
                <span className="calc-field__unit">({info.unit}/month)</span>
              </label>
              <input
                type="number"
                id={`energy-${key}`}
                className="calc-field__input"
                min="0"
                max="100000"
                step="0.1"
                placeholder="0"
                value={formData.energy[key] || ''}
                onChange={(e) => handleNumberChange('energy', key, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }, [formData.energy, handleNumberChange]);

  /**
   * Render the diet step.
   */
  const renderDietStep = useMemo(() => {
    return (
      <div className="calc-step" role="group" aria-labelledby="step-diet-heading">
        <h3 id="step-diet-heading" className="calc-step__title">
          {CATEGORIES.diet.icon} Your Dietary Habits
        </h3>
        <p className="calc-step__desc">
          Select the option that best describes your typical diet.
        </p>
        <div className="calc-step__options" role="radiogroup" aria-label="Diet type selection">
          {Object.entries(DIET_FACTORS).map(([key, info]) => (
            <button
              key={key}
              type="button"
              className={`diet-option ${formData.diet === key ? 'diet-option--selected' : ''}`}
              onClick={() => handleDietChange(key)}
              role="radio"
              aria-checked={formData.diet === key}
              id={`diet-option-${key}`}
            >
              <span className="diet-option__icon" aria-hidden="true">{info.icon}</span>
              <span className="diet-option__label">{info.label}</span>
              <span className="diet-option__desc">{info.description}</span>
              <span className="diet-option__impact">
                ~{formatEmissions(info.factor * 52, { short: true })}/year
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }, [formData.diet, handleDietChange]);

  /**
   * Render the shopping step.
   */
  const renderShoppingStep = useMemo(() => {
    return (
      <div className="calc-step" role="group" aria-labelledby="step-shopping-heading">
        <h3 id="step-shopping-heading" className="calc-step__title">
          {CATEGORIES.shopping.icon} Shopping & Consumption
        </h3>
        <p className="calc-step__desc">
          Estimate your average monthly shopping habits.
        </p>
        <div className="calc-step__fields">
          {Object.entries(SHOPPING_FACTORS).map(([key, info]) => (
            <div key={key} className="calc-field" id={`shopping-field-${key}`}>
              <label className="calc-field__label" htmlFor={`shopping-${key}`}>
                <span aria-hidden="true">{info.icon}</span> {info.label}
                <span className="calc-field__unit">({info.unit}/month)</span>
              </label>
              <input
                type="number"
                id={`shopping-${key}`}
                className="calc-field__input"
                min="0"
                max="1000"
                step="1"
                placeholder="0"
                value={formData.shopping[key] || ''}
                onChange={(e) => handleNumberChange('shopping', key, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }, [formData.shopping, handleNumberChange]);

  /**
   * Render the waste step.
   */
  const renderWasteStep = useMemo(() => {
    return (
      <div className="calc-step" role="group" aria-labelledby="step-waste-heading">
        <h3 id="step-waste-heading" className="calc-step__title">
          {CATEGORIES.waste.icon} Waste & Recycling
        </h3>
        <p className="calc-step__desc">
          Estimate your weekly waste production in kg.
        </p>
        <div className="calc-step__fields">
          {Object.entries(WASTE_FACTORS).map(([key, info]) => (
            <div key={key} className="calc-field" id={`waste-field-${key}`}>
              <label className="calc-field__label" htmlFor={`waste-${key}`}>
                <span aria-hidden="true">{info.icon}</span> {info.label}
                <span className="calc-field__unit">({info.unit}/week)</span>
              </label>
              <input
                type="number"
                id={`waste-${key}`}
                className="calc-field__input"
                min="0"
                max="500"
                step="0.1"
                placeholder="0"
                value={formData.waste[key] || ''}
                onChange={(e) => handleNumberChange('waste', key, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }, [formData.waste, handleNumberChange]);

  const stepRenderers = [
    renderTransportStep,
    renderEnergyStep,
    renderDietStep,
    renderShoppingStep,
    renderWasteStep,
  ];

  return (
    <div className="page page--calculator">
      <section aria-labelledby="calc-heading">
        <h1 id="calc-heading" className="page__title">
          Carbon Footprint Calculator
        </h1>
        <p className="page__subtitle">
          Answer questions across 5 categories to calculate your annual carbon footprint.
          All emission factors are based on EPA and DEFRA scientific data.
        </p>

        {/* Step Progress */}
        <div className="calc-progress" aria-label="Calculator progress">
          <ProgressBar
            value={progress}
            label={`Step ${currentStep + 1} of ${STEPS.length}: ${STEP_LABELS[stepKey]}`}
            ariaLabel={`Calculator progress: step ${currentStep + 1} of ${STEPS.length}`}
            variant="accent"
            id="calc-progress-bar"
          />
          <div className="calc-progress__steps">
            {STEPS.map((step, index) => (
              <button
                key={step}
                type="button"
                className={`calc-progress__step ${
                  index === currentStep ? 'calc-progress__step--active' : ''
                } ${index < currentStep ? 'calc-progress__step--completed' : ''}`}
                onClick={() => {
                  setCurrentStep(index);
                  announce(`Step ${index + 1}: ${STEP_LABELS[step]}`);
                }}
                aria-label={`Go to step ${index + 1}: ${STEP_LABELS[step]}`}
                aria-current={index === currentStep ? 'step' : undefined}
                id={`calc-step-btn-${step}`}
              >
                <span className="calc-progress__step-icon" aria-hidden="true">
                  {index < currentStep ? '✓' : CATEGORIES[step].icon}
                </span>
                <span className="calc-progress__step-label">{STEP_LABELS[step]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Current Step Content */}
        <Card className="calc-card" id="calc-current-step">
          <form onSubmit={(e) => e.preventDefault()} noValidate>
            {stepRenderers[currentStep]}

            {/* Navigation Buttons */}
            <div className="calc-actions">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                id="calc-btn-previous"
                ariaLabel="Go to previous step"
              >
                ← Previous
              </Button>

              {currentStep < STEPS.length - 1 ? (
                <Button
                  variant="primary"
                  onClick={handleNext}
                  id="calc-btn-next"
                  ariaLabel="Go to next step"
                >
                  Next →
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={handleCalculate}
                  loading={isCalculating}
                  id="calc-btn-calculate"
                  icon="🌍"
                >
                  Calculate My Footprint
                </Button>
              )}
            </div>
          </form>
        </Card>
      </section>
    </div>
  );
}

export default Calculator;
