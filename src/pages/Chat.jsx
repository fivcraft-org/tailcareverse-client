import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ConversationList from "../components/chat/ConversationList";
import ChatWindow from "../components/chat/ChatWindow";
import EmptyChat from "../components/chat/EmptyChat";
import { useTheme } from "../context/ThemeContext";
import { getConversations, markAllMessagesAsRead } from "../api/api-chat";
import { getUserProfile } from "../api/api-user";
import "../styles/chat.css";

export default function Chat() {
  const [searchParams, setSearchParams] = useSearchParams();
  const userIdParam = searchParams.get("userId");

  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const markAsRead = async () => {
      try {
        await markAllMessagesAsRead();
      } catch (err) {
        console.error("Error marking all as read:", err);
      }
    };
    markAsRead();
  }, []);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await getConversations();
        const chats = res.data || [];
        setConversations(chats);

        // Handle deep-link from Profile
        if (userIdParam) {
          const existingChat = chats.find((c) => c.id === userIdParam);
          if (existingChat) {
            setSelectedChat(existingChat);
          } else {
            // New chat - fetch user details
            const userRes = await getUserProfile(userIdParam);
            const userData = userRes.data;
            const firstName = userData.profile?.firstName;
            const lastName = userData.profile?.lastName;
            const fullName =
              userData.fullName ||
              (firstName && lastName
                ? `${firstName} ${lastName}`
                : userData.username);

            setSelectedChat({
              id: userData._id,
              name: fullName,
              avatar: userData.profile?.avatar?.url,
              isNew: true,
            });
          }
        }
      } catch (err) {
        console.error("Error fetching conversations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [userIdParam]);

  const handleUpdateConversation = (message) => {
    setConversations((prev) => {
      const convoIndex = prev.findIndex(
        (c) =>
          c.id ===
          (message.sender === "me" ? message.receiver : message.sender),
      );

      let updatedConvos = [...prev];
      if (convoIndex !== -1) {
        const convo = {
          ...updatedConvos[convoIndex],
          lastMessage: message.text,
        };
        updatedConvos.splice(convoIndex, 1);
        updatedConvos.unshift(convo);
      } else if (
        selectedChat &&
        selectedChat.isNew &&
        (message.sender === "me" || message.sender === selectedChat.id)
      ) {
        // If it's a new chat we just started
        const newConvo = {
          id: selectedChat.id,
          name: selectedChat.name,
          avatar: selectedChat.avatar,
          lastMessage: message.text,
        };
        updatedConvos.unshift(newConvo);
        // Clear isNew flag
        setSelectedChat((prev) => ({ ...prev, isNew: false }));
      }
      return updatedConvos;
    });
  };

  return (
    <div data-theme={isDarkMode ? "dark" : "light"} className="w-full">
      <div className={`chat-container ${selectedChat ? "active-chat" : ""}`}>
        <div className="chat-sidebar">
          <ConversationList
            conversations={conversations}
            loading={loading}
            selectedChat={selectedChat}
            onSelect={(chat) => {
              setSelectedChat(chat);
              setSearchParams({ userId: chat.id });
            }}
          />
        </div>

        <div className="chat-main">
          {selectedChat ? (
            <ChatWindow
              chat={selectedChat}
              onBack={() => {
                setSelectedChat(null);
                setSearchParams({});
              }}
              onNewMessage={handleUpdateConversation}
              onDeleteChat={(id) => {
                setConversations((prev) => prev.filter((c) => c.id !== id));
                setSelectedChat(null);
                setSearchParams({});
              }}
            />
          ) : (
            <EmptyChat />
          )}
        </div>
      </div>
    </div>
  );
}
