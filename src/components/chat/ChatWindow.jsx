import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import ChatInfoModal from "./ChatInfoModal";
import { FiChevronLeft, FiInfo, FiPhone, FiVideo } from "react-icons/fi";
import {
  getMessages,
  sendMessage as sendMessageApi,
  markMessagesAsRead,
} from "../../api/api-chat";
import { useAuth } from "../../hooks/useAuth";
import { useSocket } from "../../context/SocketContext";

const ChatWindow = ({ chat, onBack, onNewMessage, onDeleteChat }) => {
  const { user: currentUser, setUser } = useAuth();
  const { socket, socketConnected } = useSocket();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isBlocked, setIsBlocked] = useState(
    currentUser?.blockedUsers?.includes(chat.id) || false,
  );

  const messagesEndRef = useRef(null);
  const selectedChatCompareRef = useRef(null);

  const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
  const avatarUrl = chat.avatar || defaultAvatar;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleMarkAsRead = async () => {
    if (chat?.id) {
      try {
        await markMessagesAsRead(chat.id);
      } catch (err) {
        console.error("Error marking messages as read:", err);
      }
    }
  };

  useEffect(() => {
    if (!socket) return;

    const handleMessageReceived = (newMessageReceived) => {
      if (selectedChatCompareRef.current?.id === newMessageReceived.sender) {
        setMessages((prev) => [...prev, newMessageReceived]);
        handleMarkAsRead();
      }
      if (onNewMessage) onNewMessage(newMessageReceived);
    };

    socket.on("message received", handleMessageReceived);

    return () => {
      socket.off("message received", handleMessageReceived);
    };
  }, [socket, onNewMessage, chat?.id]);

  useEffect(() => {
    const fetchChatMessages = async () => {
      if (!chat?.id) return;
      setLoading(true);
      try {
        const res = await getMessages(chat.id);
        const fetchedMessages = res.data || [];
        setMessages(fetchedMessages);
        if (socket) socket.emit("join chat", chat.id);
        handleMarkAsRead();
      } catch (err) {
        console.error("Error fetching messages:", err);
      } finally {
        setLoading(false);
        setTimeout(scrollToBottom, 50);
      }
    };

    fetchChatMessages();
    selectedChatCompareRef.current = chat;
    setIsBlocked(currentUser?.blockedUsers?.includes(chat.id) || false);
  }, [chat?.id, currentUser?.blockedUsers]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    const newMessage = {
      id: Date.now(),
      text,
      sender: "me",
      receiver: chat.id,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage]);
    if (onNewMessage) onNewMessage(newMessage);

    try {
      const { data } = await sendMessageApi({
        receiverId: chat.id,
        text,
      });
      if (socket) socket.emit("new message", data);
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="chat-header-main">
          <button className="mobile-back-btn" onClick={onBack}>
            <FiChevronLeft size={24} />
          </button>

          <Link to={`/profile/${chat.id}`} className="chat-header-user-link">
            <div className="chat-header-avatar">
              <img src={avatarUrl} alt={chat.name} />
              <div className="online-indicator-small"></div>
            </div>
            <div className="chat-header-info">
              <h3>{chat.name}</h3>
              <span>Active Now</span>
            </div>
          </Link>
        </div>

        <div className="chat-header-actions">
          <button className="icon-btn">
            <FiPhone />
          </button>
          <button className="icon-btn">
            <FiVideo />
          </button>
          <button className="icon-btn" onClick={() => setIsInfoModalOpen(true)}>
            <FiInfo />
          </button>
        </div>
      </div>

      <div className="chat-messages">
        {loading ? (
          <div className="chat-loading">Loading conversations...</div>
        ) : messages.length === 0 ? (
          <div className="chat-empty-state">No messages yet. Say hi! 👋</div>
        ) : (
          messages.map((msg, index) => (
            <MessageBubble key={msg.id || index} message={msg} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput
        onSend={sendMessage}
        disabled={isBlocked}
        placeholder={isBlocked ? "Unblock to send messages" : "Message..."}
      />

      <ChatInfoModal
        chat={chat}
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        isBlocked={isBlocked}
        onBlockUpdate={(val) => {
          setIsBlocked(val);
          // Update AuthContext globally so other components know
          if (setUser) {
            setUser((prev) => ({
              ...prev,
              blockedUsers: val
                ? [...(prev.blockedUsers || []), chat.id]
                : (prev.blockedUsers || []).filter((id) => id !== chat.id),
            }));
          }
        }}
        onDeleteChat={() => {
          setMessages([]);
          if (onDeleteChat) onDeleteChat(chat.id);
        }}
      />
    </div>
  );
};

export default ChatWindow;
