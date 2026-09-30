import React, { useState, useEffect } from 'react';
import { ZegoExpressEngine } from 'zego-express-engine-webrtc';
import axios from 'axios';

const JoinMeeting = () => {
  const [meetingId, setMeetingId] = useState('');
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [zg, setZg] = useState(null);
  const [isJoined, setIsJoined] = useState(false);

  useEffect(() => {
    const initZego = async () => {
      const appID = process.env.REACT_APP_ZEGO_APP_ID;
      const newZg = new ZegoExpressEngine(appID);
      setZg(newZg);

      const result = await newZg.checkSystemRequirements();
      if (!result.webRTC) {
        setError('WebRTC is not supported in your browser');
      }

      return () => {
        if (newZg) {
          newZg.destroyEngine();
        }
      };
    };

    initZego();
  }, []);

  const handleJoinMeeting = async () => {
    if (!meetingId || !userId || !userName) {
      setError('Please fill all fields');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const tokenResponse = await axios.post('/api/get-zego-token', {
        roomId: meetingId,
        userId,
        userName
      });

      const { token } = tokenResponse.data;
      await zg.loginRoom(meetingId, token, { userID: userId, userName }, { userUpdate: true });

      const localStream = await zg.createStream({
        camera: { video: true, audio: true, facingMode: 'user' },
      });

      await zg.startPublishingStream('stream_' + userId, localStream);
      const localVideoElement = document.getElementById('local-video');
      zg.startPlayingStream(localStream, { video: localVideoElement });

      setIsJoined(true);

      zg.on('roomStreamUpdate', async (roomID, updateType, streamList) => {
        if (updateType === 'ADD') {
          for (const stream of streamList) {
            await zg.startPlayingStream(stream.streamID);
          }
        }
      });

    } catch (err) {
      console.error('Error joining meeting:', err);
      setError(err.response?.data?.message || 'Failed to join meeting');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveMeeting = async () => {
    if (zg) {
      await zg.logoutRoom(meetingId);
      setIsJoined(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Join Scheduled Meeting</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700">
          <p>{error}</p>
        </div>
      )}
      
      {!isJoined ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Meeting ID:</label>
            <input
              type="text"
              value={meetingId}
              onChange={(e) => setMeetingId(e.target.value)}
              placeholder="Enter meeting ID"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your User ID:</label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Your unique ID"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Name:</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Your display name"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button 
            onClick={handleJoinMeeting} 
            disabled={isLoading || !zg}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isLoading || !zg ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Joining...
              </>
            ) : 'Join Meeting'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="border rounded-md p-4">
            <h3 className="text-lg font-medium mb-2">Meeting Room: {meetingId}</h3>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="relative pt-[56.25%] bg-gray-200 rounded">
                <video 
                  id="local-video"
                  autoPlay
                  playsInline
                  muted
                  className="absolute inset-0 w-full h-full object-cover"
                ></video>
                <div className="absolute bottom-0 left-0 bg-black bg-opacity-50 text-white p-2 w-full">
                  You ({userName})
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={handleLeaveMeeting}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition duration-200"
          >
            Leave Meeting
          </button>
        </div>
      )}
    </div>
  );
};

export default JoinMeeting;