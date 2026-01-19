export interface Product {
  id: string;
  _id?: string;
  name: string;
  price: number;
  category: string;
  image: string;
  images?: string[];
  description?: string;
  sizes?: string[];
  colors?: string[];
  inStock?: boolean;
  isNew?: boolean;
  stock?: number;
}
