/*
 * CENTRAL THEME CONFIGURATION
 *
 * Index page, PDF viewer aur question-paper galleries isi list se
 * theme buttons aur allowed theme names read karte hain.
 *
 * Naya theme add karne ke liye:
 *
 * 1. Neeche STUDY_HELPER_THEMES list mein ek unique id aur label add karein:
 *
 *    { id: "green", label: "♣ Green" }
 *
 * 2. css/base.css mein same id ka variable block add karein:
 *
 *    html[data-theme="green"] {
 *        --app-background: linear-gradient(135deg, #..., #...);
 *        --app-background-solid: #...;
 *        --app-text: #...;
 *        --app-heading: #...;
 *        --app-muted: #...;
 *        --app-surface: #...;
 *        --app-surface-translucent: rgba(...);
 *        --app-surface-soft: #...;
 *        --app-surface-softer: #...;
 *        --app-border: #...;
 *        --app-border-strong: #...;
 *        --app-primary: #...;
 *        --app-primary-dark: #...;
 *        --app-primary-text: #...;
 *        --app-shadow-color: rgba(...);
 *        --app-paper: #...;
 *        --body-art-opacity: 0.2;
 *        --pdf-filter: none;
 *    }
 *
 * id aur data-theme ka naam bilkul same hona chahiye.
 * Baaki JavaScript files mein theme name manually add karne ki zarurat nahi hai.
 */
window.STUDY_HELPER_THEMES = [
	{ id: "light", label: "☀ Light" },
	{ id: "dark", label: "☾ Dark" },
	{ id: "sepia", label: "◐ Sepia" },
	{ id: "pink", label: "✿ Pink" },
	{ id: "skyblue", label: "☁ Sky Blue" }
];
