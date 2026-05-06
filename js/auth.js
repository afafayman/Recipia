/* ═══════════════════════════════════════════════════════════
   RECIPIA — Auth Module
   Handles Sign Up / Sign In / Sign Out via Supabase Auth
═══════════════════════════════════════════════════════════ */

const AUTH_URL      = 'https://nkqvhktwhqueltbrjcxg.supabase.co/auth/v1';
const SUPABASE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rcXZoa3R3aHF1ZWx0YnJqY3hnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4NTM2MzUsImV4cCI6MjA5MzQyOTYzNX0.p7SEHdhvJLELZ-fCr9jJqQeeNMT1NPL0532VKWjXydI';
const SESSION_KEY   = 'recipia_session';

/* ── CURRENT USER STATE ── */
let currentUser    = null;
let currentSession = null;

/**
 * Loads session from localStorage on startup.
 */
function loadSession() {
  try {
    const saved = JSON.parse(localStorage.getItem(SESSION_KEY));
    if (saved?.access_token) {
      currentSession = saved;
      currentUser    = saved.user;
    }
  } catch { /* ignore */ }
}

/**
 * Saves session to localStorage.
 */
function saveSession(session) {
  currentSession = session;
  currentUser    = session?.user || null;
  if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  else         localStorage.removeItem(SESSION_KEY);
}

/**
 * Returns current logged-in user or null.
 */
function getUser() { return currentUser; }

/**
 * Returns current user ID or null.
 */
function getUserId() { return currentUser?.id || null; }

/**
 * Returns current username from profile or email prefix.
 */
function getUsername() {
  return currentUser?.user_metadata?.username
    || currentUser?.email?.split('@')[0]
    || 'Chef';
}

/* ── SIGN UP ── */
async function signUp(email, password, username) {
  const res = await fetch(`${AUTH_URL}/signup`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY },
    body:    JSON.stringify({
      email, password,
      data: { username },
    }),
  });
  const data = await res.json();
  if (data.error || !data.access_token) {
    throw new Error(data.error?.message || data.msg || 'Sign up failed');
  }
  saveSession(data);

  // Create profile row
  await supabaseRequest('profiles', {
    method: 'POST',
    body:   { id: data.user.id, username, avatar_emoji: '👨‍🍳' },
  }).catch(() => {});

  return data;
}

/* ── SIGN IN ── */
async function signIn(email, password) {
  const res = await fetch(`${AUTH_URL}/token?grant_type=password`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY },
    body:    JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (data.error || !data.access_token) {
    throw new Error(data.error_description || data.error || 'Sign in failed');
  }
  saveSession(data);
  return data;
}

/* ── SIGN OUT ── */
async function signOut() {
  try {
    await fetch(`${AUTH_URL}/logout`, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'apikey':        SUPABASE_KEY,
        'Authorization': `Bearer ${currentSession?.access_token}`,
      },
    });
  } catch { /* ignore */ }
  saveSession(null);
}

/* ── INIT ── */
loadSession();
