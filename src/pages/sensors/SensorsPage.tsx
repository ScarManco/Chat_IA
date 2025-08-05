import React, { useEffect, useState } from 'react';
import { db, Sensor, Antenna, Location } from '@/lib/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Edit, Trash2, Cpu } from 'lucide-react';
import toast from 'react-hot-toast';

export function SensorsPage() {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [antennas, setAntennas] = useState<Antenna[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [filteredSensors, setFilteredSensors] = useState<Sensor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAntenna, setFilterAntenna] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingSensor, setEditingSensor] = useState<Sensor | null>(null);

  // Form states
  const [formAntennaId, setFormAntennaId] = useState('');
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sensorTypes = [
    'Temperature',
    'Humidity',
    'Pressure',
    'Motion',
    'Light',
    'Proximity',
    'RFID Tag',
    'Other'
  ];

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterSensors();
  }, [sensors, searchTerm, filterAntenna, filterType]);

  const fetchData = async () => {
    try {
      await db.init();
      const [sensorsData, antennasData, locationsData] = await Promise.all([
        db.getSensors(),
        db.getAntennas(),
        db.getLocations()
      ]);
      setSensors(sensorsData);
      setAntennas(antennasData);
      setLocations(locationsData);
    } catch (error) {
      toast.error('Error fetching data');
      console.error('Error:', error);
    }
  };

  const filterSensors = () => {
    let filtered = sensors;

    if (searchTerm) {
      filtered = filtered.filter(sensor =>
        sensor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sensor.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterAntenna !== 'all') {
      filtered = filtered.filter(sensor => sensor.antenna_id === filterAntenna);
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(sensor => sensor.type === filterType);
    }

    setFilteredSensors(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (editingSensor) {
        await db.updateSensor(editingSensor.id, {
          antenna_id: formAntennaId,
          name: formName,
          type: formType
        });
        toast.success('Sensor updated successfully');
      } else {
        await db.createSensor(formAntennaId, formName, formType);
        toast.success('Sensor added successfully');
      }

      setIsAddDialogOpen(false);
      setEditingSensor(null);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(editingSensor ? 'Error updating sensor' : 'Error adding sensor');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormAntennaId('');
    setFormName('');
    setFormType('');
  };

  const startEdit = (sensor: Sensor) => {
    setEditingSensor(sensor);
    setFormAntennaId(sensor.antenna_id);
    setFormName(sensor.name);
    setFormType(sensor.type);
    setIsAddDialogOpen(true);
  };

  const deleteSensor = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este sensor?')) {
      try {
        await db.deleteSensor(id);
        fetchData();
        toast.success('Sensor deleted successfully');
      } catch (error) {
        toast.error('Error deleting sensor');
        console.error('Error:', error);
      }
    }
  };

  const getAntennaName = (antennaId: string) => {
    const antenna = antennas.find(a => a.id === antennaId);
    return antenna ? antenna.name : 'Unknown Antenna';
  };

  const getLocationName = (antennaId: string) => {
    const antenna = antennas.find(a => a.id === antennaId);
    if (!antenna) return 'Unknown Location';
    const location = locations.find(l => l.id === antenna.location_id);
    return location ? location.name : 'Unknown Location';
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'Temperature': 'bg-red-100 text-red-800',
      'Humidity': 'bg-blue-100 text-blue-800',
      'Pressure': 'bg-purple-100 text-purple-800',
      'Motion': 'bg-orange-100 text-orange-800',
      'Light': 'bg-yellow-100 text-yellow-800',
      'Proximity': 'bg-green-100 text-green-800',
      'RFID Tag': 'bg-indigo-100 text-indigo-800',
      'Other': 'bg-gray-100 text-gray-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Sensors</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) {
            setEditingSensor(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Sensor
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingSensor ? 'Edit Sensor' : 'Add New Sensor'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="antenna">Antenna</Label>
                <Select value={formAntennaId} onValueChange={setFormAntennaId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an antenna" />
                  </SelectTrigger>
                  <SelectContent>
                    {antennas.map((antenna) => (
                      <SelectItem key={antenna.id} value={antenna.id}>
                        {antenna.name} ({getLocationName(antenna.id)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Sensor Name</Label>
                <Input
                  id="name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Enter sensor name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Sensor Type</Label>
                <Select value={formType} onValueChange={setFormType} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sensor type" />
                  </SelectTrigger>
                  <SelectContent>
                    {sensorTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  {isLoading ? (editingSensor ? 'Updating...' : 'Adding...') : 
                   (editingSensor ? 'Update Sensor' : 'Add Sensor')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="search"
                placeholder="Search by name or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="filterAntenna">Filter by Antenna</Label>
            <Select value={filterAntenna} onValueChange={setFilterAntenna}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Antennas</SelectItem>
                {antennas.map((antenna) => (
                  <SelectItem key={antenna.id} value={antenna.id}>
                    {antenna.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="filterType">Filter by Type</Label>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {sensorTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
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
                setFilterAntenna('all');
                setFilterType('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-sm font-medium text-gray-500">Total Sensors</h3>
          <p className="text-2xl font-bold text-indigo-600">{sensors.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-sm font-medium text-gray-500">Active Sensors</h3>
          <p className="text-2xl font-bold text-green-600">
            {sensors.filter(s => s.status === 'active').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-sm font-medium text-gray-500">Sensor Types</h3>
          <p className="text-2xl font-bold text-blue-600">
            {new Set(sensors.map(s => s.type)).size}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-sm font-medium text-gray-500">Connected Antennas</h3>
          <p className="text-2xl font-bold text-purple-600">
            {new Set(sensors.map(s => s.antenna_id)).size}
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
                <TableHead>Type</TableHead>
                <TableHead>Antenna</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSensors.map((sensor) => (
                <TableRow key={sensor.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <Cpu className="w-4 h-4 mr-2 text-indigo-600" />
                      {sensor.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${getTypeColor(sensor.type)}`}>
                      {sensor.type}
                    </span>
                  </TableCell>
                  <TableCell>{getAntennaName(sensor.antenna_id)}</TableCell>
                  <TableCell>{getLocationName(sensor.antenna_id)}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(sensor.status)}`}>
                      {sensor.status}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(sensor.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(sensor)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteSensor(sensor.id)}
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