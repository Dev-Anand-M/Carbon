/**
 * @fileoverview Main application component with routing and providers.
 * @module App
 */

import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CarbonProvider } from './contexts/CarbonContext.jsx';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import ErrorBoundary from './components/common/ErrorBoundary.jsx';
import Header from './components/layout/Header.jsx';
import Footer from './components/layout/Footer.jsx';

/* Code-split pages for optimal loading performance */
const Home = lazy(() => import('./pages/Home.jsx'));
const Calculator = lazy(() => import('./pages/Calculator.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const Tracking = lazy(() => import('./pages/Tracking.jsx'));
const Insights = lazy(() => import('./pages/Insights.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

/**
 * Loading fallback component shown during lazy page loads.
 * @returns {JSX.Element}
 */
function PageLoader() {
  return (
    <div className="page-loader" role="status" aria-label="Loading page">
      <div className="page-loader__spinner" aria-hidden="true">
        <div className="page-loader__ring" />
      </div>
      <p className="page-loader__text">Loading...</p>
    </div>
  );
}

/**
 * Root application component.
 * @returns {JSX.Element}
 */
function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <CarbonProvider>
          <BrowserRouter>
            <div className="app">
              <Header />
              <main id="main-content" className="app__main" role="main" tabIndex={-1}>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/calculator" element={<Calculator />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/tracking" element={<Tracking />} />
                    <Route path="/insights" element={<Insights />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </main>
              <Footer />
            </div>
          </BrowserRouter>
        </CarbonProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
