import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Eye, Package, Users, BarChart3, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Shipment {
  id: string;
  tracking_number: string;
  sender_name: string;
  recipient_name: string;
  status: string;
  origin_city: string;
  destination_city: string;
  service_type: string;
  shipping_cost: number;
  created_at: string;
}

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
}

export default function AdminPanel() {
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    tracking_number: "",
    sender_name: "",
    sender_address: "",
    sender_phone: "",
    recipient_name: "",
    recipient_address: "",
    recipient_phone: "",
    package_description: "",
    weight: "",
    service_type: "standard",
    status: "pending",
    origin_city: "",
    destination_city: "",
    estimated_delivery: "",
    shipping_cost: "",
  });

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkUserAccess();
  }, []);

  const checkUserAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/auth");
      return;
    }

    setUser(user);

    // Check if user is admin
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error || !profile || profile.role !== 'admin') {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin panel",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    setUserProfile(profile);
    fetchData();
  };

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch shipments
    const { data: shipmentsData, error: shipmentsError } = await supabase
      .from('shipments')
      .select('*')
      .order('created_at', { ascending: false });

    if (!shipmentsError) {
      setShipments(shipmentsData || []);
    }

    // Fetch profiles
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (!profilesError) {
      setProfiles(profilesData || []);
    }

    setLoading(false);
  };

  const generateTrackingNumber = () => {
    const prefix = "SH";
    const number = Math.random().toString().slice(2, 11);
    return `${prefix}${number}`;
  };

  const handleCreateShipment = async () => {
    if (!formData.sender_name || !formData.recipient_name || !formData.origin_city || !formData.destination_city) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const trackingNumber = editingShipment?.tracking_number || generateTrackingNumber();
    
    const shipmentData = {
      ...formData,
      tracking_number: trackingNumber,
      weight: parseFloat(formData.weight) || 0,
      shipping_cost: parseFloat(formData.shipping_cost) || 0,
    };

    let error;
    if (editingShipment) {
      const { error: updateError } = await supabase
        .from('shipments')
        .update(shipmentData)
        .eq('id', editingShipment.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('shipments')
        .insert([shipmentData]);
      error = insertError;

      // Add initial status history
      if (!insertError) {
        const { data: newShipment } = await supabase
          .from('shipments')
          .select('id')
          .eq('tracking_number', trackingNumber)
          .single();

        if (newShipment) {
          await supabase
            .from('shipment_status_history')
            .insert([{
              shipment_id: newShipment.id,
              status: formData.status,
              location: formData.origin_city,
              description: "Package received and processed",
            }]);
        }
      }
    }

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: editingShipment ? "Shipment updated successfully" : "Shipment created successfully",
      });
      setIsCreateDialogOpen(false);
      setEditingShipment(null);
      resetForm();
      fetchData();
    }
  };

  const handleDeleteShipment = async (id: string) => {
    const { error } = await supabase
      .from('shipments')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Shipment deleted successfully",
      });
      fetchData();
    }
  };

  const resetForm = () => {
    setFormData({
      tracking_number: "",
      sender_name: "",
      sender_address: "",
      sender_phone: "",
      recipient_name: "",
      recipient_address: "",
      recipient_phone: "",
      package_description: "",
      weight: "",
      service_type: "standard",
      status: "pending",
      origin_city: "",
      destination_city: "",
      estimated_delivery: "",
      shipping_cost: "",
    });
  };

  const handleEdit = (shipment: Shipment) => {
    setEditingShipment(shipment);
    setFormData({
      tracking_number: shipment.tracking_number,
      sender_name: shipment.sender_name,
      sender_address: "",
      sender_phone: "",
      recipient_name: shipment.recipient_name,
      recipient_address: "",
      recipient_phone: "",
      package_description: "",
      weight: "",
      service_type: shipment.service_type,
      status: shipment.status,
      origin_city: shipment.origin_city,
      destination_city: shipment.destination_city,
      estimated_delivery: "",
      shipping_cost: shipment.shipping_cost.toString(),
    });
    setIsCreateDialogOpen(true);
  };

  const filteredShipments = shipments.filter(shipment => {
    const matchesSearch = shipment.tracking_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shipment.sender_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shipment.recipient_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || shipment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatStatus = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading admin panel...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
        <p className="text-muted-foreground">
          Welcome back, {userProfile?.full_name}. Manage shipments and users from this dashboard.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shipments</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shipments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profiles.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Transit</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {shipments.filter(s => s.status === 'in_transit').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="shipments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="shipments">Shipments</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="shipments" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search shipments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_transit">In Transit</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="primary-gradient" onClick={resetForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Shipment
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingShipment ? "Edit Shipment" : "Create New Shipment"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingShipment ? "Update shipment details" : "Add a new shipment to the system"}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sender_name">Sender Name *</Label>
                    <Input
                      id="sender_name"
                      value={formData.sender_name}
                      onChange={(e) => setFormData({...formData, sender_name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="recipient_name">Recipient Name *</Label>
                    <Input
                      id="recipient_name"
                      value={formData.recipient_name}
                      onChange={(e) => setFormData({...formData, recipient_name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sender_address">Sender Address</Label>
                    <Input
                      id="sender_address"
                      value={formData.sender_address}
                      onChange={(e) => setFormData({...formData, sender_address: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="recipient_address">Recipient Address</Label>
                    <Input
                      id="recipient_address"
                      value={formData.recipient_address}
                      onChange={(e) => setFormData({...formData, recipient_address: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="origin_city">Origin City *</Label>
                    <Input
                      id="origin_city"
                      value={formData.origin_city}
                      onChange={(e) => setFormData({...formData, origin_city: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="destination_city">Destination City *</Label>
                    <Input
                      id="destination_city"
                      value={formData.destination_city}
                      onChange={(e) => setFormData({...formData, destination_city: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="service_type">Service Type</Label>
                    <Select value={formData.service_type} onValueChange={(value) => setFormData({...formData, service_type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="express">Express</SelectItem>
                        <SelectItem value="international">International</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_transit">In Transit</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      value={formData.weight}
                      onChange={(e) => setFormData({...formData, weight: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shipping_cost">Shipping Cost ($)</Label>
                    <Input
                      id="shipping_cost"
                      type="number"
                      step="0.01"
                      value={formData.shipping_cost}
                      onChange={(e) => setFormData({...formData, shipping_cost: e.target.value})}
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="package_description">Package Description</Label>
                    <Textarea
                      id="package_description"
                      value={formData.package_description}
                      onChange={(e) => setFormData({...formData, package_description: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <Button variant="outline" onClick={() => {
                    setIsCreateDialogOpen(false);
                    setEditingShipment(null);
                    resetForm();
                  }}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateShipment} className="primary-gradient">
                    {editingShipment ? "Update" : "Create"} Shipment
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tracking Number</TableHead>
                    <TableHead>Sender</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredShipments.map((shipment) => (
                    <TableRow key={shipment.id}>
                      <TableCell className="font-mono">{shipment.tracking_number}</TableCell>
                      <TableCell>{shipment.sender_name}</TableCell>
                      <TableCell>{shipment.recipient_name}</TableCell>
                      <TableCell>{shipment.origin_city} → {shipment.destination_city}</TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(shipment.status)} text-white`}>
                          {formatStatus(shipment.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>${shipment.shipping_cost}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(shipment)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDeleteShipment(shipment.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage user accounts and permissions
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profiles.map((profile) => (
                    <TableRow key={profile.id}>
                      <TableCell>{profile.full_name || 'N/A'}</TableCell>
                      <TableCell>{profile.email}</TableCell>
                      <TableCell>
                        <Badge variant={profile.role === 'admin' ? 'default' : 'secondary'}>
                          {profile.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(profile.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}