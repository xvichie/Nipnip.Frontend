'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useMerchantSnippet } from '@/lib/queries/merchants'
import { useLanguage } from '@/lib/i18n'
import { apiFetch } from '@/lib/api'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? ''

type Platform = 'woo' | 'custom'
type TestStatus = 'idle' | 'testing' | 'connected' | 'failed'
type ExTab = 'php' | 'js'

function buildPhpExample(key: string, api: string) {
  return `<?php
// Order confirmation / thank-you page
// Replace $order_id and $amount with your actual values
$order_id = '12345';   // e.g. $order->get_id()
$amount   = 99.90;     // e.g. $order->get_total()

$ref = $_COOKIE['_nn_ref'] ?? '';
if ($ref !== '') {
    $ch = curl_init('${api}/api/conversions/track');
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER     => [
            'Content-Type: application/json',
            'X-Merchant-Key: ${key}',
        ],
        CURLOPT_POSTFIELDS => json_encode([
            'ref'      => $ref,
            'orderId'  => (string) $order_id,
            'amount'   => (float)  $amount,
            'currency' => 'GEL',
        ]),
    ]);
    curl_exec($ch);
    curl_close($ch);
}`
}

function buildJsExample(key: string, api: string) {
  return `// Order confirmation page
// Replace orderId and amount with your actual values
const orderId = '12345';  // e.g. document.getElementById('order-id').textContent
const amount  = 99.90;    // e.g. parseFloat(document.getElementById('total').dataset.amount)

const m = document.cookie.match(/(^|;\\s*)_nn_ref=([^;]+)/);
if (m) {
  fetch('${api}/api/conversions/track', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Merchant-Key': '${key}',
    },
    body: JSON.stringify({
      ref: decodeURIComponent(m[2]),
      orderId,
      amount,
      currency: 'GEL',
    }),
  });
}`
}

const COPY_ICON = (
  <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden>
    <rect x="3.5" y="3.5" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.3"/>
    <path d="M7.5 3.5V2.5A1 1 0 0 0 6.5 1.5h-4A1 1 0 0 0 1.5 2.5v4A1 1 0 0 0 2.5 7.5h1" stroke="currentColor" strokeWidth="1.3"/>
  </svg>
)
const CHECK_ICON = (
  <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden>
    <path d="M1.5 5.5l2.5 2.5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

function CopyBtn({
  copied, onCopy, copyLabel, copiedLabel, size = 'xs',
}: {
  copied: boolean
  onCopy: () => void
  copyLabel: string
  copiedLabel: string
  size?: 'xs' | 'sm'
}) {
  return (
    <button
      onClick={onCopy}
      className={[
        size === 'xs' ? 'btn btn-xs' : 'btn btn-sm',
        'rounded-lg px-3 gap-1.5 normal-case font-medium transition-all',
        copied
          ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
          : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10',
      ].join(' ')}
    >
      {copied ? <>{CHECK_ICON}{copiedLabel}</> : <>{COPY_ICON}{copyLabel}</>}
    </button>
  )
}

function SnippetCard({
  label, accent, code, desc, copied, onCopy, copyLabel, copiedLabel,
}: {
  label: string
  accent: 'violet' | 'fuchsia'
  code: string
  desc: string
  copied: boolean
  onCopy: () => void
  copyLabel: string
  copiedLabel: string
}) {
  const badge = accent === 'violet'
    ? 'bg-violet-500/10 border-violet-500/20 text-violet-400'
    : 'bg-fuchsia-500/10 border-fuchsia-500/20 text-fuchsia-400'
  const dot = accent === 'violet' ? 'bg-violet-400/50' : 'bg-fuchsia-400/50'

  return (
    <div className="rounded-2xl border border-white/8 bg-[#0f0f18] overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/6">
        <div className="flex items-center gap-2.5">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400/30" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/30" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/30" />
          </div>
          <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-md border ${badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
            {label}
          </span>
        </div>
        <CopyBtn copied={copied} onCopy={onCopy} copyLabel={copyLabel} copiedLabel={copiedLabel} />
      </div>
      <pre className="px-5 py-4 text-[11px] leading-relaxed font-mono text-white/60 overflow-x-auto bg-[#08080d]" style={{ scrollbarWidth: 'none' }}>
        {code}
      </pre>
      <div className="px-5 py-3 border-t border-white/6 bg-white/1">
        <p className="text-xs text-white/40 leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}

function CodeBlock({
  lang, code, copied, onCopy, copyLabel, copiedLabel,
}: {
  lang: string
  code: string
  copied: boolean
  onCopy: () => void
  copyLabel: string
  copiedLabel: string
}) {
  return (
    <div className="rounded-xl border border-white/8 bg-[#0f0f18] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/6">
        <span className="text-[11px] font-semibold text-white/30 uppercase tracking-wider">{lang}</span>
        <CopyBtn copied={copied} onCopy={onCopy} copyLabel={copyLabel} copiedLabel={copiedLabel} />
      </div>
      <pre className="px-4 py-4 text-[11px] leading-relaxed font-mono text-white/60 overflow-x-auto bg-[#08080d]" style={{ scrollbarWidth: 'none' }}>
        {code}
      </pre>
    </div>
  )
}

export default function IntegrationPage() {
  const { data, isLoading, isError } = useMerchantSnippet()
  const { t } = useLanguage()

  const [platform, setPlatform] = useState<Platform>('custom')
  const [exTab, setExTab] = useState<ExTab>('php')
  const [copied1, setCopied1] = useState(false)
  const [copied2, setCopied2] = useState(false)
  const [copiedKey, setCopiedKey] = useState(false)
  const [copiedEx, setCopiedEx] = useState(false)
  const [testStatus, setTestStatus] = useState<TestStatus>('idle')
  const [connectedName, setConnectedName] = useState('')

  function doCopy(text: string, setFn: (v: boolean) => void) {
    navigator.clipboard.writeText(text)
    setFn(true)
    setTimeout(() => setFn(false), 2000)
  }

  function switchPlatform(p: Platform) {
    setPlatform(p)
    setTestStatus('idle')
    setConnectedName('')
  }

  async function testConnection() {
    if (!data?.apiKey) return
    setTestStatus('testing')
    setConnectedName('')
    try {
      const res = await apiFetch<{ name: string }>('/api/tracking/ping', null, {
        method: 'POST',
        headers: { 'X-Merchant-Key': data.apiKey },
      })
      setConnectedName(res.name)
      setTestStatus('connected')
    } catch {
      setTestStatus('failed')
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6 max-w-3xl">
        <div className="h-7 w-48 skeleton rounded-xl" />
        <div className="h-10 w-72 skeleton rounded-xl" />
        <div className="h-56 skeleton rounded-2xl" />
        <div className="h-56 skeleton rounded-2xl" />
        <div className="h-20 skeleton rounded-2xl" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="p-6">
        <div className="alert alert-error text-sm">{t.integration.loadError}</div>
      </div>
    )
  }

  const phpCode = data ? buildPhpExample(data.apiKey, API_URL) : ''
  const jsCode  = data ? buildJsExample(data.apiKey, API_URL) : ''

  const wooSteps = [
    { label: t.integration.wooStep1, desc: t.integration.wooStep1Desc, isDone: false },
    { label: t.integration.wooStep2, desc: t.integration.wooStep2Desc, isDone: false },
    { label: t.integration.wooStep3, desc: t.integration.wooStep3Desc, isDone: false },
    { label: t.integration.wooDone, desc: t.integration.wooDoneDesc, isDone: true },
  ]

  return (
    <div className="flex flex-col gap-8 p-6 max-w-3xl">

      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-fuchsia-400 bg-fuchsia-500/10 border border-fuchsia-500/20 rounded-full px-3 py-0.5 w-fit">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
            <path d="M3 3L1 5l2 2M7 3L9 5l-2 2M6 2L4 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          JS
        </span>
        <h1 className="text-2xl font-black text-white">{t.integration.title}</h1>
        <p className="text-white/40 text-sm">{t.integration.subtitle}</p>
      </div>

      {/* Platform selector */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">{t.integration.platformSelector}</span>
        <div className="flex gap-2 p-1 rounded-xl bg-white/4 border border-white/8 w-fit">
          <button
            onClick={() => switchPlatform('woo')}
            className={[
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all',
              platform === 'woo'
                ? 'bg-[#0f0f18] text-white shadow-sm border border-white/8'
                : 'text-white/40 hover:text-white/70',
            ].join(' ')}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M2 6C2 4.9 2.9 4 4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6Z" stroke="currentColor" strokeWidth="1.6"/>
              <path d="M2 9h20M8 4v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="17" cy="15" r="2" stroke="currentColor" strokeWidth="1.4"/>
            </svg>
            {t.integration.platformWoo}
          </button>
          <button
            onClick={() => switchPlatform('custom')}
            className={[
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all',
              platform === 'custom'
                ? 'bg-[#0f0f18] text-white shadow-sm border border-white/8'
                : 'text-white/40 hover:text-white/70',
            ].join(' ')}
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
              <path d="M4.5 4L1.5 7.5 4.5 11M10.5 4L13.5 7.5 10.5 11M8.5 3l-2 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {t.integration.platformCustom}
          </button>
        </div>
      </div>

      {/* ── WooCommerce ── */}
      {platform === 'woo' && (
        <div className="flex flex-col gap-5">

          {/* API key card */}
          <div className="rounded-2xl border border-white/8 bg-[#0f0f18] px-5 py-4 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden className="text-fuchsia-400">
                <circle cx="7" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M2 12c0-2.8 2.2-4 5-4s5 1.2 5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              <span className="text-sm font-bold text-white">{t.integration.wooApiKeyTitle}</span>
            </div>
            <div className="flex items-stretch gap-2">
              <div className="flex-1 rounded-xl bg-black/30 border border-white/8 px-3 py-2.5 min-w-0">
                <p className="text-xs font-mono text-fuchsia-300 break-all leading-relaxed">{data?.apiKey}</p>
              </div>
              <CopyBtn
                size="sm"
                copied={copiedKey}
                onCopy={() => doCopy(data?.apiKey ?? '', setCopiedKey)}
                copyLabel={t.integration.copySnippet}
                copiedLabel={t.integration.copied}
              />
            </div>
            <p className="text-xs text-white/35">{t.integration.wooApiKeyDesc}</p>
          </div>

          {/* Steps */}
          <div className="flex flex-col gap-3">
            {wooSteps.map((step, i) => (
              <div
                key={i}
                className={[
                  'flex items-start gap-4 px-5 py-4 rounded-xl border',
                  step.isDone
                    ? 'border-emerald-500/20 bg-emerald-500/5'
                    : 'border-white/7 bg-white/2',
                ].join(' ')}
              >
                <span className={[
                  'shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black',
                  step.isDone
                    ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                    : 'bg-violet-500/20 border border-violet-500/30 text-violet-300',
                ].join(' ')}>
                  {step.isDone
                    ? <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden><path d="M2 6l2.5 2.5 5.5-5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    : i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white">{step.label}</p>
                  <p className="text-xs text-white/40 mt-0.5 leading-relaxed">{step.desc}</p>
                  {i === 0 && (
                    <div className="mt-3 flex items-center gap-3">
                      <button
                        disabled
                        className="btn btn-sm bg-violet-500/20 border-violet-500/30 text-violet-300/50 rounded-xl normal-case gap-2 cursor-not-allowed"
                      >
                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
                          <path d="M6.5 1.5v7M3.5 6l3 3 3-3M1.5 10.5h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {t.integration.wooDownloadBtn}
                      </button>
                      <span className="text-xs text-white/30 italic">{t.integration.wooComingSoon}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Custom Website ── */}
      {platform === 'custom' && (
        <div className="flex flex-col gap-6">

          <SnippetCard
            label={t.integration.snippet1Label}
            accent="violet"
            code={data?.snippet1 ?? ''}
            desc={t.integration.snippet1Desc}
            copied={copied1}
            onCopy={() => doCopy(data?.snippet1 ?? '', setCopied1)}
            copyLabel={t.integration.copySnippet}
            copiedLabel={t.integration.copied}
          />

          <SnippetCard
            label={t.integration.snippet2Label}
            accent="fuchsia"
            code={data?.snippet2 ?? ''}
            desc={t.integration.snippet2Desc}
            copied={copied2}
            onCopy={() => doCopy(data?.snippet2 ?? '', setCopied2)}
            copyLabel={t.integration.copySnippet}
            copiedLabel={t.integration.copied}
          />

          {/* Cookie note */}
          <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-violet-500/5 border border-violet-500/15">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden className="text-violet-400 shrink-0 mt-0.5">
              <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M7 6v4M7 4.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <p className="text-xs text-violet-300/70 leading-relaxed">{t.integration.cookieNote}</p>
          </div>

          {/* Examples section */}
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-sm font-bold text-white">{t.integration.examplesTitle}</p>
              <p className="text-xs text-white/35 mt-0.5">{t.integration.examplesDesc}</p>
            </div>

            {/* Example sub-tabs */}
            <div className="flex gap-1 p-0.5 rounded-lg bg-white/4 border border-white/8 w-fit">
              {(['php', 'js'] as ExTab[]).map(tab => (
                <button
                  key={tab}
                  onClick={() => { setExTab(tab); setCopiedEx(false) }}
                  className={[
                    'px-3 py-1 rounded-md text-xs font-semibold transition-all',
                    exTab === tab
                      ? 'bg-[#0f0f18] text-white border border-white/8'
                      : 'text-white/40 hover:text-white/70',
                  ].join(' ')}
                >
                  {tab === 'php' ? t.integration.phpTab : t.integration.jsTab}
                </button>
              ))}
            </div>

            <CodeBlock
              lang={exTab === 'php' ? t.integration.phpTab : t.integration.jsTab}
              code={exTab === 'php' ? phpCode : jsCode}
              copied={copiedEx}
              onCopy={() => doCopy(exTab === 'php' ? phpCode : jsCode, setCopiedEx)}
              copyLabel={t.integration.copySnippet}
              copiedLabel={t.integration.copied}
            />
          </div>
        </div>
      )}

      {/* Test Connection */}
      <div className="rounded-2xl border border-white/8 bg-[#0f0f18] px-5 py-4 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm font-bold text-white">{t.integration.testBtn}</p>
            <p className="text-xs text-white/35 mt-0.5">{t.integration.testHint}</p>
          </div>
          {testStatus === 'connected' && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {t.integration.connectedBadge}{connectedName ? ` — ${connectedName}` : ''}
            </span>
          )}
          {testStatus === 'failed' && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-red-500/15 border border-red-500/25 text-red-400 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
              {t.integration.notConnectedBadge}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={testConnection}
            disabled={testStatus === 'testing'}
            className="btn btn-sm w-fit bg-violet-500/20 border-violet-500/30 text-violet-300 hover:bg-violet-500/30 rounded-xl normal-case gap-2 disabled:opacity-60"
          >
            {testStatus === 'testing' ? (
              <><span className="loading loading-spinner loading-xs" />{t.integration.testing}</>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.4"/>
                  <path d="M4.5 7l1.75 1.75L9.5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {t.integration.testBtn}
              </>
            )}
          </button>
          {testStatus === 'connected' && <p className="text-xs text-emerald-400/70">{t.integration.connectedHint}</p>}
          {testStatus === 'failed' && <p className="text-xs text-red-400/70">{t.integration.notConnectedHint}</p>}
        </div>
      </div>

      {/* Footer note */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/3 border border-white/7">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden className="text-white/30 shrink-0">
          <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.4"/>
          <path d="M7 6v4M7 4.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <p className="text-xs text-white/40 leading-relaxed">
          {t.integration.noWebsiteNote}{' '}
          <Link href="/dashboard/merchant/report-sale" className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">
            {t.integration.noWebsiteLink}
          </Link>
        </p>
      </div>

    </div>
  )
}
