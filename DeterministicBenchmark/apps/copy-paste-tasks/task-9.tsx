import React, { useState, useEffect, useRef } from 'react';
import { Star, ShoppingCart } from 'lucide-react';

// Product interface
interface Product {
  id: number;
  name: string;
  price: number;
  rating: number;
  reviewCount: number;
  category: string;
  imageUrl: string;
  description: string;
  hasScreen: boolean;
}

// Simple seeded random number generator
class SeededRandom {
  private seed: number;
  
  constructor(seed: number) {
    this.seed = seed;
  }
  
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}

// Generate deterministic product data
const generateProductData = (): Product[] => {
  const rng = new SeededRandom(12345); // Fixed seed for consistent data
  
  // Electronics items with screen information
  const electronicsItems = [
    // Items WITH screens
    { name: 'iPhone 15 Pro', hasScreen: true },
    { name: 'Samsung Galaxy S24', hasScreen: true },
    { name: 'MacBook Air M2', hasScreen: true },
    { name: 'Dell XPS 13', hasScreen: true },
    { name: 'iPad Pro', hasScreen: true },
    { name: 'Surface Pro 9', hasScreen: true },
    { name: 'Gaming Laptop ASUS', hasScreen: true },
    { name: 'HP Spectre x360', hasScreen: true },
    { name: 'Lenovo ThinkPad', hasScreen: true },
    { name: 'Microsoft Surface Laptop', hasScreen: true },
    { name: 'Samsung Tab S9', hasScreen: true },
    { name: 'Google Pixel 8', hasScreen: true },
    { name: 'OnePlus 11', hasScreen: true },
    { name: 'Xiaomi 13 Pro', hasScreen: true },
    { name: 'Nothing Phone 2', hasScreen: true },
    { name: 'Steam Deck', hasScreen: true },
    { name: 'Nintendo Switch OLED', hasScreen: true },
    { name: 'Apple Watch Ultra', hasScreen: true },
    { name: 'Garmin Fenix 7', hasScreen: true },
    { name: 'Meta Quest 3', hasScreen: true },
    // Items WITHOUT screens  
    { name: 'Sony WH-1000XM5 Headphones', hasScreen: false },
    { name: 'AirPods Pro', hasScreen: false },
    { name: 'Bose QuietComfort Headphones', hasScreen: false },
    { name: 'PlayStation 5', hasScreen: false },
    { name: 'Xbox Series X', hasScreen: false },
    { name: 'Mechanical Keyboard RGB', hasScreen: false },
    { name: 'Wireless Mouse Gaming', hasScreen: false },
    { name: 'USB-C Charging Cable', hasScreen: false },
    { name: 'Bluetooth Speaker JBL', hasScreen: false },
    { name: 'Wireless Charger Pad', hasScreen: false },
    { name: 'External SSD 1TB', hasScreen: false },
    { name: 'Webcam 4K HD', hasScreen: false },
    { name: 'Power Bank 20000mAh', hasScreen: false },
    { name: 'HDMI Cable 4K', hasScreen: false },
    { name: 'Router WiFi 6', hasScreen: false }
  ];
  
  const products: Product[] = [];
  
  // Generate 35 electronics items
  for (let i = 0; i < electronicsItems.length; i++) {
    const rating = 3.2 + (rng.next() * 1.6); // 3.2 to 4.8
    const price = 99 + Math.floor(rng.next() * 2901); // $99-$2999
    const reviewCount = 50 + Math.floor(rng.next() * 1000); // 50-1049 reviews
    
    products.push({
      id: i + 1,
      name: electronicsItems[i].name,
      price,
      rating: Math.round(rating * 10) / 10, // Round to 1 decimal
      reviewCount,
      category: 'Electronics',
      imageUrl: `/api/placeholder/200/200`,
      description: `High-quality ${electronicsItems[i].name.toLowerCase()} with advanced features`,
      hasScreen: electronicsItems[i].hasScreen
    });
  }
  
  return products;
};

const Task9: React.FC = () => {
  const [products] = useState<Product[]>(() => generateProductData());
  const [sortBy, setSortBy] = useState<string>('name');
  const hasLoggedOnce = useRef(false);
  
  // Expose app state for testing
  useEffect(() => {
    // Find products without screens
    const productsWithoutScreens = products.filter(p => !p.hasScreen);
    const expectedProductNames = productsWithoutScreens.map(p => p.name).sort();
    
    // Console log for human testers (single-run)
    if (!hasLoggedOnce.current) {
      const expectedJSON = { products: expectedProductNames };
      console.log('=== EXPECTED JSON (for testers) ===');
      console.log(JSON.stringify(expectedJSON, null, 2));
      console.log('=== COPY-PASTEABLE VERSION ===');
      console.log(JSON.stringify(expectedJSON));
      console.log(`Total products: ${products.length}, Products without screens: ${productsWithoutScreens.length}`);
      console.log('Products without screens:', expectedProductNames);
      hasLoggedOnce.current = true;
    }
    
    (window as any).app_state = {
      products,
      productsWithoutScreens,
      expectedProductNames,
      submission: (window as any).app_state?.submission,
      totalProducts: products.length,
      productsWithoutScreensCount: productsWithoutScreens.length
    };
  }, [products]);
  
  const getSortedProducts = () => {
    return products.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating; // Highest rating first
        case 'price':
          return a.price - b.price; // Lowest price first
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  };
  
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Star key={i} size={16} className="fill-yellow-400 text-yellow-400 opacity-50" />
        );
      } else {
        stars.push(
          <Star key={i} size={16} className="text-gray-300" />
        );
      }
    }
    
    return stars;
  };
  
  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center gap-2">
          <ShoppingCart size={24} className="text-blue-600" />
          <h1 className="text-xl font-semibold">Electronics Catalog</h1>
        </div>
      </div>
      
      {/* Controls */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="name">Name (A to Z)</option>
              <option value="rating">Rating (High to Low)</option>
              <option value="price">Price (Low to High)</option>
            </select>
          </div>
          <div className="text-sm text-gray-600">
            Showing {products.length} electronics products
          </div>
        </div>
      </div>
      
      {/* Product Grid */}
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {getSortedProducts().map(product => (
            <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-32 bg-gray-100 flex items-center justify-center">
                <div className="text-gray-400 text-sm">Product Image</div>
              </div>
              
              <div className="p-4">
                <h3 className="font-medium text-gray-900 mb-2">{product.name}</h3>
                
                <div className="flex items-center gap-1 mb-2">
                  {renderStars(product.rating)}
                  <span className="text-sm text-gray-600 ml-1">
                    {product.rating} ({product.reviewCount})
                  </span>
                </div>
                
                <div className="text-lg font-bold text-gray-900 mb-2">
                  ${product.price.toFixed(2)}
                </div>
                
                <p className="text-sm text-gray-600 line-clamp-2">
                  {product.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
};

export default Task9;
