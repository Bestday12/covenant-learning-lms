// Lightweight analytics wrapper (swap in PostHog/Mixpanel later)
export function trackEvent(eventName, payload = {}) {
  if (import.meta.env.VITE_APP_ENV === "development") {
    console.log("[analytics]", eventName, payload);
    return;
  }
  try {
    window?.posthog?.capture?.(eventName, payload);
  } catch (err) {
    console.error("analytics error", err);
  }
}
