import { SiteHeader } from '@/components/layout/SiteHeader'
import { SiteFooter } from '@/components/layout/SiteFooter'

export const metadata = { title: 'კონტაქტი — NipNip' }

const CONTACTS = [
  {
    label: 'ელ-ფოსტა',
    value: 'nipnipge@gmail.com',
    href: 'mailto:nipnipge@gmail.com',
    description: 'ყველაზე სწრაფი გზა ჩვენთან დასაკავშირებლად.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
        <rect x="2" y="4" width="16" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M2 7l8 5 8-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    label: 'ტელეფონი',
    value: '+995 555 35 00 63',
    href: 'tel:+995555350063',
    description: 'დაგვირეკე სამუშაო საათებში.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
        <path d="M3 3.5c0-.6.4-1 1-1h2.4c.5 0 .9.3 1 .8l.7 3a1 1 0 0 1-.3 1L6.4 8.6a10.5 10.5 0 0 0 5 5l1.3-1.4a1 1 0 0 1 1-.3l3 .7c.5.1.8.5.8 1V16.5c0 .6-.4 1-1 1h-1.5C7.5 17.5 2.5 12.5 2.5 5.5V3.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    label: 'Instagram',
    value: '@nipnip.ge',
    href: 'https://instagram.com/nipnip.ge',
    description: 'ახალი ამბები, კრეატორების success story-ები.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
        <rect x="2" y="2" width="16" height="16" rx="4.5" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="10" cy="10" r="3.5" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="14.5" cy="5.5" r="1" fill="currentColor"/>
      </svg>
    ),
  },
  {
    label: 'TikTok',
    value: '@nipnip.ge',
    href: 'https://tiktok.com/@nipnip.ge',
    description: 'კონტენტი, რჩევები და სიახლეები.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
        <path d="M13 2c.3 2.3 1.6 3.6 4 3.9v3c-1.3.1-2.6-.3-4-1.1V13a5 5 0 1 1-3.5-4.8V11a2 2 0 1 0 1.5 1.9V2H13Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    ),
  },
]

export default function ContactPage() {
  return (
    <div className="bg-[#08080d] text-white min-h-screen flex flex-col selection:bg-violet-500/30">
      <SiteHeader />

      <main className="flex-1 pt-[60px]">

        {/* Hero */}
        <section className="relative py-24 px-6 text-center overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-violet-600/15 rounded-full blur-[120px] pointer-events-none" />
          <div className="relative max-w-xl mx-auto">
            <p className="text-violet-400 text-xs font-semibold uppercase tracking-widest mb-4">◉ კონტაქტი</p>
            <h1 className="font-display text-5xl lg:text-6xl font-black tracking-tight leading-tight mb-6">
              გამარჯობა,<br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-violet-400 to-fuchsia-400">
                რითი დაგეხმარო?
              </span>
            </h1>
            <p className="text-white/45 text-lg leading-relaxed">
              კითხვა? პარტნიორობა? შეცდომა? — ყველაფრით მოგვმართე, ვუპასუხებთ.
            </p>
          </div>
        </section>

        {/* Contact cards */}
        <section className="py-10 pb-24 px-6">
          <div className="max-w-2xl mx-auto flex flex-col gap-4">
            {CONTACTS.map(({ label, value, href, description, icon }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith('http') ? '_blank' : undefined}
                rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="group flex items-center gap-5 p-6 rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:border-violet-500/25 hover:bg-violet-500/[0.04] transition-all duration-200"
              >
                <div className="w-11 h-11 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 shrink-0 group-hover:bg-violet-500/15 transition-colors">
                  {icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-white/40 text-xs uppercase tracking-widest font-semibold mb-0.5">{label}</p>
                  <p className="font-semibold text-white group-hover:text-violet-300 transition-colors truncate">{value}</p>
                  <p className="text-white/30 text-xs mt-0.5">{description}</p>
                </div>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden
                  className="text-white/20 group-hover:text-violet-400 shrink-0 transition-colors"
                >
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            ))}
          </div>
        </section>

        {/* Response time note */}
        <section className="py-16 px-6 bg-[#0c0c12] border-t border-white/[0.05]">
          <div className="max-w-lg mx-auto text-center">
            <div className="inline-flex items-center gap-2 border border-white/[0.07] bg-white/[0.02] rounded-full px-5 py-2 text-sm text-white/40 mb-4">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              ჩვეულებრივ ვპასუხობთ 24 საათში
            </div>
            <p className="text-white/25 text-sm leading-relaxed">
              მოგვწერე ნებისმიერ დროს. მერჩანტობა, თანამშრომლობა ან ტექნიკური პრობლემა —
              ყველაფერი მიგვაღწევს.
            </p>
          </div>
        </section>

      </main>

      <SiteFooter />
    </div>
  )
}
