// src/hooks/useFacebookPixel.js
// Fire Meta Pixel events throughout the LMS

export function trackViewContent(courseId, courseName, price) {
  if (typeof window.fbq !== "function") return;
  window.fbq("track", "ViewContent", {
    content_ids: [courseId],
    content_name: courseName,
    content_type: "product",
    value: price || 0,
    currency: "GBP",
  });
}

export function trackInitiateCheckout(courseId, courseName, price) {
  if (typeof window.fbq !== "function") return;
  window.fbq("track", "InitiateCheckout", {
    content_ids: [courseId],
    content_name: courseName,
    value: price || 0,
    currency: "GBP",
    num_items: 1,
  });
}

export function trackPurchase(courseId, courseName, price, orderId) {
  if (typeof window.fbq !== "function") return;
  window.fbq("track", "Purchase", {
    content_ids: [courseId],
    content_name: courseName,
    value: price || 0,
    currency: "GBP",
    content_type: "product",
    order_id: orderId || "",
  });
}

export function trackLead(email) {
  if (typeof window.fbq !== "function") return;
  window.fbq("track", "Lead", { email });
}

export function trackCompleteRegistration(courseId) {
  if (typeof window.fbq !== "function") return;
  window.fbq("track", "CompleteRegistration", {
    content_name: courseId,
    status: "enrolled",
  });
}