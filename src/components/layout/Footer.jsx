/**
 * @fileoverview Application footer component.
 * @module components/layout/Footer
 */

/**
 * Application footer with links and credits.
 * @returns {JSX.Element}
 */
function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer__container">
        <div className="footer__brand">
          <span className="footer__logo" aria-hidden="true">🌍</span>
          <p className="footer__tagline">
            Making sustainability simple, one action at a time.
          </p>
        </div>

        <div className="footer__links">
          <h4 className="footer__heading">Data Sources</h4>
          <ul className="footer__list">
            <li>
              <a
                href="https://www.epa.gov/energy/greenhouse-gas-equivalencies-calculator"
                target="_blank"
                rel="noopener noreferrer"
                className="footer__link"
              >
                EPA GHG Calculator
              </a>
            </li>
            <li>
              <a
                href="https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2023"
                target="_blank"
                rel="noopener noreferrer"
                className="footer__link"
              >
                DEFRA Conversion Factors
              </a>
            </li>
          </ul>
        </div>

        <div className="footer__info">
          <h4 className="footer__heading">About</h4>
          <p className="footer__text">
            CarbonWise uses scientifically-backed emission factors to help you
            understand and reduce your environmental impact.
          </p>
        </div>

        <div className="footer__bottom">
          <p className="footer__copyright">
            &copy; {currentYear} CarbonWise. Built with 💚 for the planet.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
