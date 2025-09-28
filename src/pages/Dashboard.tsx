import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { motion } from "framer-motion";
import { MapPin, Plus, Calendar, MessageCircle, Compass } from "lucide-react";
import { useNavigate } from "react-router";
import { useState } from "react";
import CreateTravelLogDialog from "@/components/CreateTravelLogDialog";
import WanderBotChat from "@/components/WanderBotChat";
import { toast } from "sonner";

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showChat, setShowChat] = useState(false);
  
  const travelLogs = useQuery(api.travelLogs.getUserTravelLogs);
  const createSampleData = useMutation(api.travelLogs.createSampleData);

  // Add sample data handler
  const handleAddSampleData = async () => {
    try {
      const id = await createSampleData({});
      toast.success("Sample data created");
      navigate(`/travel-log/${id}`);
    } catch (e) {
      toast.error("Failed to create sample data");
      console.error(e);
    }
  };

  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center cursor-pointer"
              onClick={() => navigate("/")}
            >
              <Compass className="h-5 w-5 text-primary" />
            </div>
            <h1
              className="text-xl font-bold tracking-tight cursor-pointer"
              onClick={() => navigate("/")}
            >
              Beyond Borders
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowChat(true)}
              className="gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              WanderBot
            </Button>
            <Button variant="ghost" size="sm" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold tracking-tight mb-2">
            Welcome back, {user.name || "Traveler"}!
          </h2>
          <p className="text-muted-foreground">
            Ready to log your next adventure?
          </p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex gap-4">
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="gap-2 h-12 px-6"
            >
              <Plus className="h-5 w-5" />
              Create New Travel Log
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowChat(true)}
              className="gap-2 h-12 px-6"
            >
              <MessageCircle className="h-5 w-5" />
              Ask WanderBot
            </Button>
            <Button
              variant="outline"
              onClick={handleAddSampleData}
              className="gap-2 h-12 px-6"
            >
              <MapPin className="h-5 w-5" />
              Add Sample Data
            </Button>
          </div>
        </motion.div>

        {/* Travel Logs Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-xl font-semibold mb-6">Your Travel Logs</h3>
          
          {travelLogs === undefined ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-20 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : travelLogs.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h4 className="text-lg font-semibold mb-2">No travel logs yet</h4>
                <p className="text-muted-foreground mb-6">
                  Start documenting your adventures by creating your first travel log.
                </p>
                <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Your First Log
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {travelLogs.map((log, index) => (
                <motion.div
                  key={log._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Card 
                    className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/20"
                    onClick={() => navigate(`/travel-log/${log._id}`)}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="truncate">{log.title}</span>
                        {log.isActive && (
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                            Active
                          </span>
                        )}
                      </CardTitle>
                      {log.startDate && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {new Date(log.startDate).toLocaleDateString()}
                        </div>
                      )}
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {log.description || "No description added yet."}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Dialogs */}
      <CreateTravelLogDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog}
      />
      
      <WanderBotChat 
        open={showChat} 
        onOpenChange={setShowChat}
      />
    </div>
  );
}