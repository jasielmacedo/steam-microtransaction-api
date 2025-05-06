import React, { useState } from 'react';
import { Clipboard, Eye, EyeOff, Key, Plus, RefreshCw, Trash } from 'lucide-react';
import Button from '../components/ui/Button';

// Mock API keys data
const initialApiKeys = [
  {
    id: '1',
    name: 'Production API Key',
    prefix: 'pk_prod_',
    created: '2025-05-15',
    lastUsed: '2025-06-01',
  },
  {
    id: '2',
    name: 'Development API Key',
    prefix: 'pk_dev_',
    created: '2025-05-20',
    lastUsed: '2025-05-30',
  },
  {
    id: '3',
    name: 'Testing API Key',
    prefix: 'pk_test_',
    created: '2025-05-25',
    lastUsed: null,
  },
];

const ApiKeys: React.FC = () => {
  const [apiKeys, setApiKeys] = useState(initialApiKeys);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');
  const [showNewKey, setShowNewKey] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  
  const handleCreateKey = () => {
    if (!newKeyName.trim()) {
      alert('Please enter a name for the API key');
      return;
    }
    
    // Generate a mock API key
    const prefix = 'pk_dev_';
    const keyValue = prefix + Array(24)
      .fill(0)
      .map(() => Math.random().toString(36).charAt(2))
      .join('');
    
    setNewKeyValue(keyValue);
    
    const newKey = {
      id: (apiKeys.length + 1).toString(),
      name: newKeyName,
      prefix,
      created: new Date().toISOString().split('T')[0],
      lastUsed: null,
    };
    
    setApiKeys([...apiKeys, newKey]);
    setShowNewKey(true);
  };
  
  const handleCopyKey = () => {
    navigator.clipboard.writeText(newKeyValue);
    setCopySuccess(true);
    
    setTimeout(() => {
      setCopySuccess(false);
    }, 2000);
  };
  
  const handleDone = () => {
    setNewKeyName('');
    setNewKeyValue('');
    setShowNewKey(false);
  };
  
  const handleDeleteKey = (id: string) => {
    if (confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      setApiKeys(apiKeys.filter(key => key.id !== id));
    }
  };

  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">API Keys</h2>
          <p className="text-gray-500 mt-1">
            Manage API keys for integration with your games
          </p>
        </div>
      </div>
      
      {/* New API Key Form */}
      <div className="card p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {showNewKey ? 'Your New API Key' : 'Create New API Key'}
        </h3>
        
        {!showNewKey ? (
          <div className="space-y-4">
            <div>
              <label htmlFor="keyName" className="block text-sm font-medium text-gray-700 mb-1">
                API Key Name
              </label>
              <input
                type="text"
                id="keyName"
                value={newKeyName}
                onChange={e => setNewKeyName(e.target.value)}
                placeholder="e.g., Production Key, Test Key"
                className="w-full rounded-md shadow-sm border-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <p className="mt-1 text-sm text-gray-500">
                Give your API key a descriptive name to identify its purpose
              </p>
            </div>
            
            <Button
              variant="primary"
              icon={<Key size={16} />}
              onClick={handleCreateKey}
            >
              Generate API Key
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Key Name
              </label>
              <p className="text-gray-900 font-medium">{newKeyName}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API Key
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <div className="relative flex items-stretch flex-grow">
                  <input
                    type={showNewKey ? "text" : "password"}
                    value={newKeyValue}
                    readOnly
                    className="block w-full rounded-none rounded-l-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                  <button
                    type="button"
                    className="relative -ml-px inline-flex items-center space-x-2 rounded-r-md border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    onClick={() => setShowNewKey(!showNewKey)}
                  >
                    {showNewKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Copy this key now. You won't be able to see it again!
              </p>
            </div>
            
            <div className="flex space-x-3">
              <Button
                variant="primary"
                icon={<Clipboard size={16} />}
                onClick={handleCopyKey}
              >
                {copySuccess ? 'Copied!' : 'Copy API Key'}
              </Button>
              
              <Button
                variant="outline"
                onClick={handleDone}
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {/* API Keys Table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Your API Keys</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Key Prefix
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Used
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {apiKeys.map((key) => (
                <tr key={key.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{key.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{key.prefix}••••••••</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{key.created}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {key.lastUsed || 'Never used'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<RefreshCw size={16} />}
                      className="text-blue-600 hover:text-blue-900 mr-2"
                    >
                      Rotate
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Trash size={16} />}
                      className="text-red-600 hover:text-red-900"
                      onClick={() => handleDeleteKey(key.id)}
                    >
                      Revoke
                    </Button>
                  </td>
                </tr>
              ))}
              
              {apiKeys.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No API keys found. Create one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* API Key Usage Guide */}
      <div className="mt-8 card p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          How to Use Your API Keys
        </h3>
        
        <div className="prose prose-blue max-w-none">
          <p>
            Integrate microtransactions into your game with our simple API. Here's how to get started:
          </p>
          
          <ol className="list-decimal pl-5 space-y-2">
            <li>Initialize the SDK with your API key</li>
            <li>Configure your products in the dashboard</li>
            <li>Implement purchase flow in your game</li>
            <li>Validate transactions server-side</li>
          </ol>
          
          <p className="mt-4">
            Check our <a href="#" className="text-blue-600 hover:text-blue-800">documentation</a> for more details on integration.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ApiKeys;