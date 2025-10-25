/**
 * MetricsPanel Component
 * Displays real-time system metrics in card format
 */

import React, { useMemo } from 'react';
import { Activity, Car, Users, Gauge, Clock } from 'lucide-react';
import useDashboardStore from '../stores/dashboardStore';

const MetricCard = ({ icon: Icon, label, value, unit, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-900/20 border-blue-700 text-blue-400',
    green: 'bg-green-900/20 border-green-700 text-green-400',
    yellow: 'bg-yellow-900/20 border-yellow-700 text-yellow-400',
    red: 'bg-red-900/20 border-red-700 text-red-400',
    purple: 'bg-purple-900/20 border-purple-700 text-purple-400',
  };

  const IconComponent = Icon;

  return (
    <div className={`p-4 rounded-lg border-2 ${colorClasses[color]} transition-all hover:shadow-lg`}>
      <IconComponent className="w-6 h-6 mb-2" />
      <div className="text-2xl font-bold mb-1">
        {value}
        {unit && <span className="text-xs text-gray-400 ml-1">{unit}</span>}
      </div>
      <div className="text-xs text-gray-400">{label}</div>
    </div>
  );
};

const MetricsPanel = () => {
  const { metrics, getAverageFPS, getVehicleStats } = useDashboardStore();
  
  // ✅ FIXED: Use useMemo to recalculate whenever these functions change
  const avgFPS = useMemo(() => getAverageFPS(1), [getAverageFPS]); // Last 1 minute
  const vehicleStats = useMemo(() => getVehicleStats(5), [getVehicleStats]); // Last 5 minutes

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold mb-4">System Metrics</h2>
      
      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <MetricCard
          icon={Activity}
          label="Current FPS"
          value={metrics.fps.toFixed(1)}
          color="green"
        />
        
        <MetricCard
          icon={Users}
          label="Active Vehicles"
          value={metrics.active_vehicles}
          color="blue"
        />
        
        <MetricCard
          icon={Car}
          label="Total Count"
          value={metrics.vehicle_count}
          color="purple"
        />
        
        <MetricCard
          icon={Gauge}
          label="Avg FPS (1m)"
          value={avgFPS.toFixed(1)}
          color="yellow"
        />
        
        <MetricCard
          icon={Clock}
          label="Frame Count"
          value={metrics.frame_count}
          color="blue"
        />
      </div>

      {/* Vehicle Statistics */}
      {vehicleStats.current > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-3">Vehicle Statistics (5 min)</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{vehicleStats.current}</div>
              <div className="text-xs text-gray-400">Current</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{vehicleStats.max}</div>
              <div className="text-xs text-gray-400">Peak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-500">{vehicleStats.avg.toFixed(1)}</div>
              <div className="text-xs text-gray-400">Average</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-500">{vehicleStats.min}</div>
              <div className="text-xs text-gray-400">Minimum</div>
            </div>
          </div>
        </div>
      )}

      {/* System Info */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-3">System Information</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Detection Mode:</span>
            <span className="font-mono text-green-500 uppercase">{metrics.mode}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Video Source:</span>
            <span className="font-mono text-blue-500">{metrics.video_source}</span>
          </div>
          
          {/* ✅ NEW: Ambulance Status - Updated Frequently */}
          <div className="flex justify-between">
            <span className="text-gray-400">Ambulance Status:</span>
            <div className="flex items-center gap-2">
              <span className={`font-mono font-bold uppercase ${
                metrics.ambulance_detected ? 'text-red-500' : 'text-green-500'
              }`}>
                {metrics.ambulance_detected ? '🚨 DETECTED' : '✅ CLEAR'}
              </span>
              {metrics.ambulance_detected && (
                <span className="text-xs text-gray-400">
                  ({(metrics.ambulance_confidence * 100).toFixed(1)}%)
                </span>
              )}
            </div>
          </div>
          
          {/* Stability indicator */}
          {metrics.ambulance_detected && (
            <div className="flex justify-between">
              <span className="text-gray-400">Detection Stability:</span>
              <span className={`font-mono font-bold ${
                metrics.ambulance_stable ? 'text-green-500' : 'text-yellow-500'
              }`}>
                {metrics.ambulance_stable ? '🟢 STABLE' : '🟡 UNSTABLE'}
              </span>
            </div>
          )}
          
          <div className="flex justify-between">
            <span className="text-gray-400">Last Update:</span>
            <span className="font-mono text-purple-500">
              {metrics.timestamp ? new Date(metrics.timestamp).toLocaleTimeString() : 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricsPanel;
