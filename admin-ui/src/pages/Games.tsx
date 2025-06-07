import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash, X, Loader, DollarSign } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import HelpTooltip from '../components/ui/HelpTooltip';
import { useGetGamesQuery, useCreateGameMutation, useUpdateGameMutation, useDeleteGameMutation, 
  Game, GameCreateUpdateRequest } from '../api/gamesApi';
import { useGetCurrenciesQuery, useGetCurrencySettingsQuery } from '../api/apiSlice';
import { CurrencyInfo, CurrencySettings } from '../types/currency';

const Games: React.FC = () => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [formData, setFormData] = useState<GameCreateUpdateRequest>({
    name: '',
    description: '',
    steam_app_id: '',
    active: true,
    default_currency: 'USD',
    supported_currencies: []
  });
  
  // Fetch currencies from backend
  const { data: currenciesData, isLoading: isLoadingCurrencies } = useGetCurrenciesQuery();

  // RTK Query hooks
  const { data, isLoading, refetch } = useGetGamesQuery({
    page: page + 1,
    size: pageSize,
    search,
  });

  const [createGame, { isLoading: isCreating }] = useCreateGameMutation();
  const [updateGame, { isLoading: isUpdating }] = useUpdateGameMutation();
  const [deleteGame, { isLoading: isDeleting }] = useDeleteGameMutation();

  // Pagination handlers
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
    setPage(0);
  };

  // Search handler
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  // Get default currency settings from backend when currency is selected
  const getDefaultCurrencySettings = async (currencyCode: string) => {
    try {
      const result = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/v1/admin/currencies/${currencyCode}/settings`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('microtrax_token')}`,
        }
      });
      const data = await result.json();
      return data;
    } catch (error) {
      console.error('Error fetching currency settings:', error);
      return {
        code: currencyCode,
        min_price_increment: 1,
        fractional_unit: 'cents'
      };
    }
  };
  
  // Effect to set default currency settings when currencies are loaded
  useEffect(() => {
    if (currenciesData?.currencies && currenciesData.currencies.length > 0 && formData.supported_currencies?.length === 0) {
      const defaultCurrency = 'USD';
      getDefaultCurrencySettings(defaultCurrency).then(settings => {
        setFormData(prev => ({
          ...prev,
          default_currency: defaultCurrency,
          supported_currencies: [settings]
        }));
      });
    }
  }, [currenciesData]);

  // Modal handlers
  const handleOpenModal = (game?: Game) => {
    if (game) {
      setSelectedGame(game);
      setFormData({
        name: game.name,
        description: game.description,
        steam_app_id: game.steam_app_id,
        active: game.active,
        publisher: game.publisher,
        developer: game.developer,
        release_date: game.release_date,
        image_url: game.image_url,
        default_currency: game.default_currency || 'USD',
        supported_currencies: game.supported_currencies || []
      });
    } else {
      setSelectedGame(null);
      setFormData({
        name: '',
        description: '',
        steam_app_id: '',
        active: true,
        default_currency: 'USD',
        supported_currencies: []
      });
      
      // Set default currency settings when creating a new game
      if (currenciesData?.currencies && currenciesData.currencies.length > 0) {
        const defaultCurrency = 'USD';
        getDefaultCurrencySettings(defaultCurrency).then(settings => {
          setFormData(prev => ({
            ...prev,
            default_currency: defaultCurrency,
            supported_currencies: [settings]
          }));
        });
      }
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  // Form handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    // Special handling for currency selection
    if (name === 'default_currency') {
      // Update default currency and ensure settings for it exist
      const currencyCode = value;
      const existingSettings = formData.supported_currencies?.find(c => c.code === currencyCode);
      
      // If we don't have settings for this currency yet, fetch and add them
      if (!existingSettings) {
        getDefaultCurrencySettings(currencyCode).then(settings => {
          setFormData(prev => ({
            ...prev,
            default_currency: currencyCode,
            supported_currencies: [...(prev.supported_currencies || []), settings]
          }));
        });
      } else {
        setFormData({
          ...formData,
          default_currency: currencyCode
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: newValue,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedGame) {
        await updateGame({ id: selectedGame._id, data: formData }).unwrap();
      } else {
        await createGame(formData).unwrap();
      }
      handleCloseModal();
      refetch();
    } catch (error) {
      console.error('Failed to save game:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this game?')) {
      try {
        await deleteGame(id).unwrap();
        refetch();
      } catch (error) {
        console.error('Failed to delete game:', error);
      }
    }
  };

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Manage Games</h2>
        <Button 
          variant="primary"
          icon={<Plus size={16} />}
          onClick={() => handleOpenModal()}
        >
          Add Game
        </Button>
      </div>
      
      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search games..."
            value={search}
            onChange={handleSearchChange}
            className="pl-10"
          />
        </div>
      </div>
      
      {/* Games table */}
      <div className="card overflow-hidden border border-gray-200 rounded-lg">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-10 flex justify-center">
              <Loader className="animate-spin mr-2" size={20} />
              <span>Loading games...</span>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Steam App ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Currency
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data && data.items.length > 0 ? (
                  data.items.map((game) => (
                    <tr key={game._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{game.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 truncate max-w-xs">{game.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{game.steam_app_id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono bg-gray-100 px-2 py-1 rounded inline-block">
                          {game.default_currency || CurrencyCode.USD}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          game.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {game.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Edit size={16} />}
                          className="text-blue-600 hover:text-blue-900 mr-2"
                          onClick={() => handleOpenModal(game)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Trash size={16} />}
                          className="text-red-600 hover:text-red-900"
                          onClick={() => handleDelete(game._id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      No games found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Pagination */}
        {data && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(Math.max(0, page - 1))}
                disabled={page === 0}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page + 1)}
                disabled={!data || (page + 1) * pageSize >= data.total}
              >
                Next
              </Button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{page * pageSize + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min((page + 1) * pageSize, data.total)}
                  </span>{' '}
                  of <span className="font-medium">{data.total}</span> results
                </p>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">Rows per page:</span>
                  <select
                    value={pageSize}
                    onChange={handlePageSizeChange}
                    className="border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                  </select>
                  
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(Math.max(0, page - 1))}
                      disabled={page === 0}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      Previous
                    </Button>
                    
                    {/* Page numbers */}
                    {Array.from({ length: Math.ceil(data.total / pageSize) }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => handlePageChange(i)}
                        className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                          page === i
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    )).slice(Math.max(0, page - 1), Math.min(page + 2, Math.ceil(data.total / pageSize)))}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(page + 1)}
                      disabled={!data || (page + 1) * pageSize >= data.total}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      Next
                    </Button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Game Form Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={handleCloseModal}
            ></div>
            
            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full mx-4">
              <div className="bg-white px-6 pt-6 pb-6 sm:p-8 sm:pb-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {selectedGame ? 'Edit Game' : 'Add New Game'}
                  </h3>
                  <button
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={handleCloseModal}
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    {/* Basic Game Information */}
                    <div className="border-b border-gray-200 pb-6">
                      <h4 className="text-sm font-medium text-gray-500 mb-4">Basic Information</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <Input
                            label="Game Name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Enter game name"
                            required
                          />
                        </div>
                        
                        <div>
                          <div className="flex items-center mb-1">
                            <label className="block text-sm font-medium text-gray-700">
                              Steam App ID
                            </label>
                            <HelpTooltip content="This is your game's unique identifier on Steam (like 730 for CS:GO). You can find this in your Steam partner dashboard or by looking at your game's Steam store URL. It's a number that Steam uses to identify your specific game." />
                          </div>
                          <input
                            name="steam_app_id"
                            type="text"
                            value={formData.steam_app_id}
                            onChange={handleInputChange}
                            placeholder="e.g., 730 (for Counter-Strike)"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          placeholder="Enter game description"
                          rows={3}
                          className="w-full rounded-md shadow-sm border-gray-300 focus:ring-blue-500 focus:border-transparent focus:outline-none transition duration-150 ease-in-out"
                          required
                        ></textarea>
                      </div>
                      
                      <div className="flex items-center mt-3">
                        <input
                          id="active"
                          name="active"
                          type="checkbox"
                          checked={formData.active}
                          onChange={e => setFormData({...formData, active: e.target.checked})}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
                          Active
                        </label>
                      </div>
                    </div>
                    
                    {/* Additional Information */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-3">Additional Information (Optional)</h4>
                      
                      <div className="mb-3">
                        <Input
                          label="Publisher"
                          name="publisher"
                          value={formData.publisher || ''}
                          onChange={handleInputChange}
                          placeholder="Enter publisher name"
                        />
                      </div>
                      
                      <div className="mb-3">
                        <Input
                          label="Developer"
                          name="developer"
                          value={formData.developer || ''}
                          onChange={handleInputChange}
                          placeholder="Enter developer name"
                        />
                      </div>
                      
                      <div className="mb-3">
                        <Input
                          label="Release Date"
                          name="release_date"
                          type="date"
                          value={formData.release_date || ''}
                          onChange={handleInputChange}
                        />
                      </div>
                      
                      <div className="mb-3">
                        <Input
                          label="Image URL"
                          name="image_url"
                          value={formData.image_url || ''}
                          onChange={handleInputChange}
                          placeholder="Enter image URL"
                        />
                      </div>
                    </div>
                    
                    {/* Currency Settings */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
                        <DollarSign size={16} className="mr-1" />
                        Currency Settings
                      </h4>
                      
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Default Currency
                        </label>
                        <select
                          name="default_currency"
                          value={formData.default_currency || 'USD'}
                          onChange={handleInputChange}
                          className="
                            w-full rounded-md shadow-sm px-4 py-2
                            border-gray-300 focus:ring-blue-500
                            focus:border-transparent focus:outline-none
                            transition duration-150 ease-in-out
                            cursor-pointer text-base
                          "
                        >
                          {isLoadingCurrencies ? (
                            <option value="USD">Loading currencies...</option>
                          ) : (
                            currenciesData?.currencies.map((currency: CurrencyInfo) => (
                              <option key={currency.code} value={currency.code}>
                                {currency.code} - {currency.name} ({currency.symbol})
                              </option>
                            ))
                          )}
                        </select>
                        <p className="mt-1 text-xs text-gray-500">
                          The default currency for this game's microtransactions
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 sm:flex sm:justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full mb-3 sm:w-auto sm:mb-0 sm:mr-3"
                      onClick={handleCloseModal}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      className="w-full sm:w-auto"
                      isLoading={isCreating || isUpdating}
                      loadingText="Saving..."
                    >
                      {selectedGame ? 'Update Game' : 'Add Game'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Games;