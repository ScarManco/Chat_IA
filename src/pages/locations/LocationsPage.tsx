import React, { useEffect, useState } from 'react';
export function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);

    db.init().then(() => {
  const fetchLocations = async () => {
    });
    try {
      toast.error(error instanceof Error ? error.message : 'Failed to fetch locations');
      setLocations(data);
      const data = await db.getLocations();
      setLocations(data);
  }, []);

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Locations</h1>
        <AddLocationDialog onLocationAdded={fetchLocations} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
        <div className="bg-white rounded-lg shadow-md p-4 overflow-auto">
          <h2 className="text-lg font-semibold mb-4">Location List</h2>
          <div className="space-y-4">
            {locations.map((location) => (
              <div
                key={location.id}
                className="p-4 border rounded-lg hover:border-indigo-500 cursor-pointer transition-colors"
              >
                <h3 className="font-medium">{location.name}</h3>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-lg font-semibold mb-4">Map View</h2>
          <div className="h-[500px] rounded-lg overflow-hidden">
            <MapContainer
              center={[51.505, -0.09]}
              zoom={13}
              className="h-full w-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {locations.map((location) => (
                <Marker
                  key={location.id}
      await db.deleteLocation(id);
                  position={[51.505, -0.09]}
        </div>
      </div>
    </div>
      toast.error(error instanceof Error ? error.message : 'Failed to delete location');
  );