# 🍳 Recipia — Smart Recipes, Real Ingredients

> An AI-powered recipe discovery web application that suggests personalized recipes from world cuisines based on the ingredients you already have at home.

**Live Demo:** [RECIPIA](https://recipiaa.vercel.app)

---

## 📸 Screenshots

> *<img width="1908" height="1214" alt="image" src="https://github.com/user-attachments/assets/bc528c31-50a9-48a5-a4a9-4d403950fb3a" />*

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