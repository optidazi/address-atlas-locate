
import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Package, Route, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Delivery {
  id: string;
  what3words: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  status: 'pending' | 'in-transit' | 'delivered';
  addedAt: string;
  estimatedTime?: number; // minutes
}

const DeliveryManager = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [sortBy, setSortBy] = useState<'distance' | 'time' | 'added'>('distance');
  const [baseLocation] = useState({ lat: 51.5074, lng: -0.1278 }); // London center

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Sort deliveries based on selected criteria
  const sortedDeliveries = [...deliveries].sort((a, b) => {
    switch (sortBy) {
      case 'distance':
        const distanceA = calculateDistance(baseLocation.lat, baseLocation.lng, a.coordinates.lat, a.coordinates.lng);
        const distanceB = calculateDistance(baseLocation.lat, baseLocation.lng, b.coordinates.lat, b.coordinates.lng);
        return distanceA - distanceB;
      case 'time':
        return (a.estimatedTime || 0) - (b.estimatedTime || 0);
      case 'added':
        return new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime();
      default:
        return 0;
    }
  });

  // Listen for new deliveries from OCR scanner
  useEffect(() => {
    const handleAddDelivery = (event: CustomEvent) => {
      const newDelivery = {
        ...event.detail,
        estimatedTime: Math.floor(Math.random() * 45) + 15, // Random time 15-60 minutes
      };
      setDeliveries(prev => [...prev, newDelivery]);
    };

    window.addEventListener('addDelivery', handleAddDelivery as EventListener);
    return () => window.removeEventListener('addDelivery', handleAddDelivery as EventListener);
  }, []);

  // Sample deliveries for demonstration
  useEffect(() => {
    setDeliveries([
      {
        id: '1',
        what3words: '///index.home.raft',
        coordinates: { lat: 51.508112, lng: -0.075949 },
        status: 'pending',
        addedAt: new Date(Date.now() - 3600000).toISOString(),
        estimatedTime: 25,
      },
      {
        id: '2',
        what3words: '///daring.lion.race',
        coordinates: { lat: 51.495326, lng: -0.191406 },
        status: 'in-transit',
        addedAt: new Date(Date.now() - 7200000).toISOString(),
        estimatedTime: 35,
      },
    ]);
  }, []);

  const updateDeliveryStatus = (id: string, status: Delivery['status']) => {
    setDeliveries(prev => 
      prev.map(delivery => 
        delivery.id === id ? { ...delivery, status } : delivery
      )
    );
  };

  const getStatusColor = (status: Delivery['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in-transit': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
    }
  };

  const formatDistance = (delivery: Delivery) => {
    const distance = calculateDistance(
      baseLocation.lat, 
      baseLocation.lng, 
      delivery.coordinates.lat, 
      delivery.coordinates.lng
    );
    return `${distance.toFixed(1)} km`;
  };

  return (
    <div className="space-y-6">
      {/* Sort Controls */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Deliveries ({deliveries.length})</h3>
        <div className="flex items-center space-x-2">
          <ArrowUpDown className="h-4 w-4 text-gray-500" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-sm border rounded px-2 py-1"
          >
            <option value="distance">By Distance</option>
            <option value="time">By Time</option>
            <option value="added">By Added Time</option>
          </select>
        </div>
      </div>

      {/* Delivery List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {sortedDeliveries.length === 0 ? (
          <Card className="p-6 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No deliveries yet</p>
            <p className="text-sm text-gray-500">Scan what3words addresses to add deliveries</p>
          </Card>
        ) : (
          sortedDeliveries.map((delivery, index) => (
            <Card key={delivery.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                    <Badge className={getStatusColor(delivery.status)}>
                      {delivery.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="font-mono text-blue-600">{delivery.what3words}</span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Route className="h-4 w-4" />
                        <span>{formatDistance(delivery)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{delivery.estimatedTime}min</span>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      Added: {new Date(delivery.addedAt).toLocaleString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2 ml-4">
                  {delivery.status === 'pending' && (
                    <Button
                      size="sm"
                      onClick={() => updateDeliveryStatus(delivery.id, 'in-transit')}
                      className="text-xs"
                    >
                      Start
                    </Button>
                  )}
                  {delivery.status === 'in-transit' && (
                    <Button
                      size="sm"
                      onClick={() => updateDeliveryStatus(delivery.id, 'delivered')}
                      className="text-xs bg-green-600 hover:bg-green-700"
                    >
                      Complete
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Summary Stats */}
      {deliveries.length > 0 && (
        <Card className="p-4 bg-gray-50">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {deliveries.filter(d => d.status === 'pending').length}
              </p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">
                {deliveries.filter(d => d.status === 'in-transit').length}
              </p>
              <p className="text-sm text-gray-600">In Transit</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {deliveries.filter(d => d.status === 'delivered').length}
              </p>
              <p className="text-sm text-gray-600">Delivered</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default DeliveryManager;
