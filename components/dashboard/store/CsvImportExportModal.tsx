'use client'

import { useRef, useState } from 'react'
import { useExportProductsCsv, useImportProductsCsv } from '@/lib/queries/storefront-admin'
import type { ProductImportResult } from '@/lib/types/storefront'

export function CsvImportExportModal() {
  const [open, setOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [result, setResult] = useState<ProductImportResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const exportCsv = useExportProductsCsv()
  const { mutate: importCsv, isPending: isImporting, error: importError } = useImportProductsCsv()

  async function handleExport() {
    setIsExporting(true)
    try {
      await exportCsv()
    } finally {
      setIsExporting(false)
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setResult(null)
    importCsv(file, { onSuccess: setResult })
    e.target.value = ''
  }

  function handleClose() {
    setOpen(false)
    setResult(null)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn btn-sm gap-2 bg-white/4 border-white/10 text-white/70 hover:text-white"
      >
        CSV
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={handleClose}>
          <div
            className="w-full max-w-lg rounded-2xl bg-[#141418] border border-white/10 p-6 flex flex-col gap-5"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">CSV მასობრივი იმპორტი/ექსპორტი</h2>
              <button onClick={handleClose} className="text-white/30 hover:text-white" aria-label="დახურვა">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                  <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="rounded-xl bg-white/2 border border-white/5 p-4 flex flex-col gap-2">
              <p className="text-sm font-semibold text-white">კატალოგის ექსპორტი</p>
              <p className="text-white/40 text-xs">
                გადმოწერს ყველა თქვენს პროდუქტს ცხრილის სახით (Name, Slug, CategoryName, BasePrice, SalePrice, Description, IsActive).
              </p>
              <button
                type="button"
                onClick={handleExport}
                disabled={isExporting}
                className="btn btn-sm self-start bg-white/4 border-white/10 text-white/70 hover:text-white disabled:opacity-40"
              >
                {isExporting ? <span className="loading loading-spinner loading-xs" /> : 'CSV-ის ჩამოტვირთვა'}
              </button>
            </div>

            <div className="rounded-xl bg-white/2 border border-white/5 p-4 flex flex-col gap-2">
              <p className="text-sm font-semibold text-white">ცხრილის იმპორტი</p>
              <p className="text-white/40 text-xs">
                სტრიქონები, რომლებსაც ემთხვევა Slug, ანახლებს იმ პროდუქტს; ცარიელი Slug-ის მქონე (ან ახალი სახელის) სტრიქონები ქმნის ახალს.
                ვარიაციები, სურათები და პარამეტრები კვლავ იმართება პროდუქტის რედაქტორში.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isImporting}
                className="btn btn-sm self-start bg-fuchsia-600 hover:bg-fuchsia-500 border-fuchsia-600 hover:border-fuchsia-500 text-white disabled:opacity-40"
              >
                {isImporting ? <span className="loading loading-spinner loading-xs" /> : 'CSV-ის ატვირთვა'}
              </button>
              {importError && <p className="text-error text-xs">{importError.message}</p>}
            </div>

            {result && (
              <div className="rounded-xl bg-white/2 border border-white/5 p-4 flex flex-col gap-2 max-h-60 overflow-y-auto">
                <p className="text-sm font-semibold text-white">
                  შეიქმნა {result.created} · განახლდა {result.updated} · გამოტოვდა {result.skipped}
                </p>
                {result.rows.filter(r => r.action !== 'created' && r.action !== 'updated').length > 0 && (
                  <div className="flex flex-col gap-1">
                    {result.rows
                      .filter(r => r.action !== 'created' && r.action !== 'updated')
                      .map(r => (
                        <p key={r.rowNumber} className={`text-xs ${r.action === 'skipped' ? 'text-red-400' : 'text-amber-400'}`}>
                          სტრიქონი {r.rowNumber} ({r.name || '—'}): {r.message}
                        </p>
                      ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
