import React, { useState, useEffect } from 'react';
import { ShoppingCart, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

// Product interface
interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  description: string;
  image: string;
}

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

// Generate realistic product data
const generateProductData = (): Product[] => {
  const productNames = {
    electronics: [
      'MacBook Pro 16"', 'Dell XPS 13', 'iPad Pro 12.9"', 'iPhone 14 Pro',
      'Samsung Galaxy S23', 'Sony WH-1000XM4', 'AirPods Pro', 'Nintendo Switch',
      'PlayStation 5', 'Xbox Series X', 'Apple Watch Series 8', 'Samsung Watch 5',
      'Kindle Paperwhite', 'Microsoft Surface Pro', 'Google Pixel 7', 'Canon EOS R5',
      'Sony A7 IV', 'LG OLED TV 55"', 'Samsung 4K Monitor', 'Razer Gaming Mouse'
    ],
    clothing: [
      'Nike Air Force 1', 'Adidas Stan Smith', 'Levi\'s 501 Jeans', 'Patagonia Jacket',
      'North Face Hoodie', 'Uniqlo T-Shirt', 'Ralph Lauren Polo', 'Zara Dress',
      'H&M Sweater', 'Gap Khakis', 'Converse Chuck Taylor', 'Vans Old Skool',
      'Nike Dri-FIT Shirt', 'Lululemon Leggings', 'Champion Sweatshirt', 'Tommy Hilfiger Shirt',
      'Calvin Klein Underwear', 'Hanes T-Shirt Pack', 'Dockers Chinos', 'Timberland Boots'
    ],
    books: [
      'The Psychology of Money', 'Atomic Habits', 'Sapiens', 'The 7 Habits Guide',
      'Think and Grow Rich', 'Rich Dad Poor Dad', 'The Lean Startup', 'Zero to One',
      'Good to Great', 'The Innovator\'s Dilemma', 'Educated', 'Becoming',
      'The Silent Patient', 'Where the Crawdads Sing', '1984', 'To Kill a Mockingbird',
      'Pride and Prejudice', 'The Great Gatsby', 'Harry Potter Box Set', 'Lord of the Rings'
    ]
  };

  const descriptions = {
    electronics: [
      'Latest technology with premium features and exceptional performance',
      'High-quality device with cutting-edge specifications and sleek design', 
      'Advanced functionality meets user-friendly interface in this top-rated product',
      'Professional-grade equipment designed for demanding users and applications',
      'Innovative features combined with reliability and outstanding build quality'
    ],
    clothing: [
      'Comfortable and stylish apparel for everyday wear and special occasions',
      'Premium materials and modern design create the perfect blend of form and function',
      'Classic style meets contemporary fashion in this versatile wardrobe essential',
      'High-quality construction ensures durability while maintaining comfort and style',
      'Trendy design and superior comfort make this a must-have fashion item'
    ],
    books: [
      'Insightful and engaging read that offers valuable perspectives and knowledge',
      'Thought-provoking content that challenges conventional wisdom and inspires growth',
      'Comprehensive guide filled with practical advice and actionable insights',
      'Captivating storytelling combined with profound themes and memorable characters',
      'Essential reading that provides both entertainment and intellectual stimulation'
    ]
  };

  const products: Product[] = [];
  let id = 1;

  // Fixed prices to ensure deterministic behavior and avoid boundary confusion ($50 and $100 exactly)
  const fixedPrices = [
    // Electronics (8 items) - mix of ranges
    96, 105, 142, 78, 33, 125, 89, 67,
    // Clothing (8 items) - mix of ranges  
    91, 115, 45, 82, 28, 118, 74, 39,
    // Books (8 items) - mostly under $50 with a few over
    22, 18, 35, 87, 16, 29, 102, 41
  ];

  let priceIndex = 0;
  
  // Generate 8 products of each category (24 total for 2 pages)
  Object.entries(productNames).forEach(([category, names]) => {
    const categoryNames = names.slice(0, 8); // Take only first 8 names per category
    categoryNames.forEach((name, index) => {
      const price = fixedPrices[priceIndex++];

      products.push({
        id: id++,
        name,
        price,
        category,
        description: descriptions[category as keyof typeof descriptions][
          index % descriptions[category as keyof typeof descriptions].length
        ],
        image: `https://images.unsplash.com/400x300/?${category}&${id}` // Placeholder image
      });
    });
  });

  // Return products in deterministic order (no random shuffle for consistent testing)
  return products;
};

const Task3: React.FC = () => {
  const [products] = useState<Product[]>(() => generateProductData());
  const [currentPage, setCurrentPage] = useState(1);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [addedProductIds, setAddedProductIds] = useState<Set<number>>(new Set());
  // const cartScrollRef = useRef<HTMLDivElement>(null); // No longer needed for auto-scroll

  const ITEMS_PER_PAGE = 12;
  const TOTAL_PAGES = 2;

  // Expose app state for testing
  useEffect(() => {
    const productsOver50 = products.filter(p => p.price > 50);
    const cartItemsOver50 = cart.filter(item => item.price > 50);
    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    (window as any).app_state = {
      products,
      cart,
      currentPage,
      addedProductIds: Array.from(addedProductIds),
      totalProducts: products.length,
      productsOver50Count: productsOver50.length,
      cartItemsCount: cart.length,
      cartItemsOver50Count: cartItemsOver50.length,
      cartTotal,
      totalPages: TOTAL_PAGES
    };
  }, [products, cart, currentPage, addedProductIds]);

  // Auto-scroll functionality no longer needed since cart doesn't have internal scrolling
  // Items will be visible by default as the page expands naturally

  const getCurrentPageProducts = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return products.slice(startIndex, endIndex);
  };

  const addToCart = (product: Product) => {
    if (addedProductIds.has(product.id)) {
      return; // Already added, prevent duplicates
    }

    // Only add items over $50
    if (product.price <= 50) {
      return; // Don't add items $50 or below
    }

    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      const newItem: CartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1 // Always start with quantity 1, agent must manually adjust
      };
      setCart([...cart, newItem]);
    }

    setAddedProductIds(prev => new Set([...prev, product.id]));
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.id !== productId));
    setAddedProductIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(productId);
      return newSet;
    });
  };

  const updateCartQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(cart.map(item =>
      item.id === productId
        ? { ...item, quantity }
        : item
    ));
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= TOTAL_PAGES) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-100">
      {/* Main Content Area - Product Catalog */}
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Product Catalog</h1>
          
          {/* Product Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {getCurrentPageProducts().map(product => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
              >
                <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                  <span className="text-gray-500 text-sm">{product.category}</span>
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-lg text-gray-800 mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  
                  <div className="mb-3">
                    <span className="text-2xl font-bold text-green-600">
                      ${product.price}
                    </span>
                    <span className="text-sm text-gray-500 ml-2">
                      {product.category}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {product.description}
                  </p>
                  
                  <button
                    onClick={() => addToCart(product)}
                    disabled={addedProductIds.has(product.id)}
                    className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                      addedProductIds.has(product.id)
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {addedProductIds.has(product.id) ? 'Added to Cart' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center space-x-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} className="mr-1" />
              Previous
            </button>

            {Array.from({ length: TOTAL_PAGES }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => goToPage(page)}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === TOTAL_PAGES}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight size={16} className="ml-1" />
            </button>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Shopping Cart */}
      <div className="w-full lg:w-80 bg-white border-t lg:border-t-0 lg:border-l border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <ShoppingCart size={20} />
            <h2 className="text-lg font-semibold">Shopping Cart</h2>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {cart.length} item{cart.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="p-4">
          {cart.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <ShoppingCart size={48} className="mx-auto mb-4 opacity-50" />
              <p>Your cart is empty</p>
              <p className="text-sm mt-2">Add items over $50 to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-sm line-clamp-2 flex-1 mr-2">
                      {item.name}
                    </h4>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-700 flex-shrink-0"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                        className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-sm"
                      >
                        -
                      </button>
                      <span className="text-sm font-medium w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-sm"
                      >
                        +
                      </button>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-semibold text-green-600">
                        ${item.price * item.quantity}
                      </div>
                      <div className="text-xs text-gray-500">
                        ${item.price} each
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t border-gray-200 p-4">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Total:</span>
              <span className="text-green-600">${getCartTotal()}</span>
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {cart.filter(item => item.price > 50).length} items over $50
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Task3;
