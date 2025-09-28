import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
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

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMessage = message.trim();
    setMessage("");
    setIsLoading(true);

    try {
      // Add user message
      await addMessage({
        message: userMessage,
        isBot: false,
      });

      // Simulate bot response (in a real app, this would call an AI service)
      const botResponse = generateBotResponse(userMessage);
      
      // Add bot response after a short delay
      setTimeout(async () => {
        await addMessage({
          message: botResponse,
          isBot: true,
        });
        setIsLoading(false);
      }, 1000);

    } catch (error) {
      toast.error("Failed to send message");
      console.error(error);
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      await clearHistory();
      toast.success("Chat history cleared");
    } catch (error) {
      toast.error("Failed to clear history");
    }
  };

  const generateBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
      return "Hello! I'm WanderBot, your travel companion. I can help you discover amazing places, plan your trips, and answer questions about destinations around the world. What would you like to explore today?";
    }
    
    if (lowerMessage.includes("places near me") || lowerMessage.includes("nearby")) {
      return "I'd love to help you find places nearby! However, I'll need your location to provide specific recommendations. Some popular categories to explore include:\n\n• Restaurants and cafes\n• Historical landmarks\n• Parks and nature spots\n• Museums and galleries\n• Shopping areas\n\nWhat type of places are you most interested in?";
    }
    
    if (lowerMessage.includes("manali")) {
      return "Manali is a beautiful hill station in Himachal Pradesh, India! Here are some must-visit places:\n\n🏔️ **Rohtang Pass** - Stunning mountain views\n🏛️ **Hadimba Temple** - Ancient cedar wood temple\n🌊 **Beas River** - Perfect for riverside walks\n🎿 **Solang Valley** - Adventure sports hub\n🏘️ **Old Manali** - Charming cafes and local culture\n\nBest time to visit: March to June for pleasant weather, December to February for snow activities!";
    }
    
    if (lowerMessage.includes("paris")) {
      return "Paris, the City of Light! ✨ Here are the essentials:\n\n🗼 **Eiffel Tower** - Iconic landmark\n🎨 **Louvre Museum** - World's largest art museum\n⛪ **Notre-Dame Cathedral** - Gothic masterpiece\n🛍️ **Champs-Élysées** - Famous shopping street\n🏛️ **Arc de Triomphe** - Historical monument\n\nPro tip: Get a Museum Pass for skip-the-line access to major attractions!";
    }
    
    if (lowerMessage.includes("tokyo")) {
      return "Tokyo is an incredible blend of tradition and modernity! 🇯🇵\n\n🏯 **Senso-ji Temple** - Ancient Buddhist temple\n🌸 **Shibuya Crossing** - World's busiest intersection\n🍣 **Tsukiji Outer Market** - Fresh sushi and street food\n🏮 **Asakusa** - Traditional district\n🌆 **Tokyo Skytree** - Panoramic city views\n\nDon't miss trying authentic ramen and visiting during cherry blossom season (March-May)!";
    }
    
    if (lowerMessage.includes("budget") || lowerMessage.includes("cheap")) {
      return "Great question! Here are some budget-friendly travel tips:\n\n💰 **Accommodation**: Consider hostels, guesthouses, or Airbnb\n🍜 **Food**: Try local street food and markets\n🚌 **Transport**: Use public transportation\n🎫 **Activities**: Look for free walking tours and museums\n📱 **Apps**: Use travel apps for deals and discounts\n\nWould you like specific budget recommendations for a particular destination?";
    }
    
    if (lowerMessage.includes("weather") || lowerMessage.includes("climate")) {
      return "Weather can make or break a trip! Here's what to consider:\n\n☀️ **Research seasonal patterns** for your destination\n🌡️ **Pack accordingly** - layers are your friend\n🌧️ **Check forecasts** before departure\n❄️ **Consider off-season travel** for better prices\n\nWhich destination are you planning to visit? I can give you specific weather insights!";
    }
    
    // Default responses
    const defaultResponses = [
      "That's an interesting question! I'd love to help you explore that destination. Could you tell me more about what specifically you'd like to know?",
      "I'm here to help with your travel planning! Whether you need destination recommendations, travel tips, or local insights, just ask away.",
      "Travel is all about discovery! What kind of experience are you looking for - adventure, relaxation, culture, or something else?",
      "I can help you with destination guides, travel tips, local recommendations, and planning advice. What would you like to explore?",
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg h-[600px] flex flex-col">
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
        
        <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
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
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      msg.isBot ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}>
                      {msg.isBot ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                    </div>
                    <div className={`max-w-[80%] rounded-lg px-3 py-2 ${
                      msg.isBot 
                        ? "bg-muted text-foreground" 
                        : "bg-primary text-primary-foreground"
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
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
        </ScrollArea>
        
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
