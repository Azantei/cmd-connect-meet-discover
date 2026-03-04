// Post type toggle
function setType(type) {
    document.getElementById('btn-casual').classList.remove('active');
    document.getElementById('btn-formal').classList.remove('active');
    document.getElementById('btn-' + type).classList.add('active');

    var rsvp = document.getElementById('rsvpWrapper');
    if (type === 'formal') {
        rsvp.classList.add('visible');
    } else {
        rsvp.classList.remove('visible');
    }
}

// Category pill toggle
function toggleCat(el) {
    el.classList.toggle('active');
}

// RSVP toggle
function toggleRsvp() {
    var toggle = document.getElementById('rsvpToggle');
    toggle.classList.toggle('on');
}
