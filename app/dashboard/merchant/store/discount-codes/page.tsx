import { DiscountCodeManager } from '@/components/dashboard/store/DiscountCodeManager'

export default function MerchantStoreDiscountCodesPage() {
  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <DiscountCodeManager />
    </div>
  )
}
