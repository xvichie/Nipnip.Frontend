import { CollectionManager } from '@/components/dashboard/store/CollectionManager'

export default function MerchantStoreCollectionsPage() {
  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <CollectionManager />
    </div>
  )
}
