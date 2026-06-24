export type Drink = {
  name: string;
  image: string;
  description: string;
  ingredients: string[];
  taste: string;
  serving: string;
  benefits?: string[];
  price: number;
};

export type Collection = {
  id: string;
  title: string;
  subtitle: string;
  theme: string;
  items: Drink[];
};

export const collections: Collection[] = [
  {
    id: 'shakes', title: 'Shakes Collection', subtitle: 'Rich · Creamy · Indulgent', theme: 'from-amber-900/30',
    items: [
      { name: 'Chocolate Shake', image: '/shake-chocolate.jpeg', description: 'Rich Belgian chocolate blended with creamy milk.', ingredients: ['Cocoa', 'Milk', 'Ice cream', 'Chocolate syrup'], taste: 'Rich & decadent', serving: 'Chilled tall glass with whipped cream', price: 70 },
      { name: 'Oreo Shake', image: '/shake-oreo.jpeg', description: 'Crushed Oreo cookies in a velvety shake.', ingredients: ['Oreo', 'Milk', 'Vanilla ice cream'], taste: 'Cookies & cream', serving: 'Topped with cookie crumble', price: 70 },
      { name: 'KitKat Shake', image: '/shake-kitkat.jpeg', description: 'Crunchy KitKat wafers blended smooth.', ingredients: ['KitKat', 'Milk', 'Ice cream'], taste: 'Crunchy chocolate', serving: 'Garnished with KitKat fingers', price: 70 },
      { name: 'Mango Shake', image: '/shake-mango.jpeg', description: 'Alphonso mango pulp blended fresh.', ingredients: ['Mango pulp', 'Milk', 'Sugar'], taste: 'Sweet & fruity', serving: 'Chilled with mango bits', price: 70 },
      { name: 'Strawberry Shake', image: '/shake-strawberry.jpeg', description: 'Fresh strawberries whipped into cream.', ingredients: ['Strawberry', 'Milk', 'Ice cream'], taste: 'Fresh & tangy', serving: 'Topped with strawberry slice', price: 70 },
      { name: 'Vanilla Shake', image: '/shake-vanilla.jpeg', description: 'Classic Madagascar vanilla bean shake.', ingredients: ['Vanilla', 'Milk', 'Ice cream'], taste: 'Smooth & classic', serving: 'Simple and elegant', price: 60 },
      { name: 'Butterscotch Shake', image: '/shake-butterscotch.jpeg', description: 'Caramelised butterscotch indulgence.', ingredients: ['Butterscotch', 'Milk', 'Praline'], taste: 'Caramel sweet', serving: 'With praline crunch', price: 70 },
      { name: 'Dry Fruit Shake', image: '/shake-dryfruit.jpeg', description: 'Loaded with almonds, cashews and pistachios.', ingredients: ['Almonds', 'Cashew', 'Pistachio', 'Milk'], taste: 'Nutty & rich', serving: 'Garnished with chopped nuts', price: 80 },
    ],
  },
  {
    id: 'cold-coffee', title: 'Cold Coffee Collection', subtitle: 'Bold · Smooth · Energising', theme: 'from-stone-800/40',
    items: [
      { name: 'Classic Cold Coffee', image: '/coffee-classic.jpeg', description: 'Smooth brewed coffee served ice cold.', ingredients: ['Coffee', 'Milk', 'Sugar', 'Ice'], taste: 'Bold & smooth', serving: 'Tall glass with foam', price: 60 },
      { name: 'Chocolate Cold Coffee', image: '/coffee-chocolate.jpeg', description: 'Coffee fused with dark chocolate.', ingredients: ['Coffee', 'Chocolate', 'Milk'], taste: 'Mocha rich', serving: 'With chocolate drizzle', price: 70 },
      { name: 'Caramel Cold Coffee', image: '/coffee-caramel.jpeg', description: 'Buttery caramel meets cold brew.', ingredients: ['Coffee', 'Caramel', 'Milk'], taste: 'Sweet caramel', serving: 'Caramel swirl glass', price: 70 },
      { name: 'Ice Cream Cold Coffee', image: '/coffee-icecream.jpeg', description: 'Topped with a scoop of vanilla ice cream.', ingredients: ['Coffee', 'Ice cream', 'Milk'], taste: 'Creamy & cold', serving: 'Affogato style', price: 80 },
      { name: 'Premium Cold Coffee', image: '/coffee-premium.jpeg', description: 'Our signature triple-shot indulgence.', ingredients: ['Espresso', 'Cream', 'Hazelnut'], taste: 'Intense & luxe', serving: 'Crystal glass presentation', price: 90 },
    ],
  },
  {
    id: 'mojitos', title: 'Mojito Collection', subtitle: 'Fresh · Fizzy · Refreshing', theme: 'from-emerald-900/30',
    items: [
      { name: 'Mint Mojito', image: '/mojito-mint.jpeg', description: 'Fresh mint muddled with lime and soda.', ingredients: ['Mint', 'Lime', 'Soda', 'Sugar'], taste: 'Cool & refreshing', serving: 'Highball with crushed ice', price: 50 },
      { name: 'Blue Lagoon Mojito', image: '/mojito-bluelagoon.jpeg', description: 'Electric blue citrus cooler.', ingredients: ['Blue curacao syrup', 'Lime', 'Soda'], taste: 'Citrus tropical', serving: 'Glowing blue glass', price: 60 },
      { name: 'Green Apple Mojito', image: '/mojito-greenapple.jpeg', description: 'Crisp green apple with mint.', ingredients: ['Green apple', 'Mint', 'Soda'], taste: 'Sweet & crisp', serving: 'With apple slices', price: 50 },
      { name: 'Watermelon Mojito', image: '/mojito-watermelon.jpeg', description: 'Juicy watermelon summer cooler.', ingredients: ['Watermelon', 'Mint', 'Lime'], taste: 'Juicy & light', serving: 'Watermelon garnish', price: 50 },
      { name: 'Strawberry Mojito', image: '/mojito-strawberry.jpeg', description: 'Berry-forward minty refresher.', ingredients: ['Strawberry', 'Mint', 'Soda'], taste: 'Berry fresh', serving: 'With muddled berries', price: 50 },
    ],
  },
  {
    id: 'lassi', title: 'Lassi Collection', subtitle: 'Creamy · Traditional · Cooling', theme: 'from-yellow-900/30',
    items: [
      { name: 'Sweet Lassi', image: '/lassi-sweet.jpeg', description: 'Traditional sweet yogurt blend.', ingredients: ['Yogurt', 'Sugar', 'Cardamom'], taste: 'Sweet & creamy', serving: 'Earthen cup with cream', benefits: ['Cooling', 'Aids digestion', 'Probiotic rich'], price: 40 },
      { name: 'Mango Lassi', image: '/lassi-mango.jpeg', description: 'Mango pulp churned with yogurt.', ingredients: ['Mango', 'Yogurt', 'Sugar'], taste: 'Fruity & thick', serving: 'Topped with saffron', benefits: ['Rich in vitamin C', 'Cooling'], price: 50 },
      { name: 'Strawberry Lassi', image: '/lassi-strawberry.jpeg', description: 'Berry twist on the classic lassi.', ingredients: ['Strawberry', 'Yogurt'], taste: 'Tangy sweet', serving: 'With berry coulis', benefits: ['Antioxidants', 'Cooling'], price: 50 },
      { name: 'Dry Fruit Lassi', image: '/lassi-dryfruit.jpeg', description: 'Loaded with premium nuts and saffron.', ingredients: ['Yogurt', 'Almonds', 'Pistachio', 'Saffron'], taste: 'Rich & nutty', serving: 'Garnished with nuts', benefits: ['Energy boost', 'Cooling'], price: 60 },
    ],
  },
  {
    id: 'buttermilk', title: 'Buttermilk Collection', subtitle: 'Light · Spiced · Hydrating', theme: 'from-slate-700/30',
    items: [
      { name: 'Classic Buttermilk', image: '/buttermilk-classic.jpeg', description: 'Light, spiced traditional chaas.', ingredients: ['Yogurt', 'Water', 'Cumin', 'Salt'], taste: 'Light & savoury', serving: 'Chilled tall glass', benefits: ['Hydrating', 'Aids digestion', 'Cooling'], price: 30 },
      { name: 'Masala Buttermilk', image: '/buttermilk-masala.jpeg', description: 'Spiced with mint, ginger and curry leaf.', ingredients: ['Yogurt', 'Mint', 'Ginger', 'Curry leaf', 'Spices'], taste: 'Spiced & zesty', serving: 'With coriander garnish', benefits: ['Digestive', 'Electrolyte boost'], price: 35 },
    ],
  },
];

export const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'Shakes', href: '#shakes' },
  { label: 'Cold Coffee', href: '#cold-coffee' },
  { label: 'Mojitos', href: '#mojitos' },
  { label: 'Lassi', href: '#lassi' },
  { label: 'Buttermilk', href: '#buttermilk' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
];
