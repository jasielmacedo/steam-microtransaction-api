import React, { useState } from 'react';
import { useGetGameClientProductsQuery } from '../../api/game-client.api';

interface GameClientProductViewerProps {
  gameId: string;
}

const GameClientProductViewer: React.FC<GameClientProductViewerProps> = ({ gameId }) => {
  const { data, error, isLoading, refetch } = useGetGameClientProductsQuery(gameId);
  
  if (isLoading) {
    return <div className="p-4 text-center">Loading game products...</div>;
  }
  
  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-800 rounded-md border border-red-200">
        <h3 className="font-medium mb-2">Error loading game products</h3>
        <p className="text-sm">{error.toString()}</p>
        <button
          onClick={() => refetch()}
          className="mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 rounded-md text-sm"
        >
          Try Again
        </button>
      </div>
    );
  }
  
  if (!data || !data.products || data.products.length === 0) {
    return (
      <div className="p-4 text-center text-gray-600">
        <p>No products found for this game</p>
      </div>
    );
  }
  
  return (
    <div className="mt-4">
      <h3 className="text-lg font-medium mb-2">Game Client Products Preview</h3>
      <div className="text-xs text-gray-500 mb-4">
        This is how products will appear to game clients.
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.products.map(product => (
          <div 
            key={product.id} 
            className="border rounded-lg overflow-hidden shadow-sm"
            style={{ 
              backgroundColor: product.background_color ? product.background_color : '#ffffff',
              color: product.background_color ? getContrastColor(product.background_color) : '#000000'
            }}
          >
            {product.icon_url_large && (
              <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
                <img 
                  src={product.icon_url_large} 
                  alt={product.name} 
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            )}
            
            <div className="p-3">
              <div className="flex justify-between items-start">
                <h4 className="font-semibold text-md">{product.name}</h4>
                <div className="text-md font-medium">
                  ${(product.price_cents / 100).toFixed(2)}
                </div>
              </div>
              
              <p className="text-sm mt-1 opacity-80">{product.description}</p>
              
              {product.tags && product.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {product.tags.map((tag, index) => (
                    <span 
                      key={index} 
                      className="px-2 py-0.5 text-xs rounded-full opacity-75"
                      style={{ 
                        backgroundColor: product.background_color 
                          ? adjustColor(product.background_color, -20) 
                          : '#f0f0f0',
                        color: product.background_color 
                          ? getContrastColor(product.background_color)
                          : '#000000'
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="mt-3 text-xs">
                <div>Type: <span className="font-medium">{product.type}</span></div>
                <div>Steam Item ID: <span className="font-medium">{product.steam_item_id}</span></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Helper function to get contrasting text color
function getContrastColor(hexColor: string): string {
  // Remove the # if present
  hexColor = hexColor.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hexColor.substring(0, 2), 16);
  const g = parseInt(hexColor.substring(2, 4), 16);
  const b = parseInt(hexColor.substring(4, 6), 16);
  
  // Calculate brightness (simplified formula)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  
  // Return black or white based on brightness
  return brightness > 128 ? '#000000' : '#ffffff';
}

// Helper function to adjust color brightness
function adjustColor(hexColor: string, amount: number): string {
  // Remove the # if present
  hexColor = hexColor.replace('#', '');
  
  // Convert to RGB
  let r = parseInt(hexColor.substring(0, 2), 16);
  let g = parseInt(hexColor.substring(2, 4), 16);
  let b = parseInt(hexColor.substring(4, 6), 16);
  
  // Adjust
  r = Math.max(0, Math.min(255, r + amount));
  g = Math.max(0, Math.min(255, g + amount));
  b = Math.max(0, Math.min(255, b + amount));
  
  // Convert back to hex
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export default GameClientProductViewer;