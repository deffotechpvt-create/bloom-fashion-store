export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  images?: string[];
  description: string;
  sizes: string[];
  colors: string[];
  inStock: boolean;
  isNew?: boolean;
}

export const categories = [
  'All',
  'Essentials',
  'Outerwear',
  'Knitwear',
  'Tailoring',
  'Shirts',
  'Seasonal',
] as const;

export type Category = (typeof categories)[number];

export const products: Product[] = [
  {
    id: '1',
    name: 'Oversized Wool Coat',
    price: 495,
    category: 'Outerwear',
    image: '/products/coat-1.jpg',
    description: 'Luxuriously soft oversized wool coat with dropped shoulders and a relaxed silhouette. Crafted from premium Italian wool blend.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Beige', 'Charcoal', 'Ivory'],
    inStock: true,
    isNew: true,
  },
  {
    id: '2',
    name: 'Cashmere Crew Sweater',
    price: 285,
    category: 'Knitwear',
    image: '/products/sweater-1.jpg',
    description: 'Essential crew neck sweater in pure cashmere. Relaxed fit with ribbed trim details.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Charcoal', 'Cream', 'Navy'],
    inStock: true,
  },
  {
    id: '3',
    name: 'Tailored Wide Trousers',
    price: 225,
    category: 'Tailoring',
    image: '/products/pants-1.jpg',
    description: 'High-waisted wide-leg trousers in crisp cotton blend. Features clean pleats and a timeless silhouette.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Cream', 'Black', 'Sand'],
    inStock: true,
    isNew: true,
  },
  {
    id: '4',
    name: 'Organic Cotton Tee',
    price: 75,
    category: 'Essentials',
    image: '/products/tshirt-1.jpg',
    description: 'Everyday essential tee in organic cotton. Relaxed fit with a subtle boxy shape.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Olive', 'White', 'Black', 'Stone'],
    inStock: true,
  },
  {
    id: '5',
    name: 'Structured Wool Blazer',
    price: 425,
    category: 'Tailoring',
    image: '/products/blazer-1.jpg',
    description: 'Impeccably tailored single-breasted blazer in Italian wool. Sharp shoulders with a slightly relaxed body.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Black', 'Navy', 'Charcoal'],
    inStock: true,
  },
  {
    id: '6',
    name: 'Linen Camp Collar Shirt',
    price: 165,
    category: 'Shirts',
    image: '/products/shirt-1.jpg',
    description: 'Relaxed camp collar shirt in premium European linen. Perfect for warm-weather layering.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Navy', 'White', 'Sand'],
    inStock: false,
  },
];
