import type { ThemeConfig } from '@/lib/types/storefront'

// Card processors (Flitt/Tbc/Bog/CityPay) collapse into a single "Card payment" label — the
// shopper doesn't need to know which processor is wired up behind the scenes.
export function getEnabledPaymentLabels(tokens: Required<ThemeConfig>): string[] {
  const labels: string[] = []
  if (tokens.codEnabled) labels.push('ნაღდი ანგარიშსწორება')
  if (tokens.bankTransferEnabled) labels.push('საბანკო გადარიცხვა')
  if (tokens.flittEnabled || tokens.tbcEnabled || tokens.bogEnabled || tokens.cityPayEnabled) labels.push('ბარათით გადახდა')
  return labels
}
