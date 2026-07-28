import { ka } from '@/strings/storefront-ka'
import { en } from '@/strings/storefront-en'
import { ru } from '@/strings/storefront-ru'
import type { StorefrontStrings } from '@/strings/storefront-ka'

export type StorefrontLanguage = 'ka' | 'en' | 'ru'
export type { StorefrontStrings }

export const STOREFRONT_LANG_COOKIE = 'nn_store_lang'

export const STOREFRONT_STRINGS: Record<StorefrontLanguage, StorefrontStrings> = { ka, en, ru }
