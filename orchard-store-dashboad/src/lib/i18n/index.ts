/**
 * i18n (Internationalization) utilities
 * Manages translations for Vietnamese and English
 */

import { translations, type Locale, type Translations } from "./translations";

const DEFAULT_LOCALE: Locale = "vi";
const LOCALE_STORAGE_KEY = "orchard_locale";

/**
 * Get the current locale from localStorage or default to Vietnamese
 */
export function getLocale(): Locale {
  if (typeof window === "undefined") {
    return DEFAULT_LOCALE;
  }

  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored === "vi" || stored === "en") {
      return stored as Locale;
    }
  } catch (error) {
    console.warn("Failed to read locale from localStorage", error);
  }

  return DEFAULT_LOCALE;
}

/**
 * Set the locale and save to localStorage
 */
export function setLocale(locale: Locale): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    // Trigger a custom event so components can react to locale changes
    window.dispatchEvent(
      new CustomEvent("localechange", { detail: { locale } })
    );
  } catch (error) {
    console.warn("Failed to save locale to localStorage", error);
  }
}

/**
 * Get translations for the current locale
 */
export function getTranslations(locale?: Locale): Translations {
  const currentLocale = locale || getLocale();
  return translations[currentLocale];
}

/**
 * Get a nested translation value by key path
 * Example: t("auth.login.welcomeBack") => "Chào mừng trở lại"
 */
export function t(keyPath: string, locale?: Locale): string {
  const currentLocale = locale || getLocale();
  const keys = keyPath.split(".");
  let value: unknown = translations[currentLocale];

  for (const key of keys) {
    if (value && typeof value === "object" && key in value) {
      value = (value as Record<string, unknown>)[key];
    } else {
      console.warn(`Translation key not found: ${keyPath}`);
      return keyPath; // Return the key path if not found
    }
  }

  return typeof value === "string" ? value : keyPath;
}

// Export types and translations
export { translations, type Locale, type Translations };
