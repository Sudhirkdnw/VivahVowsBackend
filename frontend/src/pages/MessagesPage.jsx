import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { loadChatRooms, loadRoomMessages, selectChatRooms, selectRoomMessages } from '../redux/chatSlice.js';

const MessagesPage = () => {
  const dispatch = useDispatch();
  const rooms = useSelector(selectChatRooms);
  const roomList = Array.isArray(rooms?.results) ? rooms.results : rooms ?? [];
  const [activeRoom, setActiveRoom] = useState(null);
  const messages = useSelector((state) => selectRoomMessages(state, activeRoom?.id));

  useEffect(() => {
    dispatch(loadChatRooms()).then((action) => {
      if (loadChatRooms.fulfilled.match(action)) {
        const payloadRooms = Array.isArray(action.payload?.results)
          ? action.payload.results
          : action.payload ?? [];
        if (payloadRooms.length) {
          setActiveRoom(payloadRooms[0]);
          dispatch(loadRoomMessages(payloadRooms[0].id));
        }
      }
    });
  }, [dispatch]);

  const handleSelectRoom = (room) => {
    setActiveRoom(room);
    dispatch(loadRoomMessages(room.id));
  };

  return (
    <div className="surface-grid" style={{ gap: '24px' }}>
      <header className="section-header">
        <div>
          <div className="badge">Messages</div>
          <h1 style={{ margin: '12px 0 0' }}>Conversations</h1>
          <p style={{ margin: '6px 0 0', color: 'rgba(203,213,225,0.75)' }}>
            Continue building connections with your matches.
          </p>
        </div>
      </header>
      <div className="surface-grid surface-grid--two">
        <aside className="surface-card" style={{ display: 'grid', gap: '12px', maxHeight: '75vh', overflowY: 'auto' }}>
          <div className="badge">Active chats</div>
          <ul className="list-reset" style={{ display: 'grid', gap: '8px' }}>
            {roomList.length === 0 && <li className="empty-state">No conversations yet.</li>}
            {roomList.map((room) => (
              <li key={room.id}>
                <button
                  type="button"
                  onClick={() => handleSelectRoom(room)}
                  className="button"
                  style={{ width: '100%', justifyContent: 'flex-start', background: activeRoom?.id === room.id ? 'linear-gradient(135deg, rgba(59,130,246,0.35), rgba(139,92,246,0.35))' : '' }}
                >
                  {room.name ?? `Room #${room.id}`}
                </button>
              </li>
            ))}
          </ul>
        </aside>
        <section className="surface-card" style={{ display: 'grid', gap: '16px', maxHeight: '75vh' }}>
          <div className="section-header">
            <div>
              <div className="badge">Conversation</div>
              <h2 style={{ margin: '12px 0 0' }}>{activeRoom?.name ?? 'Select a conversation'}</h2>
            </div>
          </div>
          <div style={{ overflowY: 'auto', paddingRight: '12px', display: 'grid', gap: '12px' }}>
            {(!messages || messages.length === 0) && (
              <div className="empty-state">No messages yet. Start the conversation!</div>
            )}
            {messages.map((message) => (
              <article key={message.id} className="surface-card" style={{ padding: '16px' }}>
                <div style={{ fontSize: '0.8rem', opacity: 0.65 }}>{message.sender_name ?? 'You'}</div>
                <p style={{ margin: '8px 0 0' }}>{message.content}</p>
                <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>
                  {message.created_at ? new Date(message.created_at).toLocaleString() : ''}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default MessagesPage;
