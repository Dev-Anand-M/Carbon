/**
 * @fileoverview Accessibility utilities hook.
 * Provides helpers for keyboard navigation, focus management,
 * and screen reader announcements.
 * @module hooks/useAccessibility
 */

import { useCallback, useRef, useEffect } from 'react';

/**
 * Hook providing accessibility utilities.
 * @returns {Object} Accessibility helpers.
 */
export function useAccessibility() {
  const announcerRef = useRef(null);

  /* Create a live region for screen reader announcements */
  useEffect(() => {
    let announcer = document.getElementById('sr-announcer');
    if (!announcer) {
      announcer = document.createElement('div');
      announcer.id = 'sr-announcer';
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.setAttribute('role', 'status');
      announcer.style.cssText =
        'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);border:0;';
      document.body.appendChild(announcer);
    }
    announcerRef.current = announcer;

    return () => {
      /* Cleanup only if we created it */
      if (announcer && announcer.parentNode) {
        announcer.parentNode.removeChild(announcer);
      }
    };
  }, []);

  /**
   * Announce a message to screen readers.
   * @param {string} message - The message to announce.
   * @param {string} [priority='polite'] - 'polite' or 'assertive'.
   */
  const announce = useCallback((message, priority = 'polite') => {
    if (announcerRef.current) {
      announcerRef.current.setAttribute('aria-live', priority);
      announcerRef.current.textContent = '';
      /* Brief delay ensures screen readers pick up the change */
      requestAnimationFrame(() => {
        if (announcerRef.current) {
          announcerRef.current.textContent = message;
        }
      });
    }
  }, []);

  /**
   * Handle keyboard events for interactive elements.
   * Triggers callback on Enter or Space key press.
   * @param {Function} callback - Function to call on activation.
   * @returns {Function} Event handler.
   */
  const handleKeyActivation = useCallback((callback) => {
    return (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        callback(event);
      }
    };
  }, []);

  /**
   * Create props for an accessible interactive element.
   * @param {Object} options
   * @param {string} options.label - Accessible label.
   * @param {Function} options.onClick - Click handler.
   * @param {string} [options.role='button'] - ARIA role.
   * @returns {Object} Props to spread on the element.
   */
  const getInteractiveProps = useCallback((options) => {
    const { label, onClick, role = 'button' } = options;
    return {
      role,
      tabIndex: 0,
      'aria-label': label,
      onClick,
      onKeyDown: handleKeyActivation(onClick),
    };
  }, [handleKeyActivation]);

  return {
    announce,
    handleKeyActivation,
    getInteractiveProps,
  };
}

export default useAccessibility;
