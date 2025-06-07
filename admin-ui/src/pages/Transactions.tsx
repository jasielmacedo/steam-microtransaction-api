import React, { useState } from 'react';
import { Calendar, Download, Filter, Search, Loader, ExternalLink } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Link } from 'react-router-dom';
import { useGetSteamTransactionsQuery } from '../api/steamApi';
import { SteamTransaction } from '../api/steamApi';

const Transactions: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  
  // API query parameters
  const queryParams = {
    status: statusFilter !== 'all' ? statusFilter : undefined,
    startDate: dateRange.start || undefined,
    endDate: dateRange.end || undefined
  };
  
  // Fetch transactions from API
  const { data: transactionsData, isLoading, isError } = useGetSteamTransactionsQuery(queryParams);
  
  // Filter transactions based on search term
  const filteredTransactions = transactionsData ? transactionsData.filter(transaction => {
    const searchLower = searchTerm.toLowerCase();
    return (
      transaction.id.toLowerCase().includes(searchLower) ||
      transaction.user.toLowerCase().includes(searchLower) ||
      transaction.product.toLowerCase().includes(searchLower)
    );
  }) : [];
  
  // Calculate total revenue from completed transactions
  const totalRevenue = filteredTransactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0)
    .toFixed(2);
  
  const exportTransactions = () => {
    if (!filteredTransactions.length) {
      alert('No transactions to export');
      return;
    }
    
    // Create CSV content
    const headers = ['ID', 'Date', 'User', 'Product', 'Amount', 'Status', 'App ID'];
    const csvContent = [
      headers.join(','),
      ...filteredTransactions.map(t => [
        t.id,
        t.date,
        t.user,
        `"${t.product.replace(/"/g, '""')}"`, // Escape quotes in product names
        t.amount,
        t.status,
        t.app_id
      ].join(','))
    ].join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Transactions</h2>
          <p className="text-gray-500 mt-1">
            View and manage all microtransactions
          </p>
        </div>
        <Button 
          variant="outline"
          icon={<Download size={16} />}
          onClick={exportTransactions}
          disabled={!filteredTransactions.length}
        >
          Export
        </Button>
      </div>
      
      {/* Stats summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="card p-5">
          <div className="text-sm font-medium text-gray-500 mb-1">Total Transactions</div>
          <div className="text-2xl font-bold text-gray-900">
            {isLoading ? <Loader size={18} className="animate-spin" /> : filteredTransactions.length}
          </div>
        </div>
        <div className="card p-5">
          <div className="text-sm font-medium text-gray-500 mb-1">Completed Transactions</div>
          <div className="text-2xl font-bold text-green-600">
            {isLoading ? <Loader size={18} className="animate-spin" /> : filteredTransactions.filter(t => t.status === 'completed').length}
          </div>
        </div>
        <div className="card p-5">
          <div className="text-sm font-medium text-gray-500 mb-1">Total Revenue</div>
          <div className="text-2xl font-bold text-blue-600">
            {isLoading ? <Loader size={18} className="animate-spin" /> : `$${totalRevenue}`}
          </div>
        </div>
      </div>
      
      {/* Filters */}
      <div className="card p-5 mb-6">
        <div className="text-gray-900 font-medium mb-3">Filters</div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="
                w-full rounded-md shadow-sm
                border-gray-300 focus:ring-blue-500
                focus:border-transparent focus:outline-none
                transition duration-150 ease-in-out
                h-[38px]
              "
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          
          <div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                type="date"
                placeholder="Start date"
                value={dateRange.start}
                onChange={e => setDateRange({...dateRange, start: e.target.value})}
                className="pl-10"
              />
            </div>
          </div>
          
          <div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                type="date"
                placeholder="End date"
                value={dateRange.end}
                onChange={e => setDateRange({...dateRange, end: e.target.value})}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Transactions table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-10 flex justify-center">
              <Loader className="animate-spin mr-2" size={20} />
              <span>Loading transactions...</span>
            </div>
          ) : isError ? (
            <div className="p-10 text-center text-red-500">
              Error loading transactions. Please try again.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{transaction.id.substring(0, 8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.user || 'Anonymous'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.product}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${parseFloat(transaction.amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${transaction.status === 'completed' ? 'bg-green-100 text-green-800' : 
                          transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'}`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Link 
                        to={`/transactions/${transaction.id}`}
                        className="text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        View <ExternalLink size={12} className="ml-1" />
                      </Link>
                    </td>
                  </tr>
                ))}
                
                {filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      No transactions found matching your search
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Pagination would go here in a real application */}
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex justify-between">
            <div className="text-sm text-gray-500">
              Showing {filteredTransactions.length} transactions
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" disabled>Previous</Button>
              <Button variant="outline" size="sm" disabled>Next</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transactions;