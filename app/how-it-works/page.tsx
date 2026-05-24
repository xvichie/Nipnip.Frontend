import { SiteHeader } from '@/components/layout/SiteHeader'
import { SiteFooter } from '@/components/layout/SiteFooter'
import Link from 'next/link'

export const metadata = { title: 'როგორ მუშაობს — NipNip' }

const CREATOR_STEPS = [
  {
    n: '01',
    title: 'დარეგისტრირდი',
    body: 'გახსენი ანგარიში Clerk-ით — სულ რამდენიმე წამი სჭირდება. ბარათი არ გჭირდება, ყველაფერი უფასოა.',
    icon: '✦',
  },
  {
    n: '02',
    title: 'აირჩიე მერჩანტი',
    body: 'დაათვალიერე ჩვენი პარტნიორი მაღაზიები. ნახე კომისიის პროცენტი, სფერო და შეარჩიე ისეთი, რომელიც შენი აუდიტორიისთვის შეესაბამება.',
    icon: '⬡',
  },
  {
    n: '03',
    title: 'აიღე ლინკი ან კოდი',
    body: 'ერთი კლიკით მიიღე შენი უნიკალური სათვალთვალო ლინკი ან პრომო კოდი. ყველა გაყიდვა შენზე ფიქსირდება.',
    icon: '◈',
  },
  {
    n: '04',
    title: 'გაუზიარე მიმდევრებს',
    body: 'დაარსე ლინკი Instagram-ის bio-ში, TikTok-ის ვიდეოში ან სადაც გინდა. კოდი ფასდაკლებასაც სთავაზობს მყიდველს.',
    icon: '◉',
  },
  {
    n: '05',
    title: 'გამოიმუშავე',
    body: 'ყოველ გაყიდვაზე კომისია ავტომატურად ირიცხება. ანგარიშზე ხედავ — ვინ, როდის, რამდენი.',
    icon: '❋',
  },
]

const MERCHANT_STEPS = [
  {
    n: '01',
    title: 'დაგვიკავშირდი',
    body: 'მერჩანტად ჩართვა ხდება ადმინის გზით. მოგვწერე ჩვენს ელ-ფოსტაზე და ჩვენ შევქმნით შენს ანგარიშს.',
    icon: '✦',
  },
  {
    n: '02',
    title: 'დააყენე კომისია',
    body: 'თავად განსაზღვრავ კომისიის პროცენტს — კრეატორები ნახავენ, სანამ ჩაერთვებიან. გამჭვირვალე და სამართლიანი.',
    icon: '⬡',
  },
  {
    n: '03',
    title: 'კრეატორები ყიდიან',
    body: 'NipNip-ის კრეატორები ავტომატურად ხედავენ შენს მაღაზიას. ისინი თავად წყვეტენ — ამ ეტაპზე შენი მხრიდან ქმედება საჭირო არ არის.',
    icon: '◈',
  },
  {
    n: '04',
    title: 'ნახე კონვერსიები',
    body: 'ანგარიშპანელზე ხედავ ყველა გაყიდვას — ვინ გამოიწვია, როდის, რა თანხა. ასევე შეგიძლია ხელით დაარეგისტრიო გაყიდვა.',
    icon: '◉',
  },
  {
    n: '05',
    title: 'გადაიხადე კომისია',
    body: 'კომისიები ითვლება ავტომატურად. გადახდა ხდება შეთანხმებული გრაფიკით — კრეატორი ბედნიერია, შენი ბრენდი იზრდება.',
    icon: '❋',
  },
]

function StepCard({ n, title, body, icon, accent }: { n: string; title: string; body: string; icon: string; accent: 'violet' | 'fuchsia' }) {
  const activeClass = accent === 'violet'
    ? 'hover:border-violet-500/25 hover:bg-violet-500/[0.03]'
    : 'hover:border-fuchsia-500/25 hover:bg-fuchsia-500/[0.03]'

  return (
    <div className={`group relative p-6 rounded-2xl border border-white/[0.07] bg-white/[0.02] transition-all duration-300 ${activeClass}`}>
      <div className="flex items-start justify-between mb-6">
        <span className="text-xl text-white/70">{icon}</span>
        <span className="font-black text-5xl text-white/[0.05] font-mono tabular-nums select-none group-hover:text-white/[0.08] transition-colors">
          {n}
        </span>
      </div>
      <h3 className="font-bold text-white text-lg mb-2">{title}</h3>
      <p className="text-white/40 text-sm leading-relaxed">{body}</p>
    </div>
  )
}

export default function HowItWorksPage() {
  return (
    <div className="bg-[#08080d] text-white min-h-screen flex flex-col selection:bg-violet-500/30">
      <SiteHeader />

      <main className="flex-1 pt-[60px]">

        {/* Hero */}
        <section className="relative py-24 px-6 text-center overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-violet-600/15 rounded-full blur-[120px] pointer-events-none" />
          <div className="relative max-w-2xl mx-auto">
            <p className="text-violet-400 text-xs font-semibold uppercase tracking-widest mb-4">⬡ გზამკვლევი</p>
            <h1 className="font-display text-5xl lg:text-6xl font-black tracking-tight leading-tight mb-6">
              როგორ მუშაობს<br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-violet-400 to-fuchsia-400">
                NipNip-ი
              </span>
            </h1>
            <p className="text-white/45 text-lg leading-relaxed">
              კრეატორებისთვის და მერჩანტებისთვის — ნაბიჯ-ნაბიჯ.
            </p>
          </div>
        </section>

        {/* Creator steps */}
        <section id="creators" className="py-20 px-6 bg-[#0c0c12] border-t border-white/[0.05]">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-violet-500/15 border border-violet-500/20 text-violet-400">
                კრეატორებისთვის
              </span>
            </div>
            <h2 className="font-display text-3xl lg:text-4xl font-black tracking-tight mb-12">
              პირველი კომისიამდე — 5 ნაბიჯი
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {CREATOR_STEPS.map(step => (
                <StepCard key={step.n} {...step} accent="violet" />
              ))}
            </div>
            <div className="mt-10 flex justify-center">
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 bg-linear-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold px-7 py-3 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-violet-900/20"
              >
                დარეგისტრირდი უფასოდ
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* Merchant steps */}
        <section id="merchants" className="py-20 px-6 border-t border-white/[0.05]">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-fuchsia-500/15 border border-fuchsia-500/20 text-fuchsia-400">
                მერჩანტებისთვის
              </span>
            </div>
            <h2 className="font-display text-3xl lg:text-4xl font-black tracking-tight mb-12">
              ჩართვა მარტივია
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {MERCHANT_STEPS.map(step => (
                <StepCard key={step.n} {...step} accent="fuchsia" />
              ))}
            </div>
            <div className="mt-10 flex justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 border border-fuchsia-500/30 bg-fuchsia-500/10 hover:bg-fuchsia-500/15 text-fuchsia-300 font-semibold px-7 py-3 rounded-xl transition-all active:scale-[0.98]"
              >
                მოგვწერე
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </div>
          </div>
        </section>

      </main>

      <SiteFooter />
    </div>
  )
}
