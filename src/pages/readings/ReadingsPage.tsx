import React, { useEffect, useState } from 'react';
import { db, Reading, Sensor, Antenna, Location } from '@/lib/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Filter, Download, Eye, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export function ReadingsPage() {
  const [readings, setReadings] = useState<Reading[]>([]);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [antennas, setAntennas] = useState<Antenna[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [filteredReadings, setFilteredReadings] = useState<Reading[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSensor, setFilterSensor] = useState('all');
  const [filterAntenna, setFilterAntenna] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedReading, setSelectedReading] = useState<Reading | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Form states
  const [formSensorId, setFormSensorId] = useState('');
  const [formTagId, setFormTagId] = useState('');
  const [formSignalStrength, setFormSignalStrength] = useState('');
  const [formData, setFormData] = useState('{}');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterReadings();
  }, [readings, searchTerm, filterSensor, filterAntenna]);

  const fetchData = async () => {
    try {
      await db.init();
      const [readingsData, sensorsData, antennasData, locationsData] = await Promise.all([
        db.getReadings(),
        db.getSensors(),
        db.getAntennas(),
        db.getLocations()
      ]);
      setReadings(readingsData);
      setSensors(sensorsData);
      setAntennas(antennasData);
      setLocations(locationsData);
    } catch (error) {
      toast.error('Error fetching data');
      console.error('Error:', error);
    }
  };

  const filterReadings = () => {
    let filtered = readings;

    if (searchTerm) {
      filtered = filtered.filter(reading =>
        reading.tag_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reading.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterSensor !== 'all') {
      filtered = filtered.filter(reading => reading.sensor_id === filterSensor);
    }

    if (filterAntenna !== 'all') {
      const sensorsByAntenna = sensors.filter(sensor => sensor.antenna_id === filterAntenna);
      const sensorIds = sensorsByAntenna.map(sensor => sensor.id);
      filtered = filtered.filter(reading => sensorIds.includes(reading.sensor_id));
    }

    setFilteredReadings(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let parsedData;
      try {
        parsedData = JSON.parse(formData);
      } catch {
        parsedData = { raw: formData };
      }

      await db.createReading(
        formSensorId,
        formTagId,
        parseFloat(formSignalStrength),
        parsedData
      );

      toast.success('Reading added successfully');
      setIsAddDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error('Error adding reading');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormSensorId('');
    setFormTagId('');
    setFormSignalStrength('');
    setFormData('{}');
  };

  const getSensorName = (sensorId: string) => {
    const sensor = sensors.find(s => s.id === sensorId);
    return sensor ? sensor.name : 'Unknown Sensor';
  };

  const getAntennaName = (sensorId: string) => {
    const sensor = sensors.find(s => s.id === sensorId);
    if (!sensor) return 'Unknown Antenna';
    const antenna = antennas.find(a => a.id === sensor.antenna_id);
    return antenna ? antenna.name : 'Unknown Antenna';
  };

  const getLocationName = (sensorId: string) => {
    const sensor = sensors.find(s => s.id === sensorId);
    if (!sensor) return 'Unknown Location';
    const antenna = antennas.find(a => a.id === sensor.antenna_id);
    if (!antenna) return 'Unknown Location';
    const location = locations.find(l => l.id === antenna.location_id);
    return location ? location.name : 'Unknown Location';
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Tag ID', 'Sensor', 'Antenna', 'Location', 'Signal Strength', 'Timestamp', 'Data'];
    const csvData = filteredReadings.map(reading => [
      reading.id,
      reading.tag_id,
      getSensorName(reading.sensor_id),
      getAntennaName(reading.sensor_id),
      getLocationName(reading.sensor_id),
      reading.signal_strength,
      new Date(reading.timestamp).toLocaleString(),
      JSON.stringify(reading.data)
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `readings-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const deleteReading = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta lectura?')) {
      try {
        const updatedReadings = readings.filter(r => r.id !== id);
        await db.saveReadings(updatedReadings);
        setReadings(updatedReadings);
        toast.success('Reading deleted successfully');
      } catch (error) {
        toast.error('Error deleting reading');
        console.error('Error:', error);
      }
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">RFID Readings</h1>
        <div className="flex gap-2">
          <Button onClick={exportToCSV} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Reading
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Reading</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sensor">Sensor</Label>
                  <Select value={formSensorId} onValueChange={setFormSensorId} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a sensor" />
                    </SelectTrigger>
                    <SelectContent>
                      {sensors.map((sensor) => (
                        <SelectItem key={sensor.id} value={sensor.id}>
                          {sensor.name} ({getAntennaName(sensor.id)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tagId">Tag ID</Label>
                  <Input
                    id="tagId"
                    value={formTagId}
                    onChange={(e) => setFormTagId(e.target.value)}
                    placeholder="Enter tag ID"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signalStrength">Signal Strength (dBm)</Label>
                  <Input
                    id="signalStrength"
                    type="number"
                    step="0.1"
                    value={formSignalStrength}
                    onChange={(e) => setFormSignalStrength(e.target.value)}
                    placeholder="e.g., -45.5"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data">Additional Data (JSON)</Label>
                  <textarea
                    id="data"
                    value={formData}
                    onChange={(e) => setFormData(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                    rows={3}
                    placeholder='{"temperature": 25, "humidity": 60}'
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Adding...' : 'Add Reading'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
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
                placeholder="Search by tag ID or reading ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="filterSensor">Filter by Sensor</Label>
            <Select value={filterSensor} onValueChange={setFilterSensor}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sensors</SelectItem>
                {sensors.map((sensor) => (
                  <SelectItem key={sensor.id} value={sensor.id}>
                    {sensor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setFilterSensor('all');
                setFilterAntenna('all');
              }}
            >
              <Filter className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-sm font-medium text-gray-500">Total Readings</h3>
          <p className="text-2xl font-bold text-indigo-600">{readings.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-sm font-medium text-gray-500">Filtered Results</h3>
          <p className="text-2xl font-bold text-green-600">{filteredReadings.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-sm font-medium text-gray-500">Unique Tags</h3>
          <p className="text-2xl font-bold text-blue-600">
            {new Set(readings.map(r => r.tag_id)).size}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-sm font-medium text-gray-500">Active Sensors</h3>
          <p className="text-2xl font-bold text-purple-600">
            {new Set(readings.map(r => r.sensor_id)).size}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md flex-1 overflow-hidden">
        <div className="overflow-auto h-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tag ID</TableHead>
                <TableHead>Sensor</TableHead>
                <TableHead>Antenna</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Signal Strength</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReadings.map((reading) => (
                <TableRow key={reading.id}>
                  <TableCell className="font-medium">{reading.tag_id}</TableCell>
                  <TableCell>{getSensorName(reading.sensor_id)}</TableCell>
                  <TableCell>{getAntennaName(reading.sensor_id)}</TableCell>
                  <TableCell>{getLocationName(reading.sensor_id)}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      reading.signal_strength > -30 ? 'bg-green-100 text-green-800' :
                      reading.signal_strength > -60 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {reading.signal_strength} dBm
                    </span>
                  </TableCell>
                  <TableCell>{new Date(reading.timestamp).toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedReading(reading);
                          setIsViewDialogOpen(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteReading(reading.id)}
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

      {/* View Reading Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Reading Details</DialogTitle>
          </DialogHeader>
          {selectedReading && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Reading ID</Label>
                  <p className="text-sm text-gray-600">{selectedReading.id}</p>
                </div>
                <div>
                  <Label>Tag ID</Label>
                  <p className="text-sm text-gray-600">{selectedReading.tag_id}</p>
                </div>
                <div>
                  <Label>Sensor</Label>
                  <p className="text-sm text-gray-600">{getSensorName(selectedReading.sensor_id)}</p>
                </div>
                <div>
                  <Label>Antenna</Label>
                  <p className="text-sm text-gray-600">{getAntennaName(selectedReading.sensor_id)}</p>
                </div>
                <div>
                  <Label>Location</Label>
                  <p className="text-sm text-gray-600">{getLocationName(selectedReading.sensor_id)}</p>
                </div>
                <div>
                  <Label>Signal Strength</Label>
                  <p className="text-sm text-gray-600">{selectedReading.signal_strength} dBm</p>
                </div>
                <div className="col-span-2">
                  <Label>Timestamp</Label>
                  <p className="text-sm text-gray-600">{new Date(selectedReading.timestamp).toLocaleString()}</p>
                </div>
              </div>
              <div>
                <Label>Additional Data</Label>
                <pre className="bg-gray-100 p-3 rounded-md text-sm overflow-auto max-h-40">
                  {JSON.stringify(selectedReading.data, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}