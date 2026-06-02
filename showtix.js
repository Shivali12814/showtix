// showtix.js — Sidenav, Notifications, Bookings, Filters, Settings, Back Button
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    initSidenav();
    initFilters();
    initSettings();
    applyStoredSettings();
    initBackButton();
  });

  /* ═══════════════════════════════════════
     BACK BUTTON — floating, shown on detail/ticket pages
  ═══════════════════════════════════════ */
  function initBackButton() {
    // Pages that are "top-level" and should NOT show a back button
    var topLevel = ['home.html', 'movies.html', 'stream.html', 'event.html',
                    'plays.html', 'activity.html', 'sign.html', 'card.html',
                    'contact.html', 'explore.html', ''];
    var page = window.location.pathname.split('/').pop();
    if (topLevel.indexOf(page) !== -1) return;
    // Also skip if this is the very first page in history
    if (window.history.length <= 1) return;

    // Create button
    var btn = document.createElement('button');
    btn.id = 'stxBackBtn';
    btn.innerHTML = '&#8592; Back';
    btn.onclick = function () { window.history.back(); };

    var isMobile = window.innerWidth <= 768;
    // On mobile, navbar is 56px + subnav 42px = 98px total
    var topOffset = isMobile ? '62px' : '80px';
    btn.style.cssText = [
      'position:fixed',
      'top:' + topOffset,
      'left:' + (isMobile ? '10px' : '16px'),
      'z-index:900',
      'display:flex',
      'align-items:center',
      'gap:4px',
      'background:rgba(13,13,13,0.88)',
      'border:1px solid rgba(255,255,255,0.18)',
      'color:rgba(255,255,255,0.9)',
      'font-family:Poppins,sans-serif',
      'font-size:' + (isMobile ? '11px' : '13px'),
      'font-weight:500',
      'padding:' + (isMobile ? '5px 10px' : '7px 15px'),
      'border-radius:20px',
      'cursor:pointer',
      'box-shadow:0 2px 12px rgba(0,0,0,0.5)',
      'transition:background 0.2s,border-color 0.2s,color 0.2s',
      'letter-spacing:0.2px',
      'white-space:nowrap',
      'backdrop-filter:blur(8px)',
      '-webkit-backdrop-filter:blur(8px)'
    ].join(';');

    // Desktop hover only (not mobile — avoids sticky red)
    if (!('ontouchstart' in window)) {
      btn.addEventListener('mouseenter', function () {
        btn.style.background = 'rgba(229,9,20,0.9)';
        btn.style.borderColor = '#e50914';
        btn.style.color = '#fff';
      });
      btn.addEventListener('mouseleave', function () {
        btn.style.background = 'rgba(13,13,13,0.82)';
        btn.style.borderColor = 'rgba(255,255,255,0.15)';
        btn.style.color = 'rgba(255,255,255,0.85)';
      });
    }
    document.body.appendChild(btn);
  }

  /* ═══════════════════════════════════════
     SIDENAV — fully rebuilt in JS
  ═══════════════════════════════════════ */
  function initSidenav() {
    var sidenav = document.getElementById('mySidenav');
    if (!sidenav) return;

    // Move to <body> to escape parent stacking context
    if (sidenav.parentElement !== document.body) {
      document.body.appendChild(sidenav);
    }

    // ── Responsive width ──
    function navWidth() {
      return window.innerWidth <= 480 ? '100vw' : window.innerWidth <= 768 ? '85vw' : '290px';
    }

    // ── Overlay ──
    var overlay = document.createElement('div');
    overlay.id = 'sidenavOverlay';
    overlay.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,0.65);z-index:997;backdrop-filter:blur(2px);';
    document.body.appendChild(overlay);

    function openNav() {
      sidenav.style.width = navWidth();
      overlay.style.display = 'block';
      document.body.style.overflow = 'hidden';
    }
    function closeNav() {
      sidenav.style.width = '0';
      overlay.style.display = 'none';
      document.body.style.overflow = '';
    }
    window.openNav  = openNav;
    window.closeNav = closeNav;
    overlay.addEventListener('click', closeNav);

    // ── Rebuild sidenav content ──
    var user = null;
    try { user = JSON.parse(localStorage.getItem('user') || 'null'); } catch(e) {}
    var firstName = user && user.name ? user.name.split(' ')[0] : null;

    sidenav.innerHTML = '';
    sidenav.style.cssText += 'overflow-y:auto;overflow-x:hidden;';

    function makeLink(icon, text, action, badge) {
      var a = document.createElement('a');
      a.href = '#';
      a.style.cssText = 'display:flex;align-items:center;gap:12px;padding:14px 22px;color:#ccc;font-family:Poppins,sans-serif;font-size:14px;font-weight:500;text-decoration:none;border-bottom:1px solid rgba(255,255,255,0.05);transition:all 0.2s;white-space:nowrap;';
      a.innerHTML = '<span style="font-size:18px;width:24px;text-align:center;flex-shrink:0;">' + icon + '</span>'
        + '<span style="flex:1;">' + text + '</span>'
        + (badge ? '<span style="background:#e50914;color:#fff;font-size:10px;font-weight:700;padding:2px 7px;border-radius:20px;flex-shrink:0;">' + badge + '</span>' : '');
      a.addEventListener('mouseenter', function() { a.style.background='rgba(229,9,20,0.08)'; a.style.color='#fff'; a.style.paddingLeft='30px'; });
      a.addEventListener('mouseleave', function() { a.style.background=''; a.style.color='#ccc'; a.style.paddingLeft='22px'; });
      if (typeof action === 'string') {
        a.href = action;
        a.style.cursor = 'pointer';
      } else if (typeof action === 'function') {
        a.addEventListener('click', function(e) { e.preventDefault(); action(); });
      }
      return a;
    }

    function makeSep(label) {
      var d = document.createElement('div');
      d.style.cssText = 'padding:10px 22px 4px;font-size:9px;font-weight:700;letter-spacing:2px;color:#444;text-transform:uppercase;font-family:Poppins,sans-serif;';
      d.textContent = label;
      return d;
    }

    // Close button
    var closeBtn = document.createElement('a');
    closeBtn.href = 'javascript:void(0)';
    closeBtn.className = 'closebtn';
    closeBtn.textContent = '×';
    closeBtn.style.cssText = 'position:absolute;top:16px;right:20px;font-size:28px;color:#888;text-decoration:none;line-height:1;z-index:2;';
    closeBtn.addEventListener('click', closeNav);
    sidenav.appendChild(closeBtn);

    // User greeting
    var greet = document.createElement('div');
    greet.style.cssText = 'padding:24px 22px 16px;border-bottom:1px solid rgba(255,255,255,0.07);';
    if (firstName) {
      greet.innerHTML = '<div style="font-family:Poppins,sans-serif;font-size:13px;color:#888;margin-bottom:4px;">Welcome back,</div>'
        + '<div style="font-family:Poppins,sans-serif;font-size:18px;font-weight:700;color:#e50914;">👤 ' + firstName + '</div>'
        + (user.email ? '<div style="font-size:11px;color:#555;margin-top:3px;">' + user.email + '</div>' : '');
    } else {
      greet.innerHTML = '<div style="font-family:Poppins,sans-serif;font-size:14px;color:#888;margin-bottom:8px;">Not signed in</div>'
        + '<a href="sign.html" style="display:inline-block;background:#e50914;color:#fff;font-family:Poppins,sans-serif;font-size:13px;font-weight:600;padding:8px 20px;border-radius:8px;text-decoration:none;">Sign In →</a>';
    }
    sidenav.appendChild(greet);

    // ── My Bookings ──
    var bookings = [];
    try { bookings = JSON.parse(localStorage.getItem('stx_bookings') || '[]'); } catch(e) {}
    var bookingBadge = bookings.length > 0 ? bookings.length.toString() : null;

    sidenav.appendChild(makeSep('Account'));
    sidenav.appendChild(makeLink('🎟', 'My Bookings', function() {
      closeNav();
      openBookingsPanel();
    }, bookingBadge));

    // ── Offers ──
    var offersCount = '3';
    sidenav.appendChild(makeLink('🎁', 'Offers & Deals', function() {
      closeNav();
      showToast('🎁 Check out today\'s offers on the Events page!', 3500);
      setTimeout(function() { window.location.href = 'event.html'; }, 1800);
    }, offersCount));

    // ── Notifications ──
    var notifCount = '2';
    sidenav.appendChild(makeLink('🔔', 'Notifications', function() {
      closeNav();
      openNotifPanel();
    }, notifCount));

    // ── Browse ──
    sidenav.appendChild(makeSep('Browse'));
    sidenav.appendChild(makeLink('🎬', 'Movies', 'movies.html'));
    sidenav.appendChild(makeLink('📺', 'Stream Library', 'stream.html'));
    sidenav.appendChild(makeLink('🎭', 'Events & Plays', 'event.html'));
    sidenav.appendChild(makeLink('⚽', 'Sports & Activities', 'activity.html'));

    // ── More ──
    sidenav.appendChild(makeSep('More'));
    sidenav.appendChild(makeLink('💳', 'Gift Cards', 'card.html'));
    sidenav.appendChild(makeLink('⭐', 'Rewards', function() {
      closeNav();
      var pts = parseInt(localStorage.getItem('stx_points') || '0', 10);
      showToast('⭐ You have ' + pts + ' reward points. Earn 10 pts per booking!', 4000);
    }));
    sidenav.appendChild(makeLink('✉️', 'Help & Support', 'contact.html'));

    // ── Settings ──
    var sep = document.createElement('div');
    sep.style.cssText = 'height:1px;background:rgba(255,255,255,0.06);margin:8px 0;';
    sidenav.appendChild(sep);
    sidenav.appendChild(makeLink('⚙️', 'Settings', function() {
      closeNav();
      if (window.openSettings) openSettings();
    }));

    // Logout (only if logged in)
    if (firstName) {
      sidenav.appendChild(makeLink('🚪', 'Logout', function() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'sign.html';
      }));
    }

    var ver = document.createElement('div');
    ver.style.cssText = 'text-align:center;font-size:10px;color:#333;padding:16px;font-family:Poppins,sans-serif;';
    ver.textContent = 'SHOWTIX v1.0';
    sidenav.appendChild(ver);

    // ── Wire hamburger ──
    var btn = document.querySelector('.side-menu');
    if (btn) btn.onclick = openNav;

    // ── Resize: update width if open ──
    window.addEventListener('resize', function() {
      if (sidenav.style.width && sidenav.style.width !== '0px' && sidenav.style.width !== '0') {
        sidenav.style.width = navWidth();
      }
    });
  }

  /* ═══════════════════════════════════════
     NOTIFICATIONS PANEL
  ═══════════════════════════════════════ */
  function openNotifPanel() {
    var existing = document.getElementById('stxNotifPanel');
    if (existing) { existing.remove(); return; }

    var notifications = [
      { icon: '🎬', title: 'Thamma is now booking!', sub: 'Book before seats fill up', time: '2h ago' },
      { icon: '🎁', title: 'Special Offer: 20% off', sub: 'Use code SHOWTIX20 on your next booking', time: '1d ago' },
      { icon: '🎟', title: 'Your booking is confirmed', sub: 'Enjoy the show!', time: '3d ago' },
    ];

    var overlay = document.createElement('div');
    overlay.id = 'stxNotifPanel';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:2000;display:flex;justify-content:flex-end;backdrop-filter:blur(3px);';

    var panel = document.createElement('div');
    panel.style.cssText = 'background:#141414;width:320px;max-width:95vw;height:100%;overflow-y:auto;border-left:1px solid rgba(229,9,20,0.2);animation:stxSlide 0.28s ease;display:flex;flex-direction:column;';

    var hdr = document.createElement('div');
    hdr.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:20px;border-bottom:1px solid rgba(255,255,255,0.07);position:sticky;top:0;background:#141414;z-index:1;';
    hdr.innerHTML = '<span style="font-family:Poppins,sans-serif;font-size:16px;font-weight:700;color:#fff;">🔔 Notifications</span>'
      + '<button id="closeNotif" style="background:none;border:none;color:#888;font-size:22px;cursor:pointer;padding:2px 8px;">✕</button>';
    panel.appendChild(hdr);

    notifications.forEach(function(n) {
      var item = document.createElement('div');
      item.style.cssText = 'display:flex;gap:14px;padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.05);cursor:pointer;transition:background 0.2s;';
      item.innerHTML = '<div style="font-size:24px;flex-shrink:0;margin-top:2px;">' + n.icon + '</div>'
        + '<div style="flex:1;">'
        + '<div style="font-family:Poppins,sans-serif;font-size:13px;font-weight:600;color:#fff;margin-bottom:3px;">' + n.title + '</div>'
        + '<div style="font-size:12px;color:#888;margin-bottom:4px;">' + n.sub + '</div>'
        + '<div style="font-size:10px;color:#555;">' + n.time + '</div>'
        + '</div>';
      item.addEventListener('mouseenter', function() { item.style.background = 'rgba(229,9,20,0.06)'; });
      item.addEventListener('mouseleave', function() { item.style.background = ''; });
      panel.appendChild(item);
    });

    var empty = document.createElement('div');
    empty.style.cssText = 'padding:30px 20px;text-align:center;color:#555;font-size:13px;font-family:Poppins,sans-serif;';
    empty.textContent = 'You\'re all caught up!';
    panel.appendChild(empty);

    overlay.appendChild(panel);
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    overlay.addEventListener('click', function(e) { if (e.target === overlay) closeNotif(); });
    hdr.querySelector('#closeNotif').addEventListener('click', closeNotif);

    function closeNotif() {
      overlay.remove();
      document.body.style.overflow = '';
    }
  }

  /* ═══════════════════════════════════════
     MY BOOKINGS PANEL
  ═══════════════════════════════════════ */
  function openBookingsPanel() {
    var existing = document.getElementById('stxBookingsPanel');
    if (existing) { existing.remove(); return; }

    var bookings = [];
    try { bookings = JSON.parse(localStorage.getItem('stx_bookings') || '[]'); } catch(e) {}

    var overlay = document.createElement('div');
    overlay.id = 'stxBookingsPanel';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:2000;display:flex;justify-content:flex-end;backdrop-filter:blur(3px);';

    var panel = document.createElement('div');
    panel.style.cssText = 'background:#141414;width:340px;max-width:95vw;height:100%;overflow-y:auto;border-left:1px solid rgba(229,9,20,0.2);animation:stxSlide 0.28s ease;display:flex;flex-direction:column;';

    var hdr = document.createElement('div');
    hdr.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:20px;border-bottom:1px solid rgba(255,255,255,0.07);position:sticky;top:0;background:#141414;z-index:1;';
    hdr.innerHTML = '<span style="font-family:Poppins,sans-serif;font-size:16px;font-weight:700;color:#fff;">🎟 My Bookings</span>'
      + '<button id="closeBookings" style="background:none;border:none;color:#888;font-size:22px;cursor:pointer;padding:2px 8px;">✕</button>';
    panel.appendChild(hdr);

    if (bookings.length === 0) {
      var empty = document.createElement('div');
      empty.style.cssText = 'padding:60px 20px;text-align:center;';
      empty.innerHTML = '<div style="font-size:48px;margin-bottom:16px;">🎬</div>'
        + '<div style="font-family:Poppins,sans-serif;font-size:15px;font-weight:600;color:#fff;margin-bottom:8px;">No bookings yet</div>'
        + '<div style="font-size:13px;color:#666;margin-bottom:24px;">Book your first ticket and it\'ll show up here</div>'
        + '<a href="movies.html" style="background:#e50914;color:#fff;font-family:Poppins,sans-serif;font-size:13px;font-weight:600;padding:10px 24px;border-radius:8px;text-decoration:none;">Browse Movies</a>';
      panel.appendChild(empty);
    } else {
      bookings.slice().reverse().forEach(function(b) {
        var card = document.createElement('div');
        card.style.cssText = 'margin:12px 16px;background:#1a1a1a;border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:16px;';
        var seatsHtml = (b.seats || []).map(function(s) {
          return '<span style="background:rgba(229,9,20,0.15);border:1px solid rgba(229,9,20,0.3);color:#e50914;font-size:10px;font-weight:700;padding:2px 7px;border-radius:20px;font-family:Poppins,sans-serif;">' + s + '</span>';
        }).join(' ');
        card.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;">'
          + '<div style="font-family:Poppins,sans-serif;font-size:14px;font-weight:700;color:#fff;">' + (b.movie || '—') + '</div>'
          + '<div style="font-size:10px;color:#555;font-family:Poppins,sans-serif;white-space:nowrap;margin-left:8px;">' + (b.date || '') + '</div>'
          + '</div>'
          + '<div style="font-size:12px;color:#888;margin-bottom:8px;font-family:Poppins,sans-serif;">' + (b.theatre || '—') + '</div>'
          + '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px;">' + seatsHtml + '</div>'
          + '<div style="display:flex;justify-content:space-between;align-items:center;">'
          + '<div style="font-size:11px;color:#555;font-family:Poppins,sans-serif;">' + (b.payment || '') + '</div>'
          + '<div style="font-family:\'Bebas Neue\',sans-serif;font-size:20px;color:#22c55e;letter-spacing:1px;">' + (b.total || '₹0') + '</div>'
          + '</div>'
          + '<div style="margin-top:8px;font-size:10px;color:#333;font-family:Poppins,sans-serif;border-top:1px solid rgba(255,255,255,0.05);padding-top:8px;">' + (b.bookingId || '') + '</div>';
        panel.appendChild(card);
      });
    }

    overlay.appendChild(panel);
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    overlay.addEventListener('click', function(e) { if (e.target === overlay) closePanel(); });
    hdr.querySelector('#closeBookings').addEventListener('click', closePanel);

    function closePanel() {
      overlay.remove();
      document.body.style.overflow = '';
    }
  }

  /* ═══════════════════════════════════════
     TOAST NOTIFICATION
  ═══════════════════════════════════════ */
  function showToast(msg, duration) {
    var t = document.getElementById('stxToast');
    if (t) t.remove();
    t = document.createElement('div');
    t.id = 'stxToast';
    t.style.cssText = 'position:fixed;bottom:28px;left:50%;transform:translateX(-50%);background:#1e1e1e;border:1px solid rgba(255,255,255,0.12);color:#fff;font-family:Poppins,sans-serif;font-size:13px;padding:12px 22px;border-radius:12px;z-index:9999;box-shadow:0 8px 32px rgba(0,0,0,0.5);animation:toastIn 0.3s ease;max-width:90vw;text-align:center;';
    t.textContent = msg;
    document.body.appendChild(t);
    if (!document.getElementById('stxToastStyle')) {
      var s = document.createElement('style');
      s.id = 'stxToastStyle';
      s.textContent = '@keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(20px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}';
      document.head.appendChild(s);
    }
    setTimeout(function() { if (t.parentNode) t.remove(); }, duration || 3000);
  }
  window.stxShowToast = showToast;

  /* ═══════════════════════════════════════
     SAVE BOOKING TO LOCALSTORAGE
  ═══════════════════════════════════════ */
  window.stxSaveBooking = function(data) {
    var bookings = [];
    try { bookings = JSON.parse(localStorage.getItem('stx_bookings') || '[]'); } catch(e) {}
    data.date = new Date().toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
    bookings.push(data);
    if (bookings.length > 20) bookings = bookings.slice(-20);
    localStorage.setItem('stx_bookings', JSON.stringify(bookings));
    // Reward points: 10 per seat
    var pts = parseInt(localStorage.getItem('stx_points') || '0', 10);
    pts += (data.seats || []).length * 10;
    localStorage.setItem('stx_points', pts.toString());
  };

  /* ═══════════════════════════════════════
     FILTERS
  ═══════════════════════════════════════ */
  function initFilters() {
    var filterGroups = document.querySelectorAll('.filter-group');
    if (!filterGroups.length) return;

    filterGroups.forEach(function(group) {
      var header = group.querySelector('.filter-header');
      if (header) header.addEventListener('click', function() { group.classList.toggle('collapsed'); });
    });

    var allCards = Array.from(document.querySelectorAll('.movie-card'));
    var groupFilters = [];
    filterGroups.forEach(function(group, i) {
      groupFilters[i] = new Set();
      group.querySelectorAll('.filter-options span').forEach(function(pill) {
        pill.addEventListener('click', function() {
          var val = pill.textContent.trim().toLowerCase();
          if (groupFilters[i].has(val)) { groupFilters[i].delete(val); pill.classList.remove('active'); }
          else { groupFilters[i].add(val); pill.classList.add('active'); }
          filterCards();
        });
      });
    });

    var catFilter = new Set();
    document.querySelectorAll('.languages span').forEach(function(pill) {
      pill.addEventListener('click', function() {
        var val = pill.textContent.trim().toLowerCase();
        if (catFilter.has(val)) { catFilter.delete(val); pill.classList.remove('active'); }
        else { catFilter.add(val); pill.classList.add('active'); }
        filterCards();
      });
    });

    function filterCards() {
      var activeGroups = groupFilters.filter(function(s) { return s.size > 0; });
      if (catFilter.size > 0) activeGroups.push(catFilter);
      allCards.forEach(function(card) {
        if (activeGroups.length === 0) { card.style.display = ''; return; }
        var tags = (card.getAttribute('data-tags') || '').toLowerCase();
        var searchIn = tags || card.textContent.toLowerCase();
        var visible = activeGroups.every(function(groupSet) {
          return Array.from(groupSet).some(function(v) { return searchIn.indexOf(v) !== -1; });
        });
        card.style.display = visible ? '' : 'none';
      });
    }

    var container = document.querySelector('.container');
    var filters = document.querySelector('.filters');
    if (container && filters && !document.getElementById('filterToggleBtn')) {
      var btn = document.createElement('button');
      btn.id = 'filterToggleBtn';
      btn.textContent = '🔽  Filters';
      btn.addEventListener('click', function() {
        var open = filters.classList.toggle('filters-open');
        btn.textContent = open ? '🔼  Hide Filters' : '🔽  Filters';
      });
      container.parentNode.insertBefore(btn, container);
    }
  }

  /* ═══════════════════════════════════════
     SETTINGS PANEL
  ═══════════════════════════════════════ */
  function initSettings() {
    var style = document.createElement('style');
    style.textContent = `
      @keyframes stxSlide{from{transform:translateX(100%)}to{transform:translateX(0)}}
      #stxSettingsOverlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:2000;justify-content:flex-end;backdrop-filter:blur(3px);}
      #stxSettingsOverlay.open{display:flex;}
      #stxPanel{background:#141414;width:300px;max-width:92vw;border-left:1px solid rgba(229,9,20,0.2);display:flex;flex-direction:column;overflow-y:auto;animation:stxSlide 0.28s ease;}
      #stxPanel h2{font-family:'Poppins',sans-serif;font-size:17px;font-weight:700;color:#fff;margin:0;}
      .stx-hdr{display:flex;justify-content:space-between;align-items:center;padding:18px 20px;border-bottom:1px solid rgba(255,255,255,0.07);position:sticky;top:0;background:#141414;}
      .stx-close{background:none;border:none;color:#888;font-size:22px;cursor:pointer;padding:2px 8px;border-radius:6px;}
      .stx-close:hover{color:#e50914;}
      .stx-row{display:flex;justify-content:space-between;align-items:center;padding:14px 20px;border-bottom:1px solid rgba(255,255,255,0.05);gap:10px;}
      .stx-label{font-family:'Poppins',sans-serif;font-size:13px;font-weight:500;color:#ccc;flex:1;}
      .stx-row select{background:#222;border:1px solid rgba(255,255,255,0.1);color:#fff;padding:5px 10px;border-radius:6px;font-size:13px;outline:none;cursor:pointer;}
      .stx-btn{background:#e50914;color:#fff;border:none;padding:6px 14px;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;}
      .stx-btn:hover{background:#b0060f;}
      .stx-toggle{position:relative;display:inline-block;width:42px;height:23px;flex-shrink:0;}
      .stx-toggle input{opacity:0;width:0;height:0;}
      .stx-slider{position:absolute;inset:0;background:#333;border-radius:23px;cursor:pointer;transition:.3s;}
      .stx-slider::before{content:'';position:absolute;height:17px;width:17px;left:3px;bottom:3px;background:#fff;border-radius:50%;transition:.3s;}
      .stx-toggle input:checked+.stx-slider{background:#e50914;}
      .stx-toggle input:checked+.stx-slider::before{transform:translateX(19px);}
      .stx-colors{display:flex;gap:8px;}
      .stx-color{width:22px;height:22px;border-radius:50%;cursor:pointer;border:2px solid transparent;transition:.2s;flex-shrink:0;}
      .stx-color:hover,.stx-color.active{border-color:#fff;transform:scale(1.2);}
      .stx-version{font-size:11px;color:#444;text-align:center;padding:16px;}
    `;
    document.head.appendChild(style);

    var wrap = document.createElement('div');
    wrap.id = 'stxSettingsOverlay';
    wrap.innerHTML = `
      <div id="stxPanel">
        <div class="stx-hdr">
          <h2>⚙️ Settings</h2>
          <button class="stx-close" id="stxClose">✕</button>
        </div>
        <div class="stx-row">
          <span class="stx-label">🌙 Dark Mode</span>
          <label class="stx-toggle"><input type="checkbox" id="stxDark" checked><span class="stx-slider"></span></label>
        </div>
        <div class="stx-row">
          <span class="stx-label">🎨 Accent Color</span>
          <div class="stx-colors">
            <span class="stx-color active" data-c="#e50914" style="background:#e50914"></span>
            <span class="stx-color" data-c="#f97316" style="background:#f97316"></span>
            <span class="stx-color" data-c="#8b5cf6" style="background:#8b5cf6"></span>
            <span class="stx-color" data-c="#06b6d4" style="background:#06b6d4"></span>
            <span class="stx-color" data-c="#22c55e" style="background:#22c55e"></span>
          </div>
        </div>
        <div class="stx-row">
          <span class="stx-label">🔤 Font Size</span>
          <select id="stxFont">
            <option value="14px">Small</option>
            <option value="16px" selected>Medium</option>
            <option value="18px">Large</option>
          </select>
        </div>
        <div class="stx-row">
          <span class="stx-label">🏙️ City</span>
          <select id="stxCity">
            <option>Delhi</option><option>Mumbai</option><option>Bangalore</option>
            <option>Chennai</option><option>Hyderabad</option><option>Kolkata</option><option>Pune</option>
          </select>
        </div>
        <div class="stx-row">
          <span class="stx-label">🔔 Notifications</span>
          <label class="stx-toggle"><input type="checkbox" id="stxNotif" checked><span class="stx-slider"></span></label>
        </div>
        <div class="stx-row" style="border:none">
          <span class="stx-label">👤 Account</span>
          <button class="stx-btn" id="stxLogout">Logout</button>
        </div>
        <div class="stx-version">SHOWTIX v1.0</div>
      </div>`;
    document.body.appendChild(wrap);

    wrap.addEventListener('click', function(e) { if (e.target === wrap) closeSettings(); });
    document.getElementById('stxClose').addEventListener('click', closeSettings);

    document.getElementById('stxDark').addEventListener('change', function() {
      localStorage.setItem('stx_dark', this.checked ? '1' : '0');
      applyDark(this.checked);
    });
    document.querySelectorAll('.stx-color').forEach(function(dot) {
      dot.addEventListener('click', function() {
        document.querySelectorAll('.stx-color').forEach(function(d) { d.classList.remove('active'); });
        dot.classList.add('active');
        setAccent(dot.dataset.c);
        localStorage.setItem('stx_accent', dot.dataset.c);
      });
    });
    document.getElementById('stxFont').addEventListener('change', function() {
      document.body.style.fontSize = this.value;
      localStorage.setItem('stx_font', this.value);
    });
    document.getElementById('stxCity').addEventListener('change', function() {
      localStorage.setItem('stx_city', this.value);
      var el = document.querySelector('.city a');
      if (el) el.textContent = this.value;
    });
    document.getElementById('stxLogout').addEventListener('click', function() {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = 'sign.html';
    });

    window.openSettings  = function() { wrap.classList.add('open'); document.body.style.overflow = 'hidden'; };
    window.closeSettings = closeSettings;
    function closeSettings() { wrap.classList.remove('open'); document.body.style.overflow = ''; }
  }

  /* ═══════════════════════════════════════
     APPLY STORED SETTINGS
  ═══════════════════════════════════════ */
  function applyStoredSettings() {
    var accent = localStorage.getItem('stx_accent') || '#e50914';
    setAccent(accent);
    document.querySelectorAll('.stx-color').forEach(function(d) {
      d.classList.toggle('active', d.dataset.c === accent);
    });
    var font = localStorage.getItem('stx_font');
    if (font) {
      document.body.style.fontSize = font;
      var sel = document.getElementById('stxFont');
      if (sel) sel.value = font;
    }
    var city = localStorage.getItem('stx_city') || 'Delhi';
    var cityEl = document.querySelector('.city a');
    if (cityEl) cityEl.textContent = city;
    var citySel = document.getElementById('stxCity');
    if (citySel) citySel.value = city;
    var dark = localStorage.getItem('stx_dark');
    if (dark === '0') {
      applyDark(false);
      var tog = document.getElementById('stxDark');
      if (tog) tog.checked = false;
    }
  }

  function setAccent(color) {
    document.documentElement.style.setProperty('--red', color);
    document.documentElement.style.setProperty('--red-dark', shadeColor(color, -20));
  }
  function applyDark(on) {
    document.documentElement.style.setProperty('--dark', on ? '#0d0d0d' : '#f0f0f0');
    document.body.style.background = on ? '' : '#f0f0f0';
    document.body.style.color = on ? '' : '#111';
  }
  function shadeColor(hex, pct) {
    var n = parseInt(hex.slice(1), 16);
    var amt = Math.round(2.55 * pct);
    var r = Math.min(255, Math.max(0, (n >> 16) + amt));
    var g = Math.min(255, Math.max(0, ((n >> 8) & 0xff) + amt));
    var b = Math.min(255, Math.max(0, (n & 0xff) + amt));
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }
})();
