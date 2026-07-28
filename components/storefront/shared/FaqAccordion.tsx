import type { ThemeConfig } from '@/lib/types/storefront'
import type { StorefrontStrings } from '@/lib/storefront-i18n'

// Renders the merchant-authored homepage FAQ block. Each theme's Home.tsx supplies its own
// typography/border classes so the block matches that theme's look, while the accordion
// mechanics (plain <details>/<summary>, no JS) stay shared.
export function FaqAccordion({
  tokens,
  t,
  headingClassName,
  questionClassName,
  answerClassName,
  borderClassName,
}: {
  tokens: Required<ThemeConfig>
  t: StorefrontStrings
  headingClassName: string
  questionClassName: string
  answerClassName: string
  borderClassName: string
}) {
  if (tokens.faqItems.length === 0) return null

  return (
    <div>
      <h2 className={headingClassName}>{tokens.faqHeading || t.faq.headingDefault}</h2>
      <div className={`flex flex-col divide-y ${borderClassName}`}>
        {tokens.faqItems.map((item, i) => (
          <details key={i} className="group py-4">
            <summary className={`flex items-center justify-between gap-4 cursor-pointer list-none ${questionClassName}`}>
              {item.question}
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden className="shrink-0 transition-transform group-open:rotate-45">
                <path d="M6 1.5v9M1.5 6h9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </summary>
            <p className={`mt-3 ${answerClassName}`}>{item.answer}</p>
          </details>
        ))}
      </div>
    </div>
  )
}
