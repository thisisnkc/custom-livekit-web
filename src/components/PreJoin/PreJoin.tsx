// import { useState } from "react";

import { useCallback } from "react";

export default function PreJoin(props) {
  //   const [isModerator, setIsModerator] = useState(false);

  const handleJoin = useCallback(async () => {
    if (props.name.trim()) {
      await props.onJoin();
    }
  }, [props]);

  return (
    <div style={{ padding: 40 }}>
      <h2>Join the Meeting</h2>
      <input
        type="text"
        placeholder="Enter your name"
        value={props.name}
        onChange={(e) => props.setName(e.target.value)}
        style={{ marginRight: 10 }}
      />
      <input
        type="text"
        placeholder="Enter room name"
        value={props.roomName}
        onChange={(e) => props.setRoomName(e.target.value)}
        style={{ marginRight: 10 }}
      />
      {/* <label>
        <input
          type="checkbox"
          checked={isModerator}
          onChange={() => setIsModerator(!isModerator)}
        />
        Join as Moderator
      </label> */}
      <br />
      <button onClick={handleJoin} style={{ marginTop: 20 }}>
        Join Meeting
      </button>
    </div>
  );
}
