/**
 * Main Dashboard Application
 * Real-time traffic monitoring system with integrated signal control
 */

import { useEffect, useState } from 'react';
import { Settings, Wifi, WifiOff, Zap } from 'lucide-react';

// Components
import VideoFeed from './components/VideoFeed';
import MetricsPanel from './components/MetricsPanel';
import EmergencyAlert from './components/EmergencyAlert';
import TrafficFlowChart from './components/TrafficFlowChart';
import DetectionControls from './components/DetectionControls';
import TrafficSignalVisualizer from './components/TrafficSignalVisualizer';
import TrafficControlPanel from './components/TrafficControlPanel';

// Services and Store
import wsService from './services/websocket';
import useDashboardStore from './stores/dashboardStore';

function App() {
  const { 
    connected, 
    setConnected, 
    updateMetrics, 
    updateFrame,
    addAlert,
    clearAllAlerts
  } = useDashboardStore();
  
  const [serverUrl, setServerUrl] = useState('http://localhost:8765');
  const [showSettings, setShowSettings] = useState(false);
  const [simulationMode, setSimulationMode] = useState('manual'); // 'manual' or 'automatic'

  useEffect(() => {
    // Connect to WebSocket server
    console.log('App.jsx: Attempting WebSocket connection to', serverUrl);
    
    wsService.connect(
      serverUrl,
      () => {
        console.log('App.jsx: Dashboard connected to backend');
        setConnected(true);
      },
      (reason) => {
        console.log('App.jsx: Dashboard disconnected:', reason);
        setConnected(false);
      }
    );

    // Subscribe to metrics updates
    const unsubMetrics = wsService.on('metrics', (data) => {
      console.log('📊 Metrics received:', data); // ✅ Debug log
      if (data && data.data) {
        updateMetrics(data.data);
      }
    });

    // Subscribe to frame updates
    const unsubFrame = wsService.on('frame', (data) => {
      if (data && data.frame) {
        updateFrame(data.frame, data.metadata);
      }
    });

    // Subscribe to alerts
    const unsubAlert = wsService.on('alert', (data) => {
      if (data) {
        addAlert(data);
      }
    });

    // Keepalive ping every 15 seconds to prevent disconnection
    const pingInterval = setInterval(() => {
      if (wsService.isConnected()) {
        console.log('App.jsx: Sending keepalive ping');
        wsService.ping();
      } else {
        console.log('App.jsx: Not connected, skipping ping');
      }
    }, 15000);

    // Connection health check every 30 seconds
    const healthCheckInterval = setInterval(() => {
      if (!wsService.isConnected()) {
        console.log('App.jsx: Connection lost, attempting to reconnect...');
        wsService.connect(
          serverUrl,
          () => {
            console.log('App.jsx: Reconnection successful');
            setConnected(true);
          },
          (reason) => {
            console.log('App.jsx: Reconnection failed:', reason);
            setConnected(false);
          }
        );
      }
    }, 30000);

    // Cleanup on unmount
    return () => {
      clearInterval(pingInterval);
      clearInterval(healthCheckInterval);
      unsubMetrics();
      unsubFrame();
      unsubAlert();
      wsService.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverUrl]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🚦</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">Traffic Control Dashboard</h1>
                <p className="text-sm text-gray-400">Real-time monitoring system</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Connection Status */}
              <div className="flex items-center gap-2">
                {connected ? (
                  <>
                    <Wifi className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-green-500 font-medium">Connected</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-5 h-5 text-red-500 animate-pulse" />
                    <span className="text-sm text-red-500 font-medium">Disconnected</span>
                  </>
                )}
              </div>

              {/* Settings Button */}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="mt-4 p-4 bg-gray-700 rounded-lg">
              <h3 className="font-semibold mb-2">Server Settings</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={serverUrl}
                  onChange={(e) => setServerUrl(e.target.value)}
                  placeholder="Server URL"
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={() => window.location.reload()}
                  className="btn-primary"
                >
                  Reconnect
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Mode Toggle Bar */}
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span className="font-semibold text-gray-300">Simulation Mode:</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSimulationMode('manual');
                  // Pass mode to TrafficSignalVisualizer
                  window.dispatchEvent(new CustomEvent('modeChanged', { detail: { mode: 'manual' } }));
                }}
                className={`px-6 py-2 rounded font-semibold transition-all ${
                  simulationMode === 'manual'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Manual
              </button>
              <button
                onClick={() => {
                  setSimulationMode('automatic');
                  window.dispatchEvent(new CustomEvent('modeChanged', { detail: { mode: 'automatic' } }));
                }}
                className={`px-6 py-2 rounded font-semibold transition-all ${
                  simulationMode === 'automatic'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Automatic
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content - Restructured View */}
      <main className="bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen">
        <div className="w-full px-3 py-6">
          {/* Emergency Alert - Always Visible at Top */}
          <div className="mb-6 max-w-full">
            <EmergencyAlert />
          </div>

          {/* Row 1: Detection System (left) + Video Feed (right) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            {/* Left - Detection Controls */}
            <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-6 overflow-hidden">
              <DetectionControls 
                onVideoStop={() => {
                  clearAllAlerts(); // Clear alerts when video stops
                }}
              />
            </div>

            {/* Right - Video Feed */}
            <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden p-6">
              <VideoFeed />
            </div>
          </div>

          {/* Row 2: Traffic Simulator (left) + Control Panel (right) - Split */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            {/* Left - Traffic Junction Visualization */}
            <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-6 overflow-hidden">
              <TrafficSignalVisualizer simulationMode={simulationMode} />
            </div>

            {/* Right - Traffic Control Panel */}
            <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-6 overflow-hidden">
              <TrafficControlPanel simulationMode={simulationMode} />
            </div>
          </div>

          {/* Row 3: System Metrics (left) + Traffic Flow Chart (right) - Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left - System Metrics */}
            <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-6">
              <h2 className="text-xl font-bold text-white mb-4">📊 System Metrics</h2>
              <MetricsPanel />
            </div>

            {/* Right - Traffic Flow Chart */}
            <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-6">
              <TrafficFlowChart timeRange={10} />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 mt-12">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <div>
              <span>Traffic Control System</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
