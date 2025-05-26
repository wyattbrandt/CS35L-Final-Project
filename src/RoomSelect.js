import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/RoomSelect.css";

function RoomSelect() {
  const navigate = useNavigate();
  const privateRoomRef = useRef(null);

  const joinRoom = (roomName) => {
    if (!roomName) return;
    navigate("/chat", { state: { room: roomName } });
  };

  return (
    <div className="room-selection-container">
      <div className="rooms-list">
        <h1 className="room-title">Select a Room</h1>

        {["Room 1", "Room 2", "Room 3", "Room 4"].map((room, i) => (
          <button 
            key={i} 
            className="room-btn" 
            onClick={() => joinRoom(room)}
          >
            {room}
          </button>
        ))}

        <div className="private-room-input">
          <input
            type="text"
            ref={privateRoomRef}
            placeholder="Enter private room name"
            className="room-input"
          />
          <button 
            className="room-btn" 
            onClick={() => joinRoom(privateRoomRef.current.value)}
          >
            Join Private Room
          </button>
        </div>
      </div>
    </div>
  );
}

export default RoomSelect;
