import React from 'react';
import { NavLink } from 'react-router-dom';
import { MapPin, Radio, Cpu, Database, LogOut } from 'lucide-react';
import { auth } from '@/lib/auth';
import toast from 'react-hot-toast';

export function Sidebar() {
  const handleLogout = async () => {
    const { error } = await auth.signOut();
    if (error) {
      toast.error('Error logging out');
    }
  };

  return (
    <div className="flex flex-col h-full w-64 bg-white border-r border-gray-200">
      <div className="p-4">
        <h1 className="text-2xl font-bold text-gray-800">RFID Manager</h1>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          <li>
            <NavLink
              to="/locations"
              className={({ isActive }) =>
                `flex items-center p-2 text-gray-700 rounded-lg hover:bg-gray-100 ${
                  isActive ? 'bg-indigo-50 text-indigo-700' : ''
                }`
              }
            >
              <MapPin className="w-5 h-5 mr-3" />
              Locations
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/antennas"
              className={({ isActive }) =>
                `flex items-center p-2 text-gray-700 rounded-lg hover:bg-gray-100 ${
                  isActive ? 'bg-indigo-50 text-indigo-700' : ''
                }`
              }
            >
              <Radio className="w-5 h-5 mr-3" />
              Antennas
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/sensors"
              className={({ isActive }) =>
                `flex items-center p-2 text-gray-700 rounded-lg hover:bg-gray-100 ${
                  isActive ? 'bg-indigo-50 text-indigo-700' : ''
                }`
              }
            >
              <Cpu className="w-5 h-5 mr-3" />
              Sensors
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/readings"
              className={({ isActive }) =>
                `flex items-center p-2 text-gray-700 rounded-lg hover:bg-gray-100 ${
                  isActive ? 'bg-indigo-50 text-indigo-700' : ''
                }`
              }
            >
              <Database className="w-5 h-5 mr-3" />
              Readings
            </NavLink>
          </li>
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center w-full p-2 text-gray-700 rounded-lg hover:bg-gray-100"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
}