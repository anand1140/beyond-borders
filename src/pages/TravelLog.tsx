import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  MapPin, 
  Plus, 
  Save, 
  Trash2, 
  Calendar,
  MessageCircle,
  Edit3,
  X
} from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import WanderBotChat from "@/components/WanderBotChat";
import InteractiveMap from "@/components/InteractiveMap";
import { Id } from "@/convex/_generated/dataModel";

export default function TravelLog() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showChat, setShowChat] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<any>(null);
  const [isAddingDestination, setIsAddingDestination] = useState(false);
  const [newDestination, setNewDestination] = useState<{
    name: string;
    notes: string;
    category: string;
    lat?: number;
    lng?: number;
  }>({
    name: "",
    notes: "",
    category: "",
  });

  // Reset add mode and pending draft whenever we enter this page or id changes
  useEffect(() => {
    setIsAddingDestination(false);
    setNewDestination({ name: "", notes: "", category: "" });
  }, [id]);

  const travelLog = useQuery(
    api.travelLogs.getTravelLog,
    user && id ? { id: id as Id<"travelLogs"> } : "skip"
  );
  
  const addDestination = useMutation(api.destinations.addDestination);
  const updateDestination = useMutation(api.destinations.updateDestination);
  const deleteDestination = useMutation(api.destinations.deleteDestination);

  const destinations = useQuery(
    api.destinations.getDestinations,
    user && id ? { travelLogId: id as Id<"travelLogs"> } : "skip"
  );

  if (!user) {
    navigate("/auth");
    return null;
  }

  if (!id) {
    navigate("/dashboard");
    return null;
  }

  const handleMapClick = (lat: number, lng: number) => {
    if (isAddingDestination) {
      setNewDestination(prev => ({
        ...prev,
        lat,
        lng,
        // Auto-fill a name using coordinates if none is set
        name: prev.name?.trim() ? prev.name : `${lat.toFixed(5)}, ${lng.toFixed(5)}`
      }));
    }
  };

  const handleAddDestination = async () => {
    if (!newDestination.name.trim() || !newDestination.lat || !newDestination.lng) {
      toast.error("Please select a location on the map and enter a name");
      return;
    }

    try {
      await addDestination({
        travelLogId: id as Id<"travelLogs">,
        name: newDestination.name.trim(),
        latitude: newDestination.lat,
        longitude: newDestination.lng,
        notes: newDestination.notes.trim() || undefined,
        category: newDestination.category.trim() || undefined,
        visitedDate: Date.now(),
      });

      toast.success("Destination added successfully!");
      // Ensure add mode fully resets to avoid map capturing clicks later
      setIsAddingDestination(false);
      setNewDestination({ name: "", notes: "", category: "" });
    } catch (error) {
      toast.error("Failed to add destination");
      console.error(error);
    }
  };

  const handleUpdateDestination = async () => {
    if (!selectedDestination || !selectedDestination.name.trim()) {
      toast.error("Please enter a name for the destination");
      return;
    }

    try {
      await updateDestination({
        id: selectedDestination._id,
        name: selectedDestination.name.trim(),
        notes: selectedDestination.notes?.trim() || undefined,
        category: selectedDestination.category?.trim() || undefined,
      });

      toast.success("Destination updated successfully!");
      setSelectedDestination(null);
    } catch (error) {
      toast.error("Failed to update destination");
      console.error(error);
    }
  };

  const handleDeleteDestination = async (destinationId: Id<"destinations">) => {
    const ok = window.confirm("Delete this destination? This cannot be undone.");
    if (!ok) return;
    try {
      await deleteDestination({ id: destinationId });
      toast.success("Destination deleted successfully!");
      setSelectedDestination(null);
    } catch (error) {
      toast.error("Failed to delete destination");
      console.error(error);
    }
  };

  if (travelLog === undefined) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading travel log...</p>
        </div>
      </div>
    );
  }

  if (!travelLog) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Travel log not found</h2>
          <p className="text-muted-foreground mb-4">
            The travel log you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-bold tracking-tight">{travelLog.title}</h1>
              {travelLog.startDate && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {new Date(travelLog.startDate).toLocaleDateString()}
                  {travelLog.endDate && (
                    <span> - {new Date(travelLog.endDate).toLocaleDateString()}</span>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowChat(true)}
              className="gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              WanderBot
            </Button>
            <Button
              variant={isAddingDestination ? "default" : "outline"}
              size="sm"
              onClick={() => setIsAddingDestination(!isAddingDestination)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              {isAddingDestination ? "Cancel" : "Add Place"}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-col md:flex-row h-auto md:h-[calc(100vh-73px)]">
        {/* Map Section */}
        <div className="flex-1 relative h-[50vh] md:h-auto">
          <InteractiveMap
            destinations={destinations || []}
            onMapClick={handleMapClick}
            onDestinationClick={setSelectedDestination}
            isAddingMode={isAddingDestination}
            pendingLatLng={
              newDestination.lat && newDestination.lng
                ? { lat: newDestination.lat, lng: newDestination.lng }
                : undefined
            }
          />
          
          {isAddingDestination && (
            null
          )}
        </div>

        {/* Sidebar */}
        <div className="w-full md:w-80 border-t md:border-l bg-muted/30">
          <div className="p-6 border-b">
            <h3 className="font-semibold mb-2">Trip Details</h3>
            <p className="text-sm text-muted-foreground">
              {travelLog.description || "No description added yet."}
            </p>
            <div className="mt-4 text-sm">
              <span className="font-medium">{destinations?.length || 0}</span> destinations added
            </div>
          </div>

          {/* Add New Destination form (shown when adding mode is active) */}
          {isAddingDestination && (
            <div className="p-6 border-b space-y-4">
              <h4 className="font-medium">Add New Destination</h4>
              <div>
                <Label htmlFor="add-name">Place Name *</Label>
                <Input
                  id="add-name"
                  placeholder="Auto-filled from map click"
                  value={newDestination.name}
                  onChange={(e) =>
                    setNewDestination((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Latitude</Label>
                  <Input
                    readOnly
                    value={
                      newDestination.lat !== undefined
                        ? newDestination.lat.toFixed(5)
                        : ""
                    }
                    placeholder="Click map"
                  />
                </div>
                <div>
                  <Label>Longitude</Label>
                  <Input
                    readOnly
                    value={
                      newDestination.lng !== undefined
                        ? newDestination.lng.toFixed(5)
                        : ""
                    }
                    placeholder="Click map"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="add-category">Category</Label>
                <Input
                  id="add-category"
                  placeholder="e.g., Temple, Restaurant, Hotel"
                  value={newDestination.category}
                  onChange={(e) =>
                    setNewDestination((prev) => ({ ...prev, category: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="add-notes">Notes</Label>
                <Textarea
                  id="add-notes"
                  placeholder="Add your thoughts about this place..."
                  value={newDestination.notes}
                  onChange={(e) =>
                    setNewDestination((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddDestination} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  Add to Log
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    // Explicitly exit add mode and clear pending pin
                    setIsAddingDestination(false);
                    setNewDestination({ name: "", notes: "", category: "" });
                  }}
                >
                  Cancel
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Tip: Click on the map to auto-fill the coordinates and name.
              </p>
            </div>
          )}

          <ScrollArea className="h-[calc(100vh-200px)] md:h-[calc(100vh-200px)]">
            <div className="p-6 space-y-4">
              <h4 className="font-medium">Destinations</h4>
              
              {destinations === undefined ? (
                <div className="text-center py-8">
                  <MapPin className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Loading destinations...</p>
                </div>
              ) : !destinations || destinations.length === 0 ? (
                <div className="text-center py-8">
                  <MapPin className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No destinations added yet. Click "Add Place" to start mapping your journey!
                  </p>
                </div>
              ) : (
                destinations.map((destination) => (
                  <motion.div
                    key={destination._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card 
                      className={`cursor-pointer transition-colors ${
                        selectedDestination?._id === destination._id 
                          ? "border-primary bg-primary/5" 
                          : "hover:bg-muted/50"
                      }`}
                      onClick={() => setSelectedDestination(destination)}
                    >
                      <CardContent
                        className="p-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium truncate">{destination.name}</h5>
                            {destination.category && (
                              <span className="text-xs bg-muted px-2 py-1 rounded-full mt-1 inline-block">
                                {destination.category}
                              </span>
                            )}
                            {destination.notes && (
                              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                {destination.notes}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDestination(destination);
                              }}
                              onMouseDown={(e) => e.stopPropagation()}
                              onPointerDown={(e) => e.stopPropagation()}
                              aria-label="Edit destination"
                            >
                              <Edit3 className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                void handleDeleteDestination(destination._id);
                              }}
                              onMouseDown={(e) => e.stopPropagation()}
                              onPointerDown={(e) => e.stopPropagation()}
                              aria-label="Delete destination"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Edit Destination Dialog */}
      {selectedDestination && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedDestination(null)}
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            className="bg-background rounded-lg p-6 w-full max-w-md"
          >
            <h3 className="text-lg font-semibold mb-4">Edit Destination</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Place Name *</Label>
                <Input
                  id="edit-name"
                  value={selectedDestination.name}
                  onChange={(e) => setSelectedDestination((prev: any) => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit-category">Category</Label>
                <Input
                  id="edit-category"
                  value={selectedDestination.category || ""}
                  onChange={(e) => setSelectedDestination((prev: any) => ({ ...prev, category: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit-notes">Notes</Label>
                <Textarea
                  id="edit-notes"
                  value={selectedDestination.notes || ""}
                  onChange={(e) => setSelectedDestination((prev: any) => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button onClick={handleUpdateDestination} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  void handleDeleteDestination(selectedDestination._id);
                }}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedDestination(null)}
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}

      <WanderBotChat open={showChat} onOpenChange={setShowChat} />
    </div>
  );
}