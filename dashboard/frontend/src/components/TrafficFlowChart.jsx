/**
 * TrafficFlowChart Component
 * Displays historical traffic data using Recharts
 */

import React, { useMemo } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, BarChart3 } from 'lucide-react';
import useDashboardStore from '../stores/dashboardStore';

const TrafficFlowChart = ({ timeRange = 10 }) => {
  const { getMetricsRange } = useDashboardStore();

  // Get metrics for the specified time range
  const chartData = useMemo(() => {
    const metrics = getMetricsRange(timeRange);
    
    return metrics.map((m) => {
      const time = new Date(m.timestamp);
      return {
        time: time.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          second: '2-digit'
        }),
        timestamp: time.getTime(),
        vehicles: m.active_vehicles || 0,
        fps: m.fps || 0,
        totalCount: m.vehicle_count || 0,
      };
    });
  }, [getMetricsRange, timeRange]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (chartData.length === 0) return null;

    const vehicles = chartData.map(d => d.vehicles);
    const peak = Math.max(...vehicles);
    const avg = vehicles.reduce((a, b) => a + b, 0) / vehicles.length;
    const current = vehicles[vehicles.length - 1] || 0;

    return { peak, avg: avg.toFixed(1), current };
  }, [chartData]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-600 rounded p-3 shadow-lg">
          <p className="text-sm text-gray-300 mb-2">{payload[0].payload.time}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-400">{entry.name}:</span>
              <span className="font-semibold text-white">
                {entry.name === 'FPS' ? entry.value.toFixed(1) : entry.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-blue-500" />
          <h2 className="text-2xl font-bold text-white">Traffic Flow</h2>
        </div>
        <div className="text-sm text-gray-400 bg-gray-800/50 px-3 py-1 rounded-lg">
          Last <span className="text-blue-400 font-semibold">{timeRange}</span> seconds
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-green-900/20 border-2 border-green-700 rounded-lg shadow-lg p-4 text-center hover:shadow-xl transition-shadow">
            <div className="text-xs font-semibold text-gray-400 uppercase mb-2">Current Vehicles</div>
            <div className="text-3xl font-bold text-green-400">{stats.current}</div>
          </div>
          <div className="bg-red-900/20 border-2 border-red-700 rounded-lg shadow-lg p-4 text-center hover:shadow-xl transition-shadow">
            <div className="text-xs font-semibold text-gray-400 uppercase mb-2">Peak Vehicles</div>
            <div className="text-3xl font-bold text-red-400">{stats.peak}</div>
          </div>
          <div className="bg-blue-900/20 border-2 border-blue-700 rounded-lg shadow-lg p-4 text-center hover:shadow-xl transition-shadow">
            <div className="text-xs font-semibold text-gray-400 uppercase mb-2">Average Vehicles</div>
            <div className="text-3xl font-bold text-blue-400">{stats.avg}</div>
          </div>
        </div>
      )}

      {/* Vehicle Count Chart */}
      <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-500" />
          Active Vehicles Over Time
        </h3>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorVehicles" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" stroke-width="0.5" />
              <XAxis 
                dataKey="time" 
                stroke="#9ca3af"
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="vehicles" 
                stroke="#3b82f6" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorVehicles)"
                name="Vehicles"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-80 flex items-center justify-center text-gray-500">
            <div className="text-center space-y-3">
              <TrendingUp className="w-16 h-16 mx-auto opacity-30" />
              <p className="text-lg font-semibold">Waiting for data...</p>
              <p className="text-sm text-gray-600">Start detection to see traffic flow analysis</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrafficFlowChart;
