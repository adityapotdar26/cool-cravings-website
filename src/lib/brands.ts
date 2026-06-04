export type Brand = {
  name: string;
  image: string;
  color: string;
  accent: string;
  bg: [string, string];
  particle: string;
  light: string;
};

export const brands: Brand[] = [
  {
    name: 'Coca-Cola',
    image: '/Cocacola.png',
    color: '#C0102B', accent: '#ffffff', bg: ['#2a0006', '#7a0a18'], particle: '#ff5a5a', light: '#ff3b3b',
  },
  {
    name: 'Sprite',
    image: '/Sprite.png',
    color: '#1f9d57', accent: '#eaffea', bg: ['#06301c', '#0f7a45'], particle: '#9cff7a', light: '#56e08a',
  },
  {
    name: 'Pepsi',
    image: '/Pepsi.png',
    color: '#0a4cae', accent: '#cfe8ff', bg: ['#031535', '#0a3a8a'], particle: '#5ab7ff', light: '#3e8bff',
  },
  {
    name: 'Fanta',
    image: '/Fanta.png',
    color: '#ef7d10', accent: '#fff0d6', bg: ['#3a1c00', '#a85200'], particle: '#ffb24d', light: '#ff9a2e',
  },
  {
    name: 'Thums Up',
    image: '/Thumsup.png',
    color: '#0c0c12', accent: '#3ea6ff', bg: ['#000000', '#031a33'], particle: '#3ea6ff', light: '#3ea6ff',
  },
];
