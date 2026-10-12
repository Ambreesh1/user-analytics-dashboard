
(function () {
  const API_URL = "http://localhost:4000/api/events";
  const STORAGE_KEY = "user_analytics_session_id";

  let sessionId = sessionStorage.getItem(STORAGE_KEY);

  if (!sessionId) {
    sessionId =
      typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : "session_" + Date.now() + "_" + Math.random().toString(36).slice(2);

    sessionStorage.setItem(STORAGE_KEY, sessionId);
  }

  function trackEvent(eventType, extra = {}) {
    const event = {
      sessionId,
      eventType,
      pageUrl: window.location.pathname + window.location.search,
      timestamp: new Date().toISOString(),
      ...extra,
    };

    fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    }).catch((error) => {
      console.error("Analytics event failed:", error);
    });
  }

  // Record a page view when the script loads.
  trackEvent("page_view");

  // Record clicks and their coordinates within the browser viewport.
  document.addEventListener("click", function (event) {
    trackEvent("click", {
      x: event.clientX,
      y: event.clientY,
    });
  });
})();
