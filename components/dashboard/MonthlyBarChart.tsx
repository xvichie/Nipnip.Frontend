'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  type TooltipProps,
} from 'recharts'

interface ChartEntry {
  label: string
  value: number
  year: number
  month: number
}

interface Props {
  data: ChartEntry[]
  accentColor: string        // e.g. '#8b5cf6'
  accentDimColor: string     // e.g. '#8b5cf620'
  selectedYear?: number
  selectedMonth?: number
  onSelect: (year: number, month: number) => void
  currency?: string
}

function CustomTooltip({ active, payload, currency = '₾' }: TooltipProps<number, string> & { currency?: string }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload as ChartEntry
  return (
    <div className="bg-[#12121c] border border-white/10 rounded-xl px-3 py-2 shadow-xl text-xs">
      <p className="text-white/50 mb-0.5">{d.label}</p>
      <p className="text-white font-bold tabular-nums">
        {(d.value).toFixed(2)} {currency}
      </p>
    </div>
  )
}

export function MonthlyBarChart({
  data,
  accentColor,
  accentDimColor,
  selectedYear,
  selectedMonth,
  onSelect,
  currency,
}: Props) {
  if (!data.length) return null

  return (
    <ResponsiveContainer width="100%" height={140}>
      <BarChart
        data={data}
        barCategoryGap="35%"
        margin={{ top: 8, right: 0, left: 0, bottom: 0 }}
      >
        <XAxis
          dataKey="label"
          tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)', fontFamily: 'inherit' }}
          axisLine={false}
          tickLine={false}
          interval={0}
        />
        <YAxis hide domain={[0, 'auto']} />
        <Tooltip
          content={<CustomTooltip currency={currency} />}
          cursor={{ fill: 'rgba(255,255,255,0.03)', radius: 6 } as object}
        />
        <Bar
          dataKey="value"
          radius={[5, 5, 2, 2]}
          isAnimationActive={false}
          onClick={(entry: ChartEntry) => onSelect(entry.year, entry.month)}
          style={{ cursor: 'pointer' }}
        >
          {data.map(entry => {
            const active = entry.year === selectedYear && entry.month === selectedMonth
            return (
              <Cell
                key={`${entry.year}-${entry.month}`}
                fill={active ? accentColor : accentDimColor}
              />
            )
          })}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
