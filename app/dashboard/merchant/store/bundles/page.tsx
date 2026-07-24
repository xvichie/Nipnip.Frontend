import { BundleManager } from '@/components/dashboard/store/BundleManager'

export default function MerchantStoreBundlesPage() {
  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <BundleManager />
    </div>
  )
}
