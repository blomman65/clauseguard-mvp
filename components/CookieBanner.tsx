import { useState, useEffect } from 'react';

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [analyticsChecked, setAnalyticsChecked] = useState(false);

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
        <div className="overlay" onClick={() => setShowSettings(false)} />
        <div className="settings-panel">
          <div className="settings-inner">

            <div className="settings-head">
              <div>
                <h2 className="settings-title">Cookie Preferences</h2>
                <p className="settings-sub">Choose which cookies you accept.</p>
              </div>
              <button className="close-btn" onClick={() => setShowSettings(false)} aria-label="Close">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            <div className="cookie-row">
              <div className="cookie-info">
                <div className="cookie-name">Essential Cookies</div>
                <div className="cookie-desc">Required for the website to function. Stores your cookie preferences.</div>
              </div>
              <div className="always-active-badge">Always active</div>
            </div>

            <div className="cookie-row">
              <div className="cookie-info">
                <div className="cookie-name">Analytics Cookies</div>
                <div className="cookie-desc">Anonymous usage data via PostHog (EU servers). No personal information collected.</div>
              </div>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={analyticsChecked}
                  onChange={(e) => setAnalyticsChecked(e.target.checked)}
                />
                <span className="toggle-track">
                  <span className="toggle-thumb" />
                </span>
              </label>
            </div>

            <div className="settings-footer">
              <button onClick={handleDeclineAll} className="btn-ghost">Decline All</button>
              <button onClick={() => handleSavePreferences(analyticsChecked)} className="btn-primary">
                Save Preferences
              </button>
            </div>

            <p className="privacy-note">
              See our <a href="/privacy">Privacy Policy</a> for details.
            </p>
          </div>
        </div>

        <style jsx global>{`
          .overlay {
            position: fixed; inset: 0;
            background: rgba(0,0,0,0.55);
            backdrop-filter: blur(3px);
            z-index: 9998;
          }
          .settings-panel {
            position: fixed; bottom: 0; left: 0; right: 0;
            z-index: 9999;
            background: #0A1628;
            border-top: 1px solid rgba(255,255,255,0.08);
            box-shadow: 0 -8px 40px rgba(0,0,0,0.55);
          }
          .settings-inner {
            max-width: 720px; margin: 0 auto; padding: 28px 24px;
          }
          .settings-head {
            display: flex; justify-content: space-between;
            align-items: flex-start; gap: 16px; margin-bottom: 22px;
          }
          .settings-title {
            font-family: 'Sora', system-ui, sans-serif;
            font-size: 17px; font-weight: 700; color: #F1F5F9;
            letter-spacing: -0.02em; margin-bottom: 4px;
          }
          .settings-sub { font-size: 13px; color: #64748B; }
          .close-btn {
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 7px; color: #64748B; cursor: pointer;
            padding: 7px; display: flex; align-items: center;
            justify-content: center; transition: background 0.15s, color 0.15s;
            flex-shrink: 0;
          }
          .close-btn:hover { background: rgba(255,255,255,0.1); color: #94A3B8; }

          .cookie-row {
            display: flex; align-items: center;
            justify-content: space-between; gap: 20px;
            padding: 16px 0; border-bottom: 1px solid rgba(255,255,255,0.05);
          }
          .cookie-name { font-size: 13.5px; font-weight: 600; color: #E2E8F0; margin-bottom: 4px; }
          .cookie-desc { font-size: 12.5px; color: #64748B; line-height: 1.5; }
          .always-active-badge {
            font-family: 'JetBrains Mono', monospace;
            font-size: 10.5px; font-weight: 600; letter-spacing: 0.06em;
            text-transform: uppercase; color: #10B981;
            background: rgba(16,185,129,0.08);
            border: 1px solid rgba(16,185,129,0.2);
            padding: 4px 10px; border-radius: 5px; white-space: nowrap; flex-shrink: 0;
          }

          /* Toggle */
          .toggle { position: relative; display: inline-flex; align-items: center; cursor: pointer; flex-shrink: 0; }
          .toggle input { position: absolute; opacity: 0; width: 0; height: 0; }
          .toggle-track {
            width: 40px; height: 22px;
            background: rgba(255,255,255,0.07);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 100px; position: relative;
            transition: background 0.2s, border-color 0.2s;
          }
          .toggle input:checked + .toggle-track {
            background: rgba(37,99,235,0.55);
            border-color: rgba(37,99,235,0.4);
          }
          .toggle-thumb {
            position: absolute; top: 2px; left: 2px;
            width: 16px; height: 16px;
            background: #94A3B8; border-radius: 50%;
            transition: transform 0.2s, background 0.2s;
          }
          .toggle input:checked + .toggle-track .toggle-thumb {
            transform: translateX(18px); background: #fff;
          }

          .settings-footer {
            display: flex; justify-content: flex-end;
            gap: 10px; margin-top: 20px;
          }
          .btn-ghost {
            display: inline-flex; align-items: center;
            font-family: 'DM Sans', system-ui, sans-serif;
            font-size: 13px; font-weight: 600;
            padding: 9px 18px; border-radius: 9px; cursor: pointer;
            background: transparent; color: #94A3B8;
            border: 1px solid rgba(255,255,255,0.1);
            transition: all 0.15s;
          }
          .btn-ghost:hover { background: rgba(255,255,255,0.05); color: #E2E8F0; }
          .btn-primary {
            display: inline-flex; align-items: center;
            font-family: 'DM Sans', system-ui, sans-serif;
            font-size: 13px; font-weight: 600;
            padding: 9px 18px; border-radius: 9px; cursor: pointer;
            background: #2563EB; color: #fff; border: none;
            box-shadow: 0 2px 10px rgba(37,99,235,0.3);
            transition: background 0.15s;
          }
          .btn-primary:hover { background: #3B82F6; }

          .privacy-note {
            font-size: 11.5px; color: #475569;
            margin-top: 14px; text-align: center;
          }
          .privacy-note a { color: #60A5FA; text-decoration: none; }
          .privacy-note a:hover { text-decoration: underline; }
        `}</style>
      </>
    );
  }

  return (
    <>
      <div className="banner">
        <div className="banner-inner">
          <div className="banner-text">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{flexShrink:0}}>
              <circle cx="7" cy="7" r="6" stroke="#60A5FA" strokeWidth="1.2"/>
              <path d="M7 6v4M7 4.5v.3" stroke="#60A5FA" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            <p>
              We use cookies to analyze site usage and improve your experience.{' '}
              <a href="/privacy">Privacy Policy</a>
            </p>
          </div>
          <div className="banner-btns">
            <button onClick={() => setShowSettings(true)} className="btn-ghost">Manage</button>
            <button onClick={handleDeclineAll} className="btn-ghost">Decline</button>
            <button onClick={handleAcceptAll} className="btn-accept">Accept All</button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .banner {
          position: fixed; bottom: 0; left: 0; right: 0;
          z-index: 9999;
          background: rgba(6,15,30,0.97);
          backdrop-filter: blur(20px);
          border-top: 1px solid rgba(255,255,255,0.07);
          box-shadow: 0 -4px 28px rgba(0,0,0,0.45);
        }
        .banner-inner {
          max-width: 920px; margin: 0 auto; padding: 14px 24px;
          display: flex; align-items: center;
          justify-content: space-between; gap: 20px; flex-wrap: wrap;
        }
        .banner-text {
          display: flex; align-items: center; gap: 10px;
          flex: 1; min-width: 240px;
        }
        .banner-text p { font-size: 13px; color: #64748B; line-height: 1.5; margin: 0; font-family: 'DM Sans', system-ui, sans-serif; }
        .banner-text a { color: #60A5FA; text-decoration: none; }
        .banner-text a:hover { text-decoration: underline; }
        .banner-btns { display: flex; gap: 8px; flex-wrap: wrap; flex-shrink: 0; }

        .btn-ghost {
          display: inline-flex; align-items: center;
          font-family: 'DM Sans', system-ui, sans-serif;
          font-size: 12.5px; font-weight: 600;
          padding: 7px 14px; border-radius: 8px; cursor: pointer;
          background: transparent; color: #94A3B8;
          border: 1px solid rgba(255,255,255,0.09);
          transition: all 0.15s; white-space: nowrap;
        }
        .btn-ghost:hover { background: rgba(255,255,255,0.05); color: #E2E8F0; }

        .btn-accept {
          display: inline-flex; align-items: center;
          font-family: 'DM Sans', system-ui, sans-serif;
          font-size: 12.5px; font-weight: 600;
          padding: 7px 14px; border-radius: 8px; cursor: pointer;
          background: #2563EB; color: #fff; border: none;
          box-shadow: 0 2px 10px rgba(37,99,235,0.28);
          transition: background 0.15s; white-space: nowrap;
        }
        .btn-accept:hover { background: #3B82F6; }
      `}</style>
    </>
  );
}