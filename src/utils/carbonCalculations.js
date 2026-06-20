/**
 * @fileoverview Carbon footprint calculation engine.
 * All calculation functions are pure — no side effects, deterministic outputs.
 * Emission factors are sourced from EPA and DEFRA databases.
 * @module utils/carbonCalculations
 */

import {
  TRANSPORT_FACTORS,
  ENERGY_FACTORS,
  DIET_FACTORS,
  SHOPPING_FACTORS,
  WASTE_FACTORS,
  EQUIVALENCIES,
  BENCHMARKS,
} from './constants.js';

/**
 * Calculate transport emissions for a given mode and distance.
 * @param {string} mode - Transport mode key (e.g., 'car_gasoline').
 * @param {number} distance - Distance in km.
 * @param {number} [frequency=1] - Number of trips.
 * @returns {number} Emissions in kg CO₂e.
 * @throws {Error} If mode is unknown.
 */
export function calculateTransportEmissions(mode, distance, frequency = 1) {
  const factor = TRANSPORT_FACTORS[mode];
  if (!factor) {
    throw new Error(`Unknown transport mode: ${mode}`);
  }
  if (distance < 0 || frequency < 0) return 0;
  return Math.round(factor.factor * distance * frequency * 100) / 100;
}

/**
 * Calculate home energy emissions.
 * @param {string} source - Energy source key (e.g., 'electricity').
 * @param {number} consumption - Consumption in the source's unit.
 * @returns {number} Emissions in kg CO₂e.
 * @throws {Error} If source is unknown.
 */
export function calculateEnergyEmissions(source, consumption) {
  const factor = ENERGY_FACTORS[source];
  if (!factor) {
    throw new Error(`Unknown energy source: ${source}`);
  }
  if (consumption < 0) return 0;
  return Math.round(factor.factor * consumption * 100) / 100;
}

/**
 * Calculate weekly diet emissions.
 * @param {string} dietType - Diet type key (e.g., 'vegetarian').
 * @returns {number} Weekly emissions in kg CO₂e.
 * @throws {Error} If diet type is unknown.
 */
export function calculateDietEmissions(dietType) {
  const factor = DIET_FACTORS[dietType];
  if (!factor) {
    throw new Error(`Unknown diet type: ${dietType}`);
  }
  return factor.factor;
}

/**
 * Calculate shopping/consumption emissions.
 * @param {string} itemType - Item category key (e.g., 'clothing').
 * @param {number} quantity - Number of items or spending units.
 * @returns {number} Emissions in kg CO₂e.
 * @throws {Error} If item type is unknown.
 */
export function calculateShoppingEmissions(itemType, quantity) {
  const factor = SHOPPING_FACTORS[itemType];
  if (!factor) {
    throw new Error(`Unknown shopping category: ${itemType}`);
  }
  if (quantity < 0) return 0;
  return Math.round(factor.factor * quantity * 100) / 100;
}

/**
 * Calculate waste emissions.
 * @param {string} wasteType - Waste category key.
 * @param {number} weight - Weight in kg.
 * @returns {number} Emissions in kg CO₂e.
 * @throws {Error} If waste type is unknown.
 */
export function calculateWasteEmissions(wasteType, weight) {
  const factor = WASTE_FACTORS[wasteType];
  if (!factor) {
    throw new Error(`Unknown waste type: ${wasteType}`);
  }
  if (weight < 0) return 0;
  return Math.round(factor.factor * weight * 100) / 100;
}

/**
 * Calculate total annual carbon footprint from all categories.
 * @param {Object} data - User's carbon data across all categories.
 * @param {Object} [data.transport] - Transport activities.
 * @param {Object} [data.energy] - Energy consumption.
 * @param {string} [data.diet] - Diet type key.
 * @param {Object} [data.shopping] - Shopping data.
 * @param {Object} [data.waste] - Waste data.
 * @returns {Object} Detailed breakdown with total and per-category emissions.
 */
export function calculateTotalFootprint(data) {
  const breakdown = {
    transport: 0,
    energy: 0,
    diet: 0,
    shopping: 0,
    waste: 0,
  };

  /* Transport emissions */
  if (data.transport) {
    Object.entries(data.transport).forEach(([mode, info]) => {
      if (info && info.distance) {
        const freq = info.frequency || 1;
        const annual = info.isWeekly ? freq * 52 : freq * 12;
        breakdown.transport += calculateTransportEmissions(mode, info.distance, annual);
      }
    });
  }

  /* Energy emissions (monthly -> annual) */
  if (data.energy) {
    Object.entries(data.energy).forEach(([source, consumption]) => {
      if (consumption && consumption > 0) {
        breakdown.energy += calculateEnergyEmissions(source, consumption) * 12;
      }
    });
  }

  /* Diet emissions (weekly -> annual) */
  if (data.diet) {
    breakdown.diet = calculateDietEmissions(data.diet) * 52;
  }

  /* Shopping emissions (monthly -> annual) */
  if (data.shopping) {
    Object.entries(data.shopping).forEach(([item, qty]) => {
      if (qty && qty > 0) {
        breakdown.shopping += calculateShoppingEmissions(item, qty) * 12;
      }
    });
  }

  /* Waste emissions (weekly -> annual) */
  if (data.waste) {
    Object.entries(data.waste).forEach(([type, weight]) => {
      if (weight && weight > 0) {
        breakdown.waste += calculateWasteEmissions(type, weight) * 52;
      }
    });
  }

  /* Round all values */
  Object.keys(breakdown).forEach((key) => {
    breakdown[key] = Math.round(breakdown[key] * 100) / 100;
  });

  const total = Object.values(breakdown).reduce((sum, val) => sum + val, 0);

  return {
    breakdown,
    total: Math.round(total * 100) / 100,
    totalTonnes: Math.round((total / 1000) * 100) / 100,
    percentages: calculatePercentages(breakdown, total),
  };
}

/**
 * Calculate percentage contribution of each category.
 * @param {Object} breakdown - Per-category emissions in kg.
 * @param {number} total - Total emissions in kg.
 * @returns {Object} Percentage breakdown.
 */
export function calculatePercentages(breakdown, total) {
  if (total === 0) {
    return Object.keys(breakdown).reduce((acc, key) => ({ ...acc, [key]: 0 }), {});
  }
  const percentages = {};
  Object.entries(breakdown).forEach(([key, value]) => {
    percentages[key] = Math.round((value / total) * 1000) / 10;
  });
  return percentages;
}

/**
 * Convert emissions to relatable equivalencies.
 * @param {number} kgCO2 - Emissions in kg CO₂e.
 * @returns {Object} Equivalencies object.
 */
export function getEquivalencies(kgCO2) {
  if (kgCO2 <= 0) {
    return {
      treesNeeded: 0,
      smartphoneCharges: 0,
      ledBulbHours: 0,
      kmDriven: 0,
      flightsDelMum: 0,
    };
  }
  return {
    treesNeeded: Math.round(kgCO2 / EQUIVALENCIES.trees_per_year),
    smartphoneCharges: Math.round(kgCO2 / EQUIVALENCIES.smartphone_charges),
    ledBulbHours: Math.round(kgCO2 / EQUIVALENCIES.led_bulb_hours),
    kmDriven: Math.round(kgCO2 / EQUIVALENCIES.km_driven),
    flightsDelMum: Math.round((kgCO2 / EQUIVALENCIES.flights_delhi_mumbai) * 10) / 10,
  };
}

/**
 * Compare user's footprint against global benchmarks.
 * @param {number} totalTonnes - User's annual footprint in tonnes.
 * @returns {Object} Comparison data.
 */
export function compareToBenchmarks(totalTonnes) {
  return Object.entries(BENCHMARKS).map(([key, value]) => ({
    key,
    label: key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    value,
    userValue: totalTonnes,
    difference: Math.round((totalTonnes - value) * 100) / 100,
    percentDifference: value > 0
      ? Math.round(((totalTonnes - value) / value) * 100)
      : 0,
    status: totalTonnes <= value ? 'below' : 'above',
  }));
}

/**
 * Calculate the reduction impact of completing an action.
 * @param {string} actionId - The action identifier.
 * @param {Array} actions - List of available actions.
 * @returns {number} Annual reduction in kg CO₂e, or 0 if not found.
 */
export function calculateActionImpact(actionId, actions) {
  const action = actions.find((a) => a.id === actionId);
  return action ? action.impact_kg_per_year : 0;
}

/**
 * Calculate progress towards a reduction goal.
 * @param {number} baseline - Baseline annual emissions in kg.
 * @param {number} current - Current annual emissions in kg.
 * @param {number} targetPercent - Target reduction percentage (1-100).
 * @returns {Object} Progress data.
 */
export function calculateGoalProgress(baseline, current, targetPercent) {
  if (baseline <= 0 || targetPercent <= 0) {
    return { progress: 0, reduced: 0, remaining: 0, onTrack: false };
  }

  const targetReduction = baseline * (targetPercent / 100);
  const actualReduction = Math.max(0, baseline - current);
  const progress = Math.min(100, Math.round((actualReduction / targetReduction) * 100));

  return {
    progress,
    reduced: Math.round(actualReduction * 100) / 100,
    remaining: Math.round(Math.max(0, targetReduction - actualReduction) * 100) / 100,
    target: Math.round(targetReduction * 100) / 100,
    onTrack: actualReduction >= targetReduction,
  };
}

/**
 * Generate a daily carbon budget based on annual footprint and target.
 * @param {number} annualKg - Annual emissions in kg CO₂e.
 * @param {number} reductionPercent - Desired reduction percentage.
 * @returns {number} Daily budget in kg CO₂e.
 */
export function calculateDailyBudget(annualKg, reductionPercent = 20) {
  const targetAnnual = annualKg * (1 - reductionPercent / 100);
  return Math.round((targetAnnual / 365) * 100) / 100;
}
