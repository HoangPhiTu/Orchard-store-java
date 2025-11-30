"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getLocale, setLocale as saveLocale, getTranslations, t, type Locale, type Translations } from "@/lib/i18n";

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  translations: Translations;
  t: (keyPath: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    // Initialize from localStorage on mount
    if (typeof window !== "undefined") {
      return getLocale();
    }
    return "vi";
  });

  const [translations, setTranslations] = useState<Translations>(() => {
    return getTranslations(locale);
  });

  // Update translations when locale changes
  useEffect(() => {
    setTranslations(getTranslations(locale));
  }, [locale]);

  // Listen for locale changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "orchard_locale" && e.newValue) {
        const newLocale = e.newValue as Locale;
        if (newLocale === "vi" || newLocale === "en") {
          setLocaleState(newLocale);
        }
      }
    };

    const handleLocaleChange = (event: CustomEvent<{ locale: Locale }>) => {
      setLocaleState(event.detail.locale);
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("localechange", handleLocaleChange as EventListener);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("localechange", handleLocaleChange as EventListener);
    };
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    // Save to localStorage
    saveLocale(newLocale);
    // Update state immediately (no reload needed)
    setLocaleState(newLocale);
  }, []);

  const translate = useCallback(
    (keyPath: string) => t(keyPath, locale),
    [locale]
  );

  return (
    <I18nContext.Provider
      value={{
        locale,
        setLocale,
        translations,
        t: translate,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}

