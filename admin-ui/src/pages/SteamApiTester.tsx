import React, { useState } from 'react';
import { Send, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

// Define API endpoint structure
interface ApiEndpoint {
  id: string;
  name: string;
  method: string;
  path: string;
  description: string;
  parameters: {
    name: string;
    type: string;
    required: boolean;
    description: string;
  }[];
}

// Steam API endpoints
const steamApiEndpoints: ApiEndpoint[] = [
  {
    id: 'get-user-info',
    name: 'Get Reliable User Info',
    method: 'POST',
    path: '/GetReliableUserInfo',
    description: 'Retrieves reliable user information from Steam.',
    parameters: [
      {
        name: 'steam_id',
        type: 'string',
        required: true,
        description: 'Steam ID of the user',
      },
      {
        name: 'game_id',
        type: 'string',
        required: false,
        description: 'Game ID from database',
      },
    ],
  },
  {
    id: 'check-app-ownership',
    name: 'Check App Ownership',
    method: 'POST',
    path: '/CheckAppOwnership',
    description: 'Checks if a user owns the specified Steam application.',
    parameters: [
      {
        name: 'steam_id',
        type: 'string',
        required: true,
        description: 'Steam ID of the user',
      },
      {
        name: 'game_id',
        type: 'string',
        required: true,
        description: 'Game ID from database',
      },
    ],
  },
  {
    id: 'init-purchase',
    name: 'Initialize Purchase',
    method: 'POST',
    path: '/InitPurchase',
    description: 'Initializes a purchase transaction with Steam using product information from the database.',
    parameters: [
      {
        name: 'product_id',
        type: 'string',
        required: true,
        description: 'ID of the product in your database',
      },
      {
        name: 'steam_id',
        type: 'string',
        required: true,
        description: 'Steam ID of the purchasing user',
      },
      {
        name: 'quantity',
        type: 'number',
        required: false,
        description: 'Quantity of items to purchase (default: 1)',
      },
    ],
  },
  {
    id: 'finalize-purchase',
    name: 'Finalize Purchase',
    method: 'POST',
    path: '/FinalizePurchase',
    description: 'Finalizes a purchase transaction that was previously initialized.',
    parameters: [
      {
        name: 'trans_id',
        type: 'string',
        required: true,
        description: 'Transaction ID returned from the initialize purchase step',
      },
    ],
  },
  {
    id: 'check-purchase-status',
    name: 'Check Purchase Status',
    method: 'POST',
    path: '/CheckPurchaseStatus',
    description: 'Checks the status of a purchase transaction.',
    parameters: [
      {
        name: 'trans_id',
        type: 'string',
        required: true,
        description: 'Transaction ID returned from initializing the purchase',
      },
    ],
  },
];

const SteamApiTester: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint | null>(null);
  const [expandedEndpoints, setExpandedEndpoints] = useState<string[]>([]);
  const [paramValues, setParamValues] = useState<Record<string, Record<string, string>>>({});
  const [apiKey, setApiKey] = useState('');
  const [responseData, setResponseData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Toggle endpoint accordion
  const toggleEndpoint = (endpointId: string) => {
    setExpandedEndpoints((prevExpanded) =>
      prevExpanded.includes(endpointId)
        ? prevExpanded.filter(id => id !== endpointId)
        : [...prevExpanded, endpointId]
    );
  };

  // Select an endpoint to test
  const selectEndpoint = (endpoint: ApiEndpoint) => {
    setSelectedEndpoint(endpoint);
    // Initialize parameter values if needed
    if (!paramValues[endpoint.id]) {
      const initialValues: Record<string, string> = {};
      endpoint.parameters.forEach(param => {
        initialValues[param.name] = '';
      });
      setParamValues({ ...paramValues, [endpoint.id]: initialValues });
    }
    setError(null);
    setResponseData(null);
  };

  // Update parameter value
  const handleParamChange = (endpointId: string, paramName: string, value: string) => {
    setParamValues({
      ...paramValues,
      [endpointId]: {
        ...paramValues[endpointId],
        [paramName]: value,
      },
    });
  };

  // Generate a random order ID
  const generateOrderId = () => {
    const randomId = Math.random().toString(36).substring(2, 15) + 
                    Math.random().toString(36).substring(2, 15);
    
    if (selectedEndpoint) {
      handleParamChange(selectedEndpoint.id, 'order_id', randomId);
    }
  };

  // Execute API request
  const executeRequest = async () => {
    if (!selectedEndpoint) return;
    
    setIsLoading(true);
    setError(null);
    setResponseData(null);
    
    try {
      // Prepare request parameters
      const endpointParams = paramValues[selectedEndpoint.id] || {};
      const requestBody: Record<string, any> = {};
      
      // Build request body from parameters
      let missingRequiredParams = [];
      
      selectedEndpoint.parameters.forEach(param => {
        const value = endpointParams[param.name];
        const stringValue = String(value || '');
        
        // Check for required parameters, but collect them instead of throwing
        if (param.required && (!value || stringValue.trim() === '')) {
          missingRequiredParams.push(param.name);
        }
        
        if (value && stringValue.trim() !== '') {
          // Convert number types
          if (param.type === 'number') {
            requestBody[param.name] = Number(value);
          } else {
            requestBody[param.name] = value;
          }
        }
      });
      
      // If missing required params, show a warning but proceed anyway
      if (missingRequiredParams.length > 0) {
        console.warn(`Missing required parameters: ${missingRequiredParams.join(', ')}`);
        setError(`Warning: Missing required parameters: ${missingRequiredParams.join(', ')}. The response may be inaccurate.`);
      }
      
      try {
        // Make the API request
        const response = await fetch(`${selectedEndpoint.path}`, {
          method: selectedEndpoint.method,
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
          },
          body: JSON.stringify(requestBody),
        });
        
        // Parse and store the response
        const responseJson = await response.json();
        setResponseData({
          status: response.status,
          statusText: response.statusText,
          data: responseJson,
        });
      } catch (fetchError) {
        // If we have a network error or CORS issue, show a simulated response
        // This is useful for demonstration purposes in case the API isn't accessible
        console.error("Error fetching data, showing simulated response", fetchError);
        setResponseData({
          status: 200,
          statusText: "OK (Simulated)",
          data: generateSimulatedResponse(selectedEndpoint.id, requestBody),
          simulated: true
        });
      }
      
    } catch (err: any) {
      setError(err.message || 'An error occurred while making the request');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Generate simulated responses for demonstration purposes
  const generateSimulatedResponse = (endpointId: string, requestBody: any) => {
    const timestamp = new Date().toISOString();
    const transId = Math.floor(Math.random() * 1000000).toString();
    
    switch (endpointId) {
      case 'get-user-info':
        return {
          success: true,
          data: {
            steam_id: requestBody.steam_id,
            name: "Test Player",
            profile_url: "https://steamcommunity.com/profiles/" + requestBody.steam_id,
            avatar: "https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg",
            country: "US",
            created: timestamp,
            last_login: timestamp
          }
        };
        
      case 'check-app-ownership':
        return {
          success: true,
          data: {
            game_id: requestBody.game_id,
            steam_id: requestBody.steam_id,
            owns_app: true,
            permanent: true,
            timestamp: timestamp
          }
        };
        
      case 'init-purchase':
        return {
          transid: transId,
          steam_id: requestBody.steam_id,
          product_id: requestBody.product_id,
          quantity: requestBody.quantity || 1,
          status: "initialized",
          timestamp: timestamp
        };
        
      case 'finalize-purchase':
        return {
          success: true,
          data: {
            trans_id: requestBody.trans_id,
            status: "complete",
            timestamp: timestamp
          }
        };
        
      case 'check-purchase-status':
        return {
          success: true,
          orderid: Math.random().toString(36).substring(2, 15),
          transid: requestBody.trans_id,
          steamid: "76561198012345678",
          status: "Complete",
          currency: "USD",
          time: timestamp,
          country: "US",
          usstate: "WA",
          items: [
            {
              itemid: "12345",
              qty: 1,
              amount: "499",
              vat: "0",
              itemstatus: "OK"
            }
          ]
        };
        
      default:
        return {
          success: true,
          message: "Simulated response for demonstration"
        };
    }
  };

  // Copy response to clipboard
  const copyToClipboard = () => {
    if (responseData) {
      navigator.clipboard.writeText(JSON.stringify(responseData, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Steam API Tester</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Endpoints List Panel */}
        <div className="md:col-span-1">
          <div className="card p-4">
            <h3 className="text-lg font-semibold mb-4">API Endpoints</h3>
            
            <div className="mb-4">
              <Input
                label="API Key"
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key"
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              {steamApiEndpoints.map(endpoint => (
                <div key={endpoint.id} className="border border-gray-200 rounded-md">
                  <div 
                    className={`
                      flex justify-between items-center p-3 cursor-pointer
                      ${selectedEndpoint?.id === endpoint.id ? 'bg-blue-50' : ''}
                    `}
                    onClick={() => toggleEndpoint(endpoint.id)}
                  >
                    <div>
                      <h4 className="font-medium text-gray-900">{endpoint.name}</h4>
                      <div className="flex items-center mt-1">
                        <span className={`
                          px-2 py-0.5 text-xs rounded
                          ${endpoint.method === 'GET' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}
                        `}>
                          {endpoint.method}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">{endpoint.path}</span>
                      </div>
                    </div>
                    {expandedEndpoints.includes(endpoint.id) ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </div>
                  
                  {expandedEndpoints.includes(endpoint.id) && (
                    <div className="p-3 border-t border-gray-200">
                      <p className="text-sm text-gray-600 mb-2">{endpoint.description}</p>
                      <h5 className="text-xs font-semibold text-gray-700 mb-1">Parameters:</h5>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {endpoint.parameters.map(param => (
                          <li key={param.name}>
                            <span className="font-medium">{param.name}</span>
                            {param.required ? (
                              <span className="text-red-500">*</span>
                            ) : (
                              <span className="text-gray-400"> (optional)</span>
                            )}
                            <span> - {param.description}</span>
                          </li>
                        ))}
                      </ul>
                      <Button
                        variant="primary"
                        size="sm"
                        className="mt-3 w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          selectEndpoint(endpoint);
                        }}
                      >
                        Test Endpoint
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Request Panel */}
        <div className="md:col-span-2">
          {selectedEndpoint ? (
            <div className="card p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{selectedEndpoint.name}</h3>
                <div className="flex items-center">
                  <span className={`
                    px-2 py-1 text-xs font-medium rounded mr-2
                    ${selectedEndpoint.method === 'GET' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}
                  `}>
                    {selectedEndpoint.method}
                  </span>
                  <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                    {selectedEndpoint.path}
                  </span>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Request Parameters</h4>
                <div className="space-y-3">
                  {selectedEndpoint.parameters.map(param => (
                    <div key={param.name}>
                      <Input
                        label={
                          <>
                            {param.name}
                            {param.required && (
                              <span className="text-red-500 ml-1 font-bold" title="Required parameter">*</span>
                            )}
                          </>
                        }
                        type={param.type === 'number' ? 'number' : 'text'}
                        placeholder={`Enter ${param.name}`}
                        value={paramValues[selectedEndpoint.id]?.[param.name] || ''}
                        onChange={(e) => handleParamChange(selectedEndpoint.id, param.name, e.target.value)}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500 mt-1">{param.description}</p>
                    </div>
                  ))}
                </div>
                
                {/* We could add helper buttons for specific endpoints here if needed */}
              </div>
              
              <Button
                variant="primary"
                className="w-full"
                icon={<Send size={16} />}
                disabled={isLoading}
                onClick={executeRequest}
                title={!apiKey ? "API key is recommended but not required for testing" : "Send API request"}
              >
                {isLoading ? 'Sending Request...' : 'Send Request'}
                {!apiKey && <span className="ml-1 text-xs opacity-80">(API key recommended)</span>}
              </Button>
              
              {/* Response section */}
              {(responseData || error) && (
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-semibold text-gray-700">Response</h4>
                    {responseData && (
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={copied ? <Check size={16} /> : <Copy size={16} />}
                        onClick={copyToClipboard}
                      >
                        {copied ? 'Copied!' : 'Copy'}
                      </Button>
                    )}
                  </div>
                  
                  {error && (
                    <div className={`${error.startsWith('Warning') ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'} border rounded-md p-4 mb-4`}>
                      <p className={error.startsWith('Warning') ? 'text-yellow-600' : 'text-red-600'}>
                        {error}
                      </p>
                    </div>
                  )}
                  
                  {responseData && (
                    <div className="relative">
                      {responseData.simulated && (
                        <div className="bg-yellow-100 text-yellow-800 px-4 py-2 text-sm rounded-t-md">
                          This is a simulated response for demonstration purposes.
                        </div>
                      )}
                      <pre className={`bg-gray-900 text-white p-4 overflow-auto max-h-96 ${responseData.simulated ? 'rounded-b-md' : 'rounded-md'}`}>
                        <code>
                          {JSON.stringify(responseData, null, 2)}
                        </code>
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="card p-8 flex flex-col items-center justify-center">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Select an API Endpoint</h3>
              <p className="text-gray-500 text-center mb-6">
                Select an endpoint from the list on the left to test it.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Each endpoint requires specific parameters</li>
                <li>• Enter your API key to authenticate requests</li>
                <li>• View real-time responses from the API</li>
                <li>• Test the complete purchase flow step-by-step</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SteamApiTester;