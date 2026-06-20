/**
 * @fileoverview Carbon emission factors and application constants.
 * Data sourced from EPA GHG Equivalencies Calculator, DEFRA 2023 conversion factors,
 * and peer-reviewed climate science publications.
 * @see https://www.epa.gov/energy/greenhouse-gas-equivalencies-calculator
 * @see https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2023
 * @module utils/constants
 */

/**
 * Emission factors for transportation (kg CO₂e per unit).
 * @readonly
 * @enum {Object}
 */
export const TRANSPORT_FACTORS = Object.freeze({
  car_gasoline: { factor: 0.21, unit: 'km', label: 'Car (Gasoline)', icon: '🚗' },
  car_diesel: { factor: 0.27, unit: 'km', label: 'Car (Diesel)', icon: '🚙' },
  car_hybrid: { factor: 0.11, unit: 'km', label: 'Car (Hybrid)', icon: '🔋' },
  car_electric: { factor: 0.05, unit: 'km', label: 'Car (Electric)', icon: '⚡' },
  bus: { factor: 0.089, unit: 'km', label: 'Bus', icon: '🚌' },
  train: { factor: 0.041, unit: 'km', label: 'Train', icon: '🚆' },
  metro: { factor: 0.033, unit: 'km', label: 'Metro/Subway', icon: '🚇' },
  bicycle: { factor: 0, unit: 'km', label: 'Bicycle', icon: '🚲' },
  walking: { factor: 0, unit: 'km', label: 'Walking', icon: '🚶' },
  motorcycle: { factor: 0.113, unit: 'km', label: 'Motorcycle', icon: '🏍️' },
  flight_short: { factor: 0.255, unit: 'km', label: 'Flight (Short <1500km)', icon: '✈️' },
  flight_long: { factor: 0.195, unit: 'km', label: 'Flight (Long >1500km)', icon: '🛫' },
});

/**
 * Emission factors for home energy (kg CO₂e per unit).
 * @readonly
 * @enum {Object}
 */
export const ENERGY_FACTORS = Object.freeze({
  electricity: { factor: 0.417, unit: 'kWh', label: 'Electricity', icon: '💡' },
  natural_gas: { factor: 2.04, unit: 'm³', label: 'Natural Gas', icon: '🔥' },
  heating_oil: { factor: 2.96, unit: 'litre', label: 'Heating Oil', icon: '🛢️' },
  lpg: { factor: 1.56, unit: 'litre', label: 'LPG', icon: '🔵' },
  solar: { factor: 0, unit: 'kWh', label: 'Solar Energy', icon: '☀️' },
  wind: { factor: 0, unit: 'kWh', label: 'Wind Energy', icon: '💨' },
});

/**
 * Weekly emission factors for dietary choices (kg CO₂e per week).
 * @readonly
 * @enum {Object}
 */
export const DIET_FACTORS = Object.freeze({
  heavy_meat: { factor: 57.2, label: 'Heavy Meat Eater', description: 'Meat at most meals', icon: '🥩' },
  medium_meat: { factor: 41.1, label: 'Medium Meat Eater', description: 'Meat a few times a week', icon: '🍗' },
  low_meat: { factor: 31.4, label: 'Low Meat Eater', description: 'Meat once or twice a week', icon: '🥘' },
  pescatarian: { factor: 24.8, label: 'Pescatarian', description: 'Fish but no meat', icon: '🐟' },
  vegetarian: { factor: 21.3, label: 'Vegetarian', description: 'No meat or fish', icon: '🥬' },
  vegan: { factor: 14.7, label: 'Vegan', description: 'No animal products', icon: '🌱' },
});

/**
 * Emission factors for shopping/consumption (kg CO₂e per item or per ₹1000 spent).
 * @readonly
 * @enum {Object}
 */
export const SHOPPING_FACTORS = Object.freeze({
  clothing: { factor: 25, unit: 'item', label: 'Clothing', icon: '👕' },
  electronics: { factor: 200, unit: 'item', label: 'Electronics', icon: '📱' },
  furniture: { factor: 150, unit: 'item', label: 'Furniture', icon: '🪑' },
  groceries: { factor: 4.2, unit: '₹1000', label: 'Groceries', icon: '🛒' },
  online_shopping: { factor: 5.5, unit: 'delivery', label: 'Online Delivery', icon: '📦' },
});

/**
 * Waste emission factors (kg CO₂e per kg of waste).
 * @readonly
 * @enum {Object}
 */
export const WASTE_FACTORS = Object.freeze({
  general: { factor: 0.587, unit: 'kg', label: 'General Waste', icon: '🗑️' },
  recycled: { factor: 0.021, unit: 'kg', label: 'Recycled Waste', icon: '♻️' },
  composted: { factor: 0.01, unit: 'kg', label: 'Composted Waste', icon: '🌿' },
  plastic: { factor: 0.94, unit: 'kg', label: 'Plastic Waste', icon: '🧴' },
});

/**
 * Carbon offset equivalencies for making emissions relatable.
 * @readonly
 */
export const EQUIVALENCIES = Object.freeze({
  trees_per_year: 21.77, // kg CO₂ absorbed per tree per year
  smartphone_charges: 0.008, // kg CO₂ per charge
  led_bulb_hours: 0.005, // kg CO₂ per hour
  km_driven: 0.21, // kg CO₂ per km (avg car)
  flights_delhi_mumbai: 160, // kg CO₂ per one-way
});

/**
 * Average annual carbon footprint benchmarks (tonnes CO₂e/year).
 * @readonly
 */
export const BENCHMARKS = Object.freeze({
  world_average: 4.8,
  india_average: 1.9,
  usa_average: 15.5,
  eu_average: 6.8,
  paris_target: 2.1,
  sustainable_target: 2.0,
});

/**
 * Predefined reduction actions with estimated impact.
 * @readonly
 */
export const REDUCTION_ACTIONS = Object.freeze([
  {
    id: 'switch_led',
    category: 'energy',
    title: 'Switch to LED Bulbs',
    description: 'Replace all incandescent/CFL bulbs with LED alternatives.',
    impact_kg_per_year: 40,
    difficulty: 'easy',
    icon: '💡',
    tip: 'LED bulbs use 75% less energy and last 25 times longer.',
  },
  {
    id: 'public_transport',
    category: 'transport',
    title: 'Use Public Transport',
    description: 'Take the bus or train instead of driving for your daily commute.',
    impact_kg_per_year: 2400,
    difficulty: 'medium',
    icon: '🚌',
    tip: 'Public transport produces 45% fewer emissions per passenger-km.',
  },
  {
    id: 'reduce_meat',
    category: 'diet',
    title: 'Reduce Meat Consumption',
    description: 'Cut meat intake to 2-3 times per week.',
    impact_kg_per_year: 500,
    difficulty: 'medium',
    icon: '🥗',
    tip: 'Beef production generates 60kg CO₂e per kg of meat.',
  },
  {
    id: 'carpool',
    category: 'transport',
    title: 'Carpool to Work',
    description: 'Share rides with colleagues for your daily commute.',
    impact_kg_per_year: 1200,
    difficulty: 'easy',
    icon: '🚗',
    tip: 'Carpooling with one person halves your commute emissions.',
  },
  {
    id: 'cold_wash',
    category: 'energy',
    title: 'Wash Clothes in Cold Water',
    description: 'Use cold water for laundry instead of hot water.',
    impact_kg_per_year: 200,
    difficulty: 'easy',
    icon: '🧺',
    tip: 'Heating water accounts for 90% of washing machine energy use.',
  },
  {
    id: 'plant_based_day',
    category: 'diet',
    title: 'One Plant-Based Day per Week',
    description: 'Dedicate one day each week to eating only plant-based meals.',
    impact_kg_per_year: 170,
    difficulty: 'easy',
    icon: '🌱',
    tip: 'If everyone did this, it would be like taking 7.6 million cars off the road.',
  },
  {
    id: 'unplug_devices',
    category: 'energy',
    title: 'Unplug Idle Electronics',
    description: 'Switch off and unplug devices when not in use to avoid phantom load.',
    impact_kg_per_year: 100,
    difficulty: 'easy',
    icon: '🔌',
    tip: 'Phantom loads account for 5-10% of household electricity use.',
  },
  {
    id: 'recycle',
    category: 'waste',
    title: 'Start Recycling',
    description: 'Separate recyclables from general waste.',
    impact_kg_per_year: 300,
    difficulty: 'easy',
    icon: '♻️',
    tip: 'Recycling one aluminum can saves enough energy to run a TV for 3 hours.',
  },
  {
    id: 'composting',
    category: 'waste',
    title: 'Compost Food Waste',
    description: 'Compost fruit peels, vegetable scraps and food waste.',
    impact_kg_per_year: 200,
    difficulty: 'medium',
    icon: '🌿',
    tip: 'Composting can divert 30% of household waste from landfills.',
  },
  {
    id: 'solar_panels',
    category: 'energy',
    title: 'Install Solar Panels',
    description: 'Generate clean electricity from rooftop solar panels.',
    impact_kg_per_year: 1500,
    difficulty: 'hard',
    icon: '☀️',
    tip: 'A typical 5kW system can offset 70-80% of household electricity.',
  },
  {
    id: 'reduce_flights',
    category: 'transport',
    title: 'Reduce Air Travel',
    description: 'Take one fewer round-trip flight per year.',
    impact_kg_per_year: 1600,
    difficulty: 'medium',
    icon: '✈️',
    tip: 'A single round-trip flight can equal months of driving emissions.',
  },
  {
    id: 'reusable_bags',
    category: 'shopping',
    title: 'Use Reusable Bags & Bottles',
    description: 'Replace single-use plastic bags and bottles with reusable alternatives.',
    impact_kg_per_year: 50,
    difficulty: 'easy',
    icon: '🛍️',
    tip: 'A reusable bag needs to be used only 11 times to offset its footprint.',
  },
]);

/**
 * Achievement badges for gamification.
 * @readonly
 */
export const ACHIEVEMENTS = Object.freeze([
  { id: 'first_calc', title: 'First Step', description: 'Complete your first carbon footprint calculation', icon: '🎯', condition: 'calculations >= 1' },
  { id: 'week_streak', title: 'Week Warrior', description: 'Log activities for 7 consecutive days', icon: '🔥', condition: 'streak >= 7' },
  { id: 'month_streak', title: 'Green Champion', description: 'Log activities for 30 consecutive days', icon: '🏆', condition: 'streak >= 30' },
  { id: 'first_action', title: 'Action Taker', description: 'Complete your first reduction action', icon: '✅', condition: 'actions >= 1' },
  { id: 'five_actions', title: 'Eco Warrior', description: 'Complete 5 reduction actions', icon: '🌍', condition: 'actions >= 5' },
  { id: 'below_average', title: 'Below Average', description: 'Reduce your footprint below the national average', icon: '📉', condition: 'footprint < national_avg' },
  { id: 'tree_planter', title: 'Virtual Forester', description: 'Offset equivalent of 10 trees worth of CO₂', icon: '🌳', condition: 'offset >= 217.7' },
  { id: 'zero_transport', title: 'Green Commuter', description: 'Log a zero-emission commute for a week', icon: '🚲', condition: 'zero_transport_week' },
]);

/**
 * Application-wide category definitions.
 * @readonly
 */
export const CATEGORIES = Object.freeze({
  transport: { label: 'Transportation', color: '#3b82f6', icon: '🚗' },
  energy: { label: 'Home Energy', color: '#f59e0b', icon: '💡' },
  diet: { label: 'Diet & Food', color: '#10b981', icon: '🥗' },
  shopping: { label: 'Shopping', color: '#8b5cf6', icon: '🛍️' },
  waste: { label: 'Waste', color: '#ef4444', icon: '🗑️' },
});

/**
 * Chart color palette — accessible, high-contrast colors.
 * @readonly
 */
export const CHART_COLORS = Object.freeze([
  '#0d9488', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#14b8a6', '#6366f1', '#f97316', '#06b6d4',
]);

/**
 * Local storage keys — centralised to prevent key collisions.
 * @readonly
 */
export const STORAGE_KEYS = Object.freeze({
  USER_PROFILE: 'carbonwise_user_profile',
  CARBON_DATA: 'carbonwise_carbon_data',
  ACTIVITIES: 'carbonwise_activities',
  GOALS: 'carbonwise_goals',
  ACHIEVEMENTS: 'carbonwise_achievements',
  THEME: 'carbonwise_theme',
  COMPLETED_ACTIONS: 'carbonwise_completed_actions',
});
