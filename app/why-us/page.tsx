import Link from 'next/link'
import { SignUpButton } from '@clerk/nextjs'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { SiteFooter } from '@/components/layout/SiteFooter'

export const metadata = { title: 'რატომ ჩვენ — NipNip' }

const STORE_ICON = (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
    <path d="M2.5 7.5 3.4 3a1.2 1.2 0 0 1 1.18-1h10.85a1.2 1.2 0 0 1 1.17 1l.9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2.5 7.5a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3.75 8v7.75h12.5V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 15.75v-5h4v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const INVENTORY_ICON = (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
    <path d="M2 5.75 10 2l8 3.75L10 9.5 2 5.75Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M2 5.75v8L10 17.5m0-8v8m0-8 8-3.75m0 0v8L10 17.5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
  </svg>
)
const DELIVERY_ICON = (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
    <path d="M2 5h9v9h-9z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M11 8h4l3 3v3h-7" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    <circle cx="5.5" cy="16" r="1.6" stroke="currentColor" strokeWidth="1.4"/>
    <circle cx="14.5" cy="16" r="1.6" stroke="currentColor" strokeWidth="1.4"/>
  </svg>
)
const INTEGRATIONS_ICON = (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
    <circle cx="6" cy="10" r="3" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="14" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="14" cy="14.5" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M8.6 8.8 11.7 6.6M8.6 11.2l3.1 2.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)
const AI_AGENT_ICON = (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
    <path d="M2 4.5A2.5 2.5 0 0 1 4.5 2h11A2.5 2.5 0 0 1 18 4.5v7A2.5 2.5 0 0 1 15.5 14H10l-4.5 3.5V14h-1A2.5 2.5 0 0 1 2 11.5v-7Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M6.8 7.7c.6-1.2 1.6-1.9 3.1-1.9s2.5 1 2.5 2.1c0 1.6-2.2 1.6-2.5 3.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="10" cy="13.4" r="1" fill="currentColor"/>
  </svg>
)
const MEDIA_ICON = (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
    <rect x="2" y="4.5" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="6.5" cy="9" r="1.7" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M2 14.5l4-3.5 3.3 2.8 2.8-2.3 4 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const AFFILIATE_ICON = (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
    <path d="M8 12.2a4.4 4.4 0 0 0 6.2 0l2.5-2.5a4.4 4.4 0 0 0-6.2-6.2l-1.25 1.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 7.8a4.4 4.4 0 0 0-6.2 0l-2.5 2.5a4.4 4.4 0 0 0 6.2 6.2l1.25-1.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const ANALYTICS_ICON = (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
    <path d="M2 2v10.5a1.5 1.5 0 0 0 1.5 1.5H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4.5 10.5 8 6.5l2.2 2 3.3-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const LINK_ICON = (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
    <path d="M8.1 11.9a4.4 4.4 0 0 0 6.2 0l2.5-2.5a4.4 4.4 0 0 0-6.2-6.2l-1.25 1.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M11.9 8.1a4.4 4.4 0 0 0-6.2 0l-2.5 2.5a4.4 4.4 0 0 0 6.2 6.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const WALLET_ICON = (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
    <rect x="1.5" y="5" width="17" height="10.5" rx="2" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M1.5 8.5h17" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="14" cy="12" r="1.3" fill="currentColor"/>
  </svg>
)

const MERCHANT_FEATURES = [
  {
    icon: STORE_ICON,
    title: 'საკუთარი ონლაინ მაღაზია',
    body: 'გახსენი ბრენდირებული მაღაზია რამდენიმე წუთში — 17 მზა დიზაინის თემა, სრული კონტროლი ფერებზე, ღილაკებზე, გვერდებზე და კატეგორიებზე.',
  },
  {
    icon: INVENTORY_ICON,
    title: 'მარაგისა და პროდუქტების მართვა',
    body: 'აკონტროლე მარაგი ვარიანტების მიხედვით — ზომა, ფერი, რაც არ უნდა გყიდდეს. ბანდლები, კოლექციები და ფასდაკლების კოდები ჩაშენებულია.',
  },
  {
    icon: DELIVERY_ICON,
    title: 'შეკვეთები, გადახდა და მიწოდება',
    body: 'ონლაინ გადახდის ინტეგრაცია (Flitt, TBC, BOG და სხვ.), ადგილზე გატანა, მიწოდების ზონები და ავტომატური საკომისიოს გამოთვლა.',
  },
  {
    icon: INTEGRATIONS_ICON,
    title: 'Facebook და Instagram',
    body: 'შემოიტანე პროდუქტები პირდაპირ პოსტებიდან, ან გამოაქვეყნე ორივე პლატფორმაზე ერთი კლიკით — არ დაგჭირდება ხელით დუბლირება.',
  },
  {
    icon: AI_AGENT_ICON,
    title: 'AI შეტყობინებების აგენტი',
    body: 'AI აგენტი ავტომატურად პასუხობს მომხმარებლებს Messenger-ში — ამოწმებს მარაგს, პასუხობს კითხვებს და ქმნის შეკვეთებს დასადასტურებლად.',
  },
  {
    icon: MEDIA_ICON,
    title: 'AI მედია ხელსაწყოები',
    body: 'პროდუქტის ფოტოებს ავტომატურად ასუფთავებს ფონისგან და დაგეხმარება სოციალური მედიის პოსტების შექმნაში — დიზაინერის გარეშე.',
  },
  {
    icon: AFFILIATE_ICON,
    title: 'აფილიატ მარკეტინგის ქსელი',
    body: 'მიეცი კრეატორებს საშუალება გაყიდონ შენი პროდუქტები საკუთარი აუდიტორიისთვის — გადაუხადე მხოლოდ შედეგზე, არა წინასწარ.',
  },
  {
    icon: ANALYTICS_ICON,
    title: 'ანალიტიკა რეალურ დროში',
    body: 'ნახე გაყიდვები, საუკეთესო პროდუქტები და კრეატორების შედეგები ერთ დაფაზე — გადაწყვეტილებები მიიღე მონაცემებზე დაყრდნობით.',
  },
]

const CREATOR_FEATURES = [
  {
    icon: LINK_ICON,
    title: 'უნიკალური ლინკები და კოდები',
    body: 'აირჩიე ნებისმიერი პარტნიორი მაღაზია და მიიღე შენი პირადი სათვალთვალო ლინკი ან ფასდაკლების კოდი — გაზიარება წამებში.',
  },
  {
    icon: AFFILIATE_ICON,
    title: 'გამჭვირვალე საკომისიო',
    body: 'ყოველი გაყიდვა, რომელიც შენი ლინკით მოხდა — შენია. საკომისიო ავტომატურად ითვლება, დამალული პირობების გარეშე.',
  },
  {
    icon: WALLET_ICON,
    title: 'გადახდები დროულად',
    body: 'თვალი ადევნე შემოსავალს რეალურ დროში და მოითხოვე გადახდა პირდაპირ დაფიდან — ბარათი ან სააბონენტო გადასახადი არ გჭირდება.',
  },
]

export default function WhyUsPage() {
  return (
    <div className="bg-[#08080d] text-white min-h-screen flex flex-col selection:bg-violet-500/30">
      <SiteHeader />

      <main className="flex-1 pt-[60px]">

        {/* Hero */}
        <section className="relative py-24 px-6 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-violet-600/15 rounded-full blur-[120px] pointer-events-none" />
          <div className="relative max-w-3xl mx-auto text-center">
            <p className="text-violet-400 text-xs font-semibold uppercase tracking-widest mb-4">✦ რატომ NipNip</p>
            <h1 className="font-display text-4xl lg:text-6xl font-black tracking-tight leading-tight mb-6">
              ყველაფერი, რაც შენს ბიზნესს სჭირდება —<br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-violet-400 to-fuchsia-400">
                ერთ პლატფორმაზე.
              </span>
            </h1>
            <p className="text-white/45 text-lg leading-relaxed max-w-xl mx-auto">
              მაღაზიის მფლობელი ხარ თუ კონტენტ-კრეატორი — NipNip-ი აერთიანებს ონლაინ მაღაზიას,
              მარაგის მართვას, AI ხელსაწყოებს და აფილიატ მარკეტინგის ქსელს ერთ ადგილას.
            </p>
          </div>
        </section>

        {/* For merchants */}
        <section className="py-20 px-6 bg-[#0c0c12] border-t border-white/5">
          <div className="max-w-6xl mx-auto">
            <div className="max-w-xl mb-14">
              <p className="text-violet-400 text-sm font-semibold uppercase tracking-widest mb-3">
                მაღაზიის მფლობელებისთვის
              </p>
              <h2 className="font-display text-3xl lg:text-4xl font-black tracking-tight leading-tight">
                გახსენი მაღაზია და<br />
                <span className="text-white/30">დანარჩენს ჩვენ ვიღებთ თავზე.</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {MERCHANT_FEATURES.map(feature => (
                <div
                  key={feature.title}
                  className="group relative p-6 rounded-2xl border border-white/7 bg-white/2 hover:bg-white/4 hover:border-violet-500/25 transition-all duration-300"
                >
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 border bg-violet-500/10 border-violet-500/20 text-violet-300">
                    {feature.icon}
                  </div>
                  <h3 className="font-display text-white font-bold text-base mb-2">{feature.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{feature.body}</p>
                  <div className="absolute bottom-0 left-6 right-6 h-px bg-linear-to-r from-transparent via-violet-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* For creators */}
        <section className="py-20 px-6 border-t border-white/5">
          <div className="max-w-6xl mx-auto">
            <div className="max-w-xl mb-14">
              <p className="text-violet-400 text-sm font-semibold uppercase tracking-widest mb-3">
                კრეატორებისთვის
              </p>
              <h2 className="font-display text-3xl lg:text-4xl font-black tracking-tight leading-tight">
                გამოიმუშავე შენი<br />
                <span className="text-white/30">აუდიტორიის ნდობით.</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
              {CREATOR_FEATURES.map(feature => (
                <div
                  key={feature.title}
                  className="group relative p-6 lg:p-8 rounded-2xl border border-white/7 bg-white/2 hover:bg-white/4 hover:border-violet-500/25 transition-all duration-300"
                >
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-6 border bg-violet-500/10 border-violet-500/20 text-violet-300">
                    {feature.icon}
                  </div>
                  <h3 className="font-display text-white font-bold text-xl mb-2">{feature.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{feature.body}</p>
                  <div className="absolute bottom-0 left-8 right-8 h-px bg-linear-to-r from-transparent via-violet-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing recap */}
        <section className="relative py-24 px-6 bg-[#0c0c12] border-t border-white/5 overflow-hidden">
          <div className="absolute top-10 right-0 w-[400px] h-[400px] rounded-full pointer-events-none bg-violet-600/10 blur-[130px]" />
          <div className="relative z-10 max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
              <div className="max-w-xl">
                <p className="text-violet-400 text-sm font-semibold uppercase tracking-widest mb-3">ფასები</p>
                <h2 className="font-display text-3xl lg:text-4xl font-black tracking-tight leading-tight">
                  დაიწყე 1 ₾-ად,<br />
                  <span className="text-white/30">გადაიხადე მხოლოდ შედეგზე.</span>
                </h2>
              </div>
              <Link
                href="/pricing"
                className="group inline-flex items-center gap-1.5 text-white/50 hover:text-white text-sm font-medium transition-colors shrink-0"
              >
                ნახე ყველა პაკეტი
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden className="transition-transform group-hover:translate-x-1">
                  <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
              <div className="rounded-2xl border border-white/7 bg-white/2 p-6 lg:p-7">
                <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-3">მაღაზია — Starter</p>
                <p className="font-display text-3xl font-black text-white mb-1">1 ₾ <span className="text-white/30 text-base font-normal">/ 3 თვე</span></p>
                <p className="text-white/40 text-sm">შემდეგ 49.99 ₾/თვე</p>
              </div>
              <div className="rounded-2xl border border-fuchsia-500/25 bg-linear-to-br from-fuchsia-500/8 via-violet-500/5 to-transparent p-6 lg:p-7">
                <p className="text-fuchsia-300 text-xs font-semibold uppercase tracking-widest mb-3">მაღაზია — Growth</p>
                <p className="font-display text-3xl font-black text-white mb-1">1 ₾ <span className="text-white/30 text-base font-normal">/ 3 თვე</span></p>
                <p className="text-white/40 text-sm">შემდეგ 89.99 ₾/თვე</p>
              </div>
              <div className="rounded-2xl border border-white/7 bg-white/2 p-6 lg:p-7">
                <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-3">აფილიატ მარკეტინგი</p>
                <p className="font-display text-3xl font-black text-white mb-1">2% <span className="text-white/30 text-base font-normal">/ 1%</span></p>
                <p className="text-white/40 text-sm">მერჩანტისგან და კრეატორის საკომისიოდან</p>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="relative py-32 px-6 bg-[#08080d] border-t border-white/5 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-violet-700/15 rounded-full blur-[100px] pointer-events-none" />
          <div className="relative z-10 max-w-2xl mx-auto text-center flex flex-col items-center gap-6">
            <h2 className="font-display text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              მზად ხარ დასაწყებად?
            </h2>
            <p className="text-white/40 text-lg max-w-md leading-relaxed">
              შექმენი მაღაზია 5 წუთში, ან შემოუერთდი კრეატორად — ორივე უფასოა დასაწყებად.
            </p>
            <SignUpButton>
              <button className="inline-flex items-center gap-2 bg-linear-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold text-base px-8 py-3.5 rounded-xl active:scale-[0.98] transition-all shadow-xl shadow-violet-900/30">
                უფასოდ დარეგისტრირდი
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </SignUpButton>
          </div>
        </section>

      </main>

      <SiteFooter />
    </div>
  )
}
