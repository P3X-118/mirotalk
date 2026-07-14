'use strict';

// In-page translation is intentionally disabled in this fork: it depended on
// Google Translate (https://translate.google.com/...element.js), a third-party
// external service loaded on every page. To keep the app fully self-contained
// (no external calls), the loader is a no-op. The #google_translate_element
// hooks in the views stay empty. Re-introduce translation only via a
// self-hosted service (e.g. LibreTranslate) if needed.
