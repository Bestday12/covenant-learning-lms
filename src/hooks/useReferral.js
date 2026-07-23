// src/hooks/useReferral.js
export function captureReferral() {
  const params = new URLSearchParams(window.location.search);
  const ref = params.get("ref");
  if (ref) {
    localStorage.setItem("cl_ref", ref.toUpperCase());
    localStorage.setItem("cl_ref_time", Date.now().toString());
  }
}

export function getReferralCode() {
  const ref = localStorage.getItem("cl_ref");
  const time = parseInt(localStorage.getItem("cl_ref_time") || "0");
  if (ref && Date.now() - time < 30 * 24 * 60 * 60 * 1000) {
    return ref;
  }
  return null;
}

export function clearReferral() {
  localStorage.removeItem("cl_ref");
  localStorage.removeItem("cl_ref_time");
}