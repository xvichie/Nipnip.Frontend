import type { StagedOption } from '@/components/dashboard/store/StagedOptionsEditor'

export interface DefaultOptionGroup {
  name: string
  values: string[]
}

function newId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)
}

export function parseDefaultOptions(raw: string | null | undefined): DefaultOptionGroup[] {
  if (!raw) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (g): g is DefaultOptionGroup =>
        !!g && typeof g.name === 'string' && Array.isArray(g.values) && g.values.every((v: unknown) => typeof v === 'string')
    )
  } catch {
    return []
  }
}

export function defaultOptionsToStaged(raw: string | null | undefined): StagedOption[] {
  return parseDefaultOptions(raw).map(group => ({
    id: newId(),
    name: group.name,
    values: group.values.map(value => ({ id: newId(), value })),
  }))
}

export function stagedToDefaultOptionsJson(staged: StagedOption[]): string {
  const groups: DefaultOptionGroup[] = staged
    .filter(o => o.name.trim())
    .map(o => ({ name: o.name.trim(), values: o.values.map(v => v.value).filter(v => v.trim()) }))
  return JSON.stringify(groups)
}
