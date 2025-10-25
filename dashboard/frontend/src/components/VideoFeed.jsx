/**
 * VideoFeed Component
 * Displays the live video stream from the traffic detection system
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { Video, VideoOff, Wifi, WifiOff } from 'lucide-react';
import useDashboardStore from '../stores/dashboardStore';

const VideoFeed = () => {
  const { currentFrame, frameMetadata, metrics, connected } = useDashboardStore();
  const imgRef = useRef(null);
  const lastFrameRef = useRef(null);
  const rafRef = useRef(null);
  const pendingUpdateRef = useRef(false);

  // ✅ FIXED: Prevent flickering by batching frame updates
  // Only update img src when frame actually changes, with debouncing
  const updateFrame = useCallback(() => {
    if (currentFrame && currentFrame !== lastFrameRef.current && imgRef.current) {
      try {
        // Store the current frame
        lastFrameRef.current = currentFrame;
        // Update image source
        imgRef.current.src = `data:image/jpeg;base64,${currentFrame}`;
      } catch (err) {
        console.error('Error updating frame:', err);
      }
    }
    pendingUpdateRef.current = false;
    rafRef.current = null;
  }, [currentFrame]);

  useEffect(() => {
    // Prevent multiple RAF calls for same frame (prevents flickering)
    if (currentFrame && currentFrame !== lastFrameRef.current && !pendingUpdateRef.current) {
      pendingUpdateRef.current = true;
      
      // Cancel previous animation frame if still pending
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      
      // Schedule update on next browser refresh
      rafRef.current = requestAnimationFrame(updateFrame);
    }

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [currentFrame, updateFrame]);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {connected ? (
            <Video className="w-6 h-6 text-green-500" />
          ) : (
            <VideoOff className="w-6 h-6 text-red-500" />
          )}
          <h2 className="text-xl font-semibold text-white">Live Feed</h2>
        </div>
        
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
          connected
            ? 'bg-green-900/40 text-green-300 border border-green-700'
            : 'bg-red-900/40 text-red-300 border border-red-700'
        }`}>
          {connected ? (
            <>
              <Wifi className="w-5 h-5" />
              <span>Connected</span>
            </>
          ) : (
            <>
              <WifiOff className="w-5 h-5" />
              <span>Disconnected</span>
            </>
          )}
        </div>
      </div>

      {/* Video Display */}
      <div className="relative bg-gray-950 rounded-lg shadow-xl border-2 border-gray-700 overflow-hidden aspect-video">
        {currentFrame ? (
          <img
            ref={imgRef}
            alt="Traffic feed"
            className="w-full h-full object-contain will-change-transform"
            loading="eager"
            decoding="async"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
            <VideoOff className="w-20 h-20 mb-4 opacity-40" />
            <p className="text-lg font-semibold">
              {connected ? 'Waiting for video stream...' : 'Not connected'}
            </p>
          </div>
        )}

        {/* FPS Overlay */}
        {currentFrame && (
          <div className="absolute top-4 left-4 bg-black/80 backdrop-blur px-4 py-2 rounded-lg pointer-events-none border border-gray-700">
            <span className="text-white text-sm font-mono font-bold">
              ⚡ {metrics.fps.toFixed(1)} FPS
            </span>
          </div>
        )}

        {/* Frame Count Overlay */}
        {currentFrame && (
          <div className="absolute top-4 right-4 bg-black/80 backdrop-blur px-4 py-2 rounded-lg pointer-events-none border border-gray-700">
            <span className="text-white text-sm font-mono font-bold">
              🎬 Frame: {metrics.frame_count}
            </span>
          </div>
        )}

        {/* Source Info */}
        {currentFrame && metrics.video_source !== 'unknown' && (
          <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur px-4 py-2 rounded-lg pointer-events-none border border-gray-700">
            <span className="text-gray-300 text-sm font-semibold">
              📹 {metrics.video_source}
            </span>
          </div>
        )}

        {/* Mode Indicator */}
        {currentFrame && (
          <div className={`absolute bottom-4 right-4 bg-black/80 backdrop-blur px-4 py-2 rounded-lg pointer-events-none border ${
            metrics.mode === 'manual' ? 'border-blue-600' : 'border-purple-600'
          }`}>
            <span className={`text-sm font-bold uppercase ${
              metrics.mode === 'manual' ? 'text-blue-300' : 'text-purple-300'
            }`}>
              {metrics.mode === 'manual' ? '📍 Manual' : '🎥 Auto'} Mode
            </span>
          </div>
        )}
      </div>

      {/* Frame Info */}
      {frameMetadata && Object.keys(frameMetadata).length > 0 && (
        <div className="mt-3 text-xs text-gray-500 flex items-center justify-between">
          <span>Last update: <span className="text-gray-400 font-mono">{new Date(frameMetadata.timestamp).toLocaleTimeString()}</span></span>
        </div>
      )}
    </div>
  );
};

export default VideoFeed;
