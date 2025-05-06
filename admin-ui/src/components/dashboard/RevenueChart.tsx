import React, { useState, useEffect } from 'react';

// Mocked chart data - in a real app this would come from an API
const data = [
  { date: '1 Jun', revenue: 1200 },
  { date: '5 Jun', revenue: 1800 },
  { date: '10 Jun', revenue: 1600 },
  { date: '15 Jun', revenue: 2100 },
  { date: '20 Jun', revenue: 1900 },
  { date: '25 Jun', revenue: 2400 },
  { date: '30 Jun', revenue: 2800 },
];

const RevenueChart: React.FC = () => {
  const [chartWidth, setChartWidth] = useState(0);
  const [chartHeight, setChartHeight] = useState(0);
  
  // Get the maximum value from the data to scale the chart
  const maxRevenue = Math.max(...data.map(item => item.revenue));
  
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
  
  // Return empty div if dimensions aren't calculated yet
  if (chartWidth === 0 || chartHeight === 0) {
    return <div className="h-[200px] bg-gray-50 animate-pulse rounded-md"></div>;
  }
  
  // Calculate the spacing between data points
  const barWidth = (chartWidth - 40) / data.length;
  const barSpacing = barWidth * 0.3;
  const actualBarWidth = barWidth - barSpacing;
  
  // Calculate the scale for the y-axis
  const yScale = (chartHeight - 40) / maxRevenue;

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
          {data.map((item, index) => {
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
                
                {/* X-axis labels */}
                <text
                  x={x + barWidth / 2}
                  y={chartHeight - 10}
                  textAnchor="middle"
                  fontSize={window.innerWidth < 640 ? "8" : "10"}
                  fill="#6b7280"
                >
                  {item.date}
                </text>
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