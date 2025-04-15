import { useLocalParticipant, RoomContext } from "@livekit/components-react";
import { useContext, useState } from "react";

interface CustomControlBarProps {
  roomName: string;
}

export default function CustomControlBar(props: CustomControlBarProps) {
  const room = useContext(RoomContext);
  const { localParticipant } = useLocalParticipant();

  const [micEnabled, setMicEnabled] = useState(true);
  const [camEnabled, setCamEnabled] = useState(true);
  const [screenShareEnabled, setScreenShareEnabled] = useState(false);
  const [egressId, setEgressId] = useState("");

  const [recording, setRecording] = useState(false);

  const toggleRecording = async () => {
    if (!recording) {
      const res = await fetch(
        "https://unifymax.t.kocharsoft.com/lightspeed-api/serverRecord",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            roomName: props.roomName,
            tenant: "maxicus", // for bucket folder
          }),
        }
      );

      // const res = await fetch(
      //   `http://localhost:3001/startRecording?roomName=${props.roomName}`
      // );

      const data = await res.text();
      console.log("Recording status: ", data);
      if (data) {
        setEgressId(data);
      } else console.error("Enable to start recording !");
    } else {
      // const res = await fetch(
      //   `http://localhost:3001/stopRecording?egressId=${egressId}`
      // );

      // const data = await res.json();
      // console.log("Recording status: ", data);

      const stopResponse = await fetch(
        "https://unifymax.t.kocharsoft.com/lightspeed-api/stop",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            EgressId: egressId,
          }),
        }
      );

      const stopData = await stopResponse.json();
      console.log("🚀 ~ toggleRecording ~ stopData:", stopData);
      if (!stopData) console.error("enable to stop recordings");
      setEgressId("");
    }
    setRecording(!recording);
  };

  const toggleMic = async () => {
    const enabled = !micEnabled;
    await localParticipant.setMicrophoneEnabled(enabled);
    setMicEnabled(enabled);
  };

  const toggleCam = async () => {
    const enabled = !camEnabled;
    await localParticipant.setCameraEnabled(enabled);
    setCamEnabled(enabled);
  };

  const toggleScreenShare = async () => {
    const enabled = !screenShareEnabled;

    await localParticipant.setScreenShareEnabled(enabled);

    setScreenShareEnabled(enabled);
  };

  const leaveRoom = () => {
    if (room) {
      room.disconnect();
    }
    window.location.reload(); // or route to home page
  };

  return (
    <div
      style={{
        height: "60px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "1rem",
        backgroundColor: "#1a1a1a",
        color: "white",
      }}
    >
      <button onClick={toggleMic} style={{ color: "black" }}>
        {micEnabled ? "Mute Mic" : "Unmute Mic"}
      </button>
      <button onClick={toggleCam} style={{ color: "black" }}>
        {camEnabled ? "Turn Off Cam" : "Turn On Cam"}
      </button>
      <button onClick={toggleScreenShare} style={{ color: "black" }}>
        {screenShareEnabled ? "Stop Share" : "Share Screen"}
      </button>
      <button onClick={toggleRecording} style={{ backgroundColor: "purple" }}>
        {recording ? "Stop Recording" : "Start Recording"}
      </button>
      <button onClick={leaveRoom} style={{ backgroundColor: "#e74c3c" }}>
        Leave
      </button>
    </div>
  );
}
