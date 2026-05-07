/* ═══════════════════════════════════════════════════════════
   RECIPIA — Auth Module
   Sign Up / Sign In / Sign Out via Supabase Auth
═══════════════════════════════════════════════════════════ */

const AUTH_URL    = 'https://nkqvhktwhqueltbrjcxg.supabase.co/auth/v1';
const SESSION_KEY = 'recipia_session';

let _currentUser    = null;
let _currentSession = null;

/* ── INIT: restore session on page load ── */
(function loadSession() {
  try {
    const saved = JSON.parse(localStorage.getItem(SESSION_KEY));
    if (saved?.access_token) {
      _currentSession = saved;
      _currentUser    = saved.user;
    }
  } catch { /* ignore */ }
})();

/* ── GETTERS ── */
function getUser()     { return _currentUser; }
function getUserId()   { return _currentUser?.id || null; }
function getUsername() {
  return _currentUser?.user_metadata?.username
    || _currentUser?.email?.split('@')[0]
    || 'Chef';
}

/* ── SESSION MANAGEMENT ── */
function saveSession(session) {
  _currentSession = session;
  _currentUser    = session?.user || null;
  if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  else         localStorage.removeItem(SESSION_KEY);
}

/* ── SIGN UP ── */
async function signUp(email, password, username) {
  const res = await fetch(`${AUTH_URL}/signup`, {
    method:  'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey':       SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      email,
      password,
      data: { username },
    }),
  });

  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(data.error?.message || data.msg || 'Sign up failed');
  }
  if (!data.access_token) {
    throw new Error('Please check your email to confirm your account.');
  }

  saveSession(data);

  // Create profile row in profiles table
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
    headers: {
      'Content-Type': 'application/json',
      'apikey':       SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(data.error_description || data.error?.message || 'Invalid email or password');
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
        'apikey':        SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${_currentSession?.access_token}`,
      },
    });
  } catch { /* ignore network errors */ }
  saveSession(null);
}
