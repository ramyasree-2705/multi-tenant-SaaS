import { Product } from '../types';

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Classic Denim Jacket',
    price: 89.99,
    category: 'Jackets',
    image: 'https://images.pexels.com/photos/1656684/pexels-photo-1656684.jpeg?auto=compress&cs=tinysrgb&w=500',
    description: 'Timeless denim jacket perfect for casual outings',
    rating: 4.5,
    reviews: 128
  },
  {
    id: '2',
    name: 'Cotton Blend T-Shirt',
    price: 24.99,
    category: 'T-Shirts',
    image: 'https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg?auto=compress&cs=tinysrgb&w=500',
    description: 'Comfortable cotton blend t-shirt for everyday wear',
    rating: 4.2,
    reviews: 89
  },
  {
    id: '3',
    name: 'Slim Fit Jeans',
    price: 79.99,
    category: 'Jeans',
    image: 'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=500',
    description: 'Modern slim fit jeans with premium denim',
    rating: 4.7,
    reviews: 156
  },
  {
    id: '4',
    name: 'Casual Hoodie',
    price: 49.99,
    category: 'Hoodies',
    image: 'https://images.pexels.com/photos/8148579/pexels-photo-8148579.jpeg?auto=compress&cs=tinysrgb&w=500',
    description: 'Cozy hoodie perfect for cool weather',
    rating: 4.3,
    reviews: 94
  },
  {
    id: '5',
    name: 'Elegant Dress Shirt',
    price: 69.99,
    category: 'Shirts',
    image: 'https://images.pexels.com/photos/769732/pexels-photo-769732.jpeg?auto=compress&cs=tinysrgb&w=500',
    description: 'Professional dress shirt for formal occasions',
    rating: 4.6,
    reviews: 73
  },
  {
    id: '6',
    name: 'Summer Dress',
    price: 59.99,
    category: 'Dresses',
    image: 'https://images.pexels.com/photos/1126993/pexels-photo-1126993.jpeg?auto=compress&cs=tinysrgb&w=500',
    description: 'Light and breezy summer dress',
    rating: 4.4,
    reviews: 112
  },
  {
    id: '7',
    name: 'Leather Boots',
    price: 129.99,
    category: 'Shoes',
    image: 'https://images.pexels.com/photos/336372/pexels-photo-336372.jpeg?auto=compress&cs=tinysrgb&w=500',
    description: 'Durable leather boots for all occasions',
    rating: 4.8,
    reviews: 201
  },
  {
    id: '8',
    name: 'Knit Sweater',
    price: 64.99,
    category: 'Sweaters',
    image: 'https://images.pexels.com/photos/7679862/pexels-photo-7679862.jpeg?auto=compress&cs=tinysrgb&w=500',
    description: 'Warm knit sweater for cold days',
    rating: 4.1,
    reviews: 67
  }
];

export const CATEGORIES = [
  'All',
  'T-Shirts',
  'Jeans',
  'Jackets',
  'Hoodies',
  'Shirts',
  'Dresses',
  'Shoes',
  'Sweaters'
];