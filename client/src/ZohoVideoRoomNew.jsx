// import React, { useEffect, useRef, useState } from "react";
// import { useParams, useLocation } from "react-router-dom";
// import { format, isBefore, isAfter, addMinutes } from "date-fns";
// import axios from "axios";
// import "./ZogoVideoRoom.css";

// const ZegoVideoRoomNew = () => {
//   const rootRef = useRef(null);
//   const { interviewId } = useParams();
//   const { state } = useLocation();
//   const [interview, setInterview] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [canJoin, setCanJoin] = useState(false);

//   useEffect(() => {
//     const loadInterview = async () => {
//       try {
//         const res = await axios.get(`/api/students/interview/${interviewId}`);
//         const data = res.data;

//         const now = new Date();
//         // const start = new Date(data.scheduledDate);

//         // const date = new Date(data?.scheduledDate);
//         // const [hours, minutes] = data?.scheduledTime.split(":").map(Number);
//         // date.setHours(hours, minutes, 0, 0);
//         const scheduledDate = new Date(data?.scheduledDate);
//         const [hours, minutes] = data?.scheduledTime.split(":").map(Number);
//         const start = new Date(
//           scheduledDate.getFullYear(),
//           scheduledDate.getMonth(),
//           scheduledDate.getDate(),
//           hours,
//           minutes,
//           0
//         );
//         console.log("start", start);


//         // const start = date.toISOString();
//         const end = addMinutes(start, 60);
//         const earliestJoin = addMinutes(start, -15); // 15 mins before

//         setCanJoin(isAfter(now, earliestJoin) && isBefore(now, end));
//         setInterview(data);
//       } catch (err) {
//         setError("Failed to load interview details");
//         console.log(err);

//       } finally {
//         setLoading(false);
//       }
//     };

//     loadInterview();
//   }, [interviewId]);
 
//   useEffect(() => {
//     if (!canJoin || !interview || !rootRef.current) return;

//     const script = document.createElement("script");
//     script.src = "https://unpkg.com/@zegocloud/zego-uikit-prebuilt/zego-uikit-prebuilt.js";
//     script.async = true;
//     script.onload = () => {
//       const { ZegoUIKitPrebuilt } = window;
//       const userID = state?.userId || `user_${Math.floor(Math.random() * 10000)}`;
//       const userName = state?.userName || (state?.userType === "company" ? "Interviewer" : "Candidate");

//       const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
//         1145885093,
//         `3b9d3984f16091783826675859259b06`,
//         interview.roomId, // Critical - same for both users
//         userID,
//         userName
//       );

//       const zp = ZegoUIKitPrebuilt.create(kitToken);
//       zp.joinRoom({
//         container: rootRef.current,
//         scenario: { mode: ZegoUIKitPrebuilt.VideoConference },
//         turnOnMicrophoneWhenJoining: true,
//         turnOnCameraWhenJoining: true,
//         onLeaveRoom: () => {
//           // Update status if interview completed
//           if (isAfter(new Date(), new Date(interview.scheduledAt))) {
//             axios.patch(`/api/interviews/${interviewId}/status`, {
//               status: "completed"
//             });
//           }
//         }
//       });
//     };

//     document.body.appendChild(script);

//     return () => {
//       document.body.removeChild(script);
//     };
//   }, [canJoin, interview, interviewId, state]);

//   if (loading) return <div>Loading...</div>;
//   if (error) return <div>Error: {error}</div>;
//   if (!interview) return <div>Interview not found</div>;

//   if (!canJoin) {
//     return (
//       <div className="h-96 mt-10 flex items-center justify-center bg-gray-50 px-4 py-8">
//         <div className="max-w-md w-full bg-white shadow-lg rounded-2xl p-6 space-y-5 border border-gray-200">
//           <h2 className="text-2xl font-bold text-center text-blue-700">Interview Scheduled</h2>

//           <div className="text-gray-700 space-y-2">
//             <p>
//               <span className="font-semibold">With:</span>{" "}
//               {state?.userType === "company"
//                 ? interview?.studentId?.name
//                 : interview?.companyId?.name}
//             </p>

//             <p>
//               <span className="font-semibold">Date:</span>{" "}
//               {format(new Date(interview?.scheduledDate), "PPPP")}
//             </p>

//             <p>
//               <span className="font-semibold">Time:</span>{" "}
//               {interview?.scheduledTime}
//             </p>

//             <p>
//               <span className="font-semibold">Duration:</span>{" "}
//               {interview?.duration || 60} minutes
//             </p>

//             <p>
//               <span className="font-semibold">Room ID:</span>{" "}
//               <span className="break-all text-sm text-gray-500">{interview?.roomId}</span>
//             </p>
//           </div>

//           <div className="bg-yellow-50 border border-yellow-200 rounded-md px-4 py-3 text-yellow-800 text-sm">
//             The interview room will open 15 minutes before the scheduled time.
//           </div>
//         </div>
//       </div>
//     );
//   }


//   return (
//     <div className="video-container">
//       <div className="interview-info">
//         Interview with {state?.userType === "company"
//           ? interview?.studentId?.name
//           : interview?.companyId?.name}
//       </div>
//       <div className="h-[80vh]" ref={rootRef}
//       // style={{ width: '100%', height: '100%' }}
//       />

//     </div>
//   );
// };

// export default ZegoVideoRoomNew;

import React, { useEffect, useRef, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { format, isBefore, isAfter, addMinutes, isPast } from "date-fns";
import axios from "axios";
import "./ZogoVideoRoom.css";

const ZegoVideoRoomNew = () => {
  const rootRef = useRef(null);
  const { interviewId } = useParams();
  const { state } = useLocation();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [canJoin, setCanJoin] = useState(false);
  const [interviewStatus, setInterviewStatus] = useState("upcoming"); // 'upcoming', 'active', 'past'

  useEffect(() => {
    const loadInterview = async () => {
      try {
        const res = await axios.get(`/api/students/interview/${interviewId}`);
        const data = res.data;

        const now = new Date();
        const scheduledDate = new Date(data?.scheduledDate);
        const [hours, minutes] = data?.scheduledTime.split(":").map(Number);
        
        // Create proper date object with local time
        const start = new Date(
          scheduledDate.getFullYear(),
          scheduledDate.getMonth(),
          scheduledDate.getDate(),
          hours,
          minutes,
          0
        );
        
        const end = addMinutes(start, data.duration || 60);
        const earliestJoin = addMinutes(start, -15); // 15 mins before

        // Determine interview status
        if (isPast(end)) {
          setInterviewStatus("past");
        } else if (isAfter(now, earliestJoin) && isBefore(now, end)) {
          setInterviewStatus("active");
          setCanJoin(true);
        } else {
          setInterviewStatus("upcoming");
        }

        setInterview(data);
      } catch (err) {
        setError("Failed to load interview details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadInterview();
  }, [interviewId]);

  useEffect(() => {
    if (!canJoin || !interview || !rootRef.current) return;

    const initializeVideoCall = () => {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/@zegocloud/zego-uikit-prebuilt/zego-uikit-prebuilt.js";
      script.async = true;
      
      script.onload = () => {
        if (!window.ZegoUIKitPrebuilt) {
          setError("Failed to load video conference library");
          return;
        }

        const { ZegoUIKitPrebuilt } = window;
        const userID = state?.userId || `user_${Math.floor(Math.random() * 10000)}`;
        const userName = state?.userName || (state?.userType === "company" ? "Interviewer" : "Candidate");

        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
         2035525961, //App ID
          "8d1c7896798278e26385d79620cc791b", //Server Secret
          interview.roomId,
          userID,
          userName
        );

        const zp = ZegoUIKitPrebuilt.create(kitToken);
        zp.joinRoom({
          container: rootRef.current,
          scenario: { mode: ZegoUIKitPrebuilt.VideoConference },
          turnOnMicrophoneWhenJoining: true,
          turnOnCameraWhenJoining: true,
          onLeaveRoom: () => {
            if (isAfter(new Date(), new Date(interview.scheduledAt))) {
              axios.patch(`/api/interviews/${interviewId}/status`, {
                status: "completed"
              });
            }
          }
        });
      };

      script.onerror = () => {
        setError("Failed to load video conference script");
      };

      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    };

    initializeVideoCall();
  }, [canJoin, interview, interviewId, state]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          Interview not found
        </div>
      </div>
    );
  }

  const renderInterviewDetails = () => {
    const interviewTime = new Date(
      new Date(interview.scheduledDate).setHours(
        ...interview.scheduledTime.split(":").map(Number),
        0,
        0
      )
    );

    const commonDetails = (
      <>
        <h2 className="text-2xl font-bold text-center mb-4">
          {interviewStatus === "past" ? "Interview Completed" : "Interview Scheduled"}
        </h2>
        <div className="space-y-2">
          <p>
            <span className="font-semibold">With:</span>{" "}
            {state?.userType === "company"
              ? interview?.studentId?.name
              : interview?.companyId?.name}
          </p>
          <p>
            <span className="font-semibold">Date:</span>{" "}
            {format(interviewTime, "PPPP")}
          </p>
          <p>
            <span className="font-semibold">Time:</span>{" "}
            {format(interviewTime, "h:mm a")}
          </p>
          <p>
            <span className="font-semibold">Duration:</span>{" "}
            {interview?.duration || 60} minutes
          </p>
          {interview?.roomId && (
            <p>
              <span className="font-semibold">Room ID:</span>{" "}
              <span className="text-sm text-gray-500 break-all">{interview.roomId}</span>
            </p>
          )}
        </div>
      </>
    );

    if (interviewStatus === "past") {
      return (
        <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md border border-gray-200">
          {commonDetails}
          <div className="mt-4 bg-green-100 border border-green-200 text-green-700 px-4 py-3 rounded">
            This interview has been completed. Check your email for follow-up details.
          </div>
        </div>
      );
    }

    if (interviewStatus === "upcoming") {
      return (
        <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md border border-gray-200">
          {commonDetails}
          <div className="mt-4 bg-blue-100 border border-blue-200 text-blue-700 px-4 py-3 rounded">
            The interview room will open 15 minutes before the scheduled time.
          </div>
        </div>
      );
    }

    return null;
  };

  if (interviewStatus !== "active") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        {renderInterviewDetails()}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="bg-white p-4 shadow-md">
        <h1 className="text-xl font-semibold">
          Interview with {state?.userType === "company"
            ? interview?.studentId?.name
            : interview?.companyId?.name}
        </h1>
        <p className="text-gray-600">
          {format(new Date(interview.scheduledDate), "PPPP 'at' h:mm a")}
        </p>
      </div>
      <div className="flex-1" ref={rootRef}></div>
    </div>
  );
};

export default ZegoVideoRoomNew;