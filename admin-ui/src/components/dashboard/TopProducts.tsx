import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

// Mock data for top products
const topProductsData = [
  {
    id: 1,
    name: 'Premium Coins Pack',
    sales: 1543,
    revenue: 5390,
    trend: 'up',
    percentage: 12,
  },
  {
    id: 2,
    name: 'Exotic Weapon Skin',
    sales: 1245,
    revenue: 4980,
    trend: 'up',
    percentage: 5,
  },
  {
    id: 3,
    name: 'Character Boost',
    sales: 987,
    revenue: 3948,
    trend: 'down',
    percentage: 3,
  },
  {
    id: 4,
    name: 'Legendary Mount',
    sales: 876,
    revenue: 3504,
    trend: 'up',
    percentage: 8,
  },
  {
    id: 5,
    name: 'Battle Pass',
    sales: 743,
    revenue: 2972,
    trend: 'down',
    percentage: 2,
  },
];

const TopProducts: React.FC = () => {
  return (
    <div className="space-y-4">
      {topProductsData.map((product) => (
        <div 
          key={product.id}
          className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
        >
          <div className="flex flex-col flex-1 min-w-0 mr-4">
            <span className="font-medium text-gray-900 text-sm sm:text-base truncate">{product.name}</span>
            <span className="text-xs sm:text-sm text-gray-500">{product.sales} sales</span>
          </div>
          
          <div className="flex items-center whitespace-nowrap">
            <span className="font-medium text-gray-900 text-sm sm:text-base mr-2">
              ${product.revenue.toLocaleString()}
            </span>
            
            <div
              className={`flex items-center text-xs ${
                product.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {product.trend === 'up' ? (
                <ArrowUp size={14} className="mr-1" />
              ) : (
                <ArrowDown size={14} className="mr-1" />
              )}
              {product.percentage}%
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TopProducts;