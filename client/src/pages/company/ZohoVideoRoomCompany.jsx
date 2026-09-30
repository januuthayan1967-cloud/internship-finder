import React, { useEffect, useRef, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { format, isBefore, isAfter, addMinutes } from "date-fns";
import axios from "axios";
import "../../../src/ZogoVideoRoom.css";

const ZegoVideoRoomCompany = () => {
  const rootRef = useRef(null);
  const { interviewId } = useParams();
  const { state } = useLocation();
  // const state="company";
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [canJoin, setCanJoin] = useState(false);

  useEffect(() => {
    const loadInterview = async () => {
      try {
        const res = await axios.get(`/api/companies/interview/${interviewId}`);
        const data = res.data;

        const now = new Date();
        // const start = new Date(data.scheduledDate);

        // const date = new Date(data?.scheduledDate);
        // const [hours, minutes] = data?.scheduledTime.split(":").map(Number);
        // date.setHours(hours, minutes, 0, 0);
        const scheduledDate = new Date(data?.scheduledDate);
        const [hours, minutes] = data?.scheduledTime.split(":").map(Number);
        const start = new Date(
          scheduledDate.getFullYear(),
          scheduledDate.getMonth(),
          scheduledDate.getDate(),
          hours,
          minutes,
          0
        );
        console.log("start",start);
        

        // const start = date.toISOString();
        const end = addMinutes(start, 60);
        const earliestJoin = addMinutes(start, -15); // 15 mins before

        setCanJoin(isAfter(now, earliestJoin) && isBefore(now, end));
        setInterview(data);
      } catch (err) {
        setError("Failed to load interview details");
        console.log(err);

      } finally {
        setLoading(false);
      }
    };

    loadInterview();
  }, [interviewId]);
  // useEffect(() => {
  //   const loadInterview = async () => {
  //     try {
  //       const now = new Date();
  //       const startTime = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes ago
  //       const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 60 minute duration

  //       const data = {
  //         companyId: "company123",
  //         studentId: "student456",
  //         scheduledAt: startTime.toISOString(), // Current time minus 30 mins
  //         duration: 60, // Minutes
  //         // roomId: "abc123xyz",
  //         roomId: `room-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
  //         status: "scheduled",
  //         companyId: { name: "Test Company" },
  //         studentId: { name: "Test Student" }
  //       };

  //       const earliestJoin = addMinutes(startTime, -15); // 15 mins before

  //       setCanJoin(isAfter(now, earliestJoin) && isBefore(now, endTime));
  //       setInterview(data);
  //     } catch (err) {
  //       setError("Failed to load interview details");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   loadInterview();
  // }, [interviewId]);
  useEffect(() => {
    if (!canJoin || !interview || !rootRef.current) return;

    const script = document.createElement("script");
    script.src = "https://unpkg.com/@zegocloud/zego-uikit-prebuilt/zego-uikit-prebuilt.js";
    script.async = true;
    script.onload = () => {
      const { ZegoUIKitPrebuilt } = window;
      const userID = `user_${Math.floor(Math.random() * 10000)}`;
      const userName = "Interviewer";

      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
         2035525961,
        `8d1c7896798278e26385d79620cc791b`,
        interview.roomId, // Critical - same for both users
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
          // Update status if interview completed
          if (isAfter(new Date(), new Date(interview.scheduledAt))) {
            axios.patch(`/api/interviews/${interviewId}/status`, {
              status: "completed"
            });
          }
        }
      });
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [canJoin, interview, interviewId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!interview) return <div>Interview not found</div>;

  if (!canJoin) {
    return (
      // <div className="scheduled-view">
      //   <h2>Interview Scheduled</h2>
      //   <p>With: {interview?.studentId?.name}
      //   </p>
      //   <p>Date: {format(new Date(interview?.scheduledDate), "PPPPp")}</p>
      //   <p>Time: {interview?.scheduledTime}</p>
      //   <p>Duration: {interview?.duration || 60} minutes</p>
      //   <p>Room ID: {interview?.roomId}</p>
      //   <p className="join-notice">
      //     The interview room will open 15 minutes before the scheduled time.
      //   </p>
      // </div>
       <div className="h-96 mt-10 flex items-center justify-center bg-gray-50 px-4 py-8">
              <div className="max-w-md w-full bg-white shadow-lg rounded-2xl p-6 space-y-5 border border-gray-200">
                <h2 className="text-2xl font-bold text-center text-blue-700">Interview Scheduled</h2>
      
                <div className="text-gray-700 space-y-2">
                  <p>
                    <span className="font-semibold">With:</span>{" "}
                    {interview?.studentId?.name}
                  </p>
      
                  <p>
                    <span className="font-semibold">Date:</span>{" "}
                    {format(new Date(interview?.scheduledDate), "PPPP")}
                  </p>
      
                  <p>
                    <span className="font-semibold">Time:</span>{" "}
                    {interview?.scheduledTime}
                  </p>
      
                  <p>
                    <span className="font-semibold">Duration:</span>{" "}
                    {interview?.duration || 60} minutes
                  </p>
      
                  <p>
                    <span className="font-semibold">Room ID:</span>{" "}
                    <span className="break-all text-sm text-gray-500">{interview?.roomId}</span>
                  </p>
                </div>
      
                <div className="bg-yellow-50 border border-yellow-200 rounded-md px-4 py-3 text-yellow-800 text-sm">
                  The interview room will open 15 minutes before the scheduled time.
                </div>
              </div>
            </div>
    );
  }

  return (
    <div className="video-container">
       <div className="interview-info">
        Interview with {interview?.studentId?.name}
      </div>
      <div className="h-[80vh]" ref={rootRef} 
      // style={{ width: '100%', height: '100%' }}
       />
     
    </div>
  );
};

export default ZegoVideoRoomCompany;