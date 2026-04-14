export type Currency = 'USD' | 'SGD' | 'AUD' | 'JPY' | 'GBP' | 'EUR' | 'CNY'

export interface CurrencyConfig {
  code: Currency
  symbol: string
  name: string
  locale: string
  noDecimals?: boolean // JPY has no sub-units
}

export const CURRENCIES: Record<Currency, CurrencyConfig> = {
  USD: { code: 'USD', symbol: '$',  name: 'US Dollar',          locale: 'en-US' },
  SGD: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar',   locale: 'en-SG' },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar',  locale: 'en-AU' },
  JPY: { code: 'JPY', symbol: '¥',  name: 'Japanese Yen',       locale: 'ja-JP', noDecimals: true },
  GBP: { code: 'GBP', symbol: '£',  name: 'British Pound',      locale: 'en-GB' },
  EUR: { code: 'EUR', symbol: '€',  name: 'Euro',               locale: 'de-DE' },
  CNY: { code: 'CNY', symbol: '¥',  name: 'Chinese Yuan',       locale: 'zh-CN' },
}

export const CURRENCY_LIST = Object.values(CURRENCIES)

/** Full formatted amount, e.g. S$1,234,567 */
export function formatAmount(n: number, currency: Currency): string {
  const cfg = CURRENCIES[currency]
  const rounded = cfg.noDecimals ? Math.round(n) : Math.round(n)
  return cfg.symbol + rounded.toLocaleString(cfg.locale)
}

/** Compact format, e.g. S$1.2M or ¥120M */
export function formatCompact(n: number, currency: Currency): string {
  const cfg = CURRENCIES[currency]
  const sym = cfg.symbol
  if (Math.abs(n) >= 1_000_000) {
    const val = (n / 1_000_000).toFixed(cfg.noDecimals ? 0 : 2)
    return `${sym}${val}M`
  }
  if (Math.abs(n) >= 1_000) {
    const val = (n / 1_000).toFixed(cfg.noDecimals ? 0 : 0)
    return `${sym}${val}K`
  }
  return `${sym}${Math.round(n).toLocaleString(cfg.locale)}`
}

export function getSymbol(currency: Currency): string {
  return CURRENCIES[currency].symbol
}
