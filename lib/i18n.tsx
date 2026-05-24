'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { ka } from '@/strings/ka'
import { en } from '@/strings/en'
import { ru } from '@/strings/ru'
import type { Strings } from '@/strings/ka'

export type Language = 'ka' | 'en' | 'ru'
export type { Strings }

const STRINGS: Record<Language, Strings> = { ka, en, ru }

interface LanguageContextValue {
  lang: Language
  setLang: (lang: Language) => void
  t: Strings
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'ka',
  setLang: () => {},
  t: ka,
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>('ka')

  useEffect(() => {
    const saved = localStorage.getItem('nipnip-lang') as Language | null
    if (saved && saved in STRINGS) setLangState(saved)
  }, [])

  function setLang(l: Language) {
    setLangState(l)
    localStorage.setItem('nipnip-lang', l)
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: STRINGS[lang] }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
