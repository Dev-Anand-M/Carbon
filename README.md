# 🌍 CarbonWise — Carbon Footprint Awareness Platform

> **Understand, Track, and Reduce** your carbon footprint through personalized insights and actionable recommendations.

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](#)
[![Tests](https://img.shields.io/badge/tests-156%20passing-brightgreen)](#)
[![License](https://img.shields.io/badge/license-MIT-blue)](#)
[![WCAG](https://img.shields.io/badge/WCAG-2.1%20AA-green)](#accessibility)

---

## 📋 Challenge Vertical

**[Challenge 3] Carbon Footprint Awareness Platform**

A smart, dynamic web application that helps individuals understand their environmental impact, track daily carbon-producing activities, and receive personalized, scientifically-backed recommendations to reduce their footprint.

---

## 🎯 Approach & Logic

### Problem Analysis

Climate change is the defining challenge of our generation. While individuals want to act, most don't know *where* to start or *how much* impact their choices have. CarbonWise bridges this gap by:

1. **Understanding** → Multi-category calculator with EPA/DEFRA emission factors
2. **Tracking** → Daily activity logging with streaks and trends  
3. **Reducing** → AI-powered personalized recommendations ranked by user impact

### Technical Approach

The application is built with a **clean, layered architecture** following SOLID principles:

```
┌─────────────────────────────────────────┐
│              Pages (Routes)              │ ← UI Layer
├─────────────────────────────────────────┤
│       Components (Reusable UI)           │ ← Presentation
├─────────────────────────────────────────┤
│    Contexts (State Management)           │ ← State Layer
├─────────────────────────────────────────┤
│  Services (Insights Engine, Storage)     │ ← Business Logic
├─────────────────────────────────────────┤
│    Utils (Calculations, Validators)      │ ← Pure Functions
├─────────────────────────────────────────┤
│     Constants (Emission Factors)         │ ← Data Layer
└─────────────────────────────────────────┘
```

### Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **React + Vite** | Minimal bundle size, fast builds, modern tooling |
| **React Context + useReducer** | Avoids heavy state libraries, clean patterns |
| **localStorage with wrappers** | No backend needed; data versioned for integrity |
| **CSS Custom Properties** | Zero-runtime theming, dark/light mode |
| **Recharts** | Accessible SVG charts with good defaults |
| **DOMPurify** | Industry-standard XSS sanitization |

---

## 🚀 How It Works

### 1. Carbon Footprint Calculator

Users answer questions across **5 emission categories**:

| Category | Data Sources | Example Inputs |
|----------|-------------|----------------|
| 🚗 Transportation | EPA vehicle emission factors | Weekly commute distance, transport mode |
| 💡 Home Energy | DEFRA conversion factors | Monthly electricity (kWh), gas (m³) |
| 🥗 Diet & Food | FAO/peer-reviewed studies | Dietary pattern (vegan → heavy meat) |
| 🛍️ Shopping | Lifecycle analysis databases | Monthly clothing, electronics purchases |
| 🗑️ Waste | EPA waste emission factors | Weekly waste by type (general, recycled) |

The calculator uses a **multi-step form** with real-time progress tracking. All emission factors are sourced from:
- [EPA GHG Equivalencies Calculator](https://www.epa.gov/energy/greenhouse-gas-equivalencies-calculator)
- [DEFRA 2023 Conversion Factors](https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2023)

### 2. Interactive Dashboard

After calculation, users see:
- **Breakdown pie chart** — emissions by category
- **Benchmark comparison** — against India/World averages and Paris targets
- **Carbon equivalencies** — "Your footprint = X trees needed / Y flights"
- **Goal setting** — set reduction targets with progress tracking
- **Achievement badges** — gamified milestones for sustained engagement

### 3. Activity Tracking

Daily logging system with:
- **Quick-add forms** — select category, type, and amount
- **Emission calculation** — real-time CO₂ computation per activity
- **Streak tracking** — consecutive days of logging
- **Filter & history** — browse past activities by category
- **Data validation** — secure input sanitization on all entries

### 4. Personalized Insights

Smart recommendation engine that:
- **Analyzes** the user's highest-emission categories
- **Ranks actions** by relevance to the user's specific profile
- **Quantifies impact** — "Switching to public transport saves 2,400 kg/year"
- **Adapts difficulty** — easy → medium → hard progression
- **Provides contextual tips** — time-of-day and seasonal advice
- **Tracks completed actions** — with cumulative impact metrics

### Insights Ranking Algorithm

```
relevanceScore = categoryWeight × 20  // Higher for user's worst categories
               + impactScore / 100     // Raw impact weight
               + difficultyBonus       // Easy=15, Medium=5, Hard=0
               + aboveAverageBonus     // +10 if above national average
```

---

## 🏗️ Architecture

```
src/
├── __tests__/                  # 156 unit & component tests
│   ├── components/             # UI component tests
│   ├── services/               # Service layer tests
│   └── utils/                  # Utility function tests
├── components/
│   ├── common/                 # Button, Card, ProgressBar, ErrorBoundary
│   └── layout/                 # Header (with skip nav), Footer
├── contexts/
│   ├── CarbonContext.jsx       # Carbon data state (useReducer)
│   └── ThemeContext.jsx        # Dark/light mode
├── hooks/
│   ├── useAccessibility.js     # Screen reader announcements, keyboard nav
│   └── useLocalStorage.js      # Persistent state hook
├── pages/
│   ├── Calculator.jsx          # Multi-step carbon calculator
│   ├── Dashboard.jsx           # Charts, goals, achievements
│   ├── Home.jsx                # Landing page with hero
│   ├── Insights.jsx            # Personalized recommendations
│   ├── NotFound.jsx            # 404 page
│   └── Tracking.jsx            # Activity logging
├── services/
│   ├── insightsEngine.js       # Recommendation ranking engine
│   └── storageService.js       # Secure localStorage abstraction
├── utils/
│   ├── carbonCalculations.js   # Pure calculation functions
│   ├── constants.js            # Emission factors & data
│   ├── formatters.js           # Number/date formatting
│   └── validators.js           # Input validation & sanitization
├── test/
│   └── setup.js                # Test configuration
├── App.jsx                     # Root with routing & providers
├── index.css                   # Complete design system
└── main.jsx                    # Entry point
```

---

## ✅ Assumptions Made

1. **Client-side only** — All data is stored in localStorage (no backend server required). This keeps the solution lightweight and privacy-respecting.
2. **Emission factors** are based on global averages from EPA and DEFRA; actual emissions vary by region, vehicle type, and energy grid.
3. **Diet emissions** use weekly averages from peer-reviewed lifecycle analysis studies.
4. **The user's locale** is assumed to be India (INR currency, Indian average benchmarks), though the app works globally.
5. **Browser support** targets modern browsers (ES2020+) with CSS custom properties support.

---

## 🛡️ Security Measures

| Measure | Implementation |
|---------|---------------|
| **XSS Prevention** | DOMPurify sanitization on all user inputs |
| **Content Security Policy** | CSP meta tag in `index.html` |
| **Input Validation** | Schema-based validators with type checking |
| **No `eval()`** | ESLint rule `no-eval` enforced |
| **No `dangerouslySetInnerHTML`** | Never used anywhere in codebase |
| **Storage Key Whitelisting** | Only known keys can be read/written |
| **Data Integrity** | Versioned storage wrapper with corruption detection |
| **External Links** | `rel="noopener noreferrer"` on all `target="_blank"` links |
| **Environment Variables** | Custom prefix prevents accidental exposure |

---

## ♿ Accessibility (WCAG 2.1 AA)

| Requirement | Implementation |
|------------|---------------|
| **Skip Navigation** | "Skip to main content" link (WCAG 2.4.1) |
| **Semantic HTML** | `<header>`, `<main>`, `<nav>`, `<footer>`, `<article>`, `<section>` |
| **ARIA Labels** | All interactive elements have descriptive labels |
| **Keyboard Navigation** | Full tab order, focus management, Escape to close |
| **Focus Indicators** | 3px solid outline with offset (WCAG 2.4.7) |
| **Color Contrast** | ≥4.5:1 ratio on all text (WCAG 1.4.3) |
| **Screen Reader Support** | Live regions for dynamic content announcements |
| **Reduced Motion** | `prefers-reduced-motion` media query respected |
| **High Contrast** | `forced-colors` media query support |
| **Form Labels** | All inputs have associated `<label>` elements |
| **Alt Text** | Charts have hidden data tables for screen readers |
| **ARIA Roles** | `role="menubar"`, `role="progressbar"`, `role="radiogroup"` |
| **No Auto-play** | No auto-playing media or animations that can't be paused |

---

## ⚡ Performance & Efficiency

| Optimization | Result |
|-------------|--------|
| **Code Splitting** | `React.lazy()` + `Suspense` on all page routes |
| **Vendor Chunking** | React and Recharts split into separate chunks |
| **Memoization** | `useMemo`/`useCallback` for expensive computations |
| **CSS Custom Properties** | Zero-runtime theming (no JS recalculation) |
| **Font Preconnect** | `<link rel="preconnect">` for Google Fonts |
| **Frozen Constants** | `Object.freeze()` prevents accidental mutations |
| **Minimal Dependencies** | Only 4 production dependencies |
| **Tree Shaking** | Vite eliminates unused code |
| **Activity Log Cap** | Limited to 500 entries to prevent localStorage bloat |

---

## 🧪 Testing

### Test Suite: **156 tests across 7 test files**

```bash
# Run all tests
npm test

# Run with watch mode
npm run test:watch

# Run with coverage report
npm run test:coverage
```

### Test Coverage

| Category | Files | Tests | Coverage |
|----------|-------|-------|----------|
| **Utils** | 3 | 97 | Calculations, validators, formatters |
| **Services** | 2 | 26 | Storage service, insights engine |
| **Components** | 1 | 18 | Button, Card, ProgressBar |
| **Data Integrity** | 1 | 15 | Constants validation |
| **Total** | **7** | **156** | **All passing** ✅ |

### What's Tested

- ✅ All calculation functions with edge cases (negative values, unknown types)
- ✅ Input sanitization (XSS attack vectors)
- ✅ Number validation (NaN, Infinity, bounds)
- ✅ Data persistence (read, write, delete, export)
- ✅ Insights engine (ranking, filtering, contextual tips)
- ✅ UI component rendering and interactions
- ✅ Accessibility attributes (ARIA, roles, labels)
- ✅ Data integrity (unique IDs, valid references, immutability)

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 19.x | UI framework |
| Vite | 8.x | Build tool & dev server |
| React Router | 7.x | Client-side routing |
| Recharts | 2.x | Interactive charts |
| DOMPurify | 3.x | XSS sanitization |
| Vitest | 4.x | Testing framework |
| Testing Library | 16.x | Component testing |
| ESLint | 9.x | Code linting |
| Prettier | 3.x | Code formatting |

---

## 📦 Getting Started

### Prerequisites

- Node.js 18+ 
- npm 9+

### Installation

```bash
# Clone the repository
git clone https://github.com/<username>/promptwar-carbon.git

# Navigate to project
cd promptwar-carbon

# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server at localhost:3000 |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build |
| `npm test` | Run all tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Generate coverage report |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<p align="center">
  Built with 💚 for the planet
</p>
#   C a r b o n  
 