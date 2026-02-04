import { useState } from "react";
import { Send, X } from "lucide-react";
import { useChat } from "@/hooks/useChat";
import { useVisualization } from "@/hooks/useVisualization";

export default function ChatPanel() {
  const [message, setMessage] = useState("");
  const { history, loading, send, clear } = useChat();
  const { setData } = useVisualization();

  const handleSend = async () => {
    if (message.trim()) {
      const response = await send({ query: message.trim() });
      // Update main visualization with related data if provided
      // Only update if data is not empty (has nodes/edges or items)
      if (response?.data) {
        const hasContent = 
          (response.data as any).nodes?.length > 0 ||
          (response.data as any).edges?.length > 0 ||
          (response.data as any).hyperedges?.length > 0 ||
          (response.data as any).items?.length > 0;
        
        if (hasContent) {
          setData(response.data);
        }
      }
      setMessage("");
    }
  };

  return (
    <div className="flex flex-col h-full space-y-3">
      <h3 className="text-sm font-semibold text-foreground">💬 Chat</h3>
      
      {/* Message History */}
      <div className="flex-1 min-h-0 border border-border rounded-md bg-muted/30 overflow-y-auto space-y-2 p-3">
        {loading && (
          <div className="flex items-center justify-center py-4 text-sm text-muted-foreground">
            <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
            Loading...
          </div>
        )}
        
        {history.length === 0 && !loading && (
          <div className="text-sm text-muted-foreground text-center py-4">No messages yet</div>
        )}
        
        {history.map((item, index) => (
          <div key={index} className={`text-sm rounded-md p-2 ${
            item.role === "user"
              ? "bg-primary text-primary-foreground ml-6"
              : "bg-secondary text-secondary-foreground mr-6"
          }`}>
            <span>{item.content}</span>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="space-y-2">
        <textarea
          placeholder="Type your message... (Cmd+Enter to send)"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
              handleSend();
            }
          }}
          rows={2}
          className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none transition-all"
        />
        
        <div className="flex gap-2">
          <button
            onClick={handleSend}
            disabled={loading || !message.trim()}
            className="flex-1 px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" /> Send
              </>
            )}
          </button>
          <button
            onClick={clear}
            className="px-3 py-2 border border-border rounded-md hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
