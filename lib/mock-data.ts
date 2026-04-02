export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  category: 'For Her' | 'For Him' | 'Testers' | 'Deals';
  image: string;
  gallery?: string[];
  description: string;
  isNew?: boolean;
  sizes?: string[];
}

export interface Order {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  items: { productId: string; name: string; quantity: number; price: number; size?: string }[];
  total: number;
  shippingFee: number;
  status: 'Pending' | 'Received' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  date: string;
  notes?: string;
}

export interface Deal {
  id: string;
  name: string;
  subtextText: string;
  durationRange: string;
  image: string;
  price?: number;
  gallery?: string[];
  productIds?: string[];
}

export const products: Product[] = [
  {
    id: '1',
    name: 'Noir Absolute',
    brand: 'Hautique',
    price: 120,
    category: 'For Him',
    image: 'https://picsum.photos/seed/perfume1/600/600',
    description: 'A deep, mysterious blend of oud, leather, and dark spices. Perfect for evening wear.',
    isNew: true,
  },
  {
    id: '2',
    name: 'Velvet Rose',
    brand: 'Hautique',
    price: 95,
    category: 'For Her',
    image: 'https://picsum.photos/seed/perfume2/600/600',
    description: 'A delicate yet powerful floral scent featuring Bulgarian rose and white musk.',
  },
  {
    id: '3',
    name: 'Oceanic Mist',
    brand: 'Hautique',
    price: 85,
    category: 'Testers',
    image: 'https://picsum.photos/seed/perfume3/600/600',
    description: 'Fresh sea salt and citrus notes. A light, airy fragrance for daily use.',
  },
  {
    id: '4',
    name: 'Golden Amber',
    brand: 'Hautique',
    price: 150,
    category: 'Deals',
    image: 'https://picsum.photos/seed/perfume4/600/600',
    description: 'Warm amber and vanilla with a hint of sandalwood. Luxurious and long-lasting.',
  },
  {
    id: '5',
    name: 'Midnight Jasmine',
    brand: 'Hautique',
    price: 110,
    category: 'For Her',
    image: 'https://picsum.photos/seed/perfume5/600/600',
    description: 'Exotic jasmine blooms under the moonlight, balanced with soft cedarwood.',
  },
  {
    id: '6',
    name: 'Silver Birch',
    brand: 'Hautique',
    price: 90,
    category: 'For Him',
    image: 'https://picsum.photos/seed/perfume6/600/600',
    description: 'Crisp birch bark and cool mint. An invigorating scent for the modern man.',
  },
  {
    id: '7',
    name: 'Citrus Bloom',
    brand: 'Hautique',
    price: 75,
    category: 'Testers',
    image: 'https://picsum.photos/seed/perfume7/600/600',
    description: 'Zesty orange and grapefruit mixed with light floral undertones.',
  },
  {
    id: '8',
    name: 'Royal Oud',
    brand: 'Hautique',
    price: 200,
    category: 'Deals',
    image: 'https://picsum.photos/seed/perfume8/600/600',
    description: 'The finest agarwood blended with rare spices. The pinnacle of luxury.',
  },
];

export const orders: Order[] = [
  {
    id: 'ORD-001',
    customerName: 'John Doe',
    email: 'john@example.com',
    phone: '+1 234 567 890',
    address: '123 Luxury Ave, New York, NY',
    items: [{ productId: '1', name: 'Noir Absolute', quantity: 1, price: 120 }],
    total: 120,
    shippingFee: 0,
    status: 'Pending',
    date: 'March 20, 2024',
  },
  {
    id: 'ORD-002',
    customerName: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+1 987 654 321',
    address: '456 Fashion St, Los Angeles, CA',
    items: [{ productId: '2', name: 'Velvet Rose', quantity: 2, price: 95 }],
    total: 190,
    shippingFee: 0,
    status: 'Delivered',
    date: 'March 18, 2024',
  },
];
