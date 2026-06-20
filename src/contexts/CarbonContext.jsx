/**
 * @fileoverview Carbon data context provider.
 * Manages all carbon footprint data, activities, goals, and achievements
 * with persistence via secure localStorage.
 * @module contexts/CarbonContext
 */

import { createContext, useContext, useReducer, useCallback, useEffect, useMemo } from 'react';
import { getStoredData, setStoredData } from '../services/storageService.js';
import { STORAGE_KEYS } from '../utils/constants.js';
import { calculateTotalFootprint } from '../utils/carbonCalculations.js';
import { generateId } from '../utils/formatters.js';

/** @type {React.Context} */
const CarbonContext = createContext(null);

/**
 * Initial state for the carbon data reducer.
 */
const initialState = {
  /** @type {Object} Raw carbon input data for the calculator */
  carbonData: {
    transport: {},
    energy: {},
    diet: 'medium_meat',
    shopping: {},
    waste: {},
  },
  /** @type {Object|null} Calculated footprint results */
  footprintResult: null,
  /** @type {Array} Activity log entries */
  activities: [],
  /** @type {Object|null} Reduction goal */
  goal: null,
  /** @type {string[]} Completed reduction action IDs */
  completedActions: [],
  /** @type {string[]} Earned achievement IDs */
  earnedAchievements: [],
  /** @type {boolean} Whether initial calculation has been done */
  hasCalculated: false,
};

/**
 * Action types for the carbon data reducer.
 * @enum {string}
 */
const ActionTypes = {
  SET_CARBON_DATA: 'SET_CARBON_DATA',
  SET_FOOTPRINT_RESULT: 'SET_FOOTPRINT_RESULT',
  ADD_ACTIVITY: 'ADD_ACTIVITY',
  REMOVE_ACTIVITY: 'REMOVE_ACTIVITY',
  SET_GOAL: 'SET_GOAL',
  TOGGLE_ACTION: 'TOGGLE_ACTION',
  EARN_ACHIEVEMENT: 'EARN_ACHIEVEMENT',
  LOAD_PERSISTED: 'LOAD_PERSISTED',
  RESET_ALL: 'RESET_ALL',
};

/**
 * Reducer for carbon data state management.
 * @param {Object} state - Current state.
 * @param {Object} action - Action object.
 * @returns {Object} New state.
 */
function carbonReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_CARBON_DATA:
      return { ...state, carbonData: { ...state.carbonData, ...action.payload } };

    case ActionTypes.SET_FOOTPRINT_RESULT:
      return { ...state, footprintResult: action.payload, hasCalculated: true };

    case ActionTypes.ADD_ACTIVITY:
      return {
        ...state,
        activities: [action.payload, ...state.activities].slice(0, 500),
      };

    case ActionTypes.REMOVE_ACTIVITY:
      return {
        ...state,
        activities: state.activities.filter((a) => a.id !== action.payload),
      };

    case ActionTypes.SET_GOAL:
      return { ...state, goal: action.payload };

    case ActionTypes.TOGGLE_ACTION:
      return {
        ...state,
        completedActions: state.completedActions.includes(action.payload)
          ? state.completedActions.filter((id) => id !== action.payload)
          : [...state.completedActions, action.payload],
      };

    case ActionTypes.EARN_ACHIEVEMENT:
      if (state.earnedAchievements.includes(action.payload)) return state;
      return {
        ...state,
        earnedAchievements: [...state.earnedAchievements, action.payload],
      };

    case ActionTypes.LOAD_PERSISTED:
      return { ...state, ...action.payload };

    case ActionTypes.RESET_ALL:
      return { ...initialState };

    default:
      return state;
  }
}

/**
 * Carbon data context provider component.
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components.
 * @returns {JSX.Element}
 */
export function CarbonProvider({ children }) {
  const [state, dispatch] = useReducer(carbonReducer, initialState);

  /* Load persisted data on mount */
  useEffect(() => {
    const carbonData = getStoredData(STORAGE_KEYS.CARBON_DATA, initialState.carbonData);
    const activities = getStoredData(STORAGE_KEYS.ACTIVITIES, []);
    const goal = getStoredData(STORAGE_KEYS.GOALS, null);
    const completedActions = getStoredData(STORAGE_KEYS.COMPLETED_ACTIONS, []);
    const achievements = getStoredData(STORAGE_KEYS.ACHIEVEMENTS, []);

    /* Recalculate footprint if data exists */
    let footprintResult = null;
    let hasCalculated = false;
    if (carbonData && Object.keys(carbonData.transport || {}).length > 0) {
      try {
        footprintResult = calculateTotalFootprint(carbonData);
        hasCalculated = true;
      } catch {
        /* Ignore calculation errors from stale data */
      }
    }

    dispatch({
      type: ActionTypes.LOAD_PERSISTED,
      payload: {
        carbonData,
        activities,
        goal,
        completedActions,
        footprintResult,
        hasCalculated,
        earnedAchievements: achievements,
      },
    });
  }, []);

  /* Persist data on changes */
  useEffect(() => {
    setStoredData(STORAGE_KEYS.CARBON_DATA, state.carbonData);
  }, [state.carbonData]);

  useEffect(() => {
    setStoredData(STORAGE_KEYS.ACTIVITIES, state.activities);
  }, [state.activities]);

  useEffect(() => {
    setStoredData(STORAGE_KEYS.GOALS, state.goal);
  }, [state.goal]);

  useEffect(() => {
    setStoredData(STORAGE_KEYS.COMPLETED_ACTIONS, state.completedActions);
  }, [state.completedActions]);

  useEffect(() => {
    setStoredData(STORAGE_KEYS.ACHIEVEMENTS, state.earnedAchievements);
  }, [state.earnedAchievements]);

  /* Action creators */
  const setCarbonData = useCallback((data) => {
    dispatch({ type: ActionTypes.SET_CARBON_DATA, payload: data });
  }, []);

  const calculateFootprint = useCallback((data) => {
    const result = calculateTotalFootprint(data || state.carbonData);
    dispatch({ type: ActionTypes.SET_FOOTPRINT_RESULT, payload: result });
    return result;
  }, [state.carbonData]);

  const addActivity = useCallback((activity) => {
    const entry = {
      ...activity,
      id: generateId(),
      timestamp: new Date().toISOString(),
    };
    dispatch({ type: ActionTypes.ADD_ACTIVITY, payload: entry });

    /* Check for achievements */
    checkAchievements(state, dispatch);
  }, [state]);

  const removeActivity = useCallback((id) => {
    dispatch({ type: ActionTypes.REMOVE_ACTIVITY, payload: id });
  }, []);

  const setGoal = useCallback((goal) => {
    dispatch({ type: ActionTypes.SET_GOAL, payload: goal });
  }, []);

  const toggleAction = useCallback((actionId) => {
    dispatch({ type: ActionTypes.TOGGLE_ACTION, payload: actionId });
  }, []);

  const resetAll = useCallback(() => {
    dispatch({ type: ActionTypes.RESET_ALL });
  }, []);

  /* Calculate streak */
  const streak = useMemo(() => {
    return calculateStreak(state.activities);
  }, [state.activities]);

  const contextValue = useMemo(() => ({
    ...state,
    streak,
    setCarbonData,
    calculateFootprint,
    addActivity,
    removeActivity,
    setGoal,
    toggleAction,
    resetAll,
  }), [state, streak, setCarbonData, calculateFootprint, addActivity, removeActivity, setGoal, toggleAction, resetAll]);

  return (
    <CarbonContext.Provider value={contextValue}>
      {children}
    </CarbonContext.Provider>
  );
}

/**
 * Custom hook to access carbon context.
 * @returns {Object} Carbon context value.
 * @throws {Error} If used outside CarbonProvider.
 */
export function useCarbon() {
  const context = useContext(CarbonContext);
  if (!context) {
    throw new Error('useCarbon must be used within a CarbonProvider');
  }
  return context;
}

/**
 * Calculate the current streak of consecutive days with logged activities.
 * @param {Array} activities - Activity log entries.
 * @returns {number} Number of consecutive days.
 */
function calculateStreak(activities) {
  if (!activities || activities.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  /* Get unique dates with activities */
  const dates = new Set(
    activities.map((a) => {
      const d = new Date(a.timestamp);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    })
  );

  let streak = 0;
  let currentDate = today.getTime();

  while (dates.has(currentDate)) {
    streak++;
    currentDate -= 86400000; /* 24 hours in ms */
  }

  return streak;
}

/**
 * Check and award achievements based on current state.
 * @param {Object} state - Current state.
 * @param {Function} dispatch - Dispatch function.
 */
function checkAchievements(state, dispatch) {
  const { activities, completedActions, footprintResult, earnedAchievements } = state;
  const streak = calculateStreak(activities);

  const checks = {
    first_calc: footprintResult !== null,
    week_streak: streak >= 7,
    month_streak: streak >= 30,
    first_action: completedActions.length >= 1,
    five_actions: completedActions.length >= 5,
    below_average: footprintResult && footprintResult.totalTonnes < 1.9,
  };

  Object.entries(checks).forEach(([id, condition]) => {
    if (condition && !earnedAchievements.includes(id)) {
      dispatch({ type: ActionTypes.EARN_ACHIEVEMENT, payload: id });
    }
  });
}

export default CarbonContext;
