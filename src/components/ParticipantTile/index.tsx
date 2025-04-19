import {
  ParticipantTile,
  TrackRefContext,
  TrackRef,
  useRoomContext,
} from "@livekit/components-react";
import { useEffect, useState } from "react";
import { Track, Room } from "livekit-client";
import { useTracks } from "@livekit/components-react";

// interface MyVideoConferenceProps {
//   room: Room;
// }

export default function MyVideoConference() {
  const tracks = useTracks(
    [
      { source: Track.Source.Unknown, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );

  // Track SID of currently selected (primary) track
  const [primaryTrackSid, setPrimaryTrackSid] = useState<string | null>(null);
  const [remotePrimaryTrackSid, setRemotePrimaryTrackSid] = useState<
    string | null
  >(null);
  const room = useRoomContext();

  useEffect(() => {
    const handler = (payload: Uint8Array) => {
      try {
        console.log("🚀 ~ handler ~ decoded:", payload);
        const decoded = new TextDecoder().decode(payload);
        console.log("🚀 ~ handler ~ decoded <<<>>>>>:", decoded);

        if (!decoded || decoded.trim() === "") return;

        const message = JSON.parse(decoded);

        console.log("got the message >>", message);
        if (message.type === "PRIMARY_TOGGLE") {
          setRemotePrimaryTrackSid(message.trackSid);
        }
      } catch (err) {
        console.error("Error decoding message", err);
      }
    };

    room.on("dataReceived", handler);
    return () => {
      room.off("dataReceived", handler);
    };
  }, [room]);

  // const handlePrimaryToggle = (trackSid: string | undefined) => {
  //   if (!trackSid) return;
  //   setPrimaryTrackSid((prev) => (prev === trackSid ? null : trackSid));
  // };

  const handlePrimaryToggle = (trackSid: string | undefined) => {
    if (!trackSid) return;
    const newPrimary = primaryTrackSid === trackSid ? null : trackSid;
    setPrimaryTrackSid(newPrimary);

    const message = {
      type: "PRIMARY_TOGGLE",
      trackSid: newPrimary,
    };
    console.log("🚀 ~ handlePrimaryToggle ~ newPrimary:", message);

    const encodedMessage = new TextEncoder().encode(JSON.stringify(message));

    room.localParticipant.publishData(encodedMessage, { reliable: true });
    // JSON.stringify({
    //   type: "PRIMARY_TOGGLE",
    //   trackSid: newPrimary,
    // }),
    // { reliable: true }
  };

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "10px",
        alignItems: "flex-start",
      }}
    >
      {tracks.map((trackRef, index) => {
        const trackSid = trackRef.publication?.trackSid;

        if (!trackRef.publication) return null;

        const isPrimary =
          trackSid === (remotePrimaryTrackSid ?? primaryTrackSid);

        // const isPrimary = trackSid === primaryTrackSid;

        return (
          <TrackRefContext.Provider value={trackRef} key={trackSid || index}>
            <ParticipantWithMenu
              trackRef={trackRef}
              isPrimary={isPrimary}
              onClick={() => handlePrimaryToggle(trackSid)}
            />
          </TrackRefContext.Provider>
        );
      })}
    </div>
  );
}

function ParticipantWithMenu({
  trackRef,
  isPrimary,
  onClick,
}: {
  trackRef: TrackRef;
  isPrimary: boolean;
  onClick: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const participant = trackRef.participant;

  const handleMute = () => {
    if (participant.isLocal) {
      console.warn("the track is local");
      return;
    }

    const audioPub = participant.getTrackPublication(Track.Source.Microphone);
    if (audioPub && audioPub.isSubscribed) {
      audioPub.setSubscribed(false);
      console.log("Muted audio for:", participant.identity);
    }
  };

  const handleKick = () => {
    console.log("Kick clicked for:", {
      identity: participant.identity,
      sid: participant.sid,
    });
  };

  return (
    <div
      onClick={onClick}
      style={{
        position: "relative",
        width: isPrimary ? "640px" : "300px",
        height: isPrimary ? "400px" : "200px",
        borderRadius: "10px",
        overflow: "hidden",
        cursor: "pointer",
        border: isPrimary ? "3px solid #4CAF50" : "1px solid #ccc",
        transition: "all 0.3s ease-in-out",
      }}
    >
      {/* Menu Button */}
      <div
        style={{
          position: "absolute",
          top: "8px",
          right: "8px",
          zIndex: 10,
          background: "rgba(0,0,0,0.6)",
          color: "white",
          borderRadius: "4px",
          padding: "4px 8px",
          cursor: "pointer",
        }}
        onClick={(e) => {
          e.stopPropagation(); // Prevent menu click from triggering toggle
          setShowMenu(!showMenu);
        }}
      >
        ⋮
      </div>

      {/* Menu Dropdown */}
      {showMenu && (
        <div
          style={{
            position: "absolute",
            top: "36px",
            right: "8px",
            zIndex: 20,
            background: "white",
            border: "1px solid #ccc",
            borderRadius: "4px",
            padding: "4px 0",
          }}
        >
          <div
            style={{ padding: "6px 12px", cursor: "pointer", color: "black" }}
            onClick={handleMute}
          >
            Mute
          </div>
          <div
            style={{ padding: "6px 12px", cursor: "pointer", color: "black" }}
            onClick={handleKick}
          >
            Kick
          </div>
        </div>
      )}

      <ParticipantTile trackRef={trackRef} />
    </div>
  );
}
