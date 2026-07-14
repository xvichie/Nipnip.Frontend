export interface CategoryEmojiGroup {
  label: string
  emoji: { char: string; label: string }[]
}

export const CATEGORY_EMOJI_GROUPS: CategoryEmojiGroup[] = [
  {
    label: 'ტანსაცმელი და აქსესუარები',
    emoji: [
      { char: '👕', label: 'ტანსაცმელი' },
      { char: '👗', label: 'კაბა' },
      { char: '👟', label: 'ფეხსაცმელი' },
      { char: '👜', label: 'ჩანთა' },
      { char: '💍', label: 'სამკაული' },
      { char: '⌚', label: 'საათი' },
      { char: '👓', label: 'სათვალე' },
      { char: '🧢', label: 'თავსაბურავი' },
      { char: '🧣', label: 'შარფი' },
      { char: '🧤', label: 'ხელთათმანი' },
    ],
  },
  {
    label: 'ელექტრონიკა',
    emoji: [
      { char: '📱', label: 'ტელეფონი' },
      { char: '💻', label: 'ლეპტოპი' },
      { char: '📺', label: 'ტელევიზორი' },
      { char: '📷', label: 'კამერა' },
      { char: '🎧', label: 'ყურსასმენი' },
      { char: '🎮', label: 'გეიმინგი' },
      { char: '⌨️', label: 'კლავიატურა' },
      { char: '🖥️', label: 'მონიტორი' },
      { char: '🔌', label: 'დამტენი' },
      { char: '🔋', label: 'ბატარეა' },
    ],
  },
  {
    label: 'სახლი და ინტერიერი',
    emoji: [
      { char: '🏠', label: 'სახლი' },
      { char: '🛋️', label: 'დივანი' },
      { char: '💡', label: 'განათება' },
      { char: '🛏️', label: 'საწოლი' },
      { char: '🛁', label: 'აბაზანა' },
      { char: '🪴', label: 'მცენარე' },
      { char: '🕯️', label: 'სანთელი' },
    ],
  },
  {
    label: 'საკვები და სასმელი',
    emoji: [
      { char: '☕', label: 'ყავა' },
      { char: '🍷', label: 'ღვინო' },
      { char: '🍺', label: 'ლუდი' },
      { char: '🍸', label: 'კოქტეილი' },
      { char: '🥛', label: 'რძე' },
      { char: '🎂', label: 'ნამცხვარი' },
      { char: '🍦', label: 'ნაყინი' },
      { char: '🍕', label: 'პიცა' },
      { char: '🥪', label: 'სენდვიჩი' },
      { char: '🍬', label: 'ტკბილეული' },
      { char: '🍎', label: 'ხილი' },
      { char: '🥕', label: 'ბოსტნეული' },
      { char: '🐟', label: 'თევზი' },
      { char: '🍖', label: 'ხორცი' },
    ],
  },
  {
    label: 'ჯანმრთელობა და მოვლა',
    emoji: [
      { char: '💊', label: 'მედიკამენტები' },
      { char: '🩺', label: 'სამედიცინო' },
      { char: '🏋️', label: 'ფიტნესი' },
      { char: '✨', label: 'სილამაზე' },
      { char: '💄', label: 'კოსმეტიკა' },
      { char: '🧴', label: 'ჰიგიენა' },
    ],
  },
  {
    label: 'მოგზაურობა და ტრანსპორტი',
    emoji: [
      { char: '🚲', label: 'ველოსიპედი' },
      { char: '🚗', label: 'ავტომობილი' },
      { char: '✈️', label: 'მოგზაურობა' },
      { char: '🧳', label: 'ჩემოდანი' },
      { char: '☂️', label: 'ქოლგა' },
    ],
  },
  {
    label: 'გართობა და ჰობი',
    emoji: [
      { char: '🎁', label: 'საჩუქარი' },
      { char: '🎵', label: 'მუსიკა' },
      { char: '🎸', label: 'გიტარა' },
      { char: '🎨', label: 'ხელოვნება' },
      { char: '🧩', label: 'თამაშები' },
      { char: '📚', label: 'წიგნები' },
      { char: '🎬', label: 'ფილმები' },
      { char: '⚽', label: 'სპორტი' },
    ],
  },
  {
    label: 'ბავშვები და შინაური ცხოველები',
    emoji: [
      { char: '👶', label: 'ბავშვები' },
      { char: '🧸', label: 'სათამაშო' },
      { char: '🐶', label: 'ძაღლი' },
      { char: '🐱', label: 'კატა' },
      { char: '🐾', label: 'შინაური ცხოველები' },
    ],
  },
  {
    label: 'ბუნება',
    emoji: [
      { char: '🌿', label: 'მცენარეები' },
      { char: '🌸', label: 'ყვავილები' },
      { char: '🌲', label: 'ბაღი' },
      { char: '☀️', label: 'გარე ცხოვრება' },
      { char: '⭐', label: 'გამორჩეული' },
    ],
  },
  {
    label: 'ხელსაწყოები და სამშენებლო',
    emoji: [
      { char: '🔧', label: 'ხელსაწყოები' },
      { char: '🔨', label: 'შენება' },
      { char: '⛑️', label: 'უსაფრთხოება' },
      { char: '✂️', label: 'მაკრატელი' },
    ],
  },
  {
    label: 'ბიზნესი და სხვა',
    emoji: [
      { char: '💼', label: 'ბიზნესი' },
      { char: '👛', label: 'საფულე' },
      { char: '💳', label: 'გადახდა' },
      { char: '💵', label: 'ფული' },
      { char: '🏷️', label: 'ფასდაკლება' },
      { char: '📦', label: 'შეფუთვა' },
      { char: '🏪', label: 'მაღაზია' },
      { char: '🔑', label: 'გასაღები' },
      { char: '🔒', label: 'უსაფრთხოება' },
      { char: '🛡️', label: 'დაცვა' },
    ],
  },
]
