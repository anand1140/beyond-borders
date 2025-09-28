import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { 
  MapPin, 
  Globe, 
  Camera, 
  MessageCircle, 
  ArrowRight,
  Compass,
  Users,
  Star
} from "lucide-react";

export default function Landing() {
  const { isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      navigate("/auth");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Compass className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xl font-bold tracking-tight">Beyond Borders</span>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/auth")}>
              Sign In
            </Button>
            <Button onClick={handleGetStarted} disabled={isLoading}>
              {isAuthenticated ? "Dashboard" : "Get Started"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
              Map Your Journey,
              <br />
              <span className="text-primary">Beyond Borders</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Create beautiful travel logs with interactive maps. Mark the places you've been, 
              add your memories, and get personalized travel recommendations from WanderBot.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={handleGetStarted}
                disabled={isLoading}
                className="h-12 px-8"
              >
                {isAuthenticated ? "Go to Dashboard" : "Start Your Journey"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => navigate("/auth")}
                className="h-12 px-8"
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Try WanderBot
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Everything you need for travel logging
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From interactive maps to AI-powered recommendations, we've got your travel documentation covered.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: MapPin,
                title: "Interactive Maps",
                description: "Mark destinations on beautiful interactive maps and see your journey come to life."
              },
              {
                icon: Camera,
                title: "Rich Memories",
                description: "Add photos, notes, and detailed descriptions to each destination you visit."
              },
              {
                icon: MessageCircle,
                title: "WanderBot AI",
                description: "Get personalized travel recommendations and discover hidden gems with our AI assistant."
              },
              {
                icon: Globe,
                title: "Global Coverage",
                description: "Document travels anywhere in the world with comprehensive mapping data."
              },
              {
                icon: Users,
                title: "Personal Logs",
                description: "Create multiple travel logs for different trips and keep them organized."
              },
              {
                icon: Star,
                title: "Beautiful Design",
                description: "Enjoy a clean, modern interface that makes travel logging a pleasure."
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              >
                <Card className="h-full border-2 hover:border-primary/20 transition-colors">
                  <CardContent className="p-6">
                    <feature.icon className="h-12 w-12 text-primary mb-4" />
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Simple steps to document your travels
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                step: "01",
                title: "Create a Travel Log",
                description: "Start by creating a new travel log for your trip with dates and description."
              },
              {
                step: "02", 
                title: "Mark Your Destinations",
                description: "Click on the interactive map to add places you've visited with notes and photos."
              },
              {
                step: "03",
                title: "Get AI Recommendations",
                description: "Chat with WanderBot to discover new places and get personalized travel tips."
              }
            ].map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Ready to start your travel journey?
            </h2>
            <p className="text-xl opacity-90 mb-8">
              Join thousands of travelers who are already documenting their adventures with Beyond Borders.
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              onClick={handleGetStarted}
              disabled={isLoading}
              className="h-12 px-8"
            >
              {isAuthenticated ? "Go to Dashboard" : "Get Started for Free"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center">
              <Compass className="h-4 w-4 text-primary" />
            </div>
            <span className="font-semibold">Beyond Borders</span>
          </div>
          <p className="text-muted-foreground">
            Built with ❤️ for travelers around the world
          </p>
        </div>
      </footer>
    </div>
  );
}