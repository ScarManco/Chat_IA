import React, { useEffect, useState } from 'react';
import { db, Antenna, Location } from '@/lib/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Edit, Trash2, Radio } from 'lucide-react';
import toast from 'react-hot-toast';

export function AntennasPage() {
  const [antennas, setAntennas] = useState<Antenna[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [filteredAntennas, setFilteredAntennas] = useState<Antenna[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLocation, setFilterLocation] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAntenna, setEditingAntenna] = useState<Antenna | null>(null);

  // Form states
  const [formLocationId, setFormLocationId] = useState('');
  const [formName, setFormName] = useState('');
  const [formIpAddress, setFormIpAddress] = useState('');
  const [formPort, setFormPort] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterAntennas();
  }, [antennas, searchTerm, filterLocation]);

  const fetchData = async () => {
    try {
      await db.init();
      const [antennasData, locationsData] = await Promise.all([
        db.getAntennas(),
        db.getLocations()
      ]);
      setAntennas(antennasData);
      setLocations(locationsData);
    } catch (error) {
      toast.error('Error fetching data');
      console.error('Error:', error);
    }
  };

  const filterAntennas = () => {
    let filtered = antennas;

    if (searchTerm) {
      filtered = filtered.filter(antenna =>
        antenna.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        antenna.ip_address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterLocation !== 'all') {
      filtered = filtered.filter(antenna => antenna.location_id === filterLocation);
    }

    setFilteredAntennas(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (editingAntenna) {
        await db.updateAntenna(editingAntenna.id, {
          location_id: formLocationId,
          name: formName,
          ip_address: formIpAddress,
          port: parseInt(formPort)
        });
        toast.success('Antenna updated successfully');
      } else {
        await db.createAntenna(formLocationId, formName, formIpAddress, parseInt(formPort));
        toast.success('Antenna added successfully');
      }

      setIsAddDialogOpen(false);
      setEditingAntenna(null);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(editingAntenna ? 'Error updating antenna' : 'Error adding antenna');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormLocationId('');
    setFormName('');
    setFormIpAddress('');
    setFormPort('');
  };

  const startEdit = (antenna: Antenna) => {
    setEditingAntenna(antenna);
    setFormLocationId(antenna.location_id);
    setFormName(antenna.name);
    setFormIpAddress(antenna.ip_address);
    setFormPort(antenna.port.toString());
    setIsAddDialogOpen(true);
  };

  const deleteAntenna = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta antena?')) {
      try {
        await db.deleteAntenna(id);
        fetchData();
        toast.success('Antenna deleted successfully');
      } catch (error) {
        toast.error('Error deleting antenna');
        console.error('Error:', error);
      }
    }
  };

  const getLocationName = (locationId: string) => {
    const location = locations.find(l => l.id === locationId);
    return location ? location.name : 'Unknown Location';
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Antennas</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) {
            setEditingAntenna(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Antenna
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingAntenna ? 'Edit Antenna' : 'Add New Antenna'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Select value={formLocationId} onValueChange={setFormLocationId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Antenna Name</Label>
                <Input
                  id="name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Enter antenna name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ipAddress">IP Address</Label>
                <Input
                  id="ipAddress"
                  value={formIpAddress}
                  onChange={(e) => setFormIpAddress(e.target.value)}
                  placeholder="192.168.1.100"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="port">Port</Label>
                <Input
                  id="port"
                  type="number"
                  value={formPort}
                  onChange={(e) => setFormPort(e.target.value)}
                  placeholder="8080"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (editingAntenna ? 'Updating...' : 'Adding...') : 
                   (editingAntenna ? 'Update Antenna' : 'Add Antenna')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="search"
                placeholder="Search by name or IP address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="filterLocation">Filter by Location</Label>
            <Select value={filterLocation} onValueChange={setFilterLocation}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setFilterLocation('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-sm font-medium text-gray-500">Total Antennas</h3>
          <p className="text-2xl font-bold text-indigo-600">{antennas.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-sm font-medium text-gray-500">Active Antennas</h3>
          <p className="text-2xl font-bold text-green-600">
            {antennas.filter(a => a.status === 'active').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-sm font-medium text-gray-500">Locations Covered</h3>
          <p className="text-2xl font-bold text-blue-600">
            {new Set(antennas.map(a => a.location_id)).size}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md flex-1 overflow-hidden">
        <div className="overflow-auto h-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Port</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAntennas.map((antenna) => (
                <TableRow key={antenna.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <Radio className="w-4 h-4 mr-2 text-indigo-600" />
                      {antenna.name}
                    </div>
                  </TableCell>
                  <TableCell>{getLocationName(antenna.location_id)}</TableCell>
                  <TableCell className="font-mono">{antenna.ip_address}</TableCell>
                  <TableCell>{antenna.port}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(antenna.status)}`}>
                      {antenna.status}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(antenna.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(antenna)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteAntenna(antenna.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}