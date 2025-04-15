import {
  GridLayout,
  ParticipantTile,
  RoomAudioRenderer,
  useTracks,
  RoomContext,
} from "@livekit/components-react";
import { Room, Track } from "livekit-client";
import "@livekit/components-styles";
import { useState, useEffect } from "react";
import CustomControlBar from "./components/Controllbar/Controllbar";
import PreJoin from "./components/PreJoin/PreJoin";

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

  useEffect(() => {
    if (!joined) return;

    const connect = async () => {
      await room.connect(serverUrl, token);

      room.localParticipant.setMicrophoneEnabled(true);
      room.localParticipant.setCameraEnabled(true);
    };

    connect();

    return () => {
      room.disconnect();
    };
  }, [joined, token, room]);

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
      <div data-lk-theme="default" style={{ height: "100vh" }}>
        <MyVideoConference />
        <RoomAudioRenderer />
        <CustomControlBar roomName={roomName} />
      </div>
    </RoomContext.Provider>
  );
}

function MyVideoConference() {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );

  return (
    <GridLayout
      tracks={tracks}
      style={{ height: "calc(100vh - 60px)" }} // Adjust based on your control bar height
    >
      <ParticipantTile />
    </GridLayout>
  );
}
