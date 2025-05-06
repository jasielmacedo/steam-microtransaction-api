import React from 'react';

// Mock data for recent transactions
const transactionsData = [
  {
    id: '1',
    date: '2025-06-01 14:35',
    user: 'user123@example.com',
    product: 'Premium Coins Pack',
    amount: '$29.99',
    status: 'completed',
  },
  {
    id: '2',
    date: '2025-06-01 12:22',
    user: 'gamer456@example.com',
    product: 'Exotic Weapon Skin',
    amount: '$19.99',
    status: 'completed',
  },
  {
    id: '3',
    date: '2025-05-31 23:44',
    user: 'player789@example.com',
    product: 'Character Boost',
    amount: '$24.99',
    status: 'pending',
  },
  {
    id: '4',
    date: '2025-05-31 18:12',
    user: 'herogamer@example.com',
    product: 'Battle Pass',
    amount: '$9.99',
    status: 'completed',
  },
  {
    id: '5',
    date: '2025-05-31 15:50',
    user: 'epicplayer42@example.com',
    product: 'Legendary Mount',
    amount: '$14.99',
    status: 'failed',
  },
];

const RecentTransactions: React.FC = () => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ID
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
          {transactionsData.map((transaction) => (
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
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                {transaction.product}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                {transaction.amount}
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
        </tbody>
      </table>
    </div>
  );
};

export default RecentTransactions;