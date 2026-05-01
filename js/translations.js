/* ═══════════════════════════════════════════════════════════
   RECIPIA — Translations
   Supports: English (en), Arabic (ar)
═══════════════════════════════════════════════════════════ */

const TRANSLATIONS = {
  en: {
    // Header & Nav
    tagline:           'Smart Recipes, Real Ingredients',
    navExplore:        'Explore',
    navCategories:     'Categories',
    navStats:          '📊 Stats',
    navFavorites:      '❤️ Favorites',
    // Hero
    heroTitle:         "What's cooking in your<br/><em>kitchen</em> today?",
    heroSub:           "Tell us what ingredients you have and we'll find you delicious recipes from cuisines all around the world.",
    eyebrow:           'Smart Recipes, Real Ingredients',
    // Input
    tabText:           'Type Ingredients',
    tabImg:            'Upload Photos',
    findBtn:           'Find Recipes',
    inputHint:         'Separate ingredients with commas.',
    inputPlaceholder:  'e.g. chicken, garlic, lemon, olive oil…',
    uploadTitle:       'Drop your photos here',
    uploadSub:         'or click to browse files',
    analyzeBtn:        'Analyse & Find Recipes',
    // Loading
    loading1:          'Working the kitchen…',
    loading2:          'Finding the best recipes…',
    // Results
    foundRecipes:      'Found',
    forYou:            'recipes for you',
    basedOn:           'Based on',
    ingredients:       'ingredients',
    smartSugg:         'smart suggestions',
    yourIngredients:   'Your Ingredients',
    allFilter:         'All',
    easyFilter:        'Easy',
    mediumFilter:      'Medium',
    hardFilter:        'Hard',
    searchPlaceholder: 'Search recipes…',
    // Recipe card & modal
    viewRecipe:        'View Recipe →',
    match:             'Match',
    atAGlance:         'At a Glance',
    ingredientsSection:'Ingredients',
    preparation:       'Preparation',
    nutritionSection:  'Nutrition (per serving)',
    chefTip:           "Chef's Tip",
    prep:              'Prep',
    cook:              'Cook',
    servings:          'Servings',
    difficulty:        'Difficulty',
    calories:          'Calories',
    protein:           'Protein',
    carbs:             'Carbs',
    fat:               'Fat',
    // Categories page
    catTitle:          'Browse Categories',
    catSubtitle:       'Pick a cuisine and discover recipes instantly',
    catLoading:        'Loading recipes for',
    // Stats page
    statsTitle:        'Your Stats',
    statsSubtitle:     'Your personal Recipia activity',
    statSearches:      'Total Searches',
    statFavorites:     'Saved Favorites',
    statTopCuisine:    'Top Cuisine',
    statTopRecipe:     'Most Opened Recipe',
    statTopIngredients:'Top Cuisines Explored',
    statRecentRecipes: 'Most Opened Recipes',
    statNoData:        'No data yet — start searching!',
    statReset:         'Reset Stats',
    statTimes:         'times',
    // Favorites page
    favPageTitle:      'Your Favorites',
    favSub:            "Recipes you've saved for later",
    emptyFav:          'No favorites yet',
    emptyFavSub:       'Tap ❤️ on any recipe to save it here',
    // Footer
    footerText:        'Discover flavors from every corner of the world',
    // Lang toggle
    langBtn:           '🌐 العربية',
    // Errors
    wrongTitle:        'Something went wrong',
    errorImg:          'Could not analyse images: ',
    errorRecipes:      'Could not load recipes: ',
    // Funny rejection messages
    notFoodTitle:      "Hmm… that doesn't look like food! 🤔",
    notFoodMessages: [
      "I'm a chef, not a philosopher! 🧑‍🍳 Try: chicken, garlic, lemon.",
      "My pots only understand ingredients… not riddles! 🍳",
      "I searched my entire kitchen and couldn't find that. Try real ingredients! 🥦",
      "Even Gordon Ramsay can't cook that. Give me actual ingredients! 👨‍🍳",
      "My AI brain is trained on recipes, not on whatever that was! 😅",
      "That's not on the menu. Try: tomato, pasta, olive oil! 🍝",
    ],
    // Image validation
    invalidImage:      'is not a supported image format. Use JPG, PNG, or WEBP.',
    imageTooLarge:     'is too large. Max size is 5MB.',
  },

  ar: {
    // Header & Nav
    tagline:           'وصفات ذكية، مكونات حقيقية',
    navExplore:        'استكشاف',
    navCategories:     'التصنيفات',
    navStats:          '📊 إحصائيات',
    navFavorites:      '❤️ المفضلة',
    // Hero
    heroTitle:         'ماذا يوجد في<br/><em>مطبخك</em> اليوم؟',
    heroSub:           'أخبرنا بالمكونات المتاحة لديك وسنجد لك وصفات لذيذة من مطابخ العالم.',
    eyebrow:           'وصفات ذكية، مكونات حقيقية',
    // Input
    tabText:           'اكتب المكونات',
    tabImg:            'رفع صور',
    findBtn:           'ابحث عن وصفات',
    inputHint:         'افصل المكونات بفواصل.',
    inputPlaceholder:  'مثال: دجاج، ثوم، ليمون، زيت زيتون…',
    uploadTitle:       'اسحب صورك هنا',
    uploadSub:         'أو اضغط لاختيار ملفات',
    analyzeBtn:        'تحليل وإيجاد وصفات',
    // Loading
    loading1:          'جاري العمل في المطبخ…',
    loading2:          'جاري البحث عن أفضل الوصفات…',
    // Results
    foundRecipes:      'تم إيجاد',
    forYou:            'وصفة لك',
    basedOn:           'بناءً على',
    ingredients:       'مكونات',
    smartSugg:         'اقتراحات ذكية',
    yourIngredients:   'مكوناتك',
    allFilter:         'الكل',
    easyFilter:        'سهل',
    mediumFilter:      'متوسط',
    hardFilter:        'صعب',
    searchPlaceholder: 'ابحث عن وصفة…',
    // Recipe card & modal
    viewRecipe:        'عرض الوصفة ←',
    match:             'تطابق',
    atAGlance:         'نظرة سريعة',
    ingredientsSection:'المكونات',
    preparation:       'طريقة التحضير',
    nutritionSection:  'القيمة الغذائية (لكل وجبة)',
    chefTip:           'نصيحة الشيف',
    prep:              'تحضير',
    cook:              'طهي',
    servings:          'حصص',
    difficulty:        'صعوبة',
    calories:          'سعرات',
    protein:           'بروتين',
    carbs:             'كربوهيدرات',
    fat:               'دهون',
    // Categories page
    catTitle:          'تصفح التصنيفات',
    catSubtitle:       'اختر مطبخاً واكتشف الوصفات فوراً',
    catLoading:        'جاري تحميل وصفات',
    // Stats page
    statsTitle:        'إحصائياتك',
    statsSubtitle:     'نشاطك الشخصي على ريسيبيا',
    statSearches:      'إجمالي عمليات البحث',
    statFavorites:     'المفضلة المحفوظة',
    statTopCuisine:    'أكثر مطبخ',
    statTopRecipe:     'أكثر وصفة فُتحت',
    statTopIngredients:'أكثر المطابخ استكشافاً',
    statRecentRecipes: 'أكثر الوصفات فتحاً',
    statNoData:        'لا توجد بيانات بعد — ابدأ البحث!',
    statReset:         'إعادة تعيين الإحصائيات',
    statTimes:         'مرات',
    // Favorites page
    favPageTitle:      'المفضلة',
    favSub:            'الوصفات التي حفظتها',
    emptyFav:          'لا توجد مفضلة بعد',
    emptyFavSub:       'اضغط ❤️ على أي وصفة لحفظها هنا',
    // Footer
    footerText:        'اكتشف نكهات من كل أرجاء العالم',
    // Lang toggle
    langBtn:           '🌐 English',
    // Errors
    wrongTitle:        'حدث خطأ ما',
    errorImg:          'تعذر تحليل الصور: ',
    errorRecipes:      'تعذر تحميل الوصفات: ',
    // Funny rejection messages
    notFoodTitle:      '!هممم… هذا لا يبدو طعاماً 🤔',
    notFoodMessages: [
      "!أنا طباخ مش فيلسوف 🧑‍🍳 جرب: دجاج، ثوم، ليمون",
      "!قدوري بيفهم في المكونات بس، مش في الألغاز 🍳",
      "!فتشت في كل المطبخ ملقتش حاجة زي دي. جرب مكونات حقيقية 🥦",
      "!حتى الشيف رمزي مش قادر يطبخ ده. هاتلي مكونات صح 👨‍🍳",
      "!دماغي الذكية اتدربت على وصفات، مش على اللي كتبته ده 😅",
      "!ده مش موجود في المنيو. جرب: طماطم، معكرونة، زيت زيتون 🍝",
    ],
    // Image validation
    invalidImage:      'ليس تنسيق صورة مدعوم. استخدم JPG أو PNG أو WEBP.',
    imageTooLarge:     'حجم الملف كبير جداً. الحد الأقصى 5 ميغابايت.',
  },
};

/* ── CATEGORIES (shared, not translated — emoji + name speaks for itself) ── */
const CATEGORIES = [
  { id: 'italian',     emoji: '🍝', name: 'Italian',      nameAr: 'إيطالي',      ingredient: 'pasta, tomato, basil, olive oil, parmesan' },
  { id: 'mexican',     emoji: '🌮', name: 'Mexican',      nameAr: 'مكسيكي',      ingredient: 'tortilla, beef, avocado, lime, jalapeño' },
  { id: 'indian',      emoji: '🍛', name: 'Indian',       nameAr: 'هندي',        ingredient: 'chicken, curry, turmeric, ginger, rice' },
  { id: 'chinese',     emoji: '🥢', name: 'Chinese',      nameAr: 'صيني',        ingredient: 'soy sauce, ginger, garlic, noodles, sesame' },
  { id: 'japanese',    emoji: '🍱', name: 'Japanese',     nameAr: 'ياباني',      ingredient: 'rice, soy sauce, mirin, tofu, seaweed' },
  { id: 'middleeastern',emoji: '🧆',name: 'Middle Eastern',nameAr: 'شرق أوسطي', ingredient: 'chickpeas, tahini, cumin, garlic, lemon' },
  { id: 'french',      emoji: '🥐', name: 'French',       nameAr: 'فرنسي',       ingredient: 'butter, cream, garlic, thyme, wine' },
  { id: 'american',    emoji: '🍔', name: 'American',     nameAr: 'أمريكي',      ingredient: 'beef, cheese, potato, onion, ketchup' },
  { id: 'mediterranean',emoji:'🥗', name: 'Mediterranean',nameAr: 'متوسطي',      ingredient: 'olive oil, lemon, feta, tomato, cucumber' },
  { id: 'thai',        emoji: '🍜', name: 'Thai',         nameAr: 'تايلاندي',    ingredient: 'coconut milk, lemongrass, fish sauce, chili, rice' },
  { id: 'moroccan',    emoji: '🫕', name: 'Moroccan',     nameAr: 'مغربي',       ingredient: 'lamb, couscous, cinnamon, cumin, apricot' },
  { id: 'greek',       emoji: '🫒', name: 'Greek',        nameAr: 'يوناني',      ingredient: 'feta, olive, lemon, oregano, lamb' },
];
