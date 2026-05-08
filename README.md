# 🍳 Recipia — Smart Recipes, Real Ingredients

> An AI-powered recipe discovery web application that suggests personalized recipes from world cuisines based on the ingredients you already have at home.

**Live Demo:** [recipiaa.vercel.app](https://recipiaa.vercel.app)

---

## 📸 Screenshots

> *(Add screenshots here after deployment)*

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔍 **Ingredient Search** | Type your ingredients and get 6 matching recipes instantly |
| 📸 **Image Detection** | Upload a photo — Gemini AI identifies the ingredients |
| ✨ **Smart Suggestions** | Suggests recipes when you're missing only 1–2 ingredients |
| 📊 **Match Score** | Shows exactly how well your ingredients match each recipe |
| 🥗 **Nutrition Info** | Calories, protein, carbs, and fat per serving |
| ❤️ **Favorites** | Save recipes locally and access them anytime |
| 🔎 **Search & Filter** | Filter by difficulty or search by recipe name |
| 🌙 **Dark Mode** | Full dark/light theme toggle saved in localStorage |
| 🌐 **Bilingual** | Full Arabic and English support with RTL layout |
| 🍽️ **Browse Categories** | 12 world cuisines to explore instantly |
| 📊 **Global & Personal Stats** | Track searches and recipe opens — globally and per user |
| 👤 **User Accounts** | Sign up / Sign in with email and password |
| ⚡ **Smart Cache** | Jaccard similarity matching — reuses results, saves AI tokens |
| 💀 **Skeleton Loaders** | Smooth loading experience while AI fetches recipes |
| 📱 **Fully Responsive** | Works on desktop, tablet, and mobile |

---

## 🗂️ Project Structure

```
recipia/
│
├── index.html              # Semantic HTML structure
├── vercel.json             # Vercel config
├── package.json            # ESM module declaration
│
├── css/
│   └── style.css           # All styles — variables, layout, dark mode, responsive
│
├── js/
│   ├── translations.js     # EN + AR strings + CATEGORIES array
│   ├── database.js         # Supabase — cache, global tracking, personal stats
│   ├── auth.js             # Sign Up / Sign In / Sign Out
│   ├── stats.js            # Local stats (localStorage)
│   ├── api.js              # Groq + Gemini API calls + validation
│   ├── favorites.js        # Favorites save/load
│   ├── ui.js               # All DOM rendering functions
│   └── app.js              # App state + all event listeners
│
└── api/
    ├── ask.js              # Vercel serverless — Groq (3 keys, round robin)
    └── vision.js           # Vercel serverless — Gemini vision (3 keys, round robin)
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| HTML5 Semantic | Structure with ARIA accessibility |
| CSS3 Custom Properties | Theming, animations, dark mode, responsive |
| Vanilla JavaScript ES6+ | App logic, state management |
| Google Fonts | Playfair Display + DM Sans + DM Mono |

### Backend (Vercel Serverless)
| Technology | Purpose |
|---|---|
| Node.js | Runtime |
| Vercel Functions | Serverless API endpoints |

### AI Models
| Model | Purpose |
|---|---|
| Groq LLaMA 3.3 70B | Recipe generation (3 keys, round robin + fallback) |
| Gemini 2.5 Flash Lite | Image ingredient detection (3 keys, round robin + fallback) |

### Database & Auth
| Service | Purpose |
|---|---|
| Supabase | PostgreSQL database + Auth |
| Supabase Auth | Email/password authentication |

### Hosting
| Service | Purpose |
|---|---|
| Vercel | Frontend + Backend (free, no sleep) |
| GitHub | Version control + auto-deploy |

---

## ⚙️ System Architecture

```
User Browser
    ↓
Vercel (Frontend — index.html)
    ↓
/api/ask.js    → Groq AI    (recipes)
/api/vision.js → Gemini AI  (image analysis)
    ↓
Supabase
  ├── recipe_cache   (smart caching — Jaccard similarity)
  ├── searches       (global + personal tracking)
  ├── recipe_opens   (global + personal tracking)
  ├── profiles       (usernames)
  └── auth.users     (email/password auth)
```

---

## 🚀 Getting Started

### Prerequisites
- Groq API keys × 3 → [console.groq.com](https://console.groq.com)
- Gemini API keys × 3 → [aistudio.google.com](https://aistudio.google.com/apikey)
- Supabase project → [supabase.com](https://supabase.com)

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/recipia.git
cd recipia
```

### 2. Deploy to Vercel
1. Push repo to GitHub
2. Connect to [vercel.com](https://vercel.com)
3. Add environment variables:

```
GROQ_API_KEY_1=your_key_1
GROQ_API_KEY_2=your_key_2
GROQ_API_KEY_3=your_key_3
GEMINI_API_KEY_1=your_key_1
GEMINI_API_KEY_2=your_key_2
GEMINI_API_KEY_3=your_key_3
```

### 3. Set up Supabase

Run this SQL in Supabase SQL Editor:

```sql
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  avatar_emoji text default '👨‍🍳',
  created_at timestamp default now()
);

create table searches (
  id uuid default gen_random_uuid() primary key,
  cuisine text,
  user_id uuid references auth.users,
  created_at timestamp default now()
);

create table recipe_opens (
  id uuid default gen_random_uuid() primary key,
  recipe_title text,
  recipe_emoji text,
  user_id uuid references auth.users,
  created_at timestamp default now()
);

create table recipe_cache (
  id uuid default gen_random_uuid() primary key,
  ingredients_key text unique,
  ingredients text[],
  recipes jsonb,
  search_count integer default 1,
  created_at timestamp default now()
);

-- Enable RLS
alter table profiles     enable row level security;
alter table searches     enable row level security;
alter table recipe_opens enable row level security;
alter table recipe_cache enable row level security;

-- Policies
create policy "profiles_select" on profiles for select using (true);
create policy "profiles_insert" on profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on profiles for update using (auth.uid() = id);
create policy "public_searches_insert" on searches for insert with check (true);
create policy "public_searches_select" on searches for select using (true);
create policy "public_opens_insert" on recipe_opens for insert with check (true);
create policy "public_opens_select" on recipe_opens for select using (true);
create policy "public_cache_insert" on recipe_cache for insert with check (true);
create policy "public_cache_select" on recipe_cache for select using (true);
create policy "public_cache_update" on recipe_cache for update using (true);
```

---

## ✅ Best Practices Applied

- **Separation of concerns** — 8 JS files, each with one responsibility
- **Single state object** — all app data in one `state` object
- **Event delegation** — no inline `onclick` handlers
- **Smart caching** — Jaccard similarity matching (80% threshold)
- **API redundancy** — 3 keys per AI service with round robin + fallback
- **API security** — keys stored as Vercel environment variables only
- **Error handling** — all async operations wrapped in try/catch
- **Accessibility** — semantic HTML5, ARIA labels, keyboard navigation
- **i18n** — all UI strings in `translations.js`, LTR + RTL support
- **ESM modules** — modern JavaScript module syntax

---

## 🤖 AI Limits (Free Tier)

| Service | Limit |
|---|---|
| Groq (×3 keys) | ~36,000 tokens/min · ~18,000 requests/day |
| Gemini (×3 keys) | Vision analysis for images |
| Supabase | 500MB database · 50,000 monthly active users |
| Vercel | 100GB bandwidth/month |

---

## 🔮 Future Improvements

- [ ] 🛒 Shopping list for missing ingredients
- [ ] ⭐ Star rating system
- [ ] 🖨️ Print recipe button
- [ ] 📱 PWA — installable on mobile
- [ ] 🔗 Share recipe button
- [ ] 🔄 Sync favorites across devices (cloud)

---

## 👨‍💻 Authors

Built as a college project using modern web technologies and AI.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
