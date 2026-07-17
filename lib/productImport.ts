// Written by ImportProductModal (Facebook and Instagram both use the same shape/key),
// read by the new-product page.
export const PRODUCT_IMPORT_STORAGE_KEY = 'nipnip:product-import'

export interface ProductImportOptionGroup {
  name: string
  values: string[]
}

export interface ProductImportData {
  name: string | null
  description: string | null
  price: number | null
  optionGroups: ProductImportOptionGroup[]
  categoryId: string | null
  imageUrls: string[]
  videoUrl: string | null
}
