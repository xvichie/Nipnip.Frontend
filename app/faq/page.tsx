import { SiteHeader } from '@/components/layout/SiteHeader'
import { SiteFooter } from '@/components/layout/SiteFooter'
import Link from 'next/link'

export const metadata = { title: 'FAQ — NipNip' }

const FAQS = [
  {
    q: 'NipNip-ი სრულიად უფასოა კრეატორებისთვის?',
    a: 'დიახ — კრეატორის ანგარიშის გახსნა, ლინკების/კოდების მიღება და ანგარიშპანელის გამოყენება ყველაფერი უფასოა. ჩვენ ვიღებთ პლატფორმის საკომისიოს მხოლოდ წარმატებული გაყიდვის შემდეგ, ეს კი ავტომატურად გათვლილია კომისიაში.',
  },
  {
    q: 'რა კომისიას ვიმუშავებ?',
    a: 'კომისიის პროცენტი ინდივიდუალურია თითოეული მერჩანტისთვის. შეგიძლია ნახო ეს პროცენტი მერჩანტის გვერდზე სანამ ლინკს ან კოდს შეარჩევ. ზოგი მაღაზია 5%-ს სთავაზობს, სხვა — 20%-ს ან მეტს.',
  },
  {
    q: 'როგორ მივიღო გადახდა?',
    a: 'გადახდის პირობები ინდივიდუალურია მერჩანტთან. მიმდინარე ეტაპზე კომისიები ასახულია ანგარიშპანელზე, ხოლო გადახდა ხდება მერჩანტთან შეთანხმებით — ყოველთვიურად ან სხვა გრაფიკით.',
  },
  {
    q: 'როგორ მუშაობს სათვალთვალო ლინკი?',
    a: 'ყოველ კრეატორს და მერჩანტს გენერირდება უნიკალური URL. მომხმარებელი რომ დააჭერს ამ ლინკს, სისტემა ფიქსირებს კლიკს. თუ ის 30 დღის განმავლობაში მერჩანტის გვერდზე შეიძინებს, გაყიდვა შენზე ფიქსირდება.',
  },
  {
    q: 'პრომო კოდი და ლინკი — განსხვავება?',
    a: 'სათვალთვალო ლინკი ავტომატურად "ამოიცნობს" შენ, ხოლო პრომო კოდი მომხმარებელს სთხოვ შეიყვანოს checkout-ზე. კოდი ხშირად ფასდაკლებასაც ანიჭებს მყიდველს, რაც კონვერსიას ზრდის. ორივეს ერთდროულად გამოყენება შეგიძლია.',
  },
  {
    q: 'შემიძლია ერთდროულად რამდენიმე მერჩანტი?',
    a: 'დიახ! არ არსებობს შეზღუდვა — შეგიძლია ნებისმიერი რაოდენობის მერჩანტისთვის მიიღო ლინკი და ყველა ერთ ანგარიშპანელზე გქონდეს.',
  },
  {
    q: 'Instagram, TikTok თუ YouTube — სად გამოვიყენო?',
    a: 'სადაც გინდა. სათვალთვალო ლინკი შეგიძლია Instagram bio-ში, Linktree-ში, TikTok ვიდეოს description-ში ან YouTube-ის description-ში ჩასვა. პრომო კოდი კი ვიდეოში ან Story-ში ხმამაღლა ან ტექსტად ახსენო.',
  },
  {
    q: 'მერჩანტი ვარ — როგორ ვჩაერთო?',
    a: 'მერჩანტის ჩართვა ხდება ადმინის გზით. მოგვწერე ჩვენს ელ-ფოსტაზე და ჩვენ შევქმნით შენს ანგარიშს, ჩამოვაყენებთ ყველა საჭირო პარამეტრს. თვითრეგისტრაცია ჯერ ხელმისაწვდომი არ არის.',
  },
  {
    q: 'კონვერსია ყოველთვის ავტომატური ხდება?',
    a: 'სათვალთვალო ლინკებისთვის — დიახ, ავტომატურად. ზოგ შემთხვევაში მერჩანტს ასევე შეუძლია გაყიდვა ხელით დაარეგისტრიროს "Report Sale" ფუნქციით, მაგალითად, ტელეფონით ან offline შეკვეთებისთვის.',
  },
]

export default function FAQPage() {
  return (
    <div className="bg-[#08080d] text-white min-h-screen flex flex-col selection:bg-violet-500/30">
      <SiteHeader />

      <main className="flex-1 pt-[60px]">

        {/* Hero */}
        <section className="relative py-24 px-6 text-center overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-violet-600/15 rounded-full blur-[120px] pointer-events-none" />
          <div className="relative max-w-2xl mx-auto">
            <p className="text-violet-400 text-xs font-semibold uppercase tracking-widest mb-4">? ხშირი შეკითხვები</p>
            <h1 className="font-display text-5xl lg:text-6xl font-black tracking-tight leading-tight mb-6">
              FAQ
            </h1>
            <p className="text-white/45 text-lg leading-relaxed">
              ყველაზე ხშირი კითხვები — პასუხებთან ერთად.
              ვერ პოულობ შენსას?{' '}
              <Link href="/contact" className="text-violet-400 hover:text-violet-300 transition-colors underline underline-offset-4 decoration-violet-400/40">
                მოგვწერე.
              </Link>
            </p>
          </div>
        </section>

        {/* Accordion */}
        <section className="py-10 pb-24 px-6">
          <div className="max-w-2xl mx-auto flex flex-col gap-3">
            {FAQS.map(({ q, a }) => (
              <details
                key={q}
                className="group rounded-2xl border border-white/[0.07] bg-white/[0.02] open:border-violet-500/20 open:bg-violet-500/[0.03] transition-colors"
              >
                <summary className="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer list-none select-none">
                  <span className="font-semibold text-white/80 group-open:text-white text-sm leading-relaxed transition-colors">
                    {q}
                  </span>
                  <span className="shrink-0 w-5 h-5 rounded-full border border-white/[0.12] flex items-center justify-center text-white/40 group-open:border-violet-500/40 group-open:text-violet-400 transition-all">
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 10 10"
                      fill="none"
                      aria-hidden
                      className="transition-transform duration-200 group-open:rotate-45"
                    >
                      <path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </span>
                </summary>
                <div className="px-6 pb-5">
                  <p className="text-white/45 text-sm leading-relaxed">{a}</p>
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-6 bg-[#0c0c12] border-t border-white/[0.05]">
          <div className="max-w-lg mx-auto text-center">
            <h2 className="font-display text-2xl font-black mb-3">სხვა კითხვა გაქვს?</h2>
            <p className="text-white/40 text-sm mb-6 leading-relaxed">
              ვიყოფთ ყველა კითხვას — არ მოგერიდოს.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.07] text-white font-medium px-6 py-2.5 rounded-xl transition-colors text-sm"
            >
              დაგვიკავშირდი
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
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
