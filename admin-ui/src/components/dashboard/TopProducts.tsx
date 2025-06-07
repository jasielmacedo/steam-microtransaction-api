import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { Link } from 'react-router-dom';

// Interface for top product data
interface TopProduct {
  id: string;
  product_name: string;
  revenue: number;
  count: number;
}

interface TopProductsProps {
  products: TopProduct[];
}

const TopProducts: React.FC<TopProductsProps> = ({ products }) => {
  // Function to generate random trend data (in a real app, this would come from the API)
  const getRandomTrend = () => {
    const isUp = Math.random() > 0.3;
    const percentage = Math.floor(Math.random() * 15) + 1;
    return { trend: isUp ? 'up' : 'down', percentage };
  };
  
  if (products.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">
        No product data available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {products.map((product) => {
        // Generate random trend data for visualization
        const { trend, percentage } = getRandomTrend();
        
        return (
          <div 
            key={product.id}
            className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
          >
            <div className="flex flex-col flex-1 min-w-0 mr-4">
              <Link 
                to={`/products/${product.id}`} 
                className="font-medium text-gray-900 text-sm sm:text-base truncate hover:text-blue-600"
              >
                {product.product_name}
              </Link>
              <span className="text-xs sm:text-sm text-gray-500">{product.count} sales</span>
            </div>
            
            <div className="flex items-center whitespace-nowrap">
              <span className="font-medium text-gray-900 text-sm sm:text-base mr-2">
                ${product.revenue.toFixed(2)}
              </span>
              
              <div
                className={`flex items-center text-xs ${
                  trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {trend === 'up' ? (
                  <ArrowUp size={14} className="mr-1" />
                ) : (
                  <ArrowDown size={14} className="mr-1" />
                )}
                {percentage}%
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TopProducts;