import { MessageCircle } from "lucide-react";

export default function EmptyChat() {
  return (
    <div className="chat-window empty-chat">
      <div className="empty-chat-content">
        <div className="empty-chat-icon">
          <MessageCircle size={60} />
        </div>
        <h2>Your Messages</h2>
        <p>Send private messages to other animal owners.</p>
      </div>
    </div>
  );
}
