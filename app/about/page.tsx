import { SiteHeader } from '@/components/layout/SiteHeader'
import { SiteFooter } from '@/components/layout/SiteFooter'

export const metadata = { title: 'შესახებ — NipNip' }

export default function AboutPage() {
  return (
    <div className="bg-[#08080d] text-white min-h-screen flex flex-col selection:bg-violet-500/30">
      <SiteHeader />

      <main className="flex-1 pt-[60px]">

        {/* Hero */}
        <section className="relative py-24 px-6 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-violet-600/15 rounded-full blur-[120px] pointer-events-none" />
          <div className="relative max-w-3xl mx-auto text-center">
            <p className="text-violet-400 text-xs font-semibold uppercase tracking-widest mb-4">✦ ჩვენ შესახებ</p>
            <h1 className="font-display text-5xl lg:text-6xl font-black tracking-tight leading-tight mb-6">
              ეფილიატ მარკეტინგი,<br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-violet-400 to-fuchsia-400">
                ქართულად.
              </span>
            </h1>
            <p className="text-white/45 text-lg leading-relaxed max-w-xl mx-auto">
              NipNip-ი ააშენა კრეატორებისთვის — ადამიანებისთვის, ვინც ყოველდღიურად ქმნის კონტენტს
              და იმსახურებს იმ შემოსავალს, რასაც მოაქვს.
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="py-20 px-6 bg-[#0c0c12] border-t border-white/[0.05]">
          <div className="max-w-4xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-violet-400 text-xs font-semibold uppercase tracking-widest mb-4">ჩვენი მისია</p>
              <h2 className="font-display text-3xl lg:text-4xl font-black tracking-tight mb-6 leading-tight">
                კრეატორებს ვაძლევთ ინსტრუმენტებს,<br />
                <span className="text-white/40">რომლებიც ებრალებათ ბრენდებს.</span>
              </h2>
              <p className="text-white/45 leading-relaxed mb-4">
                ტრადიციული ეფილიატ პლატფორმები რთული, ძვირი და ხშირად ინგლისურენოვანია.
                NipNip-ი სხვაგვარია — ჩვენ ვქმნით ბარიერების გარეშე, ქართულ ბაზარზე
                მორგებულ გამოცდილებას.
              </p>
              <p className="text-white/45 leading-relaxed">
                კრეატორმა მხოლოდ ერთი ლინკი ან კოდი უნდა გაუზიაროს თავის მიმდევრებს —
                დანარჩენს ჩვენ ვაკეთებთ.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { value: '100%', label: 'ქართული პლატფორმა' },
                { value: '0₾', label: 'კრეატორის გამოწერა' },
                { value: '⚡', label: 'სწრაფი განახლება' },
                { value: '✓', label: 'გამჭვირვალე კომისია' },
              ].map(({ value, label }) => (
                <div key={label} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 flex flex-col gap-2">
                  <span className="text-3xl font-black text-transparent bg-clip-text bg-linear-to-r from-violet-400 to-fuchsia-400">
                    {value}
                  </span>
                  <span className="text-white/40 text-sm">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-20 px-6 border-t border-white/[0.05]">
          <div className="max-w-4xl mx-auto">
            <p className="text-violet-400 text-xs font-semibold uppercase tracking-widest mb-4">გუნდი</p>
            <h2 className="font-display text-3xl font-black tracking-tight mb-12">გავიცნოთ ერთმანეთი</h2>

            <div className="flex flex-col sm:flex-row items-start gap-6 p-6 lg:p-8 rounded-2xl border border-white/[0.07] bg-white/[0.02]">
              <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-2xl font-black shrink-0 select-none">
                A
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-bold text-lg">ანდრია ხვიჩია</h3>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-violet-500/15 border border-violet-500/20 text-violet-400">
                    დამფუძნებელი
                  </span>
                </div>
                <p className="text-white/40 text-sm mb-3">Full-stack Developer · Tbilisi, Georgia</p>
                <p className="text-white/50 text-sm leading-relaxed max-w-lg">
                  NipNip-ს ვაშენებ, რადგან ქართველ კრეატორებს ვხედავ — ტალანტიანებს,
                  მყოლელებს — მაგრამ ინსტრუმენტების გარეშე. ეს პლატფორმა მათთვისაა.
                </p>
                <div className="flex items-center gap-3 mt-4">
                  <a
                    href="mailto:nipnipge@gmail.com"
                    className="text-white/30 hover:text-violet-400 transition-colors text-sm"
                  >
                    nipnipge@gmail.com
                  </a>
                  <a
                    href="tel:+995555350063"
                    className="text-white/30 hover:text-violet-400 transition-colors text-sm"
                  >
                    +995 555 35 00 63
                  </a>
                </div>
              </div>
            </div>

            <p className="text-white/25 text-sm mt-6 text-center">
              გუნდი იზრდება — თუ გინდა ჩვენი ნაწილი გახდე,{' '}
              <a href="/contact" className="text-violet-400 hover:text-violet-300 transition-colors">
                დაგვიკავშირდი
              </a>
              .
            </p>
          </div>
        </section>

      </main>

      <SiteFooter />
    </div>
  )
}
