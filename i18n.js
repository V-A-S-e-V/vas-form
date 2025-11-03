// the local that our app first
const defaultLocale = navigator.language || "en";

// the active locale
let locale;
let translations = {};

// function to set the locale and load translations
document.addEventListener("DOMContentLoaded", async () => {
  // Translate the page to the default locale
  setLocale(defaultLocale);
});

async function setLocale(newLocale) {
  if (newLocale === locale) return;
  const newTranslations = await fetchTranslations(newLocale);
  locale = newLocale;
  translations = newTranslations;
  translatePage();
}


// Retrieve Translation JSON objectt for the given
// locale over the network
async function fetchTranslations(locale) {
  try {
    const response = await fetch(`/locales/${locale}.json`);
    if (!response.ok) throw new Error("Translations not found");
    return await response.json();
  } catch (error) {
    console.error(`Error loading translations for locale ${locale}:`, error);
    return {};
  }
}

function translatePage() {
  document.querySelectorAll("[data-i18n-key]").forEach(translateElement);
}

function translateElement(element) {
  const key = element.getAttribute("data-i18n-key");
  const translation = translations[key];
  if (translation !== undefined) {
    element.innerText = translation;
  } else {
    console.warn(`Missing translation for key: ${key}`);
  }
}
