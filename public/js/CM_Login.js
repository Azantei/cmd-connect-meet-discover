/*
  Created for use for C.M.D. with the assistance of AI tools:
  Claude 4.6, Co-Pilot using Claude Somnet 4.5, and Cursor Composer 1.5.
  Logs and further project documents can be found at:
  https://drive.google.com/drive/folders/1UOnmlC70OxJRkkYt0ohzdkyXL9j82hFQ
*/
/* ==========================================
   C.M.D. - LOGIN/SIGNUP
   Tab switching between sign in and sign up forms
========================================== */

/**
 * Switch between sign in and sign up tabs
 * @param {string} tab - Tab identifier ('signin' or 'signup')
 */
function switchTab(tab) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    document.getElementById(tab).classList.add('active');
    const idx = tab === 'signin' ? 0 : 1;
    document.querySelectorAll('.tab-btn')[idx].classList.add('active');
    
    // Initialize interest pills when switching to signup
    if (tab === 'signup') {
        initializeInterestPills();
    }
    
    // Clear all error messages when switching tabs
    clearAllErrors();
}

/**
 * Check URL hash on page load and switch to signup tab if needed
 */
window.addEventListener('DOMContentLoaded', function() {
    if (window.location.hash === '#signup') {
        switchTab('signup');
    } else {
        // Initialize pills on page load if on signup tab
        initializeInterestPills();
    }
});

/**
 * Validate email format
 * @param {string} email - Email address to validate
 * @returns {boolean} - True if valid, false otherwise
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Show error message for a specific input
 * @param {string} inputId - ID of the input element
 * @param {string} errorId - ID of the error message element
 * @param {string} message - Error message to display
 */
function showError(inputId, errorId, message) {
    const input = document.getElementById(inputId);
    const errorElement = document.getElementById(errorId);
    
    if (input) input.classList.add('error');
    if (errorElement) errorElement.textContent = message;
}

/**
 * Clear error message for a specific input
 * @param {string} inputId - ID of the input element
 * @param {string} errorId - ID of the error message element
 */
function clearError(inputId, errorId) {
    const input = document.getElementById(inputId);
    const errorElement = document.getElementById(errorId);
    
    if (input) input.classList.remove('error');
    if (errorElement) errorElement.textContent = '';
}

/**
 * Clear all error messages
 */
function clearAllErrors() {
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    document.querySelectorAll('input.error').forEach(el => el.classList.remove('error'));
}

/**
 * Validate sign in form
 * @param {Event} event - Click event
 */
function validateSignIn(event) {
    event.preventDefault();
    clearAllErrors();
    
    const email = document.getElementById('signin-email').value.trim();
    const password = document.getElementById('signin-password').value;
    let isValid = true;
    
    // Validate email
    if (!email) {
        showError('signin-email', 'signin-email-error', 'Email is required');
        isValid = false;
    } else if (!isValidEmail(email)) {
        showError('signin-email', 'signin-email-error', 'Not a valid email address');
        isValid = false;
    }

    // Validate password
    if (!password) {
        showError('signin-password', 'signin-password-error', 'Password is required');
        isValid = false;
    }
    
    if (isValid) {
        document.getElementById('signinForm').submit();
    }
}

/**
 * Validate sign up form
 * @param {Event} event - Click event
 */
function validateSignUp(event) {
    event.preventDefault();
    clearAllErrors();

    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    let isValid = true;

    if (!name) {
        showError('signup-name', 'signup-name-error', 'Full name is required');
        isValid = false;
    }

    if (!email) {
        showError('signup-email', 'signup-email-error', 'Email is required');
        isValid = false;
    } else if (!isValidEmail(email)) {
        showError('signup-email', 'signup-email-error', 'Not a valid email address');
        isValid = false;
    }

    if (!password) {
        showError('signup-password', 'signup-password-error', 'Password is required');
        isValid = false;
    } else if (!isPasswordStrong(password)) {
        showError('signup-password', 'signup-password-error', 'Password must be at least 8 characters with uppercase, lowercase, and a number');
        isValid = false;
    }

    if (isValid) {
        document.getElementById('signupForm').submit();
    }
}

/**
 * Toggle password visibility
 * @param {string} inputId - ID of the password input
 */
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.parentElement.querySelector('.toggle-password');
    
    if (input.type === 'password') {
        input.type = 'text';
        // Change icon to "eye-off" when password is visible
        button.innerHTML = `
            <svg class="eye-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
        `;
    } else {
        input.type = 'password';
        // Change icon back to "eye" when password is hidden
        button.innerHTML = `
            <svg class="eye-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
            </svg>
        `;
    }
}

// Interest categories
var ALL_INTERESTS = ["Outdoors", "Running", "Coffee", "Music", "Sports", "Food", "Arts", "Tech", "Fitness", "Games", "Photography", "Travel"];

/**
 * Initialize interest pills when tab is shown
 */
function initializeInterestPills() {
    var pillsWrap = document.getElementById('interestPills');
    if (pillsWrap && pillsWrap.children.length === 0) {
        ALL_INTERESTS.forEach(function(interest) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'pill';
            btn.textContent = interest;
            btn.onclick = function() {
                btn.classList.toggle('active');
                clearError('', 'signup-interests-error');
            };
            pillsWrap.appendChild(btn);
        });
    }
}

/**
 * Get selected interests
 * @returns {Array} Array of selected interest names
 */
function getSelectedInterests() {
    var activePills = document.querySelectorAll('#interestPills .pill.active');
    return Array.from(activePills).map(function(pill) { return pill.textContent; });
}

/**
 * Check password strength
 */
function checkPasswordStrength() {
    var password = document.getElementById('signup-password').value;
    var strengthDiv = document.getElementById('password-strength');
    var strengthFill = document.getElementById('strength-fill');
    var strengthText = document.getElementById('strength-text');
    
    if (password.length === 0) {
        strengthDiv.style.display = 'none';
        return;
    }
    
    strengthDiv.style.display = 'block';
    
    var strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    var percentage = (strength / 6) * 100;
    strengthFill.style.width = percentage + '%';
    
    if (strength <= 2) {
        strengthFill.style.backgroundColor = '#e74c3c';
        strengthText.textContent = 'Weak';
        strengthText.style.color = '#e74c3c';
    } else if (strength <= 4) {
        strengthFill.style.backgroundColor = '#f39c12';
        strengthText.textContent = 'Medium';
        strengthText.style.color = '#f39c12';
    } else {
        strengthFill.style.backgroundColor = '#27ae60';
        strengthText.textContent = 'Strong';
        strengthText.style.color = '#27ae60';
    }
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {boolean} True if password meets requirements
 */
function isPasswordStrong(password) {
    if (password.length < 8) return false;
    if (!/[a-z]/.test(password)) return false;
    if (!/[A-Z]/.test(password)) return false;
    if (!/[0-9]/.test(password)) return false;
    return true;
}

/**
 * Called by the "Use My Location" button on the setup form.
 * UC-CM-01 Alternative Flow 1: browser grants geolocation — coordinates are
 * reverse-geocoded via Mapbox and the readable address autofills the input.
 * UC-CM-01 Exception Flow 3: permission denied — inline denial message shown.
 */
function requestGPSLocation() {
    var input = document.getElementById('location');
    var msg   = document.getElementById('location-msg');
    var btn   = document.querySelector('.btn-gps');

    if (!navigator.geolocation) {
        showLocationMsg('Geolocation is not supported by your browser. Please enter your location manually.');
        return;
    }

    if (btn) { btn.disabled = true; btn.style.opacity = '0.6'; }
    if (msg) { msg.style.display = 'none'; msg.textContent = ''; }

    navigator.geolocation.getCurrentPosition(
        function(pos) {
            var lat = pos.coords.latitude;
            var lng = pos.coords.longitude;

            if (!window.MAPBOX_TOKEN) {
                if (input) input.value = lat.toFixed(4) + ', ' + lng.toFixed(4);
                resetGPSButton(btn);
                return;
            }

            // Reverse geocode: lng,lat order required by Mapbox.
            // types=place restricts results to city level so we get "Everett, WA"
            // rather than a full street address.
            var geocodeUrl =
                'https://api.mapbox.com/geocoding/v5/mapbox.places/' +
                lng + ',' + lat +
                '.json?access_token=' + window.MAPBOX_TOKEN + '&limit=1&types=place';

            fetch(geocodeUrl)
                .then(function(r) {
                    if (!r.ok) throw new Error('HTTP ' + r.status);
                    return r.json();
                })
                .then(function(data) {
                    if (data.features && data.features.length) {
                        var feature = data.features[0];
                        var city = feature.text;
                        var regionCtx = feature.context && feature.context.find(function(c) {
                            return c.id.indexOf('region.') === 0;
                        });
                        var state = regionCtx
                            ? (regionCtx.short_code || regionCtx.text).replace(/^US-/i, '')
                            : '';
                        if (input) input.value = state ? city + ', ' + state : city;
                    } else {
                        if (input) input.value = lat.toFixed(4) + ', ' + lng.toFixed(4);
                    }
                    resetGPSButton(btn);
                })
                .catch(function() {
                    if (input) input.value = lat.toFixed(4) + ', ' + lng.toFixed(4);
                    resetGPSButton(btn);
                });
        },
        function() {
            showLocationMsg('Location access denied. Please enter your location manually.');
            resetGPSButton(btn);
        }
    );
}

function showLocationMsg(text) {
    var msg = document.getElementById('location-msg');
    if (msg) { msg.textContent = text; msg.style.display = 'block'; }
}

function resetGPSButton(btn) {
    if (btn) { btn.disabled = false; btn.style.opacity = ''; }
}
