/**
 * Traffic Control Panel Component
 * Extracted control panel from TrafficSignalVisualizer for side-by-side layout
 */

import React, { useEffect, useState, useCallback } from 'react';
import { AlertCircle, RotateCcw, Zap } from 'lucide-react';
import useDashboardStore from '../stores/dashboardStore';

const TrafficControlPanel = ({ simulationMode }) => {
  const [mode, setMode] = useState(simulationMode || 'manual');
  const [videoLane, setVideoLane] = useState('north');
  const [selectedDirection, setSelectedDirection] = useState('north');
  const [stats, setStats] = useState({
    totalAmbulances: 0,
  });
  const [lastAmbulanceTriggered, setLastAmbulanceTriggered] = useState(false);

  const { metrics } = useDashboardStore();

  // Sync mode from parent prop
  useEffect(() => {
    if (simulationMode) {
      setMode(simulationMode);
    }
  }, [simulationMode]);

  const fetchSignalStatus = async () => {
    try {
      const response = await fetch('http://localhost:8765/api/signals/status');
      if (response.ok) {
        const data = await response.json();
        setStats((prev) => ({
          ...prev,
          totalAmbulances: data.statistics?.totalAmbulances || prev.totalAmbulances,
        }));
      }
    } catch (error) {
      console.error('Error fetching signal status:', error);
    }
  };

  useEffect(() => {
    const interval = setInterval(fetchSignalStatus, 1000);
    fetchSignalStatus();
    return () => clearInterval(interval);
  }, []);

  const handleAmbulance = useCallback(async (direction) => {
    try {
      const response = await fetch('http://localhost:8765/api/signals/ambulance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ direction, confidence: 0.95 }),
      });
      if (response.ok) {
        console.log(`Ambulance triggered for ${direction}`);
      }
    } catch (error) {
      console.error('Error triggering ambulance:', error);
    }
  }, []);

  const handleReset = async () => {
    try {
      await fetch('http://localhost:8765/api/signals/reset', { method: 'POST' });
    } catch (error) {
      console.error('Error resetting:', error);
    }
  };

  // ✅ AUTOMATIC MODE: Auto-trigger ambulance signal when ambulance detected in video lane
  useEffect(() => {
    if (mode === 'automatic' && metrics.ambulance_detected && !lastAmbulanceTriggered) {
      // Ambulance detected in the configured lane
      handleAmbulance(videoLane);
      setLastAmbulanceTriggered(true);
      console.log(`🚑 Auto-triggered ambulance for lane: ${videoLane}`);
    } else if (!metrics.ambulance_detected && lastAmbulanceTriggered) {
      // Ambulance left frame - reset trigger flag
      setLastAmbulanceTriggered(false);
      console.log(`✅ Ambulance cleared - Reset trigger flag`);
    }
  }, [metrics.ambulance_detected, mode, videoLane, lastAmbulanceTriggered, handleAmbulance]);

  const directions = ['north', 'south', 'east', 'west'];
  const directionLabels = { north: 'NORTH', south: 'SOUTH', east: 'EAST', west: 'WEST' };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-white">🎮 Control Panel</h3>
      
      {/* Mode Status */}
      <div className="bg-gray-900/50 p-4 rounded-lg space-y-3 border-2 border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            <span className="font-semibold text-white">Current Mode</span>
          </div>
          <div className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all shadow-md ring-2 ${
            mode === 'manual'
              ? 'bg-blue-600 text-white ring-blue-400'
              : 'bg-purple-600 text-white ring-purple-400'
          }`}>
            {mode === 'manual' ? '📍 Manual' : '🎥 Automatic'}
          </div>
        </div>

        {/* Mode Description */}
        <div className="text-xs text-gray-300 p-3 bg-gray-950 rounded-lg border border-gray-700">
          {mode === 'manual' ? (
            <span>📍 <strong>Manual Mode:</strong> Click direction buttons below to trigger ambulance</span>
          ) : (
            <span>🎥 <strong>Automatic Mode:</strong> Ambulance triggered automatically when detected in <strong>{videoLane.toUpperCase()}</strong> lane</span>
          )}
        </div>

        {/* Lane Selection - Only show in automatic mode */}
        {mode === 'automatic' && (
          <div className="space-y-2 pt-3 border-t border-gray-700">
            <label className="text-sm text-gray-300 font-semibold">Video Lane Assignment</label>
            <div className="grid grid-cols-4 gap-2">
              {['north', 'south', 'east', 'west'].map((lane) => (
                <button
                  key={lane}
                  onClick={() => setVideoLane(lane)}
                  className={`py-2 px-2 rounded-lg font-semibold transition-all text-sm ${
                    videoLane === lane
                      ? 'bg-purple-600 text-white ring-2 ring-purple-400 shadow-lg'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {lane.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Manual Mode Controls */}
      {mode === 'manual' && (
        <>
          <div className="bg-gradient-to-r from-blue-900/40 to-blue-800/40 p-4 rounded-lg border border-blue-700 text-center">
            <div className="text-xs text-gray-400 font-semibold">SELECTED DIRECTION</div>
            <div className="text-2xl font-bold text-blue-300 uppercase mt-2">{directionLabels[selectedDirection]}</div>
          </div>

          {/* Direction Selection */}
          <div className="grid grid-cols-2 gap-2">
            {directions.map((dir) => (
              <button
                key={dir}
                onClick={() => setSelectedDirection(dir)}
                className={`py-2 px-3 rounded-lg font-semibold transition-all text-sm ${
                  selectedDirection === dir
                    ? 'bg-blue-600 text-white ring-2 ring-blue-400 shadow-md'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {directionLabels[dir]}
              </button>
            ))}
          </div>

          {/* Ambulance Button */}
          <button
            onClick={() => handleAmbulance(selectedDirection)}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all shadow-lg ring-2 ring-red-500/50 hover:ring-red-400"
          >
            <AlertCircle className="w-5 h-5" />
            Trigger Ambulance ({directionLabels[selectedDirection]})
          </button>
        </>
      )}

      {/* Automatic Mode Status */}
      {mode === 'automatic' && (
        <div className="bg-gradient-to-r from-purple-900/40 to-purple-800/40 border-2 border-purple-600 p-4 rounded-lg text-sm text-purple-200">
          <div className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full ${metrics.ambulance_detected ? 'bg-red-500 animate-pulse ring-2 ring-red-400' : 'bg-gray-500'}`} />
            <span className="font-semibold">
              {metrics.ambulance_detected
                ? `🚑 Ambulance detected (${(metrics.ambulance_confidence * 100).toFixed(1)}%)`
                : '✓ No ambulance in frame'}
            </span>
          </div>
        </div>
      )}

      {/* Reset Button */}
      <button
        onClick={handleReset}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-all shadow-md ring-2 ring-gray-600"
      >
        <RotateCcw className="w-4 h-4" />
        Reset System
      </button>

      {/* Statistics */}
      <div className="bg-gradient-to-r from-yellow-900/40 to-yellow-800/40 rounded-lg shadow-xl border-2 border-yellow-700 p-4 mt-4">
        <div className="text-sm text-gray-300 font-semibold">Total Ambulances</div>
        <div className="text-3xl font-bold text-yellow-300 mt-1">{stats.totalAmbulances || 0}</div>
      </div>
    </div>
  );
};

export default TrafficControlPanel;
