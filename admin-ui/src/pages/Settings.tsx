import React, { useState } from 'react';
import { Save } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const Settings: React.FC = () => {
  // Company settings
  const [companySettings, setCompanySettings] = useState({
    name: 'MicroTrax Games',
    email: 'support@microtrax.example.com',
    website: 'https://microtrax.example.com',
  });
  
  // Currency settings
  const [currencySettings, setCurrencySettings] = useState({
    name: 'Coins',
    symbol: '🪙',
    conversionRate: 100, // e.g., $1 = 100 coins
  });
  
  // Webhook settings
  const [webhookSettings, setWebhookSettings] = useState({
    purchaseSuccess: 'https://yourgame.example.com/webhook/purchase/success',
    purchaseFailed: 'https://yourgame.example.com/webhook/purchase/failed',
  });
  
  // Email notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    purchaseConfirmation: true,
    failedTransactions: true,
    weeklyReports: true,
    newProductReleases: false,
  });
  
  const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCompanySettings(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrencySettings(prev => ({ 
      ...prev, 
      [name]: name === 'conversionRate' ? parseFloat(value) || 0 : value 
    }));
  };
  
  const handleWebhookChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setWebhookSettings(prev => ({ ...prev, [name]: value }));
  };
  
  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNotificationSettings(prev => ({ ...prev, [name]: checked }));
  };
  
  const handleSaveSettings = () => {
    // In a real app, this would save settings to the backend
    alert('Settings saved successfully!');
  };

  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Settings</h2>
          <p className="text-gray-500 mt-1">
            Configure your microtransaction system
          </p>
        </div>
        <Button 
          variant="primary"
          icon={<Save size={16} />}
          onClick={handleSaveSettings}
        >
          Save Changes
        </Button>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {/* Company Information */}
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Company Information</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Input
                label="Company Name"
                name="name"
                value={companySettings.name}
                onChange={handleCompanyChange}
                placeholder="Your company name"
              />
            </div>
            <div>
              <Input
                label="Support Email"
                name="email"
                type="email"
                value={companySettings.email}
                onChange={handleCompanyChange}
                placeholder="support@yourcompany.com"
              />
            </div>
            <div className="md:col-span-2">
              <Input
                label="Website URL"
                name="website"
                value={companySettings.website}
                onChange={handleCompanyChange}
                placeholder="https://yourcompany.com"
              />
            </div>
          </div>
        </div>
        
        {/* In-Game Currency */}
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">In-Game Currency</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <Input
                label="Currency Name"
                name="name"
                value={currencySettings.name}
                onChange={handleCurrencyChange}
                placeholder="e.g., Coins, Gems, Credits"
              />
            </div>
            <div>
              <Input
                label="Currency Symbol"
                name="symbol"
                value={currencySettings.symbol}
                onChange={handleCurrencyChange}
                placeholder="e.g., 🪙, 💎, ⭐"
              />
              <p className="mt-1 text-xs text-gray-500">
                This can be an emoji or a short text symbol
              </p>
            </div>
            <div>
              <Input
                label="Conversion Rate (per $1)"
                name="conversionRate"
                type="number"
                value={currencySettings.conversionRate.toString()}
                onChange={handleCurrencyChange}
                placeholder="e.g., 100"
              />
              <p className="mt-1 text-xs text-gray-500">
                How many {currencySettings.name} equals $1
              </p>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 rounded-md">
            <div className="text-sm text-blue-800">
              <span className="font-medium">Preview: </span>
              $1.00 = {currencySettings.conversionRate} {currencySettings.symbol} {currencySettings.name}
            </div>
          </div>
        </div>
        
        {/* Webhook Configuration */}
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Webhook Configuration</h3>
          <p className="text-gray-500 mb-4">
            Configure webhooks to receive real-time notifications for transactions
          </p>
          
          <div className="space-y-4">
            <div>
              <Input
                label="Purchase Success Webhook URL"
                name="purchaseSuccess"
                value={webhookSettings.purchaseSuccess}
                onChange={handleWebhookChange}
                placeholder="https://yourgame.example.com/webhook/purchase/success"
              />
              <p className="mt-1 text-xs text-gray-500">
                This URL will be called when a purchase is successfully completed
              </p>
            </div>
            
            <div>
              <Input
                label="Purchase Failed Webhook URL"
                name="purchaseFailed"
                value={webhookSettings.purchaseFailed}
                onChange={handleWebhookChange}
                placeholder="https://yourgame.example.com/webhook/purchase/failed"
              />
              <p className="mt-1 text-xs text-gray-500">
                This URL will be called when a purchase fails
              </p>
            </div>
          </div>
        </div>
        
        {/* Email Notifications */}
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Email Notifications</h3>
          <p className="text-gray-500 mb-4">
            Configure which email notifications you want to receive
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                id="purchaseConfirmation"
                name="purchaseConfirmation"
                type="checkbox"
                checked={notificationSettings.purchaseConfirmation}
                onChange={handleNotificationChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="purchaseConfirmation" className="ml-2 block text-sm text-gray-700">
                Purchase confirmation emails
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                id="failedTransactions"
                name="failedTransactions"
                type="checkbox"
                checked={notificationSettings.failedTransactions}
                onChange={handleNotificationChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="failedTransactions" className="ml-2 block text-sm text-gray-700">
                Failed transaction alerts
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                id="weeklyReports"
                name="weeklyReports"
                type="checkbox"
                checked={notificationSettings.weeklyReports}
                onChange={handleNotificationChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="weeklyReports" className="ml-2 block text-sm text-gray-700">
                Weekly revenue reports
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                id="newProductReleases"
                name="newProductReleases"
                type="checkbox"
                checked={notificationSettings.newProductReleases}
                onChange={handleNotificationChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="newProductReleases" className="ml-2 block text-sm text-gray-700">
                New product release notifications
              </label>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <Button variant="outline">Cancel</Button>
          <Button 
            variant="primary"
            icon={<Save size={16} />}
            onClick={handleSaveSettings}
          >
            Save All Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;