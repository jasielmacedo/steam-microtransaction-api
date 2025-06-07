import React, { useState } from 'react';
import { Bell, Send, AlertCircle } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface NotificationTesterProps {
  onSendTest: (data: TestNotificationData) => Promise<void>;
  availableProviders: {
    email: boolean;
    push: boolean;
    web: boolean;
  };
}

export interface TestNotificationData {
  subject: string;
  message: string;
  notification_type: string;
  provider_types: string[];
}

const NotificationTester: React.FC<NotificationTesterProps> = ({ 
  onSendTest,
  availableProviders
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<TestNotificationData>({
    subject: 'Test Notification',
    message: 'This is a test notification from MicroTrax.',
    notification_type: 'SYSTEM_ALERT',
    provider_types: []
  });
  
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNotification(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleProviderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNotification(prev => {
      const updatedProviders = checked 
        ? [...prev.provider_types, name] 
        : prev.provider_types.filter(p => p !== name);
      
      return {
        ...prev,
        provider_types: updatedProviders
      };
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (notification.provider_types.length === 0) {
      setErrorMessage('Please select at least one notification provider');
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }
    
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    
    try {
      await onSendTest(notification);
      setSuccessMessage('Test notification sent successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error sending test notification:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Failed to send test notification');
    } finally {
      setIsLoading(false);
    }
  };
  
  const notificationTypes = [
    { value: 'TRANSACTION_CREATED', label: 'Transaction Created' },
    { value: 'TRANSACTION_COMPLETED', label: 'Transaction Completed' },
    { value: 'TRANSACTION_FAILED', label: 'Transaction Failed' },
    { value: 'PRODUCT_CREATED', label: 'Product Created' },
    { value: 'PRODUCT_UPDATED', label: 'Product Updated' },
    { value: 'PRODUCT_DELETED', label: 'Product Deleted' },
    { value: 'WEEKLY_REPORT', label: 'Weekly Report' },
    { value: 'SYSTEM_ALERT', label: 'System Alert' }
  ];
  
  return (
    <div className="card p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
        <Bell size={18} className="mr-2 text-blue-500" />
        Test Notifications
      </h3>
      
      <p className="text-gray-500 mb-4">
        Test your notification configuration by sending a test notification to yourself.
      </p>
      
      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 bg-green-50 p-3 rounded text-green-700 text-sm">
          {successMessage}
        </div>
      )}
      
      {/* Error Message */}
      {errorMessage && (
        <div className="mb-4 bg-red-50 p-3 rounded text-red-700 text-sm flex items-center">
          <AlertCircle size={16} className="mr-2" />
          {errorMessage}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Notification Type */}
          <div>
            <label htmlFor="notification_type" className="block text-sm font-medium text-gray-700 mb-1">
              Notification Type
            </label>
            <select
              id="notification_type"
              name="notification_type"
              value={notification.notification_type}
              onChange={handleInputChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              {notificationTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Subject */}
          <Input
            label="Subject"
            name="subject"
            value={notification.subject}
            onChange={handleInputChange}
            placeholder="Notification Subject"
          />
          
          {/* Message */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={3}
              value={notification.message}
              onChange={handleInputChange}
              placeholder="Notification message..."
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
          
          {/* Notification Providers */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Providers to Test
            </label>
            
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  id="email-provider"
                  name="email"
                  type="checkbox"
                  checked={notification.provider_types.includes('email')}
                  onChange={handleProviderChange}
                  disabled={!availableProviders.email}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="email-provider" className={`ml-2 block text-sm ${availableProviders.email ? 'text-gray-700' : 'text-gray-400'}`}>
                  Email {!availableProviders.email && '(not configured)'}
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="push-provider"
                  name="push"
                  type="checkbox"
                  checked={notification.provider_types.includes('push')}
                  onChange={handleProviderChange}
                  disabled={!availableProviders.push}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="push-provider" className={`ml-2 block text-sm ${availableProviders.push ? 'text-gray-700' : 'text-gray-400'}`}>
                  Push Notification {!availableProviders.push && '(not configured)'}
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="web-provider"
                  name="web"
                  type="checkbox"
                  checked={notification.provider_types.includes('web')}
                  onChange={handleProviderChange}
                  disabled={!availableProviders.web}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="web-provider" className={`ml-2 block text-sm ${availableProviders.web ? 'text-gray-700' : 'text-gray-400'}`}>
                  Web Notification {!availableProviders.web && '(not subscribed)'}
                </label>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              variant="primary"
              icon={<Send size={16} />}
              isLoading={isLoading}
              disabled={isLoading || notification.provider_types.length === 0}
            >
              Send Test
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NotificationTester;