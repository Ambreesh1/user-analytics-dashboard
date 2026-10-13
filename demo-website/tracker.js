(() => {
  const API_URL = "https://user-analytics-dashboard-4xv1.onrender.com/api/events";
  const STORAGE_KEY = "demo_analytics_session_id";

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

  // Track page views.
  trackEvent("page_view");

  // Track clicks and viewport coordinates.
  document.addEventListener("click", (event) => {
    trackEvent("click", {
      x: event.clientX,
      y: event.clientY,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      scrollX: window.scrollX,
      scrollY: window.scrollY,
    });
  });
})();
