import React, { useState, useEffect } from 'react';

// Chart data interface
interface ChartDataPoint {
  date: string;
  revenue: number;
  count: number;
}

interface RevenueChartProps {
  data: ChartDataPoint[];
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  const [chartWidth, setChartWidth] = useState(0);
  const [chartHeight, setChartHeight] = useState(0);
  
  // Format date labels to be more readable
  const formatDateLabel = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })}`;
    } catch (e) {
      return dateStr;
    }
  };
  
  // Process the data to format dates
  const processedData = data.map(item => ({
    ...item,
    formattedDate: formatDateLabel(item.date)
  }));
  
  // Get the maximum revenue from the data to scale the chart
  const maxRevenue = data.length > 0 ? Math.max(...data.map(item => item.revenue)) : 1000;
  
  // Set up the chart dimensions based on container size
  useEffect(() => {
    const handleResize = () => {
      const container = document.getElementById('revenue-chart-container');
      if (container) {
        setChartWidth(container.clientWidth);
        // Adjust height based on screen width
        setChartHeight(window.innerWidth < 640 ? 150 : 200);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Return empty div if dimensions aren't calculated yet or no data
  if (chartWidth === 0 || chartHeight === 0) {
    return <div className="h-[200px] bg-gray-50 animate-pulse rounded-md"></div>;
  }
  
  // If no data, show an empty state
  if (data.length === 0) {
    return (
      <div className="h-[240px] sm:h-[280px] flex items-center justify-center text-gray-500">
        No revenue data available for this period
      </div>
    );
  }
  
  // Calculate the spacing between data points
  const barWidth = (chartWidth - 40) / Math.max(processedData.length, 1);
  const barSpacing = barWidth * 0.3;
  const actualBarWidth = barWidth - barSpacing;
  
  // Calculate the scale for the y-axis (with buffer space)
  const yScale = (chartHeight - 40) / (maxRevenue * 1.1);

  return (
    <div 
      id="revenue-chart-container" 
      className="w-full h-[240px] sm:h-[280px] relative overflow-hidden"
    >
      {/* Y-axis labels */}
      <div className="absolute left-0 top-0 h-full w-10 flex flex-col justify-between text-[10px] sm:text-xs text-gray-500">
        <div>${Math.round(maxRevenue)}</div>
        <div>${Math.round(maxRevenue / 2)}</div>
        <div>$0</div>
      </div>
      
      {/* Chart area */}
      <div className="ml-10 h-full">
        <svg width={chartWidth - 10} height={chartHeight}>
          {/* Horizontal guidelines */}
          <line 
            x1="0" y1={0} 
            x2={chartWidth - 10} y2={0} 
            stroke="#e5e7eb" strokeWidth="1" 
          />
          <line 
            x1="0" y1={chartHeight / 2} 
            x2={chartWidth - 10} y2={chartHeight / 2} 
            stroke="#e5e7eb" strokeWidth="1" 
          />
          <line 
            x1="0" y1={chartHeight - 1} 
            x2={chartWidth - 10} y2={chartHeight - 1} 
            stroke="#e5e7eb" strokeWidth="1" 
          />
          
          {/* Bars */}
          {processedData.map((item, index) => {
            const barHeight = item.revenue * yScale;
            const x = index * barWidth;
            const y = chartHeight - barHeight;
            
            return (
              <g key={index}>
                <rect
                  x={x + barSpacing / 2}
                  y={y}
                  width={actualBarWidth}
                  height={barHeight}
                  rx={4}
                  fill="url(#gradient)"
                  className="transition-all duration-500 ease-out"
                />
                
                {/* Tooltip on hover */}
                <title>${item.revenue.toFixed(2)} / {item.count} transactions</title>
                
                {/* X-axis labels - only show every n-th label on small screens */}
                {(index % (processedData.length > 14 ? 3 : 1) === 0 || index === processedData.length - 1) && (
                  <text
                    x={x + barWidth / 2}
                    y={chartHeight + 10}
                    textAnchor="middle"
                    fontSize={window.innerWidth < 640 ? "8" : "10"}
                    fill="#6b7280"
                  >
                    {item.formattedDate}
                  </text>
                )}
              </g>
            );
          })}
          
          {/* Gradient definition */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="1" />
              <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.6" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
};

export default RevenueChart;