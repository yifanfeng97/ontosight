import { useState } from "react";
import { Input, Button, List, Spin, Empty } from "antd";
import { SendOutlined } from "@ant-design/icons";
import { useChat } from "@/hooks/useChat";
import "@/components/ChatPanel.css";

export default function ChatPanel() {
  const [message, setMessage] = useState("");
  const { history, loading, send, clear } = useChat();

  const handleSend = async () => {
    if (message.trim()) {
      await send({ query: message.trim(), context: {} });
      setMessage("");
    }
  };

  return (
    <div className="chat-panel">
      <h3>Chat</h3>
      <div className="chat-history">
        {loading && <Spin size="small" />}
        {history.length === 0 && !loading && (
          <Empty description="No messages yet" />
        )}
        <List
          dataSource={history}
          renderItem={(item, index) => (
            <div key={index} className={`chat-message ${item.role}`}>
              <span>{item.content}</span>
            </div>
          )}
        />
      </div>

      <div className="chat-input-group">
        <Input.TextArea
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={2}
          onPressEnter={(e) => {
            if (e.ctrlKey || e.metaKey) {
              handleSend();
            }
          }}
        />
        <div className="chat-actions">
          <Button type="primary" onClick={handleSend} loading={loading}>
            <SendOutlined /> Send
          </Button>
          <Button onClick={clear} type="link" size="small">
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
}
