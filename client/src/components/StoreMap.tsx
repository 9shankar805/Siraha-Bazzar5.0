import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Loader2, Map, Star, Phone } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Store {
  id: number;
  name: string;
  address: string;
  latitude: string;
  longitude: string;
  phone: string;
  description?: string;
  ownerId: number;
  createdAt: Date;
  isActive: boolean;
  website?: string;
  logo?: string;
  rating?: number;
  totalReviews?: number;
  googleMapsLink?: string;
}

interface StoreWithDistance extends Store {
  distance: number;
}

// Custom icons for the map
const userIcon = L.icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const storeIcon = L.icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

export default function StoreMap() {
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
    googleMapsLink?: string;
    coordinates?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualLocation, setManualLocation] = useState({ lat: "", lon: "" });

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  };

  // Calculate direction using bearing formula
  const calculateDirection = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const y = Math.sin(dLon) * Math.cos(lat2 * Math.PI / 180);
    const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
      Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos(dLon);
    const bearing = Math.atan2(y, x) * 180 / Math.PI;

    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(bearing / 45) % 8;

    return directions[index];
  };

  const formatDistance = (distance: number) => {
    return distance >= 1
      ? `${distance.toFixed(1)}km`
      : `${(distance * 1000).toFixed(0)}m`;
  };

  // Get user's current location
  const getUserLocation = async () => {
    setLoading(true);
    setError(null);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation is not supported'));
          return;
        }
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      const googleMapsLink = `https://www.google.com/maps?q=${lat},${lng}`;
      const coordinates = `Latitude: ${lat.toFixed(6)}, Longitude: ${lng.toFixed(6)}`;

      setUserLocation({
        lat,
        lng,
        googleMapsLink,
        coordinates
      });
    } catch (err) {
      setError('Unable to get your location. Please make sure location services are enabled.');
      console.error('Error getting location:', err);
    } finally {
      setLoading(false);
    }
  };

  // Set manual location
  const setManualLocationHandler = () => {
    const lat = parseFloat(manualLocation.lat);
    const lon = parseFloat(manualLocation.lon);

    if (!isNaN(lat) && !isNaN(lon)) {
      const googleMapsLink = `https://www.google.com/maps?q=${lat},${lon}`;
      const coordinates = `Latitude: ${lat.toFixed(6)}, Longitude: ${lon.toFixed(6)}`;

      setUserLocation({
        lat,
        lng: lon,
        googleMapsLink,
        coordinates
      });
    }
  };

  // Fetch nearby stores when user location is available
  const { data: stores = [], isLoading: isLoadingStores } = useQuery<Store[]>({
    queryKey: ["/api/stores"],
  });

  const getNearbyStores = () => {
    if (!userLocation) return [];

    return stores.map(store => {
      const storeLocation = {
        lat: parseFloat(store.latitude || '0'),
        lng: parseFloat(store.longitude || '0')
      };

      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        storeLocation.lat,
        storeLocation.lng
      );

      const direction = calculateDirection(
        userLocation.lat,
        userLocation.lng,
        storeLocation.lat,
        storeLocation.lng
      );

      return {
        ...store,
        storeLocation,
        distance: `${formatDistance(distance)} (${direction})`
      };
    }).sort((a, b) => {
      const aDist = parseFloat(a.distance.split(' ')[0]);
      const bDist = parseFloat(b.distance.split(' ')[0]);
      return aDist - bDist;
    });
  };

  const nearbyStores = getNearbyStores();

  return (
    <Card className="mb-8 p-2 sm:p-4 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <h2 className="text-xl font-semibold">Nearby Stores</h2>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={getUserLocation}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Getting Location...
              </>
            ) : (
              <>
                <MapPin className="mr-2 h-4 w-4" />
                Refresh Location
              </>
            )}
          </Button>
          {userLocation && (
            <Button
              variant="outline"
              onClick={() => window.open(userLocation.googleMapsLink!, '_blank')}
              className="w-full sm:w-auto"
            >
              <Map className="mr-2 h-4 w-4" />
              View on Map
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="text-red-500 mb-4">{error}</div>
      )}

      {userLocation && (
        <div className="mb-4">
          <div className="text-sm text-gray-600 mb-2">Your Location:</div>
          <div className="bg-gray-100 p-3 rounded-md break-words">
            <code>{userLocation.coordinates}</code>
          </div>
        </div>
      )}

      {userLocation ? (
        nearbyStores.length > 0 ? (
          <div className="space-y-6">
            <div className="h-[300px] sm:h-[400px] rounded-md overflow-hidden relative z-0">
              <MapContainer
                center={[userLocation.lat, userLocation.lng]}
                zoom={13}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
                className="z-0"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker
                  position={[userLocation.lat, userLocation.lng]}
                  icon={userIcon}
                >
                  <Popup>Your Location</Popup>
                </Marker>
                {nearbyStores.map((store) => (
                  <Marker
                    key={store.id}
                    position={[store.storeLocation.lat, store.storeLocation.lng]}
                    icon={storeIcon}
                  >
                    <Popup>
                      <div className="space-y-1">
                        <h3 className="font-semibold">{store.name}</h3>
                        <p className="text-sm">{store.address}</p>
                        <p className="text-sm">{store.distance}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-2"
                          onClick={() => window.open(
                            `https://www.google.com/maps/dir/?api=1&destination=${store.storeLocation.lat},${store.storeLocation.lng}`,
                            '_blank'
                          )}
                        >
                          <Navigation className="mr-2 h-4 w-4" />
                          Directions
                        </Button>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {nearbyStores.map((store) => (
                <Card key={store.id} className="p-3 sm:p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-5 h-5 text-blue-500" />
                    <span className="font-medium">{store.name}</span>
                  </div>

                  <div className="text-sm text-gray-600 mb-2 break-words">
                    {store.address}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <Navigation className="w-4 h-4" />
                    <span>{store.distance}</span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(
                        `https://www.google.com/maps/dir/?api=1&destination=${store.storeLocation.lat},${store.storeLocation.lng}`,
                        '_blank'
                      )}
                      className="w-full sm:w-auto"
                    >
                      <Navigation className="mr-2 h-4 w-4" />
                      Directions
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(
                        store.googleMapsLink ||
                        `https://www.google.com/maps?q=${store.storeLocation.lat},${store.storeLocation.lng}`,
                        '_blank'
                      )}
                      className="w-full sm:w-auto"
                    >
                      <Map className="mr-2 h-4 w-4" />
                      View Map
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No nearby stores found
          </div>
        )
      ) : (
        !error && (
          <div className="text-center py-8 text-gray-500">
            Getting your location...
          </div>
        )
      )}

      <style jsx global>{`
        .leaflet-container {
          z-index: 0 !important;
        }
        .leaflet-control-container {
          z-index: 0 !important;
        }
        .leaflet-popup {
          z-index: 1 !important;
        }
        .leaflet-top,
        .leaflet-bottom {
          z-index: 0 !important;
        }
      `}</style>
    </Card>
  );
}