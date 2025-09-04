import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/apiService';
import { Settings as SettingsType, Fabric } from '../types';

interface SettingsProps {
  showAlert: (message: string) => void;
}

const Settings: React.FC<SettingsProps> = ({ showAlert }) => {
  const [settings, setSettings] = useState<SettingsType | null>(null);
  const [fabrics, setFabrics] = useState<Fabric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fabricPrices, setFabricPrices] = useState<Record<number, string>>({});

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [settingsData, fabricsData] = await Promise.all([
        apiService.getSettings(),
        apiService.getFabrics(),
      ]);
      setSettings(settingsData);
      setFabrics(fabricsData);
      const initialPrices: Record<number, string> = {};
      fabricsData.forEach(f => {
        initialPrices[f.id] = f.price_per_meter.toFixed(2);
      });
      setFabricPrices(initialPrices);
    } catch (error) {
      showAlert('Failed to load settings data.');
    } finally {
      setIsLoading(false);
    }
  }, [showAlert]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (settings) {
      setSettings({
        ...settings,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (settings) {
      const updatedSettings = {
        stitching_price: parseFloat(String(settings.stitching_price)),
        extra_hem_cm: parseFloat(String(settings.extra_hem_cm)),
      };
      await apiService.updateSettings(updatedSettings);
      showAlert('Settings updated successfully.');
    }
  };
  
  const handlePriceInputChange = (fabricId: number, value: string) => {
    setFabricPrices(prev => ({ ...prev, [fabricId]: value }));
  };
  
  const handleSavePrice = async (fabricId: number) => {
    const newPrice = parseFloat(fabricPrices[fabricId]);
    if (isNaN(newPrice) || newPrice < 0) {
      showAlert('Please enter a valid price.');
      return;
    }
    
    const result = await apiService.updateFabricPrice(fabricId, newPrice);
    // Fix: Restructured conditional to handle the error case first for correct type narrowing.
    if(!result.success) {
      showAlert(`Error: ${result.error}`);
      return;
    }
    
    showAlert('Fabric price updated successfully.');
    fetchData(); // Refresh data to confirm
  };

  if (isLoading) {
    return <div className="text-center p-10">Loading settings...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">General Settings</h2>
        {settings && (
          <form onSubmit={handleUpdateSettings} className="space-y-4 max-w-md">
            <div className="flex flex-col">
              <label className="mb-1 font-medium text-gray-700">Stitching Price (per piece)</label>
              <input type="number" step="0.01" name="stitching_price" value={settings.stitching_price} onChange={handleSettingsChange} className="border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"/>
            </div>
            <div className="flex flex-col">
              <label className="mb-1 font-medium text-gray-700">Extra Hem (in cm)</label>
              <input type="number" step="0.01" name="extra_hem_cm" value={settings.extra_hem_cm} onChange={handleSettingsChange} className="border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"/>
            </div>
            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition">Update Settings</button>
          </form>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Manage Fabric Prices</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 font-medium text-gray-600">Fabric Name</th>
                <th className="p-3 font-medium text-gray-600">Design Code</th>
                <th className="p-3 font-medium text-gray-600">Price per Meter</th>
                <th className="p-3 font-medium text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {fabrics.map(fabric => (
                <tr key={fabric.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{fabric.name}</td>
                  <td className="p-3">{fabric.design_code}</td>
                  <td className="p-3">
                    <input 
                      type="number" 
                      step="0.01" 
                      value={fabricPrices[fabric.id] || ''}
                      onChange={(e) => handlePriceInputChange(fabric.id, e.target.value)}
                      className="border border-gray-300 p-1 rounded-md w-24"
                    />
                  </td>
                  <td className="p-3">
                    <button onClick={() => handleSavePrice(fabric.id)} className="bg-indigo-500 text-white px-3 py-1 rounded text-sm hover:bg-indigo-600 transition">Save</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Settings;