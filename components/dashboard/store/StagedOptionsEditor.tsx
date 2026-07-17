'use client'

import { useState } from 'react'
import { sortOptionValueObjects } from '@/lib/sortOptionValues'

export interface StagedOptionValue {
  id: string
  value: string
}

export interface StagedOption {
  id: string
  name: string
  values: StagedOptionValue[]
}

function newId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)
}

function OptionRow({
  option,
  onChange,
  onRemove,
}: {
  option: StagedOption
  onChange: (next: StagedOption) => void
  onRemove: () => void
}) {
  const [value, setValue] = useState('')

  function handleAddValue(e: React.FormEvent) {
    e.preventDefault()
    if (!value.trim()) return
    onChange({ ...option, values: [...option.values, { id: newId(), value: value.trim() }] })
    setValue('')
  }

  function handleRemoveValue(id: string) {
    onChange({ ...option, values: option.values.filter(v => v.id !== id) })
  }

  return (
    <div className="rounded-xl bg-white/2 border border-white/5 px-4 py-3 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-white">{option.name}</span>
        <button
          type="button"
          onClick={onRemove}
          className="btn btn-xs bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"
        >
          Delete option
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {sortOptionValueObjects(option.values).map(v => (
          <span
            key={v.id}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/8 bg-white/4 px-2 py-1 text-xs text-white/70"
          >
            {v.value}
            <button type="button" onClick={() => handleRemoveValue(v.id)} className="text-white/30 hover:text-red-400">×</button>
          </span>
        ))}
      </div>
      <form onSubmit={handleAddValue} className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="New value (e.g. Large)"
          className="input input-xs flex-1 bg-white/4 border-white/10 focus:border-fuchsia-500/60"
        />
        <button
          type="submit"
          disabled={!value.trim()}
          className="btn btn-xs bg-fuchsia-600 hover:bg-fuchsia-500 border-fuchsia-600 text-white disabled:opacity-40"
        >
          Add
        </button>
      </form>
    </div>
  )
}

export function StagedOptionsEditor({
  options,
  onChange,
}: {
  options: StagedOption[]
  onChange: (next: StagedOption[]) => void
}) {
  const [name, setName] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    onChange([...options, { id: newId(), name: name.trim(), values: [] }])
    setName('')
  }

  return (
    <div className="rounded-2xl border border-white/7 bg-white/2 p-6 flex flex-col gap-4">
      <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">Options</h2>

      {options.length > 0 ? (
        <div className="flex flex-col gap-3">
          {options.map(option => (
            <OptionRow
              key={option.id}
              option={option}
              onChange={next => onChange(options.map(o => (o.id === option.id ? next : o)))}
              onRemove={() => onChange(options.filter(o => o.id !== option.id))}
            />
          ))}
        </div>
      ) : (
        <p className="text-white/30 text-sm">No options yet (e.g. Size, Color).</p>
      )}

      <form onSubmit={handleSubmit} className="flex gap-3 pt-2 border-t border-white/5">
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="New option name (e.g. Size)"
          className="input input-sm flex-1 bg-white/4 border-white/10 focus:border-fuchsia-500/60"
        />
        <button
          type="submit"
          disabled={!name.trim()}
          className="btn btn-sm bg-fuchsia-600 hover:bg-fuchsia-500 border-fuchsia-600 text-white disabled:opacity-40"
        >
          Add Option
        </button>
      </form>
    </div>
  )
}
