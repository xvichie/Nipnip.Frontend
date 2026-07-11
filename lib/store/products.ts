export type ProductVariant = {
  color: string
  colorHex: string
  sizes: string[]
}

export type Product = {
  id: string
  slug: string
  name: string
  price: number
  originalPrice?: number
  description: string
  longDescription: string
  category: string
  images: string[]
  variants: ProductVariant[]
  badge?: string
  rating: number
  reviewCount: number
}

export type Category = {
  id: string
  name: string
  slug: string
  icon: string
  count: number
}

// CDN photo IDs verified by fetching actual Unsplash og:image tags
function u(id: string) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=80`
}

const IMG = {
  // ── Nike running / Pegasus-style ─────────────────────────────────────────
  pegasusOrange:  u('1542291026-7eec264c27ff'), // bright orange Nike running shoe
  pegasusBlue:    u('1608231387042-66d1773070a5'), // blue/grey Nike runner
  runningYellow:  u('1491553895911-0055eca6402d'), // yellow/white running shoes

  // ── Trail / Salomon-style ────────────────────────────────────────────────
  trailOrange:    u('1578116922645-3976907a7671'), // aggressive orange trail shoe

  // ── White court / Air Force 1 / Stan Smith ───────────────────────────────
  sneakerWhite:   u('1606107557195-0e29a4b5b4aa'), // clean white Nike-style sneaker
  sneakerOnFeet:  u('1595950653106-6c9ebd614d3a'), // white sneakers on feet in grass
  courtWhite:     u('1560769629-975ec94e6a86'),    // white court shoe editorial

  // ── Adidas UltraBoost (verified from Unsplash UltraBoost pages) ──────────
  ultraboostWB:   u('1519861297062-a1eec154f81a'), // white/black Adidas UltraBoost
  ultraboostBlk:  u('1544327415-cfb77383dabc'),    // black Adidas Ultra Boost pair

  // ── Colorful / Nike SB Dunk ──────────────────────────────────────────────
  dunkColor:      u('1556906781-9a412961a28a'), // colorful hi-contrast Nike SB
  canvas:         u('1525966222134-fcfa99b8ae77'), // canvas low-tops aerial
  flatlay:        u('1600185365483-26d7a4cc7519'), // sneaker lifestyle flat-lay

  // ── Vans Old Skool (verified from Unsplash Vans pages) ───────────────────
  vansBlack:      u('1565963513169-108e0c01a074'), // black Vans sneakers by Fábio Alves
  vansBW:         u('1608103870856-1f4b9a997a0b'), // person in black-and-white Vans
  vansStreet:     u('1603004015976-83e85669bffc'), // b&w sneakers street shot

  // ── Timberland 6-Inch (verified from Unsplash Timberland pages) ──────────
  timberPair:     u('1542838776-096d877b5aa2'), // pair of brown Timberland boots
  timberRailway:  u('1542838686-ddebb563fef4'), // yellow Timberland on railway track
  timberWork:     u('1542841791-77f33b752ef1'), // brown Timberland work boot on foot

  // ── Dr. Martens 1460 (verified from Unsplash boot pages) ─────────────────
  dmBlackBeach:   u('1620851500170-860a690a7101'), // black leather boots on beach
  dmBrownLaceUp:  u('1616244916660-d135a013d1f8'), // brown leather lace-up boots
  dmCombat:       u('1777400154125-b53a325057b9'), // black platform combat boots

  // ── Tod's loafer / dress shoes (verified from Unsplash loafer pages) ─────
  loaferBrown:    u('1616406432452-07bc5938759d'), // brown leather loafers on textile
  dressShoeBox:   u('1490114538077-0a7f8cb49891'), // brown leather dress shoes with box

  // ── Adidas Adilette (verified from Unsplash Adidas slides pages) ─────────
  adiletteBW:     u('1583473848882-f9a5bc7fd2ee'), // black & white Adidas slide sandals
  adiletteBlack:  u('1764268641240-2675102b111d'), // black slides with white Adidas logo
}

export const CATEGORIES: Category[] = [
  { id: '1', name: 'სირბილი',      slug: 'running',  icon: '🏃', count: 4 },
  { id: '2', name: 'სნიკერები',    slug: 'sneakers', icon: '👟', count: 4 },
  { id: '3', name: 'ჩექმები',      slug: 'boots',    icon: '🥾', count: 2 },
  { id: '4', name: 'ყოველდღიური', slug: 'casual',   icon: '🌿', count: 3 },
]

export function getCategoryName(slug: string): string {
  return CATEGORIES.find(c => c.slug === slug)?.name ?? slug
}

export const PRODUCTS: Product[] = [
  // ── RUNNING ──────────────────────────────────────────────────────────────
  {
    id: '1',
    slug: 'nike-air-zoom-pegasus-41',
    name: 'Nike Air Zoom Pegasus 41',
    price: 129,
    originalPrice: 159,
    category: 'running',
    badge: 'ფასდაკლება',
    rating: 4.8,
    reviewCount: 3241,
    description: 'Nike-ს ყველაზე პოპულარული ყოველდღიური სარბოლო ფეხსაცმელი — 41-ე გამოშვება React X ქაფით და Zoom Air ბალიშით.',
    longDescription:
      'Pegasus 41 ინარჩუნებს ყველაფერს, რაც ამ სერიას 40+ წლის განმავლობაში პოპულარულს ხდიდა — ამჯერად React X ქაფის ახალი ფენით, რომელიც 13%-ით უფრო მსუბუქია. წინა Zoom Air ბალიში ყოველ ნაბიჯზე დაბრუნებადი პასუხობს, გაფართოებული upper კი სუნთქვადია ცხელ ამინდშიც. სისწრაფეზე ყოველდღიური ვარჯიშისთვის — Pegasus 41 თქვენი ბაზა.',
    images: [IMG.pegasusOrange, IMG.pegasusBlue, IMG.runningYellow], // Nike running shoes
    variants: [
      { color: 'Black/Anthracite',    colorHex: '#1a1a2e', sizes: ['38','39','40','41','42','43','44','45','46'] },
      { color: 'Varsity Royal/White', colorHex: '#1d4ed8', sizes: ['38','39','40','41','42','43','44','45'] },
      { color: 'Gym Red/White',       colorHex: '#c8102e', sizes: ['39','40','41','42','43','44'] },
    ],
  },
  {
    id: '6',
    slug: 'salomon-speedcross-6',
    name: 'Salomon Speedcross 6',
    price: 149,
    category: 'running',
    badge: 'ბესტსელერი',
    rating: 4.9,
    reviewCount: 5812,
    description: 'Salomon-ის ბილიკის სარბოლო ფლაგმანი — Chevron ბაქნები, Contagrip® MA ძირი, სველ ლამიან გზებზეც უძლეველი.',
    longDescription:
      'Speedcross 6 მეექვსე თაობაში კიდევ ერთხელ განახლდა. ახალი Chevron ბაქნების გეომეტრია ლამიან ჩამოსვლებზე ორჯერ მეტ ამოყოფის ძალას განავითარებს. EnergyCell+ ქაფის შუაძირი სიმძიმის მიუხედავად მსუბუქია, ხოლო Quicklace™ სისტემა ერთი გამოყვანით იჭიმება. ბილიკის სარბოლო ფეხსაცმელის გლობალური სტანდარტი.',
    images: [IMG.trailOrange, IMG.pegasusOrange, IMG.runningYellow],
    variants: [
      { color: 'Olive Night/Black', colorHex: '#3d5a3e', sizes: ['39','40','41','42','43','44','45','46'] },
      { color: 'Fiesta/Lapis Blue', colorHex: '#ea580c', sizes: ['39','40','41','42','43','44','45'] },
      { color: 'Black/Phantom',     colorHex: '#0f172a', sizes: ['40','41','42','43','44','45','46'] },
    ],
  },
  {
    id: '8',
    slug: 'adidas-adizero-adios-pro-3',
    name: 'Adidas Adizero Adios Pro 3',
    price: 219,
    category: 'running',
    badge: 'ახალი',
    rating: 4.9,
    reviewCount: 1047,
    description: 'Adidas-ის კარბონ-ფირფიტიანი Elite Racing Flat — სამი Lightstrike Pro ქაფის ფენა, EnergyRods 2.0.',
    longDescription:
      'Adidas Adios Pro 3 დღეს ყველაზე სწრაფი ასფალტის სარბოლო ფეხსაცმელია. ორი EnergyRods 2.0 ნახშირბადის ელემენტი ფეხის ბუნებრივ ბიომექანიკაზეა დარეგულირებული, სამ-ფენიანი Lightstrike Pro ქაფი კი 40 კმ-ზე მეტ ვარჯიშშიც არ კარგავს პასუხს. Adidas-ის სარბოლო ისტორიის შედევრი.',
    images: [IMG.runningYellow, IMG.pegasusOrange, IMG.pegasusBlue],
    variants: [
      { color: 'Solar Yellow/Core Black', colorHex: '#fbbf24', sizes: ['38','39','40','41','42','43','44','45'] },
      { color: 'Impact Orange/Black',     colorHex: '#f97316', sizes: ['38','39','40','41','42','43','44'] },
      { color: 'Solar Red/Black',         colorHex: '#dc2626', sizes: ['39','40','41','42','43','44','45'] },
    ],
  },
  {
    id: '11',
    slug: 'new-balance-fresh-foam-1080v13',
    name: 'New Balance Fresh Foam X 1080v13',
    price: 89,
    category: 'running',
    rating: 4.6,
    reviewCount: 2198,
    description: 'New Balance-ის ყველაზე კომფორტული სარბოლო ფეხსაცმელი — Fresh Foam X ძირი 13-ე თაობა, Hypoknit upper.',
    longDescription:
      'Fresh Foam X 1080v13 მაღალი ბალიშიანი სარბოლო ფეხსაცმელების ახალი სტანდარტია. Fresh Foam X მაკრო-სტრუქტურა 6 ათასი მონაცემის საფუძველზე შეიქმნა. Hypoknit upper ნაჭდევი ხაზების გარეშეა — ფეხი პირდაპირ ქაფს გრძნობს. ყოველდღიური გრძელი სვლებისთვის.',
    images: [IMG.pegasusBlue, IMG.trailOrange, IMG.runningYellow],
    variants: [
      { color: 'Teal/White',        colorHex: '#0d9488', sizes: ['37','38','39','40','41','42','43','44'] },
      { color: 'Quartz Gray/White', colorHex: '#9ca3af', sizes: ['37','38','39','40','41','42','43','44'] },
      { color: 'Black/Thunder',     colorHex: '#111827', sizes: ['38','39','40','41','42','43','44','45'] },
    ],
  },

  // ── SNEAKERS ──────────────────────────────────────────────────────────────
  {
    id: '4',
    slug: 'nike-air-force-1-07',
    name: "Nike Air Force 1 '07",
    price: 79,
    originalPrice: 95,
    category: 'sneakers',
    badge: 'ფასდაკლება',
    rating: 4.7,
    reviewCount: 18432,
    description: '1982 წლიდან დღემდე — Air Force 1, პირველი Nike ბასკეტბოლის ფეხსაცმელი Air-ბალიშით, ქუჩის სტილის ლეგენდა.',
    longDescription:
      'Air Force 1 Bruce Kilgore-ის 1982 წლის დიზაინი ყველა დროის ყველაზე იკონური სნიკერია. ჰოლოუ Air-ბალიში ქუსლქვეშ ახლაც 40 წლის ტექნოლოგიით მუშაობს. პრემიუმ ტყავის upper ყოველ წელს ოდნავ განახლდება — სიმარტივე და სისუფთავე კი არასდროს.',
    images: [IMG.sneakerWhite, IMG.courtWhite, IMG.sneakerOnFeet],
    variants: [
      { color: 'White/White',     colorHex: '#f5f5f5', sizes: ['36','37','38','39','40','41','42','43','44','45'] },
      { color: 'Black/Black',     colorHex: '#0a0a0f', sizes: ['37','38','39','40','41','42','43','44','45'] },
      { color: 'University Blue', colorHex: '#4169e1', sizes: ['38','39','40','41','42','43','44'] },
    ],
  },
  {
    id: '2',
    slug: 'adidas-ultraboost-24',
    name: 'Adidas UltraBoost 24',
    price: 99,
    category: 'sneakers',
    badge: 'ახალი',
    rating: 4.6,
    reviewCount: 4391,
    description: 'Adidas-ის Boost ტექნოლოგია ყველაზე პოპულარულ სნიკერში — Primeknit+ upper და 6000 Boost ნაჭრის ძირი.',
    longDescription:
      'UltraBoost 24 Boost ტექნოლოგიის ახალი პიკია. 6000+ Boost ნაჭრი ყოველ ნაბიჯზე ატყდება და ბრუნდება სიზუსტით. Primeknit+ upper მდგრადობის მასალებისგანაა შექმნილი. სტილი, რომელიც სარბოლო კვლევის ლაბიდან პირდაპირ ქუჩაზე მოვიდა.',
    images: [IMG.ultraboostWB, IMG.ultraboostBlk, IMG.sneakerWhite],
    variants: [
      { color: 'Cloud White/Gold Met.', colorHex: '#f5f5f5', sizes: ['36','37','38','39','40','41','42','43','44','45'] },
      { color: 'Core Black/Black',      colorHex: '#0a0a0f', sizes: ['37','38','39','40','41','42','43','44','45'] },
      { color: 'Lucid Blue/Orange',     colorHex: '#1e40af', sizes: ['38','39','40','41','42','43','44'] },
    ],
  },
  // {
  //   id: '10',
  //   slug: 'nike-sb-dunk-low',
  //   name: 'Nike SB Dunk Low',
  //   price: 69,
  //   category: 'sneakers',
  //   rating: 4.5,
  //   reviewCount: 7263,
  //   description: 'Nike-ის სკეიტ-კულტურის ლეგენდა — Zoom Air ბალიშით, სქელი ენით, მყარი ტყავ-ქსოვილის კომბინაციით.',
  //   longDescription:
  //     'SB Dunk Low 2002 წელს სკეიტბორდინგისთვის გადაადაპტირებული Dunk-ია. სქელი ენა, Zoom Air ბალიში ბალიშქვეშ და გამაგრებული ადგომის ზონა სკეიტერების მოთხოვნებს აკმაყოფილებს. დღეს ეს ფეხსაცმელი სკეიტ-პარკსა და კოლექციონირების სამყაროს შორის გაიყო.',
  //   images: [IMG.dunkColor, IMG.canvas, IMG.sneakerWhite],
  //   variants: [
  //     { color: 'Black/White (Panda)',   colorHex: '#1a1a1e', sizes: ['36','37','38','39','40','41','42','43','44','45'] },
  //     { color: 'University Blue/White', colorHex: '#4169e1', sizes: ['37','38','39','40','41','42','43','44','45'] },
  //     { color: 'Varsity Red/White',     colorHex: '#c8102e', sizes: ['38','39','40','41','42','43','44'] },
  //   ],
  // },
  {
    id: '13',
    slug: 'adidas-stan-smith',
    name: 'Adidas Stan Smith',
    price: 89,
    category: 'sneakers',
    rating: 4.7,
    reviewCount: 22807,
    description: '1965 წლიდან — ყველა დროის ყველაზე გაყიდვადი სნიკერი. სუფთა ტყავი, სერფორირებული სამი ზოლი, კლასიკური ქუსლის Tab.',
    longDescription:
      'Stan Smith ორიგინალად Robert Haillet-ის სახელს ატარებდა. 1978 წელს სახელი შეიცვალა — Stan Smith-ი 1971 წლის Wimbledon-ის ჩემპიონია. 50+ წელი, მინიმალური ჯვარედინი სამი ზოლი, სრული მარცვლის ტყავი — Stan Smith სიმარტივეს ანიჭებს პრიორიტეტს.',
    images: [IMG.courtWhite, IMG.sneakerOnFeet, IMG.flatlay],
    variants: [
      { color: 'Cloud White/Green', colorHex: '#f5f5f5', sizes: ['36','37','38','39','40','41','42','43','44','45'] },
      { color: 'Cloud White/Navy',  colorHex: '#f0f0f0', sizes: ['36','37','38','39','40','41','42','43','44'] },
      { color: 'Core Black/Black',  colorHex: '#111111', sizes: ['37','38','39','40','41','42','43','44','45'] },
    ],
  },

  // ── BOOTS ─────────────────────────────────────────────────────────────────
  {
    id: '3',
    slug: 'timberland-6-inch-premium',
    name: 'Timberland 6-Inch Premium',
    price: 189,
    category: 'boots',
    rating: 4.9,
    reviewCount: 12054,
    description: 'ორიგინალური 1973 წლის დიზაინი — ხორბლის ნუბუკი, ყვითელი ძაფი, ReBOTL™ ძირი. კლასიკა, რომელიც არ ბერდება.',
    longDescription:
      'Timberland-ის 6-Inch boot 1973 წელს გამოჩნდა ამ ერთი მიზნით: გაუძლოს ჩრდილო-აღმოსავლეთ ამერიკის ყველაზე მძიმე ამინდს. Waterproof full-grain ტყავი დღემდე ბარიერია. Lug-ძირი გლინოიდ სახეობებზეც ჭამს. 2024 წლის ReBOTL™ ვერსია ნარჩენი მასალებისგანაა შექმნილი.',
    images: [IMG.timberPair, IMG.timberRailway, IMG.timberWork],
    variants: [
      { color: 'Wheat Nubuck', colorHex: '#c4943a', sizes: ['39','40','41','42','43','44','45','46','47'] },
      { color: 'Black Nubuck', colorHex: '#1a1a1a', sizes: ['39','40','41','42','43','44','45','46'] },
    ],
  },
  {
    id: '9',
    slug: 'dr-martens-1460',
    name: 'Dr. Martens 1460',
    price: 209,
    category: 'boots',
    rating: 4.8,
    reviewCount: 8931,
    description: '1960 წლის 1 აპრილს, Doc-ის დაბადების დღეს, პირველი წყვილი გამოვიდა — 8-eye boot, AirWair ძირი. კულტი.',
    longDescription:
      'Dr. Martens 1460 ბრიტანული სამუშაო ჩექმის სიმბოლოა. კლასიკური smooth ტყავი Griggs-ის ფაბრიკიდან, ყვითელი AirCushion ძირი პნევმატური ბალიშით, ყვითელი ძაფი — ეს ელემენტები 1960 წლიდან უცვლელია. Punk-ის, Grunge-ისა და ჰიფსტერ კულტურის სიმბოლო.',
    images: [IMG.dmBlackBeach, IMG.dmBrownLaceUp, IMG.dmCombat],
    variants: [
      { color: 'Black Smooth',       colorHex: '#0d0d0d', sizes: ['36','37','38','39','40','41','42','43','44','45','46'] },
      { color: 'Cherry Red Smooth',  colorHex: '#b91c1c', sizes: ['36','37','38','39','40','41','42','43','44','45'] },
      { color: 'Dark Brown Arcadia', colorHex: '#3d1d0a', sizes: ['37','38','39','40','41','42','43','44','45'] },
    ],
  },

  // ── CASUAL ────────────────────────────────────────────────────────────────
  {
    id: '5',
    slug: 'vans-old-skool',
    name: 'Vans Old Skool',
    price: 59,
    category: 'casual',
    rating: 4.6,
    reviewCount: 31048,
    description: '1977 წლის სკეიტ-კულტურის სიმბოლო — Vans-ის "Jazz Stripe", სუიდ და canvas ზედაპირი, vulcanized ძირი.',
    longDescription:
      'Old Skool 1977 წელს Vans-ის პირველი ფეხსაცმელი გახდა Waffle outsole-ის მიღმა. ხელნაწერი "Jazz Stripe" — დამფუძნებელ Paul Van Doren-ის მიერ ნახატი — ახლა ბრენდის ყველაზე ცნობადი ვიზუალური ელემენტია. Canvas-სა და სუიდის კომბინაცია მდგრადობა-სუნთქვადობის ბალანსია.',
    images: [IMG.vansBlack, IMG.vansBW, IMG.vansStreet],
    variants: [
      { color: 'Black/White',  colorHex: '#1a1a1e', sizes: ['36','37','38','39','40','41','42','43','44','45','46'] },
      { color: 'True White',   colorHex: '#f5f5f0', sizes: ['36','37','38','39','40','41','42','43','44','45'] },
      { color: 'Dress Blues',  colorHex: '#1e3560', sizes: ['37','38','39','40','41','42','43','44'] },
      { color: 'Eucalyptus',   colorHex: '#6b9e7e', sizes: ['36','37','38','39','40','41','42','43'] },
    ],
  },
  {
    id: '7',
    slug: 'tods-gommino-moccasin',
    name: "Tod's Gommino Driving Moccasin",
    price: 169,
    category: 'casual',
    rating: 4.7,
    reviewCount: 1823,
    description: 'ბოლოში 133 rubber Gommino pebble — Tod-ის ხელმოწერა 1979 წლიდან. იტალიური ხელოსნობა, ყველაზე კომფორტული ოფის ფეხსაცმელი.',
    longDescription:
      "Tod's Gommino Diego Della Valle-ს 1979 წლის კონცეფციაა: რბილი loafer, რომელიც მანქანის პედლებზეც კომფორტულია. ძირის 133 rubber pebble ზუსტად ასეთი რაოდენობითაა — ეს Tod's-ის ხელმოწერა. ზედაპირი Montegranaro-ს ოსტატების ხელით ამოგლეჯილი სრული მარცვლის ტყავია. ოფისი, სადილი, ავტომობილი — ეს ფეხსაცმელი ყველგან ადეკვატურია.",
    images: [IMG.loaferBrown, IMG.dressShoeBox, IMG.courtWhite],
    variants: [
      { color: 'Cuoio Leather', colorHex: '#b45309', sizes: ['39','40','41','42','43','44','45'] },
      { color: 'Dark Brown',    colorHex: '#3d1d0a', sizes: ['39','40','41','42','43','44'] },
      { color: 'Black Nappa',   colorHex: '#0a0a0f', sizes: ['39','40','41','42','43','44','45'] },
    ],
  },
  {
    id: '12',
    slug: 'adidas-adilette-aqua',
    name: 'Adidas Adilette Aqua',
    price: 45,
    category: 'casual',
    rating: 4.3,
    reviewCount: 9712,
    description: 'Adidas-ის კლასიკური სლაიდი — Cloudfoam შუაძირი, ანტიბაქტერიული ზედაპირი, სპორტ-კლუბიდან ქუჩამდე.',
    longDescription:
      'Adilette პირველად 1972 წელს გამოჩნდა ოლიმპიური გუნდების კეთილდღეობის კოლექციაში. Aqua ვერსია Cloudfoam შუაძირს ამატებს — ანტიბაქტერიული ზედაპირი ნებისმიერ გარემოში სუფთა რჩება. ვარჯიშის შემდეგ ან პლაჟზე — Adilette კომფორტის მომენტის სინონიმია.',
    images: [IMG.adiletteBW, IMG.adiletteBlack, IMG.sneakerOnFeet],
    variants: [
      { color: 'Cloud White/Core Black', colorHex: '#f5f5f5', sizes: ['36','37','38','39','40','41','42','43','44','45','46'] },
      { color: 'Core Black/White',       colorHex: '#0a0a0f', sizes: ['36','37','38','39','40','41','42','43','44','45'] },
      { color: 'Bliss Pink/White',       colorHex: '#fbcfe8', sizes: ['36','37','38','39','40','41','42','43','44'] },
    ],
  },
]

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find(p => p.slug === slug)
}

export function getProductsByCategory(category: string): Product[] {
  return PRODUCTS.filter(p => p.category === category)
}
