// import React, { useEffect, useRef } from "react";

// const ZegoVideoRoom = () => {
//   const rootRef = useRef(null);

//   useEffect(() => {
//     const loadScript = async () => {
//       // Load the Zego script dynamically
//       const script = document.createElement("script");
//       script.src = "https://unpkg.com/@zegocloud/zego-uikit-prebuilt/zego-uikit-prebuilt.js";
//       script.async = true;
//       script.onload = () => {
//         // Script loaded, now run the Zego logic
//         const getUrlParams = (url) => {
//           let urlStr = url.split("?")[1];
//           const urlSearchParams = new URLSearchParams(urlStr);
//           const result = Object.fromEntries(urlSearchParams.entries());
//           return result;
//         };

//         const roomID = getUrlParams(window.location.href)["roomID"] || (Math.floor(Math.random() * 10000) + "");
//         const userID = Math.floor(Math.random() * 10000) + "";
//         const userName = "userName" + userID;
//         const appID = 2025958080;
//         const serverSecret = "955100c66cad43b842a2f350046fab5e";

//         const kitToken = window.ZegoUIKitPrebuilt.generateKitTokenForTest(
//           appID,
//           serverSecret,
//           roomID,
//           userID,
//           userName
//         );

//         const zp = window.ZegoUIKitPrebuilt.create(kitToken);
//         zp.joinRoom({
//           container: rootRef.current,
//           sharedLinks: [
//             {
//               name: "Personal link",
//               url:
//                 window.location.protocol +
//                 "//" +
//                 window.location.host +
//                 window.location.pathname +
//                 "?roomID=" +
//                 roomID,
//             },
//           ],
//           scenario: {
//             mode: window.ZegoUIKitPrebuilt.VideoConference,
//           },
//           turnOnMicrophoneWhenJoining: true,
//           turnOnCameraWhenJoining: true,
//           showMyCameraToggleButton: true,
//           showMyMicrophoneToggleButton: true,
//           showAudioVideoSettingsButton: true,
//           showScreenSharingButton: true,
//           showTextChat: true,
//           showUserList: true,
//           maxUsers: 50,
//           layout: "Auto",
//           showLayoutButton: true,
//         });
//       };
//       document.body.appendChild(script);
//     };

//     loadScript();
//   }, []);

//   return (
//     <div
//       ref={rootRef}
//       style={{ width: "100vw", height: "100vh" }}
//     ></div>
//   );
// };

// export default ZegoVideoRoom;

// import React, { useEffect, useRef, useState } from "react";
// import { useSearchParams } from "react-router-dom";

// const ZegoVideoRoom = () => {
//   const rootRef = useRef(null);
//   const [searchParams] = useSearchParams();
//   const [canJoin, setCanJoin] = useState(null);

//   useEffect(() => {
//     const scheduledDate = searchParams.get("scheduledDate"); // e.g., 2025-07-07T00:00:00.000+00:00
//     const scheduledTime = searchParams.get("scheduledTime"); // e.g., 12:40

//     if (!scheduledDate || !scheduledTime) {
//       setCanJoin(false);
//       return;
//     }

//     const scheduledDateObj = new Date(scheduledDate); // still UTC at this point
//     const [hours, minutes] = scheduledTime.split(":").map(Number);
//     scheduledDateObj.setUTCHours(hours);
//     scheduledDateObj.setUTCMinutes(minutes);
//     scheduledDateObj.setUTCSeconds(0);
//     scheduledDateObj.setUTCMilliseconds(0);

//     const currentTime = new Date();

//     if (currentTime < scheduledDateObj) {
//       setCanJoin(false);
//       return;
//     } else {
//       setCanJoin(true);
//     }

//     const loadScript = async () => {
//       const script = document.createElement("script");
//       script.src = "https://unpkg.com/@zegocloud/zego-uikit-prebuilt/zego-uikit-prebuilt.js";
//       script.async = true;
//       script.onload = () => {
//         const roomID = searchParams.get("roomID") || Math.floor(Math.random() * 10000).toString();
//         const userID = Math.floor(Math.random() * 10000).toString();
//         const userName = "userName" + userID;
//         const appID = 2025958080;
//         const serverSecret = "955100c66cad43b842a2f350046fab5e";

//         const kitToken = window.ZegoUIKitPrebuilt.generateKitTokenForTest(
//           appID,
//           serverSecret,
//           roomID,
//           userID,
//           userName
//         );

//         const zp = window.ZegoUIKitPrebuilt.create(kitToken);
//         zp.joinRoom({
//           container: rootRef.current,
//           sharedLinks: [
//             {
//               name: "Personal link",
//               url: `${window.location.protocol}//${window.location.host}${window.location.pathname}?roomID=${roomID}`,
//             },
//           ],
//           scenario: {
//             mode: window.ZegoUIKitPrebuilt.VideoConference,
//           },
//           turnOnMicrophoneWhenJoining: true,
//           turnOnCameraWhenJoining: true,
//           showMyCameraToggleButton: true,
//           showMyMicrophoneToggleButton: true,
//           showAudioVideoSettingsButton: true,
//           showScreenSharingButton: true,
//           showTextChat: true,
//           showUserList: true,
//           maxUsers: 50,
//           layout: "Auto",
//           showLayoutButton: true,
//         });
//       };
//       document.body.appendChild(script);
//     };

//     loadScript();
//   }, [searchParams]);

//   if (canJoin === false) {
//     return (
//       <div className="flex items-center justify-center h-screen text-center px-4">
//         <div className="max-w-md">
//           <h2 className="text-2xl font-semibold text-red-600 mb-4">Interview Not Started</h2>
//           <p className="text-gray-700">
//             You're early. Please join the interview at the scheduled time.
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return <div ref={rootRef} style={{ width: "100vw", height: "100vh" }} />;
// };

// export default ZegoVideoRoom;

////////////////////////////////////////////////////////////////////////////////////////////////
import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const ZegoVideoRoom = () => {
  const rootRef = useRef(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [roomState, setRoomState] = useState({
    canJoin: null,
    loading: true,
    message: "Checking meeting details...",
    meetingLink: ""
  });
  const [meetingDetails, setMeetingDetails] = useState({
    scheduledDate: "",
    scheduledTime: "",
    roomID: ""
  });

  useEffect(() => {
    // Extract parameters from URL
    const roomID = searchParams.get("roomID") || generateRandomID();
    const scheduledDate = searchParams.get("scheduledDate");
    const scheduledTime = searchParams.get("scheduledTime");

    setMeetingDetails({
      scheduledDate,
      scheduledTime,
      roomID
    });

    // Generate meeting link
    const meetingLink = `${window.location.origin}${window.location.pathname}?roomID=${roomID}${
      scheduledDate ? `&scheduledDate=${encodeURIComponent(scheduledDate)}` : ""
    }${scheduledTime ? `&scheduledTime=${encodeURIComponent(scheduledTime)}` : ""}`;

    setRoomState(prev => ({
      ...prev,
      meetingLink,
      loading: false
    }));

    // Check if meeting can be joined
    checkMeetingTime(scheduledDate, scheduledTime, roomID);
  }, [searchParams]);

  const generateRandomID = () => {
    return Math.floor(Math.random() * 10000).toString();
  };

  const checkMeetingTime = (scheduledDate, scheduledTime, roomID) => {
    if (!scheduledDate || !scheduledTime) {
      // No schedule specified - allow immediate joining
      setRoomState(prev => ({
        ...prev,
        canJoin: true,
        message: "Joining meeting..."
      }));
      initializeZego(roomID);
      return;
    }

    try {
      // Parse scheduled time (assuming UTC)
      const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}:00Z`);
      const currentTime = new Date();

      if (currentTime < scheduledDateTime) {
        // Meeting is in the future
        const timeDiff = scheduledDateTime - currentTime;
        const hours = Math.floor(timeDiff / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

        setRoomState(prev => ({
          ...prev,
          canJoin: false,
          message: `Meeting starts in ${hours}h ${minutes}m`,
          meetingTime: scheduledDateTime.toLocaleString()
        }));

        // Set a timeout to allow joining when the time comes
        const timeout = setTimeout(() => {
          setRoomState(prev => ({
            ...prev,
            canJoin: true,
            message: "Meeting time reached. Joining now..."
          }));
          initializeZego(roomID);
        }, timeDiff);

        return () => clearTimeout(timeout);
      } else {
        // Meeting time has passed - allow joining
        setRoomState(prev => ({
          ...prev,
          canJoin: true,
          message: "Joining meeting..."
        }));
        initializeZego(roomID);
      }
    } catch (error) {
      console.error("Error parsing meeting time:", error);
      setRoomState(prev => ({
        ...prev,
        canJoin: false,
        message: "Invalid meeting time format"
      }));
    }
  };

  const initializeZego = (roomID) => {
    const script = document.createElement("script");
    script.src = "https://unpkg.com/@zegocloud/zego-uikit-prebuilt/zego-uikit-prebuilt.js";
    script.async = true;
    script.onload = () => {
      if (!window.ZegoUIKitPrebuilt) {
        setRoomState(prev => ({
          ...prev,
          canJoin: false,
          message: "Failed to load video SDK"
        }));
        return;
      }

      const userID = generateRandomID();
      const userName = `user_${userID}`;
      const appID = 2025958080;
      const serverSecret = "955100c66cad43b842a2f350046fab5e";

      const kitToken = window.ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID,
        serverSecret,
        roomID,
        userID,
        userName
      );

      const zp = window.ZegoUIKitPrebuilt.create(kitToken);
      zp.joinRoom({
        container: rootRef.current,
        sharedLinks: [
          {
            name: "Meeting Link",
            url: roomState.meetingLink
          },
        ],
        scenario: {
          mode: window.ZegoUIKitPrebuilt.VideoConference,
        },
        turnOnMicrophoneWhenJoining: true,
        turnOnCameraWhenJoining: true,
        showMyCameraToggleButton: true,
        showMyMicrophoneToggleButton: true,
        showAudioVideoSettingsButton: true,
        showScreenSharingButton: true,
        showTextChat: true,
        showUserList: true,
        maxUsers: 50,
        layout: "Auto",
        showLayoutButton: true,
      });
    };

    script.onerror = () => {
      setRoomState(prev => ({
        ...prev,
        canJoin: false,
        message: "Failed to load video SDK"
      }));
    };

    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  };

  const copyMeetingLink = () => {
    navigator.clipboard.writeText(roomState.meetingLink)
      .then(() => alert("Meeting link copied to clipboard!"))
      .catch(() => alert("Failed to copy meeting link"));
  };

  if (roomState.loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">{roomState.message}</p>
        </div>
      </div>
    );
  }

  if (roomState.canJoin === false) {
    return (
      <div className="flex items-center justify-center h-screen text-center px-4">
        <div className="max-w-md">
          <h2 className="text-2xl font-semibold text-blue-600 mb-4">Meeting Scheduled</h2>
          <p className="text-gray-700 mb-2">{roomState.message}</p>
          {roomState.meetingTime && (
            <p className="text-gray-600 mb-4">Scheduled for: {roomState.meetingTime}</p>
          )}
          <div className="mt-6">
            <p className="text-sm text-gray-500 mb-2">Share this meeting link:</p>
            <div className="flex items-center border rounded-lg overflow-hidden">
              <input
                type="text"
                readOnly
                value={roomState.meetingLink}
                className="flex-grow px-3 py-2 text-sm border-0 focus:ring-0"
              />
              <button
                onClick={copyMeetingLink}
                className="bg-blue-500 text-white px-3 py-2 hover:bg-blue-600"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div ref={rootRef} style={{ width: "100vw", height: "100vh" }} />
      <div className="fixed bottom-4 right-4 bg-white p-2 rounded-lg shadow-lg">
        <button
          onClick={copyMeetingLink}
          className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
        >
          Copy Meeting Link
        </button>
      </div>
    </>
  );
};

export default ZegoVideoRoom;

