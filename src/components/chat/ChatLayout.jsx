import { useState } from "react";
import ConversationList from "./ConversationList";
import ChatWindow from "./ChatWindow";
import EmptyChat from "./EmptyChat";
import "../../styles/chat.css";

const ChatLayout = () => {
  const [selectedChat, setSelectedChat] = useState(null);

  return (
    <div className="chat-container">
      <div className="chat-sidebar">
        <ConversationList onSelect={setSelectedChat} />
      </div>

      <div className="chat-main">
        {selectedChat ? (
          <ChatWindow chat={selectedChat} />
        ) : (
          <EmptyChat />
        )}
      </div>
    </div>
  );
};

export default ChatLayout;