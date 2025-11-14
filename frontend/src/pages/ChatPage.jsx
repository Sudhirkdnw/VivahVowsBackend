import { useEffect, useRef, useState } from 'react';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';

function ChatPage() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    async function fetchRooms() {
      try {
        const response = await apiClient.get('/api/chat/rooms/');
        setRooms(response.data);
        if (response.data.length) {
          selectRoom(response.data[0]);
        }
      } catch (error) {
        console.error('Failed to load chat rooms', error);
      } finally {
        setLoadingRooms(false);
      }
    }

    fetchRooms();
  }, []);

  const selectRoom = async (room) => {
    setSelectedRoom(room);
    setLoadingMessages(true);
    try {
      const response = await apiClient.get(`/api/chat/rooms/${room.id}/messages/`);
      setMessages(response.data);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (error) {
      console.error('Failed to load messages', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!messageText.trim() || !selectedRoom) return;
    try {
      const response = await apiClient.post(`/api/chat/rooms/${selectedRoom.id}/messages/`, {
        content: messageText.trim()
      });
      setMessages((prev) => [...prev, response.data]);
      setMessageText('');
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (error) {
      console.error('Failed to send message', error);
    }
  };

  return (
    <div className="chat-layout">
      <aside className="chat-sidebar">
        <header>Chats</header>
        {loadingRooms ? (
          <p style={{ padding: '1rem' }}>Loading rooms…</p>
        ) : rooms.length === 0 ? (
          <p style={{ padding: '1rem' }}>No chat rooms yet. Like someone to start a conversation.</p>
        ) : (
          <ul className="chat-room-list">
            {rooms.map((room) => {
              const isActive = selectedRoom?.id === room.id;
              return (
                <li key={room.id}>
                  <button
                    type="button"
                    className={isActive ? 'active' : ''}
                    onClick={() => selectRoom(room)}
                  >
                    <span>{room.partner?.name || 'Match'}</span>
                    <small>{room.partner?.city}</small>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </aside>
      <section className="chat-window">
        {selectedRoom ? (
          <>
            <header>{selectedRoom.partner?.name || 'Conversation'}</header>
            <div className="messages">
              {loadingMessages ? (
                <p>Loading messages…</p>
              ) : messages.length === 0 ? (
                <p>No messages yet. Say hello!</p>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`message ${message.sender === user.id ? 'self' : ''}`}
                  >
                    <span>{message.content}</span>
                    <small>{new Date(message.created_at).toLocaleString()}</small>
                  </div>
                ))
              )}
              <div ref={bottomRef} />
            </div>
            <form className="message-form" onSubmit={handleSubmit}>
              <input
                type="text"
                value={messageText}
                onChange={(event) => setMessageText(event.target.value)}
                placeholder="Type a message"
              />
              <button className="btn" type="submit">
                Send
              </button>
            </form>
          </>
        ) : (
          <div style={{ padding: '2rem' }}>
            <h2>Select a chat room</h2>
            <p>Your messages will appear here once you pick a conversation.</p>
          </div>
        )}
      </section>
    </div>
  );
}

export default ChatPage;
