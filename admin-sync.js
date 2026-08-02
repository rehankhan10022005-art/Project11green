/* ===========================================================
   ADMIN-SYNC — include this on every public page (before </body>).
   It quietly pulls the latest content saved from admin.html and
   swaps it into any element carrying a [data-edit-id] attribute.
   Safe to include even before Firebase is configured — it will
   simply do nothing (site shows its normal hardcoded content).
=========================================================== */
(function () {
  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  function applyContent(data) {
    document.querySelectorAll('[data-edit-id]').forEach(function (el) {
      var key = el.getAttribute('data-edit-id');
      var val = data[key];
      if (val === undefined || val === null) return;

      if (el.tagName === 'IMG') {
        if (val.img) el.src = val.img;
      } else if (el.tagName === 'SOURCE') {
        if (val.video) {
          el.src = val.video;
          var parentVideo = el.closest('video');
          if (parentVideo) parentVideo.load();
        }
      } else if (el.tagName === 'VIDEO') {
        if (val.poster) el.poster = val.poster;
      } else {
        // Text content (e.g. prices)
        if (val.display !== undefined) {
          el.textContent = val.display;
        }
        if (val.base !== undefined) {
          var card = el.closest('.pricing-card, .coach-card');
          var btn = card ? card.querySelector('.open-modal-btn') : null;
          if (btn) btn.setAttribute('data-base', val.base);
        }
      }
    });
  }

  async function init() {
    try {
      if (typeof firebaseConfig === 'undefined') return; // not configured yet
      if (!window.firebase) {
        await loadScript('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
        await loadScript('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js');
      }
      if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
      var db = firebase.firestore();
      var doc = await db.collection('content').doc('site').get();
      if (doc.exists) applyContent(doc.data());
    } catch (e) {
      console.warn('Admin sync unavailable (site shows default content):', e);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
