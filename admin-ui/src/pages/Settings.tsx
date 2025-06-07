import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, Check, X } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import HelpTooltip from '../components/ui/HelpTooltip';
import { useGetSettingsQuery, useUpdateSettingsMutation, useTestNotificationMutation } from '../api/apiSlice';
import { CompanySettings, WebhookSettings, NotificationSettings } from '../types/settings';
import NotificationTester, { TestNotificationData } from '../components/settings/NotificationTester';

const Settings: React.FC = () => {
  // RTK Query hooks
  const { data: settings, isLoading, error } = useGetSettingsQuery();
  const [updateSettings, { isLoading: isUpdating }] = useUpdateSettingsMutation();
  const [testNotification] = useTestNotificationMutation();
  
  // Local state
  const [companySettings, setCompanySettings] = useState<CompanySettings>({
    name: 'MicroTrax Games',
    email: 'support@microtrax.example.com',
    website: 'https://microtrax.example.com',
  });
  
  // Webhook settings
  const [webhookSettings, setWebhookSettings] = useState<WebhookSettings>({
    purchaseSuccess: 'https://yourgame.example.com/webhook/purchase/success',
    purchaseFailed: 'https://yourgame.example.com/webhook/purchase/failed',
  });
  
  // Email notification settings
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    purchaseConfirmation: true,
    failedTransactions: true,
    weeklyReports: true,
    newProductReleases: false,
  });
  
  // Notification providers settings
  const [notificationProviders, setNotificationProviders] = useState<NotificationProviderSettings>({
    email: {
      enabled: false,
      smtpHost: '',
      smtpPort: 587,
      smtpUser: '',
      smtpPassword: '',
      fromEmail: 'noreply@microtrax.example.com',
      useTls: true
    },
    push: {
      enabled: false,
      fcmApiKey: '',
      fcmUrl: 'https://fcm.googleapis.com/fcm/send'
    },
    web: {
      enabled: false,
      subscribers: [],
      vapidPublicKey: '',
      vapidPrivateKey: ''
    }
  });
  
  // UI state
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  
  // Update local state when settings data is loaded
  useEffect(() => {
    if (settings) {
      setCompanySettings(settings.company);
      setWebhookSettings(settings.webhooks);
      setNotificationSettings(settings.notifications);
      if (settings.notificationProviders) {
        setNotificationProviders(settings.notificationProviders);
      }
    }
  }, [settings]);
  
  const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCompanySettings(prev => ({ ...prev, [name]: value }));
  };
  
  const handleWebhookChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setWebhookSettings(prev => ({ ...prev, [name]: value }));
  };
  
  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNotificationSettings(prev => ({ ...prev, [name]: checked }));
  };
  
  // Email provider settings handlers
  const handleEmailProviderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setNotificationProviders(prev => ({
      ...prev,
      email: {
        ...prev.email,
        [name]: type === 'checkbox' ? checked : value
      }
    }));
  };
  
  const handleEmailPortChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const port = parseInt(e.target.value, 10) || 0;
    setNotificationProviders(prev => ({
      ...prev,
      email: {
        ...prev.email,
        smtpPort: port
      }
    }));
  };
  
  // Push provider settings handlers
  const handlePushProviderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setNotificationProviders(prev => ({
      ...prev,
      push: {
        ...prev.push,
        [name]: type === 'checkbox' ? checked : value
      }
    }));
  };
  
  // Web notification provider handlers
  const handleWebProviderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setNotificationProviders(prev => ({
      ...prev,
      web: {
        ...prev.web,
        [name]: type === 'checkbox' ? checked : value
      }
    }));
  };
  
  // Allow current browser to subscribe to web notifications
  const handleSubscribeToWebNotifications = async () => {
    try {
      console.log('Attempting to subscribe to web notifications...');
      
      // Check if browser supports notifications and service workers
      if (!('Notification' in window) || !('serviceWorker' in navigator)) {
        setLocalError('This browser does not support desktop notifications or service workers.');
        return;
      }
      
      // First, make sure we have a valid VAPID public key
      if (!notificationProviders.web.vapidPublicKey) {
        // Save settings first to generate VAPID keys
        setLocalError('VAPID keys are missing. Saving settings to generate them...');
        
        // Try to generate VAPID keys by saving settings
        try {
          const updatedSettings = await updateSettings({
            company: companySettings,
            webhooks: webhookSettings,
            notifications: notificationSettings,
            notificationProviders: {
              ...notificationProviders,
              web: {
                ...notificationProviders.web,
                enabled: true
              }
            }
          }).unwrap();
          
          // Check if we got back VAPID keys
          if (updatedSettings.notificationProviders?.web?.vapidPublicKey) {
            console.log('Generated VAPID keys successfully');
            // Update local state
            setNotificationProviders(updatedSettings.notificationProviders);
            setSuccessMessage('Generated VAPID keys successfully. Please try subscribing again.');
            
            // Don't continue with subscription yet - let the user try again
            return;
          } else {
            throw new Error('Failed to generate VAPID keys');
          }
        } catch (e) {
          console.error('Error generating VAPID keys:', e);
          setLocalError('Failed to generate VAPID keys. Please try again later.');
          return;
        }
      }
      
      // Register and get the service worker
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('Service worker registered:', registration);
      
      // Wait for the service worker to be activated
      if (registration.installing) {
        console.log('Service worker is installing, waiting for it to activate...');
        await new Promise<void>((resolve) => {
          registration.installing?.addEventListener('statechange', (e) => {
            if ((e.target as ServiceWorker).state === 'activated') {
              console.log('Service worker activated');
              resolve();
            }
          });
          
          // Set a timeout in case the service worker never activates
          setTimeout(() => {
            console.log('Service worker activation timeout reached, proceeding anyway...');
            resolve();
          }, 5000);
        });
      }
      
      // Check if we already have permission
      if (Notification.permission === 'granted') {
        console.log('Notification permission already granted');
        await subscribeUserToPush(registration);
      } else if (Notification.permission !== 'denied') {
        console.log('Requesting notification permission...');
        // Request permission
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          console.log('Notification permission granted');
          await subscribeUserToPush(registration);
        } else {
          console.log('Notification permission denied');
          setLocalError('Notification permission denied.');
        }
      } else {
        console.log('Notification permission previously denied');
        setLocalError('Notification permission was previously denied. Please enable notifications in your browser settings.');
      }
    } catch (err) {
      console.error('Error subscribing to web notifications:', err);
      setLocalError(err instanceof Error ? err.message : 'Failed to subscribe to web notifications');
    }
  };
  
  // Subscribe the user to push notifications
  const subscribeUserToPush = async (registration?: ServiceWorkerRegistration) => {
    try {
      // If no registration was provided, get the active one
      if (!registration) {
        console.log('No service worker registration provided, getting current registration');
        registration = await navigator.serviceWorker.ready;
      }
      
      if (!registration) {
        setLocalError('Service worker registration failed. Web notifications require a service worker.');
        return;
      }
      
      // Get the public VAPID key
      const vapidPublicKey = notificationProviders.web.vapidPublicKey;
      if (!vapidPublicKey) {
        setLocalError('VAPID public key not configured. Please save settings first to generate keys.');
        return;
      }
      
      console.log('Using VAPID public key:', vapidPublicKey);
      
      // Convert the VAPID key to a Uint8Array with improved error handling
      try {
        const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
        console.log('Converted VAPID key to Uint8Array, length:', convertedVapidKey.length);
        
        // Check if there's an existing subscription and unsubscribe from it
        const existingSubscription = await registration.pushManager.getSubscription();
        if (existingSubscription) {
          await existingSubscription.unsubscribe();
          console.log('Unsubscribed from existing push subscription');
        }
        
        // Subscribe the user
        console.log('Subscribing to push notifications...');
        const subscriptionOptions = {
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey
        };
        console.log('Subscription options:', subscriptionOptions);
        
        const subscription = await registration.pushManager.subscribe(subscriptionOptions);
        
        console.log('Push subscription successful:', subscription);
        
        // Add this subscription to the subscribers list
        const newSubscriber = {
          user_id: 'current_user', // In a real app, use the actual user ID
          subscription_info: subscription.toJSON()
        };
        
        // Filter out any existing subscriptions for the current user
        const filteredSubscribers = notificationProviders.web.subscribers.filter(
          sub => sub.user_id !== 'current_user'
        );
        
        // Create updated settings with the new subscriber
        const updatedSettings = {
          company: companySettings,
          webhooks: webhookSettings,
          notifications: notificationSettings,
          notificationProviders: {
            ...notificationProviders,
            web: {
              ...notificationProviders.web,
              enabled: true, // Make sure it's enabled
              subscribers: [...filteredSubscribers, newSubscriber]
            }
          }
        };
        
        // Update backend immediately to ensure subscription is saved
        await updateSettings(updatedSettings).unwrap();
        
        // Update local state
        setNotificationProviders(prev => ({
          ...prev,
          web: {
            ...prev.web,
            enabled: true,
            subscribers: [...filteredSubscribers, newSubscriber]
          }
        }));
        
        setSuccessMessage('Successfully subscribed to web notifications!');
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (convertError) {
        console.error('Error converting or using VAPID key:', convertError);
        
        // Try regenerating VAPID keys and try again
        setLocalError('Error with VAPID key. Trying to generate new keys...');
        
        // Save settings to regenerate keys
        const updatedSettings = await updateSettings({
          company: companySettings,
          webhooks: webhookSettings,
          notifications: notificationSettings,
          notificationProviders: {
            ...notificationProviders,
            web: {
              ...notificationProviders.web,
              enabled: true,
              // Force regeneration by clearing the keys
              vapidPublicKey: '',
              vapidPrivateKey: ''
            }
          }
        }).unwrap();
        
        // Update local state with new keys
        setNotificationProviders(updatedSettings.notificationProviders);
        setSuccessMessage('Generated new VAPID keys. Please try subscribing again.');
      }
    } catch (err) {
      console.error('Error subscribing to push:', err);
      setLocalError(err instanceof Error ? err.message : 'Failed to subscribe to push notifications');
    }
  };
  
  // Helper function to convert a base64 string to a Uint8Array
  const urlBase64ToUint8Array = (base64String: string) => {
    try {
      if (!base64String) {
        throw new Error('Base64 string is empty or null');
      }

      // Add padding if needed
      const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
      
      // Convert URL-safe base64 to regular base64
      const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');
      
      // Decode base64 to binary string
      let rawData;
      try {
        rawData = window.atob(base64);
      } catch (e) {
        console.error('Error decoding base64:', e);
        throw new Error('Invalid base64 encoding in VAPID key');
      }
      
      // Convert binary string to Uint8Array
      const outputArray = new Uint8Array(rawData.length);
      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }
      
      if (outputArray.length < 16) {
        console.error('VAPID key is too short after conversion:', outputArray.length);
        throw new Error('VAPID key is too short after conversion');
      }
      
      return outputArray;
    } catch (error) {
      console.error('Error in urlBase64ToUint8Array:', error);
      throw error;
    }
  };
  
  const handleSaveSettings = async () => {
    try {
      // Update settings in the backend
      await updateSettings({
        company: companySettings,
        webhooks: webhookSettings,
        notifications: notificationSettings,
        notificationProviders: notificationProviders
      }).unwrap();
      
      setSuccessMessage('Settings saved successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setLocalError(err instanceof Error ? err.message : 'Failed to save settings');
    }
  };
  
  // Handle sending test notifications
  const handleSendTestNotification = async (data: TestNotificationData) => {
    try {
      await testNotification(data).unwrap();
    } catch (err) {
      console.error('Error sending test notification:', err);
      throw err;
    }
  };

  // If loading, show a loading spinner
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If there's an error, show an error message
  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-md">
        <h3 className="font-bold">Error loading settings</h3>
        <p>{error.toString()}</p>
      </div>
    );
  }

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
          isLoading={isUpdating}
        >
          Save Changes
        </Button>
      </div>
      
      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-md flex items-center">
          <Check size={18} className="mr-2 flex-shrink-0" />
          <span>{successMessage}</span>
          <button 
            className="ml-auto text-green-700" 
            onClick={() => setSuccessMessage(null)}
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Error Message */}
      {localError && (
        <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-md flex items-center">
          <AlertCircle size={18} className="mr-2 flex-shrink-0" />
          <span>{localError}</span>
          <button 
            className="ml-auto text-red-700" 
            onClick={() => setLocalError(null)}
          >
            <X size={18} />
          </button>
        </div>
      )}
      
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
        
        {/* Webhook Configuration */}
        <div className="card p-6">
          <div className="flex items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Webhook Configuration</h3>
            <HelpTooltip content="Webhooks are like notifications for your game server. When a player buys something through Steam, we'll automatically tell your game about it so you can give them their items instantly!" />
          </div>
          <p className="text-gray-500 mb-4">
            Configure webhooks to receive real-time notifications for Steam transactions
          </p>
          
          <div className="space-y-4">
            <div>
              <div className="flex items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Purchase Success Webhook URL
                </label>
                <HelpTooltip content="When a player successfully buys something through Steam, we'll send a POST request to this URL with all the purchase details. Your game server can then give the player their items immediately!" />
              </div>
              <input
                name="purchaseSuccess"
                type="url"
                value={webhookSettings.purchaseSuccess}
                onChange={handleWebhookChange}
                placeholder="https://yourgame.example.com/webhook/purchase/success"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
              />
              <p className="mt-1 text-xs text-gray-500">
                💡 Your game server endpoint that handles successful purchases
              </p>
            </div>
            
            <div>
              <div className="flex items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Purchase Failed Webhook URL
                </label>
                <HelpTooltip content="If something goes wrong with a Steam purchase (payment fails, user cancels, etc.), we'll notify this URL so your game can handle it appropriately - maybe show an error message or retry logic." />
              </div>
              <input
                name="purchaseFailed"
                type="url"
                value={webhookSettings.purchaseFailed}
                onChange={handleWebhookChange}
                placeholder="https://yourgame.example.com/webhook/purchase/failed"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
              />
              <p className="mt-1 text-xs text-gray-500">
                ⚠️ Your game server endpoint that handles failed purchases
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
        
        {/* Notification Providers */}
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Providers</h3>
          <p className="text-gray-500 mb-4">
            Configure notification delivery methods
          </p>
          
          {/* Email Provider */}
          <div className="mb-6 border-b pb-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900">Email Provider</h4>
              <div className="flex items-center">
                <span className="mr-2 text-sm text-gray-700">Enabled</span>
                <input
                  id="emailEnabled"
                  name="enabled"
                  type="checkbox"
                  checked={notificationProviders.email.enabled}
                  onChange={handleEmailProviderChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Input
                  label="SMTP Host"
                  name="smtpHost"
                  type="text"
                  value={notificationProviders.email.smtpHost}
                  onChange={handleEmailProviderChange}
                  placeholder="smtp.example.com"
                  disabled={!notificationProviders.email.enabled}
                />
              </div>
              <div>
                <Input
                  label="SMTP Port"
                  name="smtpPort"
                  type="number"
                  value={notificationProviders.email.smtpPort.toString()}
                  onChange={handleEmailPortChange}
                  placeholder="587"
                  disabled={!notificationProviders.email.enabled}
                />
              </div>
              <div>
                <Input
                  label="SMTP Username"
                  name="smtpUser"
                  type="text"
                  value={notificationProviders.email.smtpUser}
                  onChange={handleEmailProviderChange}
                  placeholder="username@example.com"
                  disabled={!notificationProviders.email.enabled}
                />
              </div>
              <div>
                <Input
                  label="SMTP Password"
                  name="smtpPassword"
                  type="password"
                  value={notificationProviders.email.smtpPassword}
                  onChange={handleEmailProviderChange}
                  placeholder="••••••••"
                  disabled={!notificationProviders.email.enabled}
                />
              </div>
              <div>
                <Input
                  label="From Email"
                  name="fromEmail"
                  type="email"
                  value={notificationProviders.email.fromEmail}
                  onChange={handleEmailProviderChange}
                  placeholder="noreply@yourcompany.com"
                  disabled={!notificationProviders.email.enabled}
                />
              </div>
              <div className="flex items-center mt-8">
                <input
                  id="useTls"
                  name="useTls"
                  type="checkbox"
                  checked={notificationProviders.email.useTls}
                  onChange={handleEmailProviderChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  disabled={!notificationProviders.email.enabled}
                />
                <label htmlFor="useTls" className="ml-2 block text-sm text-gray-700">
                  Use TLS
                </label>
              </div>
            </div>
          </div>
          
          {/* Push Notification Provider */}
          <div className="mb-6 border-b pb-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900">Push Notification Provider</h4>
              <div className="flex items-center">
                <span className="mr-2 text-sm text-gray-700">Enabled</span>
                <input
                  id="pushEnabled"
                  name="enabled"
                  type="checkbox"
                  checked={notificationProviders.push.enabled}
                  onChange={handlePushProviderChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Input
                  label="Firebase Cloud Messaging API Key"
                  name="fcmApiKey"
                  type="password"
                  value={notificationProviders.push.fcmApiKey}
                  onChange={handlePushProviderChange}
                  placeholder="Enter your FCM API key"
                  disabled={!notificationProviders.push.enabled}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Get your API key from the Firebase Console
                </p>
              </div>
              <div>
                <Input
                  label="FCM URL"
                  name="fcmUrl"
                  type="text"
                  value={notificationProviders.push.fcmUrl}
                  onChange={handlePushProviderChange}
                  placeholder="https://fcm.googleapis.com/fcm/send"
                  disabled={!notificationProviders.push.enabled}
                />
              </div>
            </div>
          </div>
          
          {/* Web Notification Provider */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900">Web Notification Provider</h4>
              <div className="flex items-center">
                <span className="mr-2 text-sm text-gray-700">Enabled</span>
                <input
                  id="webEnabled"
                  name="enabled"
                  type="checkbox"
                  checked={notificationProviders.web.enabled}
                  onChange={handleWebProviderChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <p className="text-sm text-gray-700 mb-2">
                  Web notifications allow this admin portal to send notifications directly to your browser,
                  even when the browser is in the background or closed.
                </p>
                
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-medium text-gray-700">
                    Active subscribers: {notificationProviders.web.subscribers.filter(sub => !!sub.subscription_info).length}
                  </span>
                  
                  <Button 
                    variant="outline"
                    onClick={handleSubscribeToWebNotifications}
                    disabled={!notificationProviders.web.enabled || !notificationProviders.web.vapidPublicKey}
                  >
                    Subscribe this browser
                  </Button>
                </div>
                
                <div className="mt-4">
                  <p className="text-xs text-gray-500 mb-2">
                    VAPID keys are used to authenticate your push notifications. They are automatically generated
                    when you enable web notifications and save.
                  </p>
                  
                  <div className="text-xs bg-gray-100 p-2 rounded-md">
                    <div className="mb-2">
                      <span className="font-mono">Public Key:</span>
                      <span className="font-mono ml-2 text-gray-600">
                        {notificationProviders.web.vapidPublicKey ? 
                          `${notificationProviders.web.vapidPublicKey.substring(0, 10)}...` : 
                          "Not generated yet"}
                      </span>
                    </div>
                    <div>
                      <span className="font-mono">Private Key:</span>
                      <span className="font-mono ml-2 text-gray-600">
                        {notificationProviders.web.vapidPrivateKey ? "••••••••••••••••" : "Not generated yet"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Notification Tester */}
        <NotificationTester 
          onSendTest={handleSendTestNotification}
          availableProviders={{
            email: notificationProviders.email.enabled,
            push: notificationProviders.push.enabled,
            web: notificationProviders.web.enabled && notificationProviders.web.subscribers.length > 0
          }}
        />
        
        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <Button 
            variant="outline" 
            onClick={() => {
              if (settings) {
                // Reset to original settings
                setCompanySettings(settings.company);
                setWebhookSettings(settings.webhooks);
                setNotificationSettings(settings.notifications);
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            variant="primary"
            icon={<Save size={16} />}
            onClick={handleSaveSettings}
            isLoading={isUpdating}
          >
            Save All Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;