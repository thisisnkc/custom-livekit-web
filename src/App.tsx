import {
  GridLayout,
  ParticipantTile,
  RoomAudioRenderer,
  useTracks,
  RoomContext,
  TrackRefContext,
} from "@livekit/components-react";
import { Room, Track, createLocalVideoTrack } from "livekit-client";
import "@livekit/components-styles";
import { useState, useEffect, useCallback } from "react";
import CustomControlBar from "./components/Controllbar/Controllbar";
import PreJoin from "./components/PreJoin/PreJoin";
import SingleTileWithMenu from "./components/ParticipantTile";
import MyVideoConference from "./components/ParticipantTile";

const serverUrl = "https://livekit.t.kocharsoft.com";

export default function App() {
  const [room] = useState(
    () =>
      new Room({
        adaptiveStream: true,
        dynacast: true,
      })
  );

  const [joined, setJoined] = useState(false);
  // const [userInfo, setUserInfo] = useState({ name: null, isModerator: false });

  const [name, setName] = useState("");
  const [roomName, setRoomName] = useState("");
  const [token, setToken] = useState("");

  const handleJoin = async () => {
    const response = await fetch(
      "https://unifymax.t.kocharsoft.com/lightspeed-api/mytoken",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personName: name,
          roomName: roomName,
        }),
      }
    );
    const token = await response.text();
    if (token) {
      setToken(token);
      setJoined(true);
    } else console.log("cannot generate token from server");

    // const res = await fetch(
    //   `http://localhost:3001/getToken?name=${name}&roomName=${roomName}`
    // );

    // const data = await res.json();
    // console.log("Token generation status: ", token);
    // if (data.status == 200) {
    //   setToken(data.token);
    //   setJoined(true);
    // } else console.log("cannot generate token from server");
  };

  const getAllVideoDevices = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter((device) => device.kind === "videoinput");
  };

  const publishAllCameras = useCallback(async (room: Room) => {
    // Step 1: Ask for permissions
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
    } catch (err) {
      console.error("Camera permissions denied:", err);
      return;
    }

    const cameras = await getAllVideoDevices();
    console.log("Available cameras:", cameras);

    for (const camera of cameras) {
      try {
        const track = await createLocalVideoTrack({
          deviceId: { exact: camera.deviceId },
        });

        await room.localParticipant.publishTrack(track, {
          name: `camera-${camera.deviceId}`,
          source: Track.Source.Unknown,
        });

        console.log("Published camera:", camera.label);
      } catch (error) {
        console.error(
          `Could not create or publish video track for device ${camera.label}:`,
          error
        );
      }
    }
  }, []);

  useEffect(() => {
    if (!joined) return;

    const connect = async () => {
      await room.connect(serverUrl, token);
      await publishAllCameras(room);

      room.localParticipant.setMicrophoneEnabled(true);
      room.localParticipant.setCameraEnabled(true);
    };

    connect();

    return () => {
      room.disconnect();
    };
  }, [joined, token, room, publishAllCameras]);

  if (!joined) {
    return (
      <PreJoin
        onJoin={handleJoin}
        name={name}
        roomName={roomName}
        setRoomName={setRoomName}
        setName={setName}
      />
    );
  }

  return (
    <RoomContext.Provider value={room}>
      <div
        data-lk-theme="default"
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        <div style={{ flex: 1, overflow: "hidden" }}>
          <MyVideoConference />
          <RoomAudioRenderer />
        </div>
        <CustomControlBar roomName={roomName} />
      </div>
    </RoomContext.Provider>
  );
}
