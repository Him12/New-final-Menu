// menu-api.js
(function () {
  const API_BASE = (window.AppConfig && window.AppConfig.API_BASE) || "";
  const DEFAULT_RESTAURANT = (window.AppConfig && window.AppConfig.DEFAULT_RESTAURANT_NUMBER) || "12345";
  const urlParams = new URLSearchParams(window.location.search);
  const RESTAURANT = urlParams.get("restaurant") || DEFAULT_RESTAURANT;
  const TABLE = urlParams.get("table") || "";

  async function getMenu() {
    if (API_BASE) {
      try {
        const res = await fetch(`${API_BASE}/api/menu/${encodeURIComponent(RESTAURANT)}`);
        if (res.ok) {
          const json = await res.json();
          // backend returns { success: true, menu: [...] } or similar
          if (json && (json.menu || json.data)) return json.menu || json.data;
        } else {
          console.warn('Backend returned', res.status, await res.text());
        }
      } catch (err) {
        console.warn('Backend error, falling back to local menu_data.json', err);
      }
    }

    // fallback to local JSON
    const res2 = await fetch('./menu_data.json');
    if (!res2.ok) throw new Error('Failed to load menu_data.json');
    return await res2.json();
  }

  async function placeOrder(payload) {
    if (!API_BASE) {
      // local fake response
      return { success: true, orderId: 'local-' + Math.floor(Math.random() * 1000000) };
    }
    try {
      const res = await fetch(`${API_BASE}/api/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (err) {
      console.error('menu-api.placeOrder error', err);
      return { success: false, error: String(err) };
    }
  }

  window.MenuAPI = { getMenu, placeOrder, meta: { RESTAURANT, TABLE } };
})();
