import React, { useState } from 'react';
import { Calendar, Download, Filter, Search } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

// Mock transaction data
const mockTransactions = Array.from({ length: 20 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * 30));
  
  const products = [
    'Premium Coins Pack',
    'Exotic Weapon Skin',
    'Character Boost',
    'Battle Pass',
    'Legendary Mount',
  ];
  
  const amounts = [9.99, 14.99, 19.99, 24.99, 29.99];
  
  const statuses = ['completed', 'pending', 'failed'];
  const statusWeights = [0.8, 0.15, 0.05]; // 80% completed, 15% pending, 5% failed
  
  // Weighted random selection for status
  const statusRandom = Math.random();
  let statusIndex = 0;
  let cumulativeWeight = 0;
  
  for (let j = 0; j < statuses.length; j++) {
    cumulativeWeight += statusWeights[j];
    if (statusRandom <= cumulativeWeight) {
      statusIndex = j;
      break;
    }
  }
  
  return {
    id: (i + 1).toString(),
    date: date.toISOString().split('T')[0] + ' ' + 
          date.getHours().toString().padStart(2, '0') + ':' + 
          date.getMinutes().toString().padStart(2, '0'),
    user: `user${Math.floor(1000 + Math.random() * 9000)}@example.com`,
    product: products[Math.floor(Math.random() * products.length)],
    amount: amounts[Math.floor(Math.random() * amounts.length)].toFixed(2),
    status: statuses[statusIndex],
  };
});

const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState(mockTransactions);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  
  // Filter transactions based on search term and status
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.id.includes(searchTerm) ||
      transaction.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.product.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    
    // Date filtering
    let matchesDate = true;
    if (dateRange.start) {
      const transactionDate = new Date(transaction.date.split(' ')[0]);
      const startDate = new Date(dateRange.start);
      matchesDate = matchesDate && transactionDate >= startDate;
    }
    if (dateRange.end) {
      const transactionDate = new Date(transaction.date.split(' ')[0]);
      const endDate = new Date(dateRange.end);
      matchesDate = matchesDate && transactionDate <= endDate;
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });
  
  const totalRevenue = filteredTransactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0)
    .toFixed(2);
  
  const exportTransactions = () => {
    // In a real application, this would generate a CSV file for download
    alert('Transactions exported to CSV');
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
        >
          Export
        </Button>
      </div>
      
      {/* Stats summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="card p-5">
          <div className="text-sm font-medium text-gray-500 mb-1">Total Transactions</div>
          <div className="text-2xl font-bold text-gray-900">{filteredTransactions.length}</div>
        </div>
        <div className="card p-5">
          <div className="text-sm font-medium text-gray-500 mb-1">Completed Transactions</div>
          <div className="text-2xl font-bold text-green-600">
            {filteredTransactions.filter(t => t.status === 'completed').length}
          </div>
        </div>
        <div className="card p-5">
          <div className="text-sm font-medium text-gray-500 mb-1">Total Revenue</div>
          <div className="text-2xl font-bold text-blue-600">${totalRevenue}</div>
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
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{transaction.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.user}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.product}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${transaction.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${transaction.status === 'completed' ? 'bg-green-100 text-green-800' : 
                        transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'}`}>
                      {transaction.status}
                    </span>
                  </td>
                </tr>
              ))}
              
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No transactions found matching your search
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination would go here in a real application */}
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex justify-between">
            <div className="text-sm text-gray-500">
              Showing {filteredTransactions.length} of {transactions.length} transactions
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