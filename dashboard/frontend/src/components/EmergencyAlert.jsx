/**
 * EmergencyAlert Component
 * Displays prominent alerts when ambulance is detected
 */

import React, { useEffect, useState, useRef } from 'react';
import { AlertTriangle, Siren, X, Activity } from 'lucide-react';
import useDashboardStore from '../stores/dashboardStore';

const EmergencyAlert = () => {
  const { metrics, alerts, clearAlert, addAlert } = useDashboardStore();
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [audioContext, setAudioContext] = useState(null);
  const wasAmbulanceDetectedRef = useRef(false);

  // Play alert sound (simple beep)
  const playAlertSound = () => {
    if (!audioEnabled || !audioContext) return;

    try {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800; // Hz
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.error('Error playing alert sound:', error);
    }
  };

  // Initialize audio context on user interaction
  const initAudio = () => {
    if (!audioContext) {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      setAudioContext(ctx);
      setAudioEnabled(true);
    } else {
      setAudioEnabled(!audioEnabled);
    }
  };

  // Play sound when ambulance is detected
  useEffect(() => {
    if (metrics.ambulance_detected && audioEnabled) {
      playAlertSound();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metrics.ambulance_detected, audioEnabled]);

  // ✅ AUTO-CLEAR: Ambulance left frame - turn off alert immediately
  useEffect(() => {
    // Check if ambulance state changed from detected to not detected
    if (wasAmbulanceDetectedRef.current && !metrics.ambulance_detected) {
      console.log('✅ Ambulance cleared - Alert disabled');
      // Add to alert history for reference
      addAlert({
        alert_type: 'ambulance_cleared',
        severity: 'info',
        data: {
          confidence: 0,
          stable: false,
          reason: 'Ambulance left the frame'
        }
      });
    }
    
    // Update the ref to track state
    wasAmbulanceDetectedRef.current = metrics.ambulance_detected;
  }, [metrics.ambulance_detected, addAlert]);

  // Main ambulance alert
  const showMainAlert = metrics.ambulance_detected;

  return (
    <div className="space-y-4">
      {/* Main Ambulance Alert */}
      {showMainAlert && (
        <div className="bg-gradient-to-r from-red-950/50 to-red-900/50 border-2 border-red-600 rounded-lg shadow-lg p-6 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <Siren className="w-10 h-10 animate-pulse text-red-500" />
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-red-300">AMBULANCE DETECTED!</h3>
              <div className="flex items-center gap-4 mt-3 text-sm">
                <div className="flex items-center gap-2 bg-red-900/40 px-3 py-1 rounded">
                  <Activity className="w-4 h-4 text-red-400" />
                  <span className="text-red-200">Confidence: {(metrics.ambulance_confidence * 100).toFixed(1)}%</span>
                </div>
                {metrics.ambulance_stable && (
                  <div className="bg-green-900/40 px-3 py-1 rounded border border-green-700">
                    <span className="font-semibold text-green-300">✓ STABLE DETECTION</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Audio toggle */}
          <button
            onClick={initAudio}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ml-4 ${
              audioEnabled
                ? 'bg-red-600 hover:bg-red-700 text-white shadow-md'
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }`}
            title={audioEnabled ? 'Mute alerts' : 'Enable alert sound'}
          >
            {audioEnabled ? '🔊 Alerts ON' : '🔇 Alerts OFF'}
          </button>
        </div>
      )}

      {/* Alert History */}
      {alerts.length > 0 && (
        <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-yellow-500" />
              <h3 className="text-lg font-semibold text-gray-200">Alert History</h3>
            </div>
            <span className="bg-yellow-900/40 text-yellow-300 px-3 py-1 rounded-full text-sm font-semibold border border-yellow-700">{alerts.length} alerts</span>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg flex items-start justify-between transition-all border ${
                  alert.alert_type === 'ambulance_detected'
                    ? 'bg-red-900/20 border-red-700 hover:bg-red-900/30'
                    : 'bg-green-900/20 border-green-700 hover:bg-green-900/30'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {alert.alert_type === 'ambulance_detected' && (
                      <Siren className="w-5 h-5 text-red-400" />
                    )}
                    {alert.alert_type === 'ambulance_cleared' && (
                      <AlertTriangle className="w-5 h-5 text-green-400" />
                    )}
                    <span className={`font-semibold ${
                      alert.alert_type === 'ambulance_detected' ? 'text-red-300' : 'text-green-300'
                    }`}>
                      {alert.alert_type === 'ambulance_detected'
                        ? 'Ambulance Detected'
                        : alert.alert_type === 'ambulance_cleared'
                        ? 'Ambulance Cleared'
                        : alert.alert_type}
                    </span>
                  </div>
                  
                  {alert.data && Object.keys(alert.data).length > 0 && (
                    <div className="text-xs text-gray-400 space-y-1 ml-7">
                      {alert.data.confidence !== undefined && (
                        <div>Confidence: {(alert.data.confidence * 100).toFixed(1)}%</div>
                      )}
                      {alert.data.stable !== undefined && (
                        <div>Stable: {alert.data.stable ? 'Yes' : 'No'}</div>
                      )}
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-500 mt-2">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </div>
                </div>

                <button
                  onClick={() => clearAlert(alert.id)}
                  className="text-gray-400 hover:text-white transition-colors ml-3 flex-shrink-0"
                  title="Dismiss alert"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmergencyAlert;
