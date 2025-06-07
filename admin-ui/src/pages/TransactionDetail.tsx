import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Check, Clock, XCircle, RefreshCw } from 'lucide-react';
import Button from '../components/ui/Button';
import { useGetSteamTransactionQuery, useCheckPurchaseStatusMutation } from '../api/steamApi';

const TransactionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: transaction, isLoading, isError, refetch } = useGetSteamTransactionQuery(id || '');
  const [checkStatus, { isLoading: isChecking }] = useCheckPurchaseStatusMutation();
  
  // Handle manual transaction status check
  const handleCheckStatus = async () => {
    if (transaction) {
      try {
        // Make sure we have all needed fields
        if (!transaction.app_id || !transaction.id || !transaction.trans_id) {
          console.error('Missing required fields for status check');
          return;
        }
        
        await checkStatus({
          app_id: transaction.app_id,
          order_id: transaction.id,
          trans_id: transaction.trans_id
        }).unwrap();
        
        // Refresh transaction data after status check
        refetch();
      } catch (error) {
        console.error('Failed to check transaction status:', error);
      }
    }
  };
  
  // Format currency value
  const formatCurrency = (amount: string, currency: string = 'USD') => {
    const numericAmount = parseFloat(amount);
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: currency 
    }).format(numericAmount);
  };
  
  // Get status badge style
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="flex items-center px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800">
            <Check size={16} className="mr-1" />
            Completed
          </span>
        );
      case 'pending':
        return (
          <span className="flex items-center px-3 py-1 text-sm font-medium rounded-full bg-yellow-100 text-yellow-800">
            <Clock size={16} className="mr-1" />
            Pending
          </span>
        );
      case 'failed':
        return (
          <span className="flex items-center px-3 py-1 text-sm font-medium rounded-full bg-red-100 text-red-800">
            <XCircle size={16} className="mr-1" />
            Failed
          </span>
        );
      default:
        return (
          <span className="flex items-center px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Link to="/transactions" className="mr-4">
            <Button variant="outline" icon={<ArrowLeft size={16} />}>
              Back
            </Button>
          </Link>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Transaction Details</h2>
            {transaction && (
              <p className="text-gray-500 mt-1">
                #{transaction.id}
              </p>
            )}
          </div>
        </div>
        <div>
          <Button
            variant="primary"
            icon={<RefreshCw size={16} className={isChecking ? 'animate-spin' : ''} />}
            onClick={handleCheckStatus}
            disabled={isLoading || isChecking || !transaction}
          >
            {isChecking ? 'Checking...' : 'Check Status'}
          </Button>
        </div>
      </div>
      
      {isLoading && (
        <div className="card p-5 text-center text-gray-500">
          Loading transaction details...
        </div>
      )}
      
      {isError && (
        <div className="card p-5 text-center text-red-500">
          Error loading transaction details. Please try refreshing.
        </div>
      )}
      
      {transaction && (
        <>
          {/* Transaction Overview */}
          <div className="card p-5 mb-6">
            <div className="flex flex-col md:flex-row justify-between">
              <div className="mb-4 md:mb-0">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Transaction Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Steam Transaction ID</p>
                    <p className="text-gray-900">{transaction.trans_id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Order ID</p>
                    <p className="text-gray-900">{transaction.id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Date</p>
                    <p className="text-gray-900">{transaction.date}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Steam User ID</p>
                    <p className="text-gray-900">{transaction.user}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">App ID</p>
                    <p className="text-gray-900">{transaction.app_id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Amount</p>
                    <p className="text-gray-900 font-medium">
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Country</p>
                    <p className="text-gray-900">{transaction.country}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    {getStatusBadge(transaction.status)}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Items Purchased */}
          <div className="card p-5 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Items Purchased</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      VAT
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transaction.items && transaction.items.length > 0 ? (
                    transaction.items.map((item) => (
                      <tr key={item.itemid} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.itemid}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {transaction.product}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.qty}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(item.amount, transaction.currency)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatCurrency(item.vat, transaction.currency)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${item.itemstatus === 'complete' ? 'bg-green-100 text-green-800' : 
                              item.itemstatus === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-red-100 text-red-800'}`}>
                            {item.itemstatus}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                        No item details available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Raw Transaction Data (for debugging, can be removed in production) */}
          {transaction.raw_data && (
            <div className="card p-5 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Raw Transaction Data</h3>
              <div className="bg-gray-100 p-4 rounded-md overflow-auto max-h-96">
                <pre className="text-xs text-gray-800">
                  {JSON.stringify(transaction.raw_data, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TransactionDetail;