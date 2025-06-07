import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  TrendingUp,
  DollarSign,
  Users,
  ShoppingBag,
  ArrowRight,
  Loader,
} from "lucide-react";
import Button from "../components/ui/Button";
import StatCard from "../components/dashboard/StatCard";
import RecentTransactions from "../components/dashboard/RecentTransactions";
import RevenueChart from "../components/dashboard/RevenueChart";
import TopProducts from "../components/dashboard/TopProducts";
import { Link } from "react-router-dom";
import {
  useGetTransactionStatsQuery,
  useGetRecentTransactionsQuery,
  useGetRevenueChartDataQuery,
  useGetTopProductsQuery,
} from "../api/steamApi";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState(30); // Default to 30 days

  // Fetch dashboard data
  const { data: statsData, isLoading: isStatsLoading } =
    useGetTransactionStatsQuery({ days: timeRange });
  const { data: recentTransactions, isLoading: isTransactionsLoading } =
    useGetRecentTransactionsQuery({ limit: 5 });
  const { data: chartData, isLoading: isChartLoading } =
    useGetRevenueChartDataQuery({ days: timeRange });
  const { data: topProducts, isLoading: isProductsLoading } =
    useGetTopProductsQuery({ limit: 5, days: timeRange });

  // Prepare dashboard stats
  const stats = [
    {
      title: "Total Revenue",
      value: statsData ? `$${statsData.total_revenue.toFixed(2)}` : "-",
      change: "+12.5%", // This would ideally come from the API comparing to previous period
      isPositive: true,
      icon: <DollarSign size={20} className="text-blue-700" />,
      color: "blue",
      isLoading: isStatsLoading,
    },
    {
      title: "Transactions",
      value: statsData ? statsData.total_count.toString() : "-",
      change: "+5.8%", // This would ideally come from the API
      isPositive: true,
      icon: <TrendingUp size={20} className="text-green-700" />,
      color: "green",
      isLoading: isStatsLoading,
    },
    {
      title: "Completed Transactions",
      value: statsData ? statsData.completed_count.toString() : "-",
      change: "+18.2%", // This would ideally come from the API
      isPositive: true,
      icon: <Users size={20} className="text-purple-700" />,
      color: "purple",
      isLoading: isStatsLoading,
    },
    {
      title: "Success Rate",
      value: statsData
        ? `${(
            (statsData.completed_count / Math.max(statsData.total_count, 1)) *
            100
          ).toFixed(1)}%`
        : "-",
      change:
        statsData && statsData.total_count > 0
          ? statsData.completed_count / statsData.total_count > 0.9
            ? "+2.1%"
            : "-1.3%"
          : "+0.0%",
      isPositive: statsData
        ? statsData.completed_count / Math.max(statsData.total_count, 1) > 0.9
        : true,
      icon: <ShoppingBag size={20} className="text-orange-700" />,
      color: "orange",
      isLoading: isStatsLoading,
    },
  ];

  return (
    <div className="fade-in">
      {/* Welcome section */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          Welcome back, {user?.name || "User"}
        </h2>
        <p className="mt-1 text-sm sm:text-base text-gray-500">
          Here's what's happening with your microtransactions today.
        </p>

        {/* Time range selector */}
        <div className="mt-3 flex space-x-2">
          <Button
            variant={timeRange === 7 ? "primary" : "outline"}
            size="sm"
            onClick={() => setTimeRange(7)}
          >
            7 Days
          </Button>
          <Button
            variant={timeRange === 30 ? "primary" : "outline"}
            size="sm"
            onClick={() => setTimeRange(30)}
          >
            30 Days
          </Button>
          <Button
            variant={timeRange === 90 ? "primary" : "outline"}
            size="sm"
            onClick={() => setTimeRange(90)}
          >
            90 Days
          </Button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.isLoading ? undefined : stat.value}
            change={stat.change}
            isPositive={stat.isPositive}
            icon={stat.icon}
            color={stat.color}
            isLoading={stat.isLoading}
          />
        ))}
      </div>

      {/* Charts and data section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Revenue chart - Takes 2/3 of the row on desktop */}
        <div className="card p-4 sm:p-5 lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
              Revenue Overview
            </h3>
            <div className="text-xs sm:text-sm text-gray-500">
              Last {timeRange} days
            </div>
          </div>
          {isChartLoading ? (
            <div className="h-64 flex items-center justify-center">
              <Loader className="animate-spin mr-2" size={20} />
              <span>Loading chart data...</span>
            </div>
          ) : (
            <RevenueChart data={chartData || []} />
          )}
        </div>

        {/* Top products - Takes 1/3 of the row on desktop */}
        <div className="card p-4 sm:p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
              Top Products
            </h3>
            <Link to="/products">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs sm:text-sm text-blue-600 hover:text-blue-700"
                icon={<ArrowRight size={16} />}
                iconPosition="right"
              >
                View All
              </Button>
            </Link>
          </div>
          {isProductsLoading ? (
            <div className="h-64 flex items-center justify-center">
              <Loader className="animate-spin mr-2" size={20} />
              <span>Loading products data...</span>
            </div>
          ) : (
            <TopProducts products={topProducts || []} />
          )}
        </div>
      </div>

      {/* Recent transactions */}
      <div className="mt-4 sm:mt-6">
        <div className="card p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-0">
              Recent Transactions
            </h3>
            <Link to="/transactions">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs sm:text-sm text-blue-600 hover:text-blue-700"
              >
                View All Transactions
              </Button>
            </Link>
          </div>
          {isTransactionsLoading ? (
            <div className="h-40 flex items-center justify-center">
              <Loader className="animate-spin mr-2" size={20} />
              <span>Loading transactions...</span>
            </div>
          ) : (
            <RecentTransactions transactions={recentTransactions || []} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
