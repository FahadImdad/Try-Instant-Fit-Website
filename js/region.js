// Region-aware homepage — PURE CLIENT-SIDE (no build step, no middleware).
// Default page = Pakistan (cheap pricing, flag shown). For non-PK visitors we
// swap to international pricing and hide the flag. If detection fails, we leave
// the Pakistan default in place (safe fallback).
//
// This file only reads a country code and edits text/visibility. It never
// touches the dashboard, the API, or uploads — so it cannot break the platform.

(function () {
  var CACHE_KEY = 'tif_region_v1';
  var CACHE_TTL_MS = 24 * 60 * 60 * 1000; // remember the country for a day

  // International pricing (abroad). Pakistan is the default already in the HTML.
  var GLOBAL = {
    price: '$0.25',
    perDollar: '4 try-ons',
    subtext: 'Just $1 for 4 try-ons · No setup fee · No monthly subscription',
    faqHtml: '$0.25 per try-on'
  };

  function applyPakistan() {
    var flag = document.getElementById('pkFlag');
    if (flag) flag.style.display = 'block';
    // Pricing is already the Pakistan default in the HTML — nothing to change.
  }

  function applyGlobal() {
    var flag = document.getElementById('pkFlag');
    if (flag) flag.style.display = 'none';

    var price = document.getElementById('pricePerTryon');
    if (price) {
      price.removeAttribute('data-usd'); // stop the PKR conversion for abroad
      price.innerHTML = GLOBAL.price +
        '<span style="font-size:1rem;font-weight:500;color:var(--muted);background:none;-webkit-text-fill-color:var(--muted);"> / try-on</span>';
    }
    var sub = document.getElementById('priceSubtext');
    if (sub) sub.textContent = GLOBAL.subtext;

    var faq = document.getElementById('faqPrice');
    if (faq) { faq.removeAttribute('data-usd'); faq.textContent = GLOBAL.faqHtml; }
  }

  function decide(country) {
    if (country && country !== 'PK') applyGlobal();
    else applyPakistan();
  }

  function getCountry() {
    // 1) cached?
    try {
      var c = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
      if (c && (Date.now() - c.t) < CACHE_TTL_MS && c.country) { decide(c.country); return; }
    } catch (e) {}

    // 2) detect via free, no-key endpoint
    fetch('https://api.country.is/', { cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        var country = (d && d.country) || 'PK';
        try { localStorage.setItem(CACHE_KEY, JSON.stringify({ country: country, t: Date.now() })); } catch (e) {}
        decide(country);
      })
      .catch(function () {
        // Detection failed → keep Pakistan default (safe), show the flag.
        applyPakistan();
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', getCountry);
  } else {
    getCountry();
  }
})();
