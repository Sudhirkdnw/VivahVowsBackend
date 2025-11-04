import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import ChatWindow from '../components/ChatWindow.jsx';
import { selectAuthTokens, selectCurrentUser } from '../redux/authSlice.js';
import { appendMessage, loadChatRooms, loadRoomMessages, selectChatRooms, selectRoomMessages } from '../redux/chatSlice.js';

const ChatPage = () => {
  const dispatch = useDispatch();
  const rooms = useSelector(selectChatRooms);
  const tokens = useSelector(selectAuthTokens);
  const currentUser = useSelector(selectCurrentUser);
  const [activeRoomId, setActiveRoomId] = useState(null);
  const wsRef = useRef(null);
  const messages = useSelector((state) => selectRoomMessages(state, activeRoomId));

  useEffect(() => {
    dispatch(loadChatRooms());
  }, [dispatch]);

  useEffect(() => {
    if (!activeRoomId || !tokens.access) {
      return undefined;
    }
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const socket = new WebSocket(
      `${protocol}://${window.location.host}/ws/chat/${activeRoomId}/?token=${tokens.access}`
    );
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      dispatch(appendMessage({ roomId: activeRoomId, message: data }));
    };
    wsRef.current = socket;
    return () => {
      socket.close();
    };
  }, [activeRoomId, tokens.access, dispatch]);

  const handleSelectRoom = (roomId) => {
    setActiveRoomId(roomId);
    dispatch(loadRoomMessages(roomId));
  };

  const activeRoom = rooms.find((room) => room.id === activeRoomId);

  const handleSendMessage = (content) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ message: content }));
    }
  };

  return (
    <div className="container chat-container">
      <div className="chat-room-list">
        <h3>Matches</h3>
        {rooms.map((room) => (
          <button
            key={room.id}
            type="button"
            className={room.id === activeRoomId ? 'active' : ''}
            onClick={() => handleSelectRoom(room.id)}
          >
            {room.partner?.name || `Match ${room.id}`}
          </button>
        ))}
      </div>
      <ChatWindow
        room={activeRoom}
        messages={messages}
        onSend={handleSendMessage}
        currentUserId={currentUser?.id}
      />
    </div>
  );
};

export default ChatPage;
