// menu-api.js
// Robust MenuAPI: reads API_BASE from window.AppConfig, fetches backend menu,
// and maps DB row shapes into the menu_data.json structure that main.js expects.

(function () {
  // Set a fallback backend URL here if you want (replace with your render URL)
  const FALLBACK_BACKEND = 'https://web-ar-backend-83y8.onrender.com'; // <- replace if needed

  const API_BASE = (window.AppConfig && window.AppConfig.API_BASE) || FALLBACK_BACKEND || '';
  const DEFAULT_RESTAURANT = (window.AppConfig && window.AppConfig.DEFAULT_RESTAURANT_NUMBER) || '12345';

  const urlParams = new URLSearchParams(window.location.search);
  const RESTAURANT = urlParams.get('restaurant') || DEFAULT_RESTAURANT;
  const TABLE = urlParams.get('table') || '';

  // Helper: transform DB rows -> menu_data.json shape
  function rowsToMenu(rows) {
    // rows: array of objects from DB (may include columns like id, name, price, translations (JSON string), category, image...)
    const menu = { all: { label: { en: 'All' }, items: [] } };

    rows.forEach(r => {
      // try to parse translations if provided as string
      let translations = null;
      try {
        if (typeof r.translations === 'string') translations = JSON.parse(r.translations);
        else translations = r.translations || null;
      } catch (e) {
        translations = null;
      }

      // build item (keep safe defaults)
      const item = {
        id: r.id !== undefined ? String(r.id) : (r.item_id || r.slug || `item-${Math.random().toString(36).slice(2,8)}`),
        image: r.image || r.image_url || 'images/placeholder.png',
        model: r.model || null,
        video: r.video || null,
        dietaryFlags: r.dietary_flags || r.dietaryFlags || [],
        dietaryColor: r.dietary_color || r.dietaryColor || null,
        spiceLevel: (typeof r.spice_level !== 'undefined') ? r.spice_level : 0,
        isChefPick: !!r.is_chef_pick,
        isDailySpecial: !!r.is_daily_special,
        prepTime: r.prep_time || null,
        nutrition: r.nutrition || null,
        allergyInfo: r.allergy_info || r.allergyInfo || '',
        translations: translations || {
          en: {
            name: r.name || r.title || '',
            desc: r.description || r.desc || '',
            price: r.price ? (typeof r.price === 'number' ? `₹${r.price}` : String(r.price)) : '',
            ingredients: r.ingredients || ''
          }
        }
      };

      // category key detection
      const catKeyRaw = (r.category || r.menu_category || r.section || '').toString().trim();
      const categoryKey = catKeyRaw ? catKeyRaw : 'menu';

      if (!menu[categoryKey]) {
        menu[categoryKey] = {
          label: { en: categoryKey[0] ? categoryKey[0].toUpperCase() + categoryKey.slice(1) : 'Menu' },
          items: []
        };
      }

      menu[categoryKey].items.push(item);
      menu.all.items.push(item);
    });

    return menu;
  }

  async function getMenu() {
    // If no API_BASE configured, fallback to local JSON
    if (!API_BASE) {
      try {
        const res2 = await fetch('./menu_data.json');
        if (!res2.ok) throw new Error('Failed to load local menu_data.json');
        return await res2.json();
      } catch (err) {
        console.error('MenuAPI: no API_BASE and local load failed', err);
        return null;
      }
    }

    const url = `${API_BASE.replace(/\/$/, '')}/api/menu/${encodeURIComponent(RESTAURANT)}`;
    try {
      const res = await fetch(url, { credentials: 'omit' });
      if (!res.ok) {
        const txt = await res.text().catch(()=>'<no body>');
        console.warn('MenuAPI: backend returned non-OK', res.status, txt);
        // fallback local file
        const res2 = await fetch('./menu_data.json');
        if (!res2.ok) throw new Error('Failed to load local menu_data.json');
        return await res2.json();
      }

      const json = await res.json();

      // Accept multiple shapes:
      // 1) Already full menu object: { all: {...}, starters: {...}, ... } OR { menu: {...} }
      // 2) rows array: { rows: [...] } or { data: [...] } or { items: [...] }
      // 3) { success: true, rows: [...] }
      if (!json) throw new Error('Empty JSON from backend');

      // If backend already returns a menu object (has "all" or category keys), use it
      const hasAll = typeof json === 'object' && json !== null && ('all' in json || 'menu' in json || 'categories' in json);
      if (hasAll) {
        // if wrapped in { menu: {...} } return that
        if (json.menu && typeof json.menu === 'object') return json.menu;
        return json;
      }

      // If backend returns rows/data
      const candidateRows = json.rows || json.data || json.items || (Array.isArray(json) ? json : null);
      if (Array.isArray(candidateRows)) {
        // Convert rows -> menu
        return rowsToMenu(candidateRows);
      }

      // If backend returned something else (like { success:false} ), fallback to local file
      const res2 = await fetch('./menu_data.json');
      if (!res2.ok) throw new Error('Failed to load local menu_data.json');
      return await res2.json();

    } catch (err) {
      console.warn('MenuAPI.getMenu error, falling back to local menu_data.json', err);
      try {
        const res2 = await fetch('./menu_data.json');
        if (!res2.ok) throw new Error('Failed to load local menu_data.json');
        return await res2.json();
      } catch (err2) {
        console.error('MenuAPI: fallback to local failed too', err2);
        return null;
      }
    }
  }

  async function placeOrder(payload) {
    if (!API_BASE) {
      // local fake response
      return { success: true, orderId: 'local-' + Math.floor(Math.random() * 1000000) };
    }
    try {
      // attach restaurant/table metadata automatically
      const body = Object.assign({}, payload, { restaurant: RESTAURANT, table: TABLE });
      const res = await fetch(`${API_BASE.replace(/\/$/, '')}/api/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        const txt = await res.text().catch(()=>'<no body>');
        return { success: false, status: res.status, error: txt };
      }
      return await res.json();
    } catch (err) {
      console.error('menu-api.placeOrder error', err);
      return { success: false, error: String(err) };
    }
  }

  window.MenuAPI = window.MenuAPI || {};
  window.MenuAPI.getMenu = getMenu;
  window.MenuAPI.placeOrder = placeOrder;
  window.MenuAPI.meta = { RESTAURANT, TABLE, API_BASE };
})();
