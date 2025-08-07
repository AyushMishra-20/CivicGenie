export interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface GeolocationPosition {
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
}

export class LocationService {
  static async getCurrentLocation(): Promise<LocationData> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position: GeolocationPosition) => {
          try {
            const { latitude, longitude } = position.coords;
            const addressData = await this.reverseGeocode(latitude, longitude);
            
            resolve({
              latitude,
              longitude,
              ...addressData
            });
          } catch (error) {
            reject(error);
          }
        },
        (error) => {
          reject(new Error(`Location access denied: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  static async reverseGeocode(latitude: number, longitude: number): Promise<Omit<LocationData, 'latitude' | 'longitude'>> {
    try {
      // Using OpenStreetMap Nominatim API for reverse geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=en`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch address data');
      }

      const data = await response.json();
      const address = data.display_name || 'Unknown Address';
      
      // Extract address components
      const addressParts = data.address || {};
      const city = addressParts.city || addressParts.town || addressParts.village || 'Unknown City';
      const state = addressParts.state || 'Unknown State';
      const pincode = addressParts.postcode || '000000';

      return {
        address,
        city,
        state,
        pincode
      };
    } catch (error) {
      // Fallback to basic address if geocoding fails
      return {
        address: `Location at ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        city: 'Unknown City',
        state: 'Unknown State',
        pincode: '000000'
      };
    }
  }

  static validateLocation(location: Partial<LocationData>): boolean {
    return !!(
      location.latitude &&
      location.longitude &&
      location.address &&
      location.city &&
      location.state &&
      location.pincode
    );
  }

  static formatAddress(location: LocationData): string {
    return `${location.address}, ${location.city}, ${location.state} - ${location.pincode}`;
  }

  static getDistanceFromMumbai(latitude: number, longitude: number): number {
    // Mumbai coordinates (approximate center)
    const mumbaiLat = 19.0760;
    const mumbaiLon = 72.8777;
    
    return this.calculateDistance(latitude, longitude, mumbaiLat, mumbaiLon);
  }

  private static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private static deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }
} 