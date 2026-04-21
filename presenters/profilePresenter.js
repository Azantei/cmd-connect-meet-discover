const CARD_COLORS = ['#2e3a4e', '#3b4a2e', '#3b2e4a', '#4a3b2e', '#2e4a3b'];

/* ========================================
   GET INITIALS
   Derives up to two uppercase initials
   from a display name string
   ======================================== */
function getInitials(name) {
  const parts = (name || '').split(' ').filter(Boolean);
  return parts.slice(0, 2).map(p => p[0].toUpperCase()).join('') || '?';
}

/* ========================================
   TO CARD
   Transforms a raw Post record into a
   display card object for the profile views
   ======================================== */
function toCard(post, defaults, extra) {
  return {
    id: post.id,
    title: post.title || '',
    desc: post.description || '',
    date: post.date ? new Date(post.date).toDateString() : 'Date TBD',
    tags: Array.isArray(post.category) ? post.category : [],
    imageUrl: post.imageUrl || null,
    ...defaults,
    ...extra
  };
}

/* ========================================
   BUILD OTHER PROFILE POST CARDS
   Formats a user's posts for the public
   profile card grid
   ======================================== */
function buildOtherProfilePostCards(posts) {
  return posts.map((p, i) => ({
    id: p.id,
    title: p.title || '',
    desc: p.description || '',
    date: p.date ? new Date(p.date).toDateString() : 'Date not set',
    color: CARD_COLORS[i % CARD_COLORS.length],
    tags: Array.isArray(p.category) ? p.category : [],
    imageUrl: p.imageUrl || null
  }));
}

/* ========================================
   BUILD PROFILE CLIENT DATA
   Shapes all profile tab data into the
   card format consumed by the JS renderer
   ======================================== */
function buildProfileClientData({ posts, upcomingRsvps, pastEvents, drafts, interestedPosts, rsvpCounts }) {
  return {
    myPosts: posts.map(p => toCard(p, { color: '#2e3a4e' }, {
      going: rsvpCounts[p.id] || 0,
      maxAttendees: p.maxAttendees || null,
      status: 'Published'
    })),
    upcomingEvents: upcomingRsvps.map(r => {
      const p = r.Post || {};
      return toCard(p, { color: '#3b4a2e' }, {
        going: rsvpCounts[p.id] || 0,
        maxAttendees: p.maxAttendees || null,
        rsvp: 'Going'
      });
    }),
    previousEvents: pastEvents.map(p => toCard(p, { color: '#2e3a4e' }, {
      going: rsvpCounts[p.id] || 0,
      maxAttendees: p.maxAttendees || null,
      type: 'attended'
    })),
    interestedEvents: interestedPosts.map(p => toCard(p, { color: '#f57c00' }, {
      going: rsvpCounts[p.id] || 0,
      maxAttendees: p.maxAttendees || null
    })),
    drafts: drafts.map(p => toCard(p, { color: '#3b3b3b' }, {
      going: 0,
      status: 'Draft',
      date: 'Draft'
    }))
  };
}

module.exports = { getInitials, toCard, buildOtherProfilePostCards, buildProfileClientData };
