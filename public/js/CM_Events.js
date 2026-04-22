/*
  Created for use for C.M.D. with the assistance of AI tools:
  Claude 4.6, Co-Pilot using Claude Somnet 4.5, and Cursor Composer 1.5.
  Logs and further project documents can be found at:
  https://drive.google.com/drive/folders/1UOnmlC70OxJRkkYt0ohzdkyXL9j82hFQ
*/
/* ==========================================
   C.M.D. - FEED PAGE
   Category filtering, search, card display, and map
========================================== */

var selectedCategories = new Set(window.INIT_CATEGORIES || []);

/* ------------------------------------------
   FILTER PANEL
------------------------------------------ */

function toggleFilterPanel() {
    var panel   = document.getElementById('filterPanel');
    var overlay = document.getElementById('filterOverlay');
    if (panel.style.display === 'none' || !panel.style.display) {
        panel.style.display   = 'flex';
        if (overlay) overlay.style.display = 'block';
    } else {
        panel.style.display   = 'none';
        if (overlay) overlay.style.display = 'none';
    }
}

function updateFilterBadge() {
    var count    = selectedCategories.size;
    var badge    = document.getElementById('filterCount');
    var clearBtn = document.getElementById('clearFiltersBtn');
    if (!badge || !clearBtn) return;
    if (count > 0) {
        badge.textContent      = count;
        badge.style.display    = 'inline-block';
        clearBtn.style.display = 'block';
    } else {
        badge.style.display    = 'none';
        clearBtn.style.display = 'none';
    }
}

/**
 * Called by onclick="toggleFilterPill(this)" on each category pill button.
 * data-category is the attribute rendered by the EJS template.
 */
function toggleFilterPill(pill) {
    var cat = pill.dataset.category;
    if (selectedCategories.has(cat)) {
        selectedCategories.delete(cat);
        pill.classList.remove('active');
    } else {
        selectedCategories.add(cat);
        pill.classList.add('active');
    }
    updateFilterBadge();
}

/**
 * Build and navigate to a filtered /posts URL.
 * Called by onchange on the dateFilter and distanceFilter selects.
 * When the user picks "Custom range..." we reveal the date inputs and wait
 * for them to fill in dates before navigating.
 */
function applyFilters() {
    var dateFilterEl = document.getElementById('dateFilter');
    var customRange  = document.getElementById('customDateRange');

    if (dateFilterEl && customRange) {
        var isCustom = dateFilterEl.value === 'custom';
        customRange.style.display = isCustom ? 'block' : 'none';
        if (isCustom) return; // wait for the user to pick dates
    }

    var params = new URLSearchParams();
    var searchEl = document.getElementById('search-input');
    if (searchEl && searchEl.value.trim()) params.set('q', searchEl.value.trim());
    selectedCategories.forEach(function(cat) { params.append('category', cat); });

    if (dateFilterEl && dateFilterEl.value !== 'all' && dateFilterEl.value !== 'custom') {
        var now = new Date();
        var start, end;
        if (dateFilterEl.value === 'today') {
            start = end = toISODate(now);
        } else if (dateFilterEl.value === 'tomorrow') {
            var tom = new Date(now); tom.setDate(now.getDate() + 1);
            start = end = toISODate(tom);
        } else if (dateFilterEl.value === 'thisweek') {
            start = toISODate(now);
            var eow = new Date(now); eow.setDate(now.getDate() + (6 - now.getDay()));
            end = toISODate(eow);
        } else if (dateFilterEl.value === 'thismonth') {
            start = toISODate(now);
            var eom = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            end = toISODate(eom);
        }
        if (start) params.set('dateFrom', start);
        if (end)   params.set('dateTo', end);
    }

    window.location.href = '/posts' + (params.toString() ? '?' + params.toString() : '');
}

/** Called by onchange on the custom startDate / endDate inputs. */
function applyCustomDateFilter() {
    var startEl = document.getElementById('startDate');
    var endEl   = document.getElementById('endDate');
    if (!startEl || !endEl || (!startEl.value && !endEl.value)) return;

    var params = new URLSearchParams();
    var searchEl = document.getElementById('search-input');
    if (searchEl && searchEl.value.trim()) params.set('q', searchEl.value.trim());
    selectedCategories.forEach(function(cat) { params.append('category', cat); });
    if (startEl.value) params.set('dateFrom', startEl.value);
    if (endEl.value)   params.set('dateTo', endEl.value);
    window.location.href = '/posts' + (params.toString() ? '?' + params.toString() : '');
}

function clearAllFilters() {
    var searchEl = document.getElementById('search-input');
    var q = searchEl ? searchEl.value.trim() : '';
    window.location.href = '/posts' + (q ? '?q=' + encodeURIComponent(q) : '');
}

function toISODate(d) {
    return d.toISOString().split('T')[0];
}

/* ------------------------------------------
   SEARCH
------------------------------------------ */

function performSearch() {
    // Server-side search; live filtering not implemented
}

function handleSearchKeypress(event) {
    // Native form submit handles Enter
}

/* ------------------------------------------
   STAR / INTERESTED
------------------------------------------ */

function toggleStar(button) {
    var card   = button.closest('.card');
    var postId = card.dataset.postId;
    var wasInterested = button.classList.contains('interested');
    var method = wasInterested ? 'DELETE' : 'POST';

    fetch('/users/interests/' + postId, { method: method })
        .then(function(response) {
            if (!response.ok) throw new Error('Failed to update interested state');
            button.classList.toggle('interested', !wasInterested);
        })
        .catch(function() {
            alert('Unable to update interested events right now. Please try again.');
        });
}

/* ------------------------------------------
   MAP
------------------------------------------ */

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/**
 * Initialise a Mapbox GL JS map in #map, geocode each post's location
 * string, and place a marker + popup for every post that resolves.
 * Token and post data are injected by the EJS template as
 * window.MAPBOX_TOKEN and window.POSTS_DATA.
 *
 * Geocoding and marker placement run inside map.on('load') so the map's
 * rendering pipeline is fully ready before any markers are added.
 */
function initMap() {
    console.log('[CMD Map] initMap() called');

    if (!window.MAPBOX_TOKEN) {
        console.warn('[CMD Map] window.MAPBOX_TOKEN is missing — map aborted');
        return;
    }
    if (typeof mapboxgl === 'undefined') {
        console.warn('[CMD Map] mapboxgl not defined — CDN may not have loaded');
        return;
    }

    mapboxgl.accessToken = window.MAPBOX_TOKEN;

    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [-122.2021, 47.9790], // Everett, WA [lng, lat]
        zoom: 11
    });

    map.addControl(new mapboxgl.NavigationControl());

    var posts = window.POSTS_DATA || [];
    var locatedPosts = posts.filter(function(p) { return p.location; });

    console.log('[CMD Map] POSTS_DATA total:', posts.length, '| with location:', locatedPosts.length);
    if (locatedPosts.length === 0) {
        console.warn('[CMD Map] No posts have a location value — no markers will appear');
    }

    // Wait for the map style to fully load before adding markers so the
    // rendering pipeline is ready to accept and display them.
    map.on('load', function() {
        console.log('[CMD Map] Map style loaded — starting geocoding');

        locatedPosts.forEach(function(post) {
            var geocodeUrl =
                'https://api.mapbox.com/geocoding/v5/mapbox.places/' +
                encodeURIComponent(post.location) +
                '.json?access_token=' + window.MAPBOX_TOKEN + '&limit=1';

            console.log('[CMD Map] Geocoding post', post.id, '— "' + post.location + '"');

            fetch(geocodeUrl)
                .then(function(r) {
                    if (!r.ok) throw new Error('Geocode API returned HTTP ' + r.status);
                    return r.json();
                })
                .then(function(data) {
                    if (!data.features || !data.features.length) {
                        console.warn('[CMD Map] No geocode result for "' + post.location + '"');
                        return;
                    }

                    var coords = data.features[0].center; // [lng, lat]
                    console.log('[CMD Map] Placing marker for "' + post.title + '" at', coords);

                    var dateStr = post.date
                        ? new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : 'Date TBD';

                    var popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
                        '<div style="font-family:\'DM Sans\',sans-serif;padding:4px 2px;min-width:160px;">' +
                        '<strong style="font-size:0.9rem;display:block;margin-bottom:4px;">' +
                            escapeHtml(post.title) +
                        '</strong>' +
                        '<span style="color:#666;font-size:0.8rem;">&#128197; ' + dateStr + '</span><br>' +
                        '<a href="/posts/' + post.id + '" ' +
                           'style="color:hsl(20,90%,55%);font-size:0.85rem;text-decoration:none;">' +
                           'View Post &#8594;</a>' +
                        '</div>'
                    );

                    new mapboxgl.Marker({ color: 'hsl(20,90%,55%)' })
                        .setLngLat(coords)
                        .setPopup(popup)
                        .addTo(map);
                })
                .catch(function(err) {
                    console.error('[CMD Map] Geocode failed for "' + post.location + '":', err);
                });
        });
    });
}

/* ------------------------------------------
   INIT
------------------------------------------ */

document.addEventListener('DOMContentLoaded', function() {
    // Mark category pills that are already active from server state
    document.querySelectorAll('.filter-pill').forEach(function(pill) {
        if (selectedCategories.has(pill.dataset.category)) {
            pill.classList.add('active');
        }
    });

    // Wire custom date range inputs (revealed when dateFilter = "custom")
    var startEl = document.getElementById('startDate');
    var endEl   = document.getElementById('endDate');
    if (startEl) startEl.addEventListener('change', applyCustomDateFilter);
    if (endEl)   endEl.addEventListener('change', applyCustomDateFilter);

    updateFilterBadge();
    initMap();
});
