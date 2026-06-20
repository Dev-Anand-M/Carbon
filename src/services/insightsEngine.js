/**
 * @fileoverview Personalized insights engine.
 * Analyzes user's carbon data to generate tailored recommendations
 * and actionable insights for reducing their footprint.
 * @module services/insightsEngine
 */

import { REDUCTION_ACTIONS, BENCHMARKS, CATEGORIES } from '../utils/constants.js';
import { calculateTotalFootprint, getEquivalencies, compareToBenchmarks } from '../utils/carbonCalculations.js';

/**
 * Generate personalized insights based on user's carbon data.
 * @param {Object} carbonData - User's carbon input data.
 * @param {string[]} completedActions - IDs of already completed actions.
 * @returns {Object} Insights object with recommendations, stats, and tips.
 */
export function generateInsights(carbonData, completedActions = []) {
  const footprint = calculateTotalFootprint(carbonData);
  const { breakdown, totalTonnes, percentages } = footprint;

  /* Identify the highest emission category */
  const sortedCategories = Object.entries(breakdown)
    .sort(([, a], [, b]) => b - a)
    .map(([key, value]) => ({
      key,
      value,
      percentage: percentages[key],
      ...CATEGORIES[key],
    }));

  const highestCategory = sortedCategories[0];
  const benchmarks = compareToBenchmarks(totalTonnes);
  const equivalencies = getEquivalencies(footprint.total);

  /* Generate priority recommendations */
  const recommendations = generateRecommendations(
    sortedCategories,
    completedActions,
    totalTonnes
  );

  /* Generate summary message */
  const summary = generateSummaryMessage(totalTonnes, highestCategory);

  /* Calculate potential savings if all recommendations are followed */
  const potentialSavings = recommendations.reduce(
    (sum, rec) => sum + rec.impact_kg_per_year,
    0
  );

  return {
    footprint,
    highestCategory,
    sortedCategories,
    benchmarks,
    equivalencies,
    recommendations,
    summary,
    potentialSavings,
    potentialSavingsTonnes: Math.round((potentialSavings / 1000) * 100) / 100,
    completedActionsCount: completedActions.length,
  };
}

/**
 * Generate prioritized recommendations based on user's profile.
 * Actions are ranked by relevance to the user's highest-emission categories
 * and filtered to exclude already completed actions.
 * @param {Array} sortedCategories - Categories sorted by emission (highest first).
 * @param {string[]} completedActions - Already completed action IDs.
 * @param {number} totalTonnes - Total annual footprint in tonnes.
 * @returns {Array} Sorted list of recommended actions.
 */
function generateRecommendations(sortedCategories, completedActions, totalTonnes) {
  /* Filter out completed actions */
  const available = REDUCTION_ACTIONS.filter(
    (action) => !completedActions.includes(action.id)
  );

  /* Score each action based on relevance */
  const scored = available.map((action) => {
    let relevanceScore = 0;

    /* Higher score if action targets the user's biggest emission category */
    const categoryRank = sortedCategories.findIndex(
      (cat) => cat.key === action.category
    );
    if (categoryRank !== -1) {
      relevanceScore += (5 - categoryRank) * 20;
    }

    /* Higher score for higher impact */
    relevanceScore += action.impact_kg_per_year / 100;

    /* Bonus for easy actions (lower barrier to adoption) */
    if (action.difficulty === 'easy') relevanceScore += 15;
    else if (action.difficulty === 'medium') relevanceScore += 5;

    /* Extra relevance if user is above average */
    if (totalTonnes > BENCHMARKS.india_average) {
      relevanceScore += 10;
    }

    return { ...action, relevanceScore };
  });

  /* Sort by relevance score descending, return top actions */
  return scored
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 8);
}

/**
 * Generate a human-readable summary of the user's footprint.
 * @param {number} totalTonnes - Annual footprint in tonnes.
 * @param {Object} highestCategory - The highest emission category.
 * @returns {Object} Summary with message, level, and emoji.
 */
function generateSummaryMessage(totalTonnes, highestCategory) {
  let level, message, emoji;

  if (totalTonnes <= BENCHMARKS.sustainable_target) {
    level = 'excellent';
    emoji = '🌟';
    message = `Outstanding! Your footprint of ${totalTonnes} tonnes/year is below the sustainable target. You're making a real difference!`;
  } else if (totalTonnes <= BENCHMARKS.india_average) {
    level = 'good';
    emoji = '👍';
    message = `Good job! Your footprint of ${totalTonnes} tonnes/year is below the Indian average. Keep up the great work!`;
  } else if (totalTonnes <= BENCHMARKS.world_average) {
    level = 'average';
    emoji = '📊';
    message = `Your footprint of ${totalTonnes} tonnes/year is above the Indian average but below the world average. There's room for improvement, especially in ${highestCategory?.label || 'your top category'}.`;
  } else {
    level = 'high';
    emoji = '⚠️';
    message = `Your footprint of ${totalTonnes} tonnes/year is above the world average. Focus on reducing ${highestCategory?.label || 'your highest category'} emissions for the biggest impact.`;
  }

  return { level, message, emoji };
}

/**
 * Calculate the impact of completed actions.
 * @param {string[]} completedActionIds - IDs of completed actions.
 * @returns {Object} Impact summary.
 */
export function calculateCompletedImpact(completedActionIds) {
  const completedActions = REDUCTION_ACTIONS.filter((a) =>
    completedActionIds.includes(a.id)
  );

  const totalImpact = completedActions.reduce(
    (sum, a) => sum + a.impact_kg_per_year,
    0
  );

  const byCategory = completedActions.reduce((acc, action) => {
    acc[action.category] = (acc[action.category] || 0) + action.impact_kg_per_year;
    return acc;
  }, {});

  return {
    totalImpact,
    totalImpactTonnes: Math.round((totalImpact / 1000) * 100) / 100,
    completedCount: completedActions.length,
    totalAvailable: REDUCTION_ACTIONS.length,
    byCategory,
    equivalencies: getEquivalencies(totalImpact),
  };
}

/**
 * Get tips based on time of day and season for contextual advice.
 * @returns {Object} Contextual tip.
 */
export function getContextualTip() {
  const hour = new Date().getHours();
  const month = new Date().getMonth();

  const tips = [];

  /* Time-based tips */
  if (hour >= 6 && hour < 10) {
    tips.push({
      icon: '🌅',
      title: 'Morning Commute',
      text: 'Consider cycling or walking for short commutes. It\'s great for health and the planet!',
    });
  } else if (hour >= 11 && hour < 14) {
    tips.push({
      icon: '🥗',
      title: 'Lunch Time',
      text: 'Choosing a plant-based lunch can save up to 2.5 kg CO₂ compared to a meat-heavy meal.',
    });
  } else if (hour >= 17 && hour < 20) {
    tips.push({
      icon: '💡',
      title: 'Evening Energy',
      text: 'Switch off lights in unused rooms and unplug devices. Phantom loads waste 5-10% of electricity.',
    });
  } else if (hour >= 20) {
    tips.push({
      icon: '🌙',
      title: 'Night Routine',
      text: 'Set your AC to 24°C instead of 20°C — every degree saves about 6% on cooling energy.',
    });
  }

  /* Season-based tips */
  if (month >= 3 && month <= 5) {
    tips.push({
      icon: '☀️',
      title: 'Summer Tip',
      text: 'Use natural ventilation when possible. Ceiling fans use 90% less energy than AC.',
    });
  } else if (month >= 10 || month <= 1) {
    tips.push({
      icon: '🧥',
      title: 'Winter Tip',
      text: 'Layer up instead of turning up the heater. Each degree lower saves ~3% on heating bills.',
    });
  }

  return tips.length > 0
    ? tips[Math.floor(Math.random() * tips.length)]
    : { icon: '🌍', title: 'Daily Tip', text: 'Every small action counts. Track your footprint consistently to see real progress!' };
}
