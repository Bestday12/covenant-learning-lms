export function initErrorMonitoring() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) return;
  // Placeholder: integrate @sentry/react here when ready for production
  console.log("[sentry] Would initialize with DSN:", dsn);
}
