import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  ShoppingBag,
  ChevronUp,
  ChevronDown,
  ArrowRight
} from 'lucide-react';
import Button from '../components/ui/Button';
import StatCard from '../components/dashboard/StatCard';
import RecentTransactions from '../components/dashboard/RecentTransactions';
import RevenueChart from '../components/dashboard/RevenueChart';
import TopProducts from '../components/dashboard/TopProducts';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  
  // Mock stats data - In a real app, this would come from an API
  const stats = [
    {
      title: 'Total Revenue',
      value: '$12,492',
      change: '+12.5%',
      isPositive: true,
      icon: <DollarSign size={20} className="text-blue-700" />,
      color: 'blue',
    },
    {
      title: 'Transactions',
      value: '4,385',
      change: '+5.8%',
      isPositive: true,
      icon: <TrendingUp size={20} className="text-green-700" />,
      color: 'green',
    },
    {
      title: 'Active Users',
      value: '2,452',
      change: '+18.2%',
      isPositive: true,
      icon: <Users size={20} className="text-purple-700" />,
      color: 'purple',
    },
    {
      title: 'Products Sold',
      value: '6,789',
      change: '-2.4%',
      isPositive: false,
      icon: <ShoppingBag size={20} className="text-orange-700" />,
      color: 'orange',
    },
  ];

  return (
    <div className="fade-in">
      {/* Welcome section */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          Welcome back, {user?.name || 'User'}
        </h2>
        <p className="mt-1 text-sm sm:text-base text-gray-500">
          Here's what's happening with your microtransactions today.
        </p>
      </div>
      
      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
        {stats.map((stat, index) => (
          <StatCard 
            key={index}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            isPositive={stat.isPositive}
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </div>
      
      {/* Charts and data section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Revenue chart - Takes 2/3 of the row on desktop */}
        <div className="card p-4 sm:p-5 lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Revenue Overview</h3>
            <div className="text-xs sm:text-sm text-gray-500">Last 30 days</div>
          </div>
          <RevenueChart />
        </div>
        
        {/* Top products - Takes 1/3 of the row on desktop */}
        <div className="card p-4 sm:p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Top Products</h3>
            <Button 
              variant="ghost"
              size="sm"
              className="text-xs sm:text-sm text-blue-600 hover:text-blue-700"
              icon={<ArrowRight size={16} />}
              iconPosition="right"
            >
              View All
            </Button>
          </div>
          <TopProducts />
        </div>
      </div>
      
      {/* Recent transactions */}
      <div className="mt-4 sm:mt-6">
        <div className="card p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-0">Recent Transactions</h3>
            <Button 
              variant="ghost"
              size="sm"
              className="text-xs sm:text-sm text-blue-600 hover:text-blue-700"
            >
              View All Transactions
            </Button>
          </div>
          <RecentTransactions />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;