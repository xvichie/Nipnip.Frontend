import type { LucideIcon } from 'lucide-react'
import {
  Shirt, ShoppingBag, Footprints, Backpack, Gem, Watch, Glasses,
  Smartphone, Laptop, Tv, Camera, Headphones, Gamepad2, Keyboard, Mouse, Printer, Tablet, Monitor,
  Wifi, Plug, Battery, Speaker,
  Home, Sofa, Armchair, Lamp, Bed, Bath, Refrigerator, Microwave, Blender,
  Utensils, Coffee, Wine, Beer, Martini, Milk, Cake, IceCreamCone, Pizza, Sandwich, Candy,
  Apple, Carrot, Egg, Fish, Drumstick,
  HeartPulse, Pill, Stethoscope, Syringe, Dumbbell, Sparkles,
  Bike, Car, Plane, Luggage, Umbrella,
  Gift, Music, Guitar, Palette, Paintbrush, Puzzle, BookOpen, Film, Clapperboard,
  Baby, Dog, Cat, PawPrint,
  Leaf, Flower, TreePine, Sun, Star,
  Wrench, Hammer, HardHat, Scissors,
  Briefcase, Wallet, CreditCard, Banknote, Tag, Package, Box, Store, Key, Lock, Shield,
} from 'lucide-react'

export interface CategoryIconDef {
  key: string
  label: string
  Icon: LucideIcon
}

export interface CategoryIconGroup {
  label: string
  icons: CategoryIconDef[]
}

export const CATEGORY_ICON_GROUPS: CategoryIconGroup[] = [
  {
    label: 'ტანსაცმელი და აქსესუარები',
    icons: [
      { key: 'shirt', label: 'ტანსაცმელი', Icon: Shirt },
      { key: 'footprints', label: 'ფეხსაცმელი', Icon: Footprints },
      { key: 'backpack', label: 'ჩანთები', Icon: Backpack },
      { key: 'gem', label: 'სამკაულები', Icon: Gem },
      { key: 'watch', label: 'საათები', Icon: Watch },
      { key: 'glasses', label: 'სათვალეები', Icon: Glasses },
      { key: 'shopping-bag', label: 'შოპინგი', Icon: ShoppingBag },
    ],
  },
  {
    label: 'ელექტრონიკა',
    icons: [
      { key: 'smartphone', label: 'ტელეფონები', Icon: Smartphone },
      { key: 'laptop', label: 'ლეპტოპები', Icon: Laptop },
      { key: 'tv', label: 'ტელევიზორები', Icon: Tv },
      { key: 'camera', label: 'კამერები', Icon: Camera },
      { key: 'headphones', label: 'ყურსასმენები', Icon: Headphones },
      { key: 'gamepad-2', label: 'გეიმინგი', Icon: Gamepad2 },
      { key: 'keyboard', label: 'კლავიატურა', Icon: Keyboard },
      { key: 'mouse', label: 'მაუსი', Icon: Mouse },
      { key: 'printer', label: 'პრინტერი', Icon: Printer },
      { key: 'tablet', label: 'ტაბლეტი', Icon: Tablet },
      { key: 'monitor', label: 'მონიტორი', Icon: Monitor },
      { key: 'wifi', label: 'ინტერნეტი', Icon: Wifi },
      { key: 'plug', label: 'დამტენები', Icon: Plug },
      { key: 'battery', label: 'ბატარეები', Icon: Battery },
      { key: 'speaker', label: 'დინამიკები', Icon: Speaker },
    ],
  },
  {
    label: 'სახლი და ინტერიერი',
    icons: [
      { key: 'home', label: 'სახლი', Icon: Home },
      { key: 'sofa', label: 'დივანი', Icon: Sofa },
      { key: 'armchair', label: 'სავარძელი', Icon: Armchair },
      { key: 'lamp', label: 'განათება', Icon: Lamp },
      { key: 'bed', label: 'საწოლი', Icon: Bed },
      { key: 'bath', label: 'აბაზანა', Icon: Bath },
      { key: 'refrigerator', label: 'მაცივარი', Icon: Refrigerator },
      { key: 'microwave', label: 'მიკროტალღური', Icon: Microwave },
      { key: 'blender', label: 'ბლენდერი', Icon: Blender },
    ],
  },
  {
    label: 'საკვები და სასმელი',
    icons: [
      { key: 'utensils', label: 'საკვები', Icon: Utensils },
      { key: 'coffee', label: 'ყავა', Icon: Coffee },
      { key: 'wine', label: 'ღვინო', Icon: Wine },
      { key: 'beer', label: 'ლუდი', Icon: Beer },
      { key: 'martini', label: 'კოქტეილები', Icon: Martini },
      { key: 'milk', label: 'რძის პროდუქტები', Icon: Milk },
      { key: 'cake', label: 'ნამცხვარი', Icon: Cake },
      { key: 'ice-cream-cone', label: 'ნაყინი', Icon: IceCreamCone },
      { key: 'pizza', label: 'პიცა', Icon: Pizza },
      { key: 'sandwich', label: 'სენდვიჩი', Icon: Sandwich },
      { key: 'candy', label: 'ტკბილეული', Icon: Candy },
      { key: 'apple', label: 'ხილი', Icon: Apple },
      { key: 'carrot', label: 'ბოსტნეული', Icon: Carrot },
      { key: 'egg', label: 'კვერცხი', Icon: Egg },
      { key: 'fish', label: 'თევზი', Icon: Fish },
      { key: 'drumstick', label: 'ხორცი', Icon: Drumstick },
    ],
  },
  {
    label: 'ჯანმრთელობა და მოვლა',
    icons: [
      { key: 'heart-pulse', label: 'ჯანმრთელობა', Icon: HeartPulse },
      { key: 'pill', label: 'მედიკამენტები', Icon: Pill },
      { key: 'stethoscope', label: 'სამედიცინო', Icon: Stethoscope },
      { key: 'syringe', label: 'ჰიგიენა', Icon: Syringe },
      { key: 'dumbbell', label: 'ფიტნესი', Icon: Dumbbell },
      { key: 'sparkles', label: 'სილამაზე', Icon: Sparkles },
    ],
  },
  {
    label: 'მოგზაურობა და ტრანსპორტი',
    icons: [
      { key: 'bike', label: 'ველოსიპედი', Icon: Bike },
      { key: 'car', label: 'ავტომობილი', Icon: Car },
      { key: 'plane', label: 'მოგზაურობა', Icon: Plane },
      { key: 'luggage', label: 'ჩემოდანი', Icon: Luggage },
      { key: 'umbrella', label: 'ქოლგა', Icon: Umbrella },
    ],
  },
  {
    label: 'გართობა და ჰობი',
    icons: [
      { key: 'gift', label: 'საჩუქრები', Icon: Gift },
      { key: 'music', label: 'მუსიკა', Icon: Music },
      { key: 'guitar', label: 'გიტარა', Icon: Guitar },
      { key: 'palette', label: 'ხელოვნება', Icon: Palette },
      { key: 'paintbrush', label: 'ხატვა', Icon: Paintbrush },
      { key: 'puzzle', label: 'თამაშები', Icon: Puzzle },
      { key: 'book-open', label: 'წიგნები', Icon: BookOpen },
      { key: 'film', label: 'ფილმები', Icon: Film },
      { key: 'clapperboard', label: 'გართობა', Icon: Clapperboard },
    ],
  },
  {
    label: 'ბავშვები და შინაური ცხოველები',
    icons: [
      { key: 'baby', label: 'ბავშვები', Icon: Baby },
      { key: 'dog', label: 'ძაღლი', Icon: Dog },
      { key: 'cat', label: 'კატა', Icon: Cat },
      { key: 'paw-print', label: 'შინაური ცხოველები', Icon: PawPrint },
    ],
  },
  {
    label: 'ბუნება და გარე ცხოვრება',
    icons: [
      { key: 'leaf', label: 'მცენარეები', Icon: Leaf },
      { key: 'flower', label: 'ყვავილები', Icon: Flower },
      { key: 'tree-pine', label: 'ბაღი', Icon: TreePine },
      { key: 'sun', label: 'გარე ცხოვრება', Icon: Sun },
      { key: 'star', label: 'გამორჩეული', Icon: Star },
    ],
  },
  {
    label: 'ხელსაწყოები და სამშენებლო',
    icons: [
      { key: 'wrench', label: 'ხელსაწყოები', Icon: Wrench },
      { key: 'hammer', label: 'შენება', Icon: Hammer },
      { key: 'hard-hat', label: 'უსაფრთხოება', Icon: HardHat },
      { key: 'scissors', label: 'მაკრატელი', Icon: Scissors },
    ],
  },
  {
    label: 'ბიზნესი და სხვა',
    icons: [
      { key: 'briefcase', label: 'ბიზნესი', Icon: Briefcase },
      { key: 'wallet', label: 'საფულე', Icon: Wallet },
      { key: 'credit-card', label: 'გადახდა', Icon: CreditCard },
      { key: 'banknote', label: 'ფული', Icon: Banknote },
      { key: 'tag', label: 'ფასდაკლება', Icon: Tag },
      { key: 'package', label: 'შეფუთვა', Icon: Package },
      { key: 'box', label: 'ყუთი', Icon: Box },
      { key: 'store', label: 'მაღაზია', Icon: Store },
      { key: 'key', label: 'გასაღები', Icon: Key },
      { key: 'lock', label: 'უსაფრთხოება', Icon: Lock },
      { key: 'shield', label: 'დაცვა', Icon: Shield },
    ],
  },
]

export const CATEGORY_ICON_MAP: Record<string, LucideIcon> = Object.fromEntries(
  CATEGORY_ICON_GROUPS.flatMap(g => g.icons.map(i => [i.key, i.Icon]))
)

export function getCategoryIcon(key: string | null | undefined): LucideIcon | null {
  if (!key) return null
  return CATEGORY_ICON_MAP[key] ?? null
}
