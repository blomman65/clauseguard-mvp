import { useState, useEffect } from 'react';

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      try {
        const consent = localStorage.getItem('cookie-consent');
        if (!consent) setShowBanner(true);
      } catch (e) {
        console.warn('localStorage not available');
      }
    }
  }, []);

  const handleAcceptAll = () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('cookie-consent', 'accepted');
        localStorage.setItem('cookie-consent-timestamp', new Date().toISOString());
        localStorage.setItem('cookie-analytics', 'true');
        window.dispatchEvent(new Event('cookieConsentChanged'));
      } catch (e) {}
    }
    setShowBanner(false);
    setShowSettings(false);
  };

  const handleDeclineAll = () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('cookie-consent', 'declined');
        localStorage.setItem('cookie-consent-timestamp', new Date().toISOString());
        localStorage.setItem('cookie-analytics', 'false');
      } catch (e) {}
    }
    setShowBanner(false);
    setShowSettings(false);
  };

  const handleSavePreferences = (analytics: boolean) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('cookie-consent', analytics ? 'accepted' : 'declined');
        localStorage.setItem('cookie-consent-timestamp', new Date().toISOString());
        localStorage.setItem('cookie-analytics', analytics ? 'true' : 'false');
        if (analytics) window.dispatchEvent(new Event('cookieConsentChanged'));
      } catch (e) {}
    }
    setShowBanner(false);
    setShowSettings(false);
  };

  if (!mounted || !showBanner) return null;

  if (showSettings) {
    return (
      <>
        <div className="cb-overlay" onClick={() => setShowSettings(false)} />
        <div className="cb-settings">
          <div className="cb-settings-inner">
            <div className="cb-settings-header">
              <div>
                <h2 className="cb-settings-title">Cookie Preferences</h2>
                <p className="cb-settings-sub">Choose which cookies you accept.</p>
              </div>
              <button className="cb-close" onClick={() => setShowSettings(false)} aria-label="Close">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            <div className="cb-cookie-row">
              <div className="cb-cookie-info">
                <div className="cb-cookie-name">Essential Cookies</div>
                <div className="cb-cookie-desc">Required for the website to function. Stores your cookie preferences.</div>
              </div>
              <div className="cb-always-active">Always active</div>
            </div>

            <div className="cb-cookie-row">
              <div className="cb-cookie-info">
                <div className="cb-cookie-name">Analytics Cookies</div>
                <div className="cb-cookie-desc">Anonymous usage data via PostHog (EU servers). No personal information collected.</div>
              </div>
              <label className="cb-toggle">
                <input type="checkbox" id="analytics-toggle" defaultChecked={false} />
                <span className="cb-toggle-track">
                  <span className="cb-toggle-thumb" />
                </span>
              </label>
            </div>

            <div className="cb-settings-footer">
              <button onClick={handleDeclineAll} className="cb-btn cb-btn--ghost">
                Decline All
              </button>
              <button
                onClick={() => {
                  const el = document.getElementById('analytics-toggle') as HTMLInputElement;
                  handleSavePreferences(el?.checked || false);
                }}
                className="cb-btn cb-btn--primary"
              >
                Save Preferences
              </button>
            </div>

            <p className="cb-privacy-link">
              See our <a href="/privacy">Privacy Policy</a> for details.
            </p>
          </div>
        </div>

        <style jsx>{`
          .cb-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.5);
            z-index: 9998;
            backdrop-filter: blur(2px);
          }
          .cb-settings {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            z-index: 9999;
            background: #0A1628;
            border-top: 1px solid rgba(255,255,255,0.08);
            box-shadow: 0 -8px 32px rgba(0,0,0,0.5);
          }
          .cb-settings-inner {
            max-width: 720px;
            margin: 0 auto;
            padding: 28px 24px;
          }
          .cb-settings-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 16px;
            margin-bottom: 24px;
          }
          .cb-settings-title {
            font-size: 17px;
            font-weight: 700;
            color: #F1F5F9;
            margin-bottom: 4px;
            letter-spacing: -0.02em;
          }
          .cb-settings-sub {
            font-size: 13px;
            color: #64748B;
          }
          .cb-close {
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 6px;
            color: #64748B;
            cursor: pointer;
            padding: 7px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.15s, color 0.15s;
            flex-shrink: 0;
          }
          .cb-close:hover { background: rgba(255,255,255,0.1); color: #94A3B8; }
          .cb-cookie-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
            padding: 16px 0;
            border-bottom: 1px solid rgba(255,255,255,0.05);
          }
          .cb-cookie-name {
            font-size: 13.5px;
            font-weight: 600;
            color: #E2E8F0;
            margin-bottom: 4px;
          }
          .cb-cookie-desc {
            font-size: 12.5px;
            color: #64748B;
            line-height: 1.5;
          }
          .cb-always-active {
            font-size: 11px;
            font-weight: 600;
            letter-spacing: 0.06em;
            text-transform: uppercase;
            color: #10B981;
            background: rgba(16,185,129,0.08);
            border: 1px solid rgba(16,185,129,0.2);
            padding: 4px 10px;
            border-radius: 4px;
            white-space: nowrap;
            flex-shrink: 0;
          }
          /* Toggle switch */
          .cb-toggle {
            position: relative;
            display: inline-flex;
            align-items: center;
            cursor: pointer;
            flex-shrink: 0;
          }
          .cb-toggle input { position: absolute; opacity: 0; width: 0; height: 0; }
          .cb-toggle-track {
            width: 40px;
            height: 22px;
            background: rgba(255,255,255,0.08);
            border: 1px solid rgba(255,255,255,0.12);
            border-radius: 100px;
            position: relative;
            transition: background 0.2s, border-color 0.2s;
          }
          .cb-toggle input:checked + .cb-toggle-track {
            background: rgba(37,99,235,0.6);
            border-color: rgba(37,99,235,0.4);
          }
          .cb-toggle-thumb {
            position: absolute;
            top: 2px;
            left: 2px;
            width: 16px;
            height: 16px;
            background: #94A3B8;
            border-radius: 50%;
            transition: transform 0.2s, background 0.2s;
          }
          .cb-toggle input:checked ~ .cb-toggle-track .cb-toggle-thumb {
            transform: translateX(18px);
            background: #fff;
          }
          .cb-settings-footer {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            margin-top: 20px;
          }
          .cb-btn {
            display: inline-flex;
            align-items: center;
            font-size: 13px;
            font-weight: 600;
            padding: 9px 18px;
            border-radius: 8px;
            cursor: pointer;
            border: none;
            transition: all 0.15s;
            font-family: inherit;
          }
          .cb-btn--ghost {
            background: transparent;
            color: #94A3B8;
            border: 1px solid rgba(255,255,255,0.1);
          }
          .cb-btn--ghost:hover { background: rgba(255,255,255,0.05); color: #E2E8F0; }
          .cb-btn--primary {
            background: #2563EB;
            color: #fff;
            box-shadow: 0 2px 8px rgba(37,99,235,0.3);
          }
          .cb-btn--primary:hover { background: #3B82F6; }
          .cb-privacy-link {
            font-size: 11.5px;
            color: #475569;
            margin-top: 14px;
            text-align: center;
          }
          .cb-privacy-link a { color: #60A5FA; text-decoration: none; }
          .cb-privacy-link a:hover { text-decoration: underline; }
        `}</style>
      </>
    );
  }

  return (
    <>
      <div className="cb-banner">
        <div className="cb-banner-inner">
          <div className="cb-banner-text">
            <div className="cb-banner-icon">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="6" stroke="#60A5FA" strokeWidth="1.2"/>
                <path d="M7 6v4M7 4.5v.5" stroke="#60A5FA" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            </div>
            <p>
              We use cookies to analyze site usage and improve your experience.{' '}
              <a href="/privacy">Privacy Policy</a>
            </p>
          </div>
          <div className="cb-banner-actions">
            <button onClick={() => setShowSettings(true)} className="cb-btn cb-btn--ghost">
              Manage
            </button>
            <button onClick={handleDeclineAll} className="cb-btn cb-btn--ghost">
              Decline
            </button>
            <button onClick={handleAcceptAll} className="cb-btn cb-btn--primary">
              Accept All
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .cb-banner {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 9999;
          background: rgba(6,15,30,0.96);
          backdrop-filter: blur(16px);
          border-top: 1px solid rgba(255,255,255,0.07);
          box-shadow: 0 -4px 24px rgba(0,0,0,0.4);
        }
        .cb-banner-inner {
          max-width: 920px;
          margin: 0 auto;
          padding: 14px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          flex-wrap: wrap;
        }
        .cb-banner-text {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1;
          min-width: 240px;
        }
        .cb-banner-icon { flex-shrink: 0; display: flex; }
        .cb-banner-text p {
          font-size: 13px;
          color: #64748B;
          line-height: 1.5;
          margin: 0;
        }
        .cb-banner-text a {
          color: #60A5FA;
          text-decoration: none;
        }
        .cb-banner-text a:hover { text-decoration: underline; }
        .cb-banner-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          flex-shrink: 0;
        }
        .cb-btn {
          display: inline-flex;
          align-items: center;
          font-size: 12.5px;
          font-weight: 600;
          padding: 7px 14px;
          border-radius: 7px;
          cursor: pointer;
          border: none;
          transition: all 0.15s;
          font-family: inherit;
          white-space: nowrap;
        }
        .cb-btn--ghost {
          background: transparent;
          color: #94A3B8;
          border: 1px solid rgba(255,255,255,0.09);
        }
        .cb-btn--ghost:hover { background: rgba(255,255,255,0.05); color: #E2E8F0; }
        .cb-btn--primary {
          background: #2563EB;
          color: #fff;
        }
        .cb-btn--primary:hover { background: #3B82F6; }
      `}</style>
    </>
  );
}