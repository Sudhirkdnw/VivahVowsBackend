import React, { useEffect, useRef, useState } from 'react';

const ChatWindow = ({ room, messages, onSend, currentUserId }) => {
  const [text, setText] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!text.trim()) return;
    onSend(text.trim());
    setText('');
  };

  if (!room) {
    return <div className="card">Select a chat to start messaging.</div>;
  }

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h3>Chat with {room.partner?.name ?? 'Match'}</h3>
      <div style={{ flex: 1, overflowY: 'auto', marginTop: '1rem', marginBottom: '1rem' }}>
        {messages.map((message) => (
          <div key={message.id} className="chat-message">
            <span className="chat-message__author">
              {message.sender === currentUserId ? 'You' : 'Partner'}
            </span>
            <p>{message.content}</p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSubmit} className="chat-input">
        <input
          type="text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Type a message"
        />
        <button type="submit" className="button-primary">
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
