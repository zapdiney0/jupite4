import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Package, MapPin, Calendar, Truck, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Shipment {
  id: string;
  tracking_number: string;
  sender_name: string;
  sender_address: string;
  recipient_name: string;
  recipient_address: string;
  package_description: string;
  weight: number;
  service_type: string;
  status: string;
  origin_city: string;
  destination_city: string;
  estimated_delivery: string;
  actual_delivery: string;
  shipping_cost: number;
  created_at: string;
}

interface StatusHistory {
  id: string;
  status: string;
  location: string;
  description: string;
  timestamp: string;
}

export default function TrackShipment() {
  const [searchParams] = useSearchParams();
  const [trackingNumber, setTrackingNumber] = useState(searchParams.get('number') || '');
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [statusHistory, setStatusHistory] = useState<StatusHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const number = searchParams.get('number');
    if (number) {
      setTrackingNumber(number);
      handleTrack(number);
    }
  }, [searchParams]);

  const handleTrack = async (number?: string) => {
    const numberToTrack = number || trackingNumber;
    if (!numberToTrack.trim()) {
      toast({
        title: "Error",
        description: "Please enter a tracking number",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      // Fetch shipment details
      const { data: shipmentData, error: shipmentError } = await supabase
        .from('shipments')
        .select('*')
        .eq('tracking_number', numberToTrack.toUpperCase())
        .single();

      if (shipmentError) {
        setShipment(null);
        setStatusHistory([]);
        toast({
          title: "Not Found",
          description: "No shipment found with this tracking number",
          variant: "destructive",
        });
        return;
      }

      setShipment(shipmentData);

      // Fetch status history
      const { data: historyData, error: historyError } = await supabase
        .from('shipment_status_history')
        .select('*')
        .eq('shipment_id', shipmentData.id)
        .order('timestamp', { ascending: false });

      if (!historyError) {
        setStatusHistory(historyData || []);
      }

    } catch (error) {
      console.error('Error tracking shipment:', error);
      toast({
        title: "Error",
        description: "Failed to track shipment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-accent" />;
      case 'in_transit':
        return <Truck className="w-5 h-5 text-primary" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-warning" />;
      default:
        return <AlertCircle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-accent';
      case 'in_transit':
        return 'bg-primary';
      case 'pending':
        return 'bg-warning';
      default:
        return 'bg-muted-foreground';
    }
  };

  const formatStatus = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Track Your Shipment</h1>
          <p className="text-muted-foreground text-lg">
            Enter your tracking number to get real-time updates on your package
          </p>
        </div>

        {/* Search */}
        <Card className="mb-8 shadow-soft">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Enter tracking number (e.g., SH001234567)"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="text-lg h-12"
                  onKeyPress={(e) => e.key === 'Enter' && handleTrack()}
                />
              </div>
              <Button 
                onClick={() => handleTrack()} 
                disabled={loading}
                className="px-8 h-12 primary-gradient shadow-medium"
              >
                <Search className="w-5 h-5 mr-2" />
                {loading ? 'Tracking...' : 'Track'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {searched && (
          <div className="space-y-6">
            {shipment ? (
              <>
                {/* Shipment Overview */}
                <Card className="shadow-soft">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Package className="w-6 h-6" />
                        {shipment.tracking_number}
                      </CardTitle>
                      <Badge className={`${getStatusColor(shipment.status)} text-white`}>
                        {formatStatus(shipment.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div>
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          From
                        </h3>
                        <p className="text-sm text-muted-foreground">{shipment.sender_name}</p>
                        <p className="text-sm text-muted-foreground">{shipment.origin_city}</p>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          To
                        </h3>
                        <p className="text-sm text-muted-foreground">{shipment.recipient_name}</p>
                        <p className="text-sm text-muted-foreground">{shipment.destination_city}</p>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Delivery
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {shipment.actual_delivery 
                            ? `Delivered: ${new Date(shipment.actual_delivery).toLocaleDateString()}`
                            : `Expected: ${new Date(shipment.estimated_delivery).toLocaleDateString()}`
                          }
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-6 border-t border-border">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Service Type:</span>
                          <span className="ml-2 font-medium">{formatStatus(shipment.service_type)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Weight:</span>
                          <span className="ml-2 font-medium">{shipment.weight} kg</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Cost:</span>
                          <span className="ml-2 font-medium">${shipment.shipping_cost}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Tracking Timeline */}
                <Card className="shadow-soft">
                  <CardHeader>
                    <CardTitle>Tracking History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {statusHistory.map((entry, index) => (
                        <div key={entry.id} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            {getStatusIcon(entry.status)}
                            {index < statusHistory.length - 1 && (
                              <div className="w-px bg-border h-12 mt-2" />
                            )}
                          </div>
                          <div className="flex-1 pb-4">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-medium">{formatStatus(entry.status)}</h4>
                              <span className="text-sm text-muted-foreground">
                                {new Date(entry.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">
                              {entry.location}
                            </p>
                            <p className="text-sm">{entry.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="text-center py-12 shadow-soft">
                <CardContent>
                  <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Shipment Not Found</h3>
                  <p className="text-muted-foreground mb-4">
                    We couldn't find a shipment with tracking number "{trackingNumber}"
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Please check your tracking number and try again. Tracking numbers are usually 10-12 characters long.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Sample Tracking Numbers */}
        {!searched && (
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Try These Sample Tracking Numbers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['SH001234567', 'SH001234568', 'SH001234569'].map((number) => (
                  <Button
                    key={number}
                    variant="outline"
                    onClick={() => {
                      setTrackingNumber(number);
                      handleTrack(number);
                    }}
                    className="text-left justify-start"
                  >
                    {number}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}