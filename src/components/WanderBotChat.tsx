import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
// Removed ScrollArea in favor of native scroll container
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

  // Track greeting to avoid duplicates
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
      if (messages === undefined) return; // wait for load
      if (greetedRef.current) return;
      if (messages.length > 0) return;

      greetedRef.current = true;
      try {
        await addMessage({
          message:
            "Hello! I'm WanderBot, your travel companion. Ask me about destinations, itineraries, budgets, or app help (like adding places to your log). Where are you headed?",
          isBot: true,
        });
      } catch {
        // ignore toast here to keep first impression clean
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
      // Add user message
      await addMessage({
        message: userMessage,
        isBot: false,
      });

      // Pass full chat history to AI for context (filter to only required fields)
      const botResponse = await generateReply({ 
        userMessage,
        chatHistory: (messages || []).map(msg => ({
          message: msg.message,
          isBot: msg.isBot
        }))
      });

      await addMessage({
        message: botResponse,
        isBot: true,
      });
    } catch (error) {
      toast.error("Failed to send message");
      console.error(error);
    } finally {
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
    const lowerMessage = userMessage.toLowerCase().trim();

    // Quick guidance for app-specific help
    if (
      lowerMessage.includes("add place") ||
      lowerMessage.includes("add location") ||
      lowerMessage.includes("marker") ||
      lowerMessage.includes("pin")
    ) {
      return "To add a place: Click 'Add Place' → click on the map to auto-fill name and coordinates → add notes/category on the left → 'Add to Log'.";
    }

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
    
    if (
      lowerMessage.includes("budget") ||
      lowerMessage.includes("cheap") ||
      lowerMessage.includes("affordable")
    ) {
      return "Great question! Here are some budget-friendly travel tips:\n\n💰 **Accommodation**: Consider hostels, guesthouses, or Airbnb\n🍜 **Food**: Try local street food and markets\n🚌 **Transport**: Use public transportation\n🎫 **Activities**: Look for free walking tours and museums\n📱 **Apps**: Use travel apps for deals and discounts\n\nWould you like specific budget recommendations for a particular destination?";
    }
    
    if (
      lowerMessage.includes("weather") ||
      lowerMessage.includes("climate") ||
      lowerMessage.includes("best time")
    ) {
      return "Weather can make or break a trip! Here's what to consider:\n\n☀️ **Research seasonal patterns** for your destination\n🌡️ **Pack accordingly** - layers are your friend\n🌧️ **Check forecasts** before departure\n❄️ **Consider off-season travel** for better prices\n\nWhich destination are you planning to visit? I can give you specific weather insights!";
    }

    if (
      lowerMessage.includes("itinerary") ||
      lowerMessage.includes("plan") ||
      lowerMessage.includes("days")
    ) {
      return "I can help plan an itinerary! Tell me: destination, number of days, and your travel style (culture, food, nature, nightlife). I'll suggest a day-by-day plan.";
    }

    if (
      lowerMessage.includes("visa") ||
      lowerMessage.includes("passport") ||
      lowerMessage.includes("entry")
    ) {
      return "Visa requirements vary by nationality and destination. Check your destination country's official immigration website or IATA Travel Centre. Tell me your nationality and destination, and I'll point you to the right resource.";
    }

    if (
      lowerMessage.includes("safety") ||
      lowerMessage.includes("safe") ||
      lowerMessage.includes("scam")
    ) {
      return "General safety tips: keep valuables minimal, use registered taxis, avoid poorly lit areas late at night, and keep digital copies of documents. For destination-specific advice, tell me where you're going.";
    }

    if (
      lowerMessage.includes("food") ||
      lowerMessage.includes("restaurant") ||
      lowerMessage.includes("cafe") ||
      lowerMessage.includes("eat")
    ) {
      return "I'd love to recommend food spots! Let me know your destination and cuisine preference (local, vegetarian, street food, cafes, fine dining).";
    }
    
    // Default responses
    const defaultResponses = [
      "I can help with itineraries, tips, and destination ideas. Tell me your destination and how many days you have.",
      "What destination are you considering? I can suggest must-see spots, local food, and the best time to visit.",
      "Share your travel style (adventure, culture, food, chill), and I'll tailor recommendations.",
      "Ask about visas, budgets, packing, or safety—happy to help you plan a smooth trip!",
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
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