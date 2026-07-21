import { SiteHeader } from '@/components/layout/SiteHeader'
import { SiteFooter } from '@/components/layout/SiteFooter'
import Link from 'next/link'

export const metadata = { title: 'ფასები — NipNip' }

const CHECK_ICON = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="shrink-0">
    <path d="M3 8.5l3 3 7-7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

interface StorePlan {
  name: string
  badge?: string
  trialPrice?: string
  trialLabel?: string
  oldPrice?: string
  price: string
  period?: string
  intro?: string
  features: string[]
  ctaLabel: string
  ctaHref: string
  highlighted?: boolean
}

const STORE_PLANS: StorePlan[] = [
  {
    name: 'Starter',
    trialPrice: '1 ₾',
    trialLabel: 'პირველი 3 თვე',
    oldPrice: '69.99 ₾',
    price: '49.99 ₾',
    period: '/თვე',
    features: [
      'საკუთარი ონლაინ მაღაზია + დომენი',
      'დიზაინის მზა თემები',
      'პროდუქტების და კატეგორიების მართვა',
      'შეკვეთების და მიწოდების მართვა',
      'გადახდის ინტეგრაცია (Flitt და სხვ.)',
      'საბაზისო ანალიტიკა',
      'მომხმარებელთა შეტყობინებების inbox',
    ],
    ctaLabel: 'დაგვიკავშირდი',
    ctaHref: '/contact',
  },
  {
    name: 'Growth',
    badge: 'პოპულარული',
    trialPrice: '1 ₾',
    trialLabel: 'პირველი 3 თვე',
    oldPrice: '119.99 ₾',
    price: '89.99 ₾',
    period: '/თვე',
    intro: 'ყველაფერი Starter-დან, პლუს:',
    features: [
      'AI მესენჯერ-აგენტი მომხმარებლებთან',
      'AI პროდუქტის ფოტოები + ფონის წაშლა',
      'სოციალური პოსტების გენერატორი',
      'გაფართოებული ანალიტიკა',
      'პრიორიტეტული მხარდაჭერა',
      'წვდომა აფილიატ მარკეტინგის ქსელზე',
    ],
    ctaLabel: 'დაგვიკავშირდი',
    ctaHref: '/contact',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'ინდივიდუალური',
    intro: 'ყველაფერი Growth-დან, პლუს:',
    features: [
      'პერსონალური ინტეგრაციები (API/webhook)',
      'სპეციალური SLA და მხარდაჭერა',
      'პერსონალური ანგარიშის მენეჯერი',
      'მოცულობითი ფასდაკლებები',
    ],
    ctaLabel: 'მოგვწერე',
    ctaHref: '/contact',
  },
]

interface AffiliatePlan {
  name: string
  badge?: string
  stats?: { value: string; label: string }[]
  price?: string
  intro?: string
  features: string[]
  ctaLabel: string
  ctaHref: string
  highlighted?: boolean
}

const AFFILIATE_PLANS: AffiliatePlan[] = [
  {
    name: 'სტანდარტული',
    badge: 'ნაგულისხმევი',
    stats: [
      { value: '2%', label: 'მერჩანტისგან, თითო გაყიდვაზე' },
      { value: '1%', label: 'კრეატორის საკომისიოდან' },
    ],
    features: [
      'წვდომა კრეატორების ღია ქსელზე',
      'უნიკალური სათვალთვალო ლინკები და პრომო კოდები',
      'ავტომატური კონვერსიის თვალთვალი',
      'ხელით გაყიდვის დარეგისტრირება',
      'ცალკე ანგარიშპანელი მერჩანტს და კრეატორს',
      'არანაირი ყოველთვიური საფასური — მხოლოდ წარმატებულ გაყიდვაზე',
    ],
    ctaLabel: 'დაგვიკავშირდი',
    ctaHref: '/contact',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'ინდივიდუალური პროცენტი',
    intro: 'დიდი მოცულობის მერჩანტებისთვის:',
    features: [
      'მოლაპარაკებადი საკომისიო მაღალი მოცულობისთვის',
      'პერსონალური ინტეგრაცია (API/webhook)',
      'დამატებითი ანალიტიკა და რეპორტინგი',
      'პერსონალური ანგარიშის მენეჯერი',
    ],
    ctaLabel: 'მოგვწერე',
    ctaHref: '/contact',
  },
]

function StorePlanCard({ plan }: { plan: StorePlan }) {
  return (
    <div
      className={[
        'relative flex flex-col p-6 lg:p-8 rounded-2xl border transition-all duration-300',
        plan.highlighted
          ? 'border-fuchsia-500/30 bg-linear-to-br from-fuchsia-500/8 via-violet-500/5 to-transparent'
          : 'border-white/[0.07] bg-white/[0.02] hover:border-violet-500/25',
      ].join(' ')}
    >
      {plan.badge && (
        <span className="absolute -top-3 left-6 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-linear-to-r from-fuchsia-500 to-violet-500 text-white shadow-lg shadow-fuchsia-900/30">
          {plan.badge}
        </span>
      )}

      <h3 className="font-display text-xl font-bold text-white mb-5">{plan.name}</h3>

      {plan.trialPrice ? (
        <>
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-5xl font-black text-transparent bg-clip-text bg-linear-to-r from-emerald-300 to-emerald-400">
              {plan.trialPrice}
            </span>
            {plan.period && <span className="text-white/40 text-sm">{plan.period}</span>}
          </div>
          {plan.trialLabel && (
            <p className="text-emerald-400 text-xs font-semibold mt-2">{plan.trialLabel}</p>
          )}

          <p className="text-white/45 text-sm leading-relaxed mt-4">
            შემდეგ{' '}
            {plan.oldPrice && (
              <span className="text-white/30 line-through decoration-white/30">{plan.oldPrice}</span>
            )}{' '}
            <span className="text-white font-semibold">{plan.price}</span>
            {plan.period}
          </p>
        </>
      ) : (
        <div className="flex items-end gap-2">
          {plan.oldPrice && (
            <span className="text-white/30 text-lg line-through decoration-white/30">{plan.oldPrice}</span>
          )}
          <span className="font-display text-3xl font-black text-white">{plan.price}</span>
          {plan.period && <span className="text-white/40 text-sm mb-1">{plan.period}</span>}
        </div>
      )}

      <div className="h-px bg-white/[0.07] my-6" />

      {plan.intro && <p className="text-white/50 text-xs font-medium mb-3">{plan.intro}</p>}

      <ul className="flex flex-col gap-2.5 mb-8 grow">
        {plan.features.map(f => (
          <li key={f} className="flex items-start gap-2.5 text-sm text-white/60 leading-snug">
            <span className="text-violet-400 mt-0.5">{CHECK_ICON}</span>
            {f}
          </li>
        ))}
      </ul>

      <Link
        href={plan.ctaHref}
        className={[
          'inline-flex items-center justify-center gap-2 font-semibold text-sm px-5 py-3 rounded-xl transition-all active:scale-[0.98]',
          plan.highlighted
            ? 'bg-linear-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white shadow-lg shadow-violet-900/30'
            : 'border border-white/10 bg-white/4 hover:bg-white/8 text-white',
        ].join(' ')}
      >
        {plan.ctaLabel}
      </Link>
    </div>
  )
}

function AffiliatePlanCard({ plan }: { plan: AffiliatePlan }) {
  return (
    <div
      className={[
        'relative flex flex-col p-6 lg:p-8 rounded-2xl border transition-all duration-300',
        plan.highlighted
          ? 'border-violet-500/30 bg-linear-to-br from-violet-500/8 via-fuchsia-500/5 to-transparent'
          : 'border-white/[0.07] bg-white/[0.02] hover:border-fuchsia-500/25',
      ].join(' ')}
    >
      {plan.badge && (
        <span className="absolute -top-3 left-6 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-linear-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-900/30">
          {plan.badge}
        </span>
      )}

      <h3 className="font-display text-xl font-bold text-white mb-4 mt-1">{plan.name}</h3>

      {plan.stats ? (
        <div className="grid grid-cols-2 gap-3 mb-2">
          {plan.stats.map(s => (
            <div key={s.label} className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4">
              <p className="font-display text-3xl font-black text-transparent bg-clip-text bg-linear-to-r from-violet-400 to-fuchsia-400">
                {s.value}
              </p>
              <p className="text-white/40 text-xs mt-1 leading-snug">{s.label}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="font-display text-2xl font-black text-white mb-2">{plan.price}</p>
      )}

      <div className="h-px bg-white/[0.07] my-6" />

      {plan.intro && <p className="text-white/50 text-xs font-medium mb-3">{plan.intro}</p>}

      <ul className="flex flex-col gap-2.5 mb-8 grow">
        {plan.features.map(f => (
          <li key={f} className="flex items-start gap-2.5 text-sm text-white/60 leading-snug">
            <span className="text-fuchsia-400 mt-0.5">{CHECK_ICON}</span>
            {f}
          </li>
        ))}
      </ul>

      <Link
        href={plan.ctaHref}
        className={[
          'inline-flex items-center justify-center gap-2 font-semibold text-sm px-5 py-3 rounded-xl transition-all active:scale-[0.98]',
          plan.highlighted
            ? 'bg-linear-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white shadow-lg shadow-violet-900/30'
            : 'border border-white/10 bg-white/4 hover:bg-white/8 text-white',
        ].join(' ')}
      >
        {plan.ctaLabel}
      </Link>
    </div>
  )
}

export default function PricingPage() {
  return (
    <div className="bg-[#08080d] text-white min-h-screen flex flex-col selection:bg-violet-500/30">
      <SiteHeader />

      <main className="flex-1 pt-[60px]">

        {/* Hero */}
        <section className="relative py-24 px-6 text-center overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-violet-600/15 rounded-full blur-[120px] pointer-events-none" />
          <div className="relative max-w-2xl mx-auto">
            <p className="text-violet-400 text-xs font-semibold uppercase tracking-widest mb-4">₾ ფასები</p>
            <h1 className="font-display text-5xl lg:text-6xl font-black tracking-tight leading-tight mb-6">
              მარტივი და<br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-violet-400 to-fuchsia-400">
                გამჭვირვალე ფასები
              </span>
            </h1>
            <p className="text-white/45 text-lg leading-relaxed">
              აირჩიე პაკეტი შენი ონლაინ მაღაზიისთვის, ან გაეცანი აფილიატ მარკეტინგის საკომისიოებს.
            </p>
          </div>
        </section>

        {/* Online store plans */}
        <section id="store" className="py-16 px-6 bg-[#0c0c12] border-t border-white/[0.05]">
          <div className="max-w-6xl mx-auto">
            <div className="max-w-xl mb-14">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-violet-500/15 border border-violet-500/20 text-violet-400 mb-4">
                ონლაინ მაღაზია
              </span>
              <h2 className="font-display text-3xl lg:text-4xl font-black tracking-tight mb-3">
                მაღაზიის პაკეტები
              </h2>
              <p className="text-white/40 text-sm leading-relaxed">
                დაიწყე მხოლოდ 1 ₾-ად — პირველი 3 თვე ნებისმიერ პაკეტზე, შემდეგ ჩვეულებრივი ყოველთვიური ტარიფი.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {STORE_PLANS.map(plan => (
                <StorePlanCard key={plan.name} plan={plan} />
              ))}
            </div>
          </div>
        </section>

        {/* Affiliate marketing plans */}
        <section id="affiliate" className="py-16 px-6 border-t border-white/[0.05]">
          <div className="max-w-6xl mx-auto">
            <div className="max-w-xl mb-14">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-fuchsia-500/15 border border-fuchsia-500/20 text-fuchsia-400 mb-4">
                აფილიატ მარკეტინგი
              </span>
              <h2 className="font-display text-3xl lg:text-4xl font-black tracking-tight mb-3">
                აფილიატ მარკეტინგის საკომისიო
              </h2>
              <p className="text-white/40 text-sm leading-relaxed">
                გამჭვირვალე საკომისიო სტრუქტურა — ყოველთვიური საფასურის გარეშე, მხოლოდ წარმატებულ გაყიდვაზე.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
              {AFFILIATE_PLANS.map(plan => (
                <AffiliatePlanCard key={plan.name} plan={plan} />
              ))}
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="relative py-24 px-6 bg-[#0c0c12] border-t border-white/[0.05] overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-violet-700/15 rounded-full blur-[100px] pointer-events-none" />
          <div className="relative z-10 max-w-2xl mx-auto text-center flex flex-col items-center gap-6">
            <h2 className="font-display text-3xl lg:text-4xl font-black tracking-tight leading-tight">
              კითხვები ფასებზე?
            </h2>
            <p className="text-white/40 text-lg max-w-md leading-relaxed">
              მოგვწერე და ერთად შევარჩევთ შენთვის საუკეთესო პაკეტს.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-linear-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold text-base px-8 py-3.5 rounded-xl active:scale-[0.98] transition-all shadow-xl shadow-violet-900/30"
            >
              დაგვიკავშირდი
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>
        </section>

      </main>

      <SiteFooter />
    </div>
  )
}
