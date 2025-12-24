import React, { useEffect, useRef, useState } from 'react';
import {
  Room,
  RoomEvent,
  RemoteParticipant,
  LocalParticipant,
  Track
} from 'livekit-client';
import './VideoRoom.css';

/**
 * VideoRoom Component
 * Handles LiveKit video room connection and audio/video streaming
 */
function VideoRoom({ roomName, token, url, sessionId }) {
  const [room, setRoom] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [localVideoEnabled, setLocalVideoEnabled] = useState(true);
  const [localAudioEnabled, setLocalAudioEnabled] = useState(true);
  const [screenShareEnabled, setScreenShareEnabled] = useState(false);
  const videoContainerRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const audioElementRef = useRef(null);

  // Initialize LiveKit room connection
  useEffect(() => {
    if (!token || !url || !roomName) {
      console.warn('Missing LiveKit credentials:', { token: !!token, url: !!url, roomName: !!roomName });
      return;
    }

    let currentRoom = null;

    const connectToRoom = async () => {
      try {
        const newRoom = new Room({
          adaptiveStream: true,
          dynacast: true,
          videoCaptureDefaults: {
            resolution: { width: 1280, height: 720 }
          }
        });

        currentRoom = newRoom;

        // Set up event listeners
        newRoom.on(RoomEvent.Connected, () => {
          console.log('✅ Connected to LiveKit room:', roomName);
          setIsConnected(true);
        });

        newRoom.on(RoomEvent.Disconnected, (reason) => {
          console.log('❌ Disconnected from LiveKit room:', reason);
          setIsConnected(false);
        });

        newRoom.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
          console.log('📹 Track subscribed:', track.kind, participant.identity);
          
          if (track.kind === Track.Kind.Video) {
            attachVideoTrack(track, participant);
          } else if (track.kind === Track.Kind.Audio) {
            attachAudioTrack(track, participant);
          }
        });

        newRoom.on(RoomEvent.TrackUnsubscribed, (track, publication, participant) => {
          console.log('📹 Track unsubscribed:', track.kind);
          track.detach();
        });

        newRoom.on(RoomEvent.LocalTrackPublished, (publication, participant) => {
          console.log('📤 Local track published:', publication.track?.kind);
          
          // Attach local video when it's published
          if (publication.track?.kind === Track.Kind.Video && localVideoRef.current) {
            publication.track.attach(localVideoRef.current);
          }
        });

        newRoom.on(RoomEvent.ConnectionQualityChanged, (quality, participant) => {
          console.log('📊 Connection quality:', quality, participant?.identity);
        });

        // Connect to room
        console.log('🔄 Connecting to LiveKit room...');
        await newRoom.connect(url, token);
        setRoom(newRoom);

        // Enable camera and microphone
        await newRoom.localParticipant.enableCameraAndMicrophone();
        
        // Attach local video if available
        const localVideoTrack = newRoom.localParticipant.videoTrackPublications.values().next().value?.track;
        if (localVideoTrack && localVideoRef.current) {
          localVideoTrack.attach(localVideoRef.current);
        }

      } catch (error) {
        console.error('❌ Failed to connect to LiveKit room:', error);
        setIsConnected(false);
        // Don't show alert for connection errors - LiveKit will retry automatically
        if (error.message && !error.message.includes('retry')) {
          console.warn('Connection error (LiveKit will retry):', error.message);
        }
      }
    };

    connectToRoom();

    // Cleanup on unmount
    return () => {
      if (currentRoom) {
        console.log('🧹 Cleaning up LiveKit room connection');
        currentRoom.disconnect();
      }
    };
  }, [token, url, roomName]);

  // Note: AI audio playback is now handled in InterviewUI component
  // to track when AI is speaking and disable recording button

  // Attach video track to DOM element
  const attachVideoTrack = (track, participant) => {
    if (track.kind === Track.Kind.Video) {
      if (participant instanceof LocalParticipant) {
        if (localVideoRef.current) {
          track.attach(localVideoRef.current);
        }
      } else {
        if (remoteVideoRef.current) {
          track.attach(remoteVideoRef.current);
        }
      }
    }
  };

  // Attach audio track to DOM element
  const attachAudioTrack = (track, participant) => {
    if (track.kind === Track.Kind.Audio) {
      if (!audioElementRef.current) {
        const audioElement = document.createElement('audio');
        audioElement.autoplay = true;
        audioElementRef.current = audioElement;
        document.body.appendChild(audioElement);
      }
      track.attach(audioElementRef.current);
    }
  };

  // Toggle local video
  const toggleVideo = async () => {
    if (!room) return;

    try {
      if (localVideoEnabled) {
        await room.localParticipant.setCameraEnabled(false);
        setLocalVideoEnabled(false);
      } else {
        await room.localParticipant.setCameraEnabled(true);
        setLocalVideoEnabled(true);
      }
    } catch (error) {
      console.error('Failed to toggle video:', error);
    }
  };

  // Toggle local audio
  const toggleAudio = async () => {
    if (!room) return;

    try {
      if (localAudioEnabled) {
        await room.localParticipant.setMicrophoneEnabled(false);
        setLocalAudioEnabled(false);
      } else {
        await room.localParticipant.setMicrophoneEnabled(true);
        setLocalAudioEnabled(true);
      }
    } catch (error) {
      console.error('Failed to toggle audio:', error);
    }
  };

  // Toggle screen share
  const toggleScreenShare = async () => {
    if (!room) return;

    try {
      if (screenShareEnabled) {
        await room.localParticipant.setScreenShareEnabled(false);
        setScreenShareEnabled(false);
      } else {
        await room.localParticipant.setScreenShareEnabled(true);
        setScreenShareEnabled(true);
      }
    } catch (error) {
      console.error('Failed to toggle screen share:', error);
    }
  };

  return (
    <div className="video-room-container">
      <div className="video-grid" ref={videoContainerRef}>
        {/* Local video */}
        <div className="video-wrapper local-video">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="video-element"
          />
          <div className="video-label">You</div>
        </div>

        {/* Remote video (AI interviewer - placeholder for future implementation) */}
        <div className="video-wrapper remote-video">
          <div className="ai-interviewer-placeholder">
            <div className="ai-avatar">🤖</div>
            <p>AI Interviewer</p>
            <p className="status-text">Connected</p>
          </div>
        </div>
      </div>

      {/* Video controls */}
      <div className="video-controls">
        <button
          className={`control-button ${localVideoEnabled ? 'active' : 'inactive'}`}
          onClick={toggleVideo}
          title={localVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
        >
          {localVideoEnabled ? '📹' : '📹❌'}
        </button>
        <button
          className={`control-button ${localAudioEnabled ? 'active' : 'inactive'}`}
          onClick={toggleAudio}
          title={localAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
        >
          {localAudioEnabled ? '🎤' : '🎤❌'}
        </button>
        <button
          className={`control-button ${screenShareEnabled ? 'active' : 'inactive'}`}
          onClick={toggleScreenShare}
          title={screenShareEnabled ? 'Stop sharing screen' : 'Share screen'}
        >
          {screenShareEnabled ? '🖥️' : '🖥️'}
        </button>
        <div className="connection-status">
          <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}></span>
          {isConnected ? 'Connected' : 'Connecting...'}
        </div>
      </div>

      {/* Hidden audio element for remote audio */}
      <div ref={audioElementRef} style={{ display: 'none' }}></div>
    </div>
  );
}

export default VideoRoom;

