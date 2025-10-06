import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { useQuery, useMutation, useAction } from "convex/react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Send, Bot, User, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface WanderBotChatProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function WanderBotChat({
  open,
  onOpenChange,
}: WanderBotChatProps) {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const messages = useQuery(api.chat.getChatMessages);
  const addMessage = useMutation(api.chat.addChatMessage);
  const clearHistory = useMutation(api.chat.clearChatHistory);
  const generateReply = useAction(api.ai.generateWanderBotReply);

  const greetedRef = useRef(false);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Auto-greet when the dialog opens and there is no history
  useEffect(() => {
    const greet = async () => {
      if (!open) return;
      if (messages === undefined) return;
      if (greetedRef.current) return;
      if (messages.length > 0) return;

      greetedRef.current = true;
      try {
        await addMessage({
          message:
            "Hello! I'm WanderBot, your travel companion. Ask me about destinations, itineraries, budgets, or app help (like adding places to your log). Where are you headed?",
          isBot: true,
        });
      } catch (err) {
        console.error("Failed to add greeting:", err);
      }
    };
    void greet();
  }, [open, messages, addMessage]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMessage = message.trim();
    setMessage("");
    setIsLoading(true);

    try {
      // Add user message first
      await addMessage({
        message: userMessage,
        isBot: false,
      });

      // Prepare chat history - only include message and isBot fields
      const chatHistoryForAI = (messages || []).map((msg) => ({
        message: msg.message,
        isBot: msg.isBot,
      }));

      console.log("Sending to AI with history length:", chatHistoryForAI.length);

      // Generate AI response
      const botResponse = await generateReply({
        userMessage,
        chatHistory: chatHistoryForAI,
      });

      console.log("Received AI response:", botResponse.substring(0, 100) + "...");

      // Add bot response
      await addMessage({
        message: botResponse,
        isBot: true,
      });

    } catch (error) {
      console.error("WanderBot error:", error);
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      console.error("Error details:", errorMsg);
      toast.error("Failed to send message. Check console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      await clearHistory();
      greetedRef.current = false;
      toast.success("Chat history cleared");
    } catch (error) {
      console.error("Clear history error:", error);
      toast.error("Failed to clear history");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg sm:h-[600px] max-h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            WanderBot
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearHistory}
              className="ml-auto"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 pr-4 overflow-y-auto" ref={scrollAreaRef}>
          <div className="space-y-4 pb-4">
            {messages === undefined ? (
              <div className="text-center text-muted-foreground py-8">
                Loading chat...
              </div>
            ) : messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8"
              >
                <Bot className="h-12 w-12 mx-auto text-primary mb-4" />
                <p className="text-muted-foreground">
                  Hi! I'm WanderBot. Ask me about destinations, travel tips, or places to explore!
                </p>
              </motion.div>
            ) : (
              <AnimatePresence>
                {messages.map((msg, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${msg.isBot ? "" : "flex-row-reverse"}`}
                  >
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        msg.isBot ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      {msg.isBot ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                    </div>
                    <div className={`max-w-[80%] rounded-lg px-3 py-2 break-words overflow-hidden ${
                       msg.isBot 
                         ? "bg-muted text-foreground" 
                         : "bg-primary text-primary-foreground"
                     }`}>
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                     </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
            
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="bg-muted rounded-lg px-3 py-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
        
        <form onSubmit={handleSendMessage} className="flex gap-2 flex-shrink-0">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask about destinations, travel tips..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !message.trim()} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}