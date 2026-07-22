'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useCart } from '@/lib/store/cart-context'
import { CImg } from '@/components/ui/CImg'

type AddressForm = {
  firstName: string; lastName: string; email: string; phone: string
  street: string; city: string; state: string; postalCode: string; country: string
}

const EMPTY: AddressForm = {
  firstName: '', lastName: '', email: '', phone: '',
  street: '', city: '', state: '', postalCode: '', country: 'საქართველო',
}

type Step = 'address' | 'payment' | 'confirm'

function StepIndicator({ step }: { step: Step }) {
  const steps: { id: Step; label: string }[] = [
    { id: 'address', label: 'მიტანა' },
    { id: 'payment', label: 'გადახდა' },
    { id: 'confirm', label: 'დადასტურება' },
  ]
  const current = steps.findIndex(s => s.id === step)
  return (
    <div className="flex items-center gap-0">
      {steps.map((s, i) => (
        <div key={s.id} className="flex items-center">
          <div className="flex items-center gap-2">
            <div className={['w-7 h-7 flex items-center justify-center text-xs font-bold border-2 transition-all',
              i < current ? 'bg-[#111] border-[#111] text-white'
                : i === current ? 'border-[#111] bg-white text-[#111]'
                : 'border-[#e5e5e5] bg-white text-[#bbb]'].join(' ')}>
              {i < current ? (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                  <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : i + 1}
            </div>
            <span className={['text-sm hidden sm:block',
              i === current ? 'text-[#111] font-semibold' : i < current ? 'text-[#555]' : 'text-[#bbb]'].join(' ')}>
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={['h-px w-8 sm:w-12 mx-2', i < current ? 'bg-[#111]' : 'bg-[#e5e5e5]'].join(' ')} />
          )}
        </div>
      ))}
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', placeholder, required, half }: {
  label: string; value: string; onChange: (v: string) => void
  type?: string; placeholder?: string; required?: boolean; half?: boolean
}) {
  return (
    <div className={half ? 'flex-1' : 'w-full'}>
      <label className="block text-xs font-semibold uppercase tracking-wider text-[#555] mb-1.5">
        {label} {required && <span className="text-[#c8102e]">*</span>}
      </label>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full border border-[#e5e5e5] px-4 py-3 text-sm text-[#111] placeholder-[#bbb] focus:outline-none focus:border-[#111] transition-colors bg-white"
      />
    </div>
  )
}

function AddressStep({ form, setForm, onNext }: {
  form: AddressForm; setForm: (f: AddressForm) => void; onNext: () => void
}) {
  function set(key: keyof AddressForm) { return (v: string) => setForm({ ...form, [key]: v }) }
  const ok = form.firstName.trim() && form.lastName.trim() && form.email.trim() && form.street.trim() && form.city.trim() && form.postalCode.trim()

  return (
    <form onSubmit={e => { e.preventDefault(); if (ok) onNext() }} className="flex flex-col gap-5">
      <div className="border-b border-[#e5e5e5] pb-4 mb-2">
        <h2 className="font-black text-xl text-[#111]">მიტანის მისამართი</h2>
        <p className="text-[#999] text-sm mt-1">სად გამოვგზავნოთ თქვენი შეკვეთა?</p>
      </div>
      <div className="flex gap-4">
        <Field label="სახელი" value={form.firstName} onChange={set('firstName')} placeholder="გიორგი" required half />
        <Field label="გვარი"  value={form.lastName}  onChange={set('lastName')}  placeholder="ბერიძე"  required half />
      </div>
      <Field label="ელ. ფოსტა"    type="email" value={form.email}  onChange={set('email')}  placeholder="giorgi@example.com" required />
      <Field label="ტელეფონი"      type="tel"   value={form.phone}  onChange={set('phone')}  placeholder="+995 555 123 456" />
      <Field label="ქუჩის მისამართი"            value={form.street} onChange={set('street')} placeholder="რუსთაველის გამზ. 2" required />
      <div className="flex gap-4">
        <Field label="ქალაქი"           value={form.city}       onChange={set('city')}       placeholder="თბილისი" required half />
        <Field label="საფოსტო ინდექსი" value={form.postalCode} onChange={set('postalCode')} placeholder="0105"    required half />
      </div>
      <div className="flex gap-4">
        <Field label="რეგიონი" value={form.state} onChange={set('state')} placeholder="თბილისი" half />
        <div className="flex-1">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#555] mb-1.5">ქვეყანა</label>
          <select value={form.country} onChange={e => set('country')(e.target.value)}
            className="w-full border border-[#e5e5e5] px-4 py-3 text-sm text-[#111] focus:outline-none focus:border-[#111] bg-white">
            {['საქართველო','სომხეთი','აზერბაიჯანი','თურქეთი','უკრაინა','სხვა'].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>
      <button type="submit" disabled={!ok}
        className="w-full py-4 bg-[#111] text-white text-sm font-semibold uppercase tracking-wide hover:bg-[#333] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
        გადახდაზე გაგრძელება
      </button>
    </form>
  )
}

function PaymentStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [method, setMethod] = useState<'card' | 'cash'>('card')
  return (
    <div className="flex flex-col gap-5">
      <div className="border-b border-[#e5e5e5] pb-4 mb-2">
        <h2 className="font-black text-xl text-[#111]">გადახდის მეთოდი</h2>
        <p className="text-[#999] text-sm mt-1">აირჩიეთ, როგორ სურთ გადახდა.</p>
      </div>
      <div className="flex flex-col gap-3">
        {[
          { id: 'card' as const, label: 'საბანკო ბარათი',    sub: 'Visa, Mastercard, Amex', icon: '💳' },
          { id: 'cash' as const, label: 'გადახდა მიტანისას', sub: 'შეკვეთის ჩაბარებისას',   icon: '💵' },
        ].map(opt => (
          <button key={opt.id} onClick={() => setMethod(opt.id)}
            className={['flex items-center gap-4 p-4 border-2 transition-colors text-left',
              method === opt.id ? 'border-[#111] bg-[#f7f7f7]' : 'border-[#e5e5e5] hover:border-[#999]'].join(' ')}>
            <div className={['w-5 h-5 border-2 flex items-center justify-center shrink-0',
              method === opt.id ? 'border-[#111]' : 'border-[#ccc]'].join(' ')}>
              {method === opt.id && <div className="w-2.5 h-2.5 bg-[#111]" />}
            </div>
            <span className="text-xl">{opt.icon}</span>
            <div>
              <p className="text-[#111] font-semibold text-sm">{opt.label}</p>
              <p className="text-[#999] text-xs">{opt.sub}</p>
            </div>
          </button>
        ))}
      </div>
      {method === 'card' && (
        <div className="border border-[#e5e5e5] p-5 flex flex-col gap-4 bg-[#f7f7f7]">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#555] mb-1.5">ბარათის ნომერი</label>
            <div className="border border-[#e5e5e5] bg-white px-4 py-3 flex items-center justify-between">
              <span className="text-[#bbb] text-sm">•••• •••• •••• ••••</span>
              <span className="text-[#bbb] text-xs">მხოლოდ დემო</span>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#555] mb-1.5">ვადა</label>
              <div className="border border-[#e5e5e5] bg-white px-4 py-3">
                <span className="text-[#bbb] text-sm">თთ / წწ</span>
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#555] mb-1.5">CVV</label>
              <div className="border border-[#e5e5e5] bg-white px-4 py-3">
                <span className="text-[#bbb] text-sm">•••</span>
              </div>
            </div>
          </div>
          <p className="text-[#bbb] text-xs">ეს დემო მაღაზიაა — გადახდა რეალურად არ ხდება.</p>
        </div>
      )}
      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 py-4 border border-[#e5e5e5] text-[#555] text-sm font-medium hover:border-[#999] hover:text-[#111] transition-colors">
          ← უკან
        </button>
        <button onClick={onNext} className="flex-[2] py-4 bg-[#111] text-white text-sm font-semibold uppercase tracking-wide hover:bg-[#333] transition-colors">
          შეკვეთის გადახედვა
        </button>
      </div>
    </div>
  )
}

function ConfirmStep({ form, onBack, onPlace }: { form: AddressForm; onBack: () => void; onPlace: () => void }) {
  const { items, subtotal } = useCart()
  const shipping = subtotal >= 100 ? 0 : 9.99
  const total = subtotal + shipping
  return (
    <div className="flex flex-col gap-5">
      <div className="border-b border-[#e5e5e5] pb-4 mb-2">
        <h2 className="font-black text-xl text-[#111]">შეკვეთის გადახედვა</h2>
        <p className="text-[#999] text-sm mt-1">ყველაფერი სწორია? გაფორმეთ შეკვეთა.</p>
      </div>
      <div className="border border-[#e5e5e5] p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#999]">მიტანა</p>
          <button onClick={onBack} className="text-xs text-[#111] underline underline-offset-2">შეცვლა</button>
        </div>
        <p className="text-[#111] font-semibold text-sm">{form.firstName} {form.lastName}</p>
        <p className="text-[#666] text-sm">{form.street}, {form.city} {form.postalCode}</p>
        <p className="text-[#666] text-sm">{form.country}</p>
        {form.email && <p className="text-[#999] text-xs mt-1">{form.email}</p>}
      </div>
      <div className="border border-[#e5e5e5] p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#999] mb-3">ნივთები</p>
        <div className="flex flex-col divide-y divide-[#f0f0f0]">
          {items.map(item => (
            <div key={`${item.product.id}-${item.color}-${item.size}`} className="flex items-center gap-3 py-3">
              <div className="w-12 h-12 bg-[#f7f7f7] overflow-hidden shrink-0">
                <CImg src={item.product.images[0]} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[#111] font-semibold text-xs truncate">{item.product.name}</p>
                <p className="text-[#999] text-[10px]">{item.color} · EU {item.size} · ×{item.quantity}</p>
              </div>
              <span className="text-[#111] font-bold text-sm shrink-0">
                ₾{(item.product.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
        <div className="border-t border-[#e5e5e5] mt-3 pt-3 flex flex-col gap-2">
          <div className="flex justify-between text-sm">
            <span className="text-[#666]">შუალედური ჯამი</span>
            <span className="text-[#111]">₾{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#666]">მიტანა</span>
            <span className={shipping === 0 ? 'text-[#2d6a2d] font-medium' : 'text-[#111]'}>
              {shipping === 0 ? 'უფასო' : `₾${shipping.toFixed(2)}`}
            </span>
          </div>
          <div className="flex justify-between font-black text-base mt-1 pt-2 border-t border-[#e5e5e5]">
            <span className="text-[#111]">სულ</span>
            <span className="text-[#111]">₾{total.toFixed(2)}</span>
          </div>
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 py-4 border border-[#e5e5e5] text-[#555] text-sm font-medium hover:border-[#999] hover:text-[#111] transition-colors">
          ← უკან
        </button>
        <button onClick={onPlace} className="flex-[2] py-4 bg-[#111] text-white text-sm font-semibold uppercase tracking-wide hover:bg-[#333] transition-colors">
          შეკვეთის გაფორმება →
        </button>
      </div>
    </div>
  )
}

function SuccessStep({ form }: { form: AddressForm }) {
  return (
    <div className="flex flex-col items-center text-center py-10 gap-6">
      <div className="w-16 h-16 border-2 border-[#2d6a2d] flex items-center justify-center">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
          <path d="M4 14l7 7 13-13" stroke="#2d6a2d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div>
        <h2 className="font-black text-3xl text-[#111] mb-2">შეკვეთა გაფორმდა!</h2>
        <p className="text-[#666] text-base leading-relaxed max-w-sm">
          გმადლობ, <span className="text-[#111] font-semibold">{form.firstName}</span>! თქვენი შეკვეთა დადასტურდა.
          {form.email && <> დადასტურება გამოვგზავნეთ: <span className="text-[#111]">{form.email}</span></>}
        </p>
      </div>
      <div className="border border-[#e5e5e5] p-5 w-full max-w-sm text-left">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#999] mb-3">მიტანა</p>
        <p className="text-[#111] font-semibold text-sm">{form.firstName} {form.lastName}</p>
        <p className="text-[#666] text-sm">{form.street}</p>
        <p className="text-[#666] text-sm">{form.city} {form.postalCode}, {form.country}</p>
        <div className="mt-3 pt-3 border-t border-[#e5e5e5] flex items-center gap-2">
          <span className="inline-block w-2 h-2 bg-[#2d6a2d]" />
          <span className="text-[#999] text-xs">სავარაუდო მიტანა: 2–4 სამუშაო დღე</span>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
        <Link href="/example-store"
          className="flex-1 text-center py-3.5 border border-[#e5e5e5] text-[#555] text-sm font-medium hover:border-[#111] hover:text-[#111] transition-colors">
          მაღაზიაში დაბრუნება
        </Link>
        <Link href="/example-store/products"
          className="flex-1 text-center py-3.5 bg-[#111] text-white text-sm font-semibold hover:bg-[#333] transition-colors">
          შოპინგის გაგრძელება
        </Link>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  const [step, setStep] = useState<Step | 'success'>('address')
  const [form, setForm] = useState<AddressForm>(EMPTY)
  const { items, subtotal, clear } = useCart()

  const shipping = subtotal >= 100 ? 0 : 9.99
  const total = subtotal + shipping

  function placeOrder() { clear(); setStep('success') }

  if (step === 'success') {
    return <div className="max-w-lg mx-auto px-4 sm:px-6 py-16 pb-24"><SuccessStep form={form} /></div>
  }

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-24 text-center">
        <h1 className="font-black text-2xl text-[#111] mb-4">გადასახდელი ნივთები არ არის</h1>
        <Link href="/example-store/products" className="text-sm text-[#111] underline underline-offset-2">
          ფეხსაცმლის დათვალიერება →
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 pb-24">
      <div className="mb-10">
        <Link href="/example-store/cart"
          className="flex items-center gap-1.5 text-[#999] hover:text-[#111] text-sm transition-colors mb-4">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M9 3L5 7l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          კალათაში დაბრუნება
        </Link>
        <h1 className="font-black text-3xl text-[#111] tracking-tight mb-6">გადახდა</h1>
        <StepIndicator step={step as Step} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        <div className="lg:col-span-3">
          {step === 'address' && <AddressStep form={form} setForm={setForm} onNext={() => setStep('payment')} />}
          {step === 'payment' && <PaymentStep onNext={() => setStep('confirm')} onBack={() => setStep('address')} />}
          {step === 'confirm' && <ConfirmStep form={form} onBack={() => setStep('payment')} onPlace={placeOrder} />}
        </div>

        <div className="lg:col-span-2">
          <div className="border border-[#e5e5e5] p-5 sticky top-20">
            <h3 className="font-bold text-[#111] text-sm mb-4 pb-4 border-b border-[#e5e5e5]">
              შეკვეთის შეჯამება
            </h3>
            <div className="flex flex-col divide-y divide-[#f0f0f0] mb-4">
              {items.map(item => (
                <div key={`${item.product.id}-${item.color}-${item.size}`} className="flex items-center gap-3 py-3">
                  <div className="relative w-12 h-12 bg-[#f7f7f7] overflow-hidden shrink-0">
                    <CImg src={item.product.images[0]} alt="" className="w-full h-full object-cover" />
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#111] text-white text-[9px] font-bold flex items-center justify-center">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#111] text-xs font-semibold truncate">{item.product.name}</p>
                    <p className="text-[#999] text-[10px]">{item.color} · EU {item.size}</p>
                  </div>
                  <span className="text-[#111] text-xs font-bold shrink-0">
                    ₾{(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-[#e5e5e5] pt-4 flex flex-col gap-2">
              <div className="flex justify-between text-xs">
                <span className="text-[#666]">შუალედური ჯამი</span>
                <span className="text-[#111]">₾{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#666]">მიტანა</span>
                <span className={shipping === 0 ? 'text-[#2d6a2d] font-medium' : 'text-[#111]'}>
                  {shipping === 0 ? 'უფასო' : `₾${shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between font-black text-sm mt-1 pt-2 border-t border-[#e5e5e5]">
                <span className="text-[#111]">სულ</span>
                <span className="text-[#111]">₾{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
