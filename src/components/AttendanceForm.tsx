import React, { useState, useEffect } from 'react';

interface LocationStatus {
  isLocationValid: boolean;
  isLocationChecked: boolean;
  locationError: string | null;
  distance?: number;
}

const AttendanceForm: React.FC = () => {
  const [isFormActive, setIsFormActive] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [locationStatus, setLocationStatus] = useState<LocationStatus>({
    isLocationValid: false,
    isLocationChecked: false,
    locationError: null
  });

  // Newell-Simon Hall coordinates (approximate)
  const NSH_COORDINATES = {
    lat: 40.4435, // latitude
    lon: -79.9459 // longitude
  };
  const ALLOWED_RADIUS_METERS = 150; // Allow 150 meter radius to account for GPS accuracy

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Radius of Earth in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  // Check user's location
  const checkLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus({
        isLocationValid: false,
        isLocationChecked: true,
        locationError: 'Geolocation is not supported by this browser'
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLon = position.coords.longitude;
        const distance = calculateDistance(
          userLat, 
          userLon, 
          NSH_COORDINATES.lat, 
          NSH_COORDINATES.lon
        );

        setLocationStatus({
          isLocationValid: distance <= ALLOWED_RADIUS_METERS,
          isLocationChecked: true,
          locationError: null,
          distance: Math.round(distance)
        });
      },
      (error) => {
        let errorMessage = 'Unable to access your location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        
        setLocationStatus({
          isLocationValid: false,
          isLocationChecked: true,
          locationError: errorMessage
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000 // Cache for 1 minute
      }
    );
  };

  useEffect(() => {
    const checkFormAvailability = () => {
      const now = new Date();
      
      setCurrentTime(now);
      
      // Get Eastern Time components using Intl.DateTimeFormat
      const easternFormatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/New_York',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      
      const easternParts = easternFormatter.formatToParts(now);
      const easternYear = parseInt(easternParts.find(p => p.type === 'year')?.value || '2024');
      const easternMonth = parseInt(easternParts.find(p => p.type === 'month')?.value || '1') - 1; // Month is 0-indexed
      const easternDay = parseInt(easternParts.find(p => p.type === 'day')?.value || '1');
      const easternHour = parseInt(easternParts.find(p => p.type === 'hour')?.value || '0');
      const easternMinute = parseInt(easternParts.find(p => p.type === 'minute')?.value || '0');
      
      // Create a proper Date object representing Eastern time
      const easternTime = new Date(easternYear, easternMonth, easternDay, easternHour, easternMinute);
      
      const dayOfWeek = easternTime.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      const hours = easternHour;
      const minutes = easternMinute;
      const currentTimeInMinutes = hours * 60 + minutes;
      
      // Tuesday = 2, Thursday = 4
      const isTuesdayOrThursday = dayOfWeek === 2 || dayOfWeek === 4;
      
      // 15:30 = 930 minutes, 15:35 = 935 minutes
      const startTime = 15 * 60 + 30; // 15:30 in minutes
      const endTime = 15 * 60 + 35;   // 15:35 in minutes
      
      const isWithinTimeWindow = currentTimeInMinutes >= startTime && currentTimeInMinutes < endTime;
      const isTimeValid = isTuesdayOrThursday && isWithinTimeWindow;
      
      // Form is active only if both time and location are valid
      setIsFormActive(isTimeValid && locationStatus.isLocationValid);
    };

    // Check location first
    if (!locationStatus.isLocationChecked) {
      checkLocation();
    }

    // Check time immediately
    checkFormAvailability();
    
    // Update every 30 seconds to keep it current
    const interval = setInterval(checkFormAvailability, 30000);
    
    return () => clearInterval(interval);
  }, [locationStatus.isLocationValid, locationStatus.isLocationChecked]);

  if (isFormActive) {
    return (
      <div>
        <iframe 
          src="https://cmu.ca1.qualtrics.com/jfe/form/SV_0UkRFM34R8dyPnE" 
          width="100%" 
          height="600px" 
          style={{ border: 'none' }}
          title="Attendance Form"
        />
        
        <div style={{ 
          marginTop: '1rem', 
          padding: '1rem', 
          backgroundColor: '#e8f4fd', 
          border: '1px solid #0969da', 
          borderRadius: '6px' 
        }}>
          <strong>Note:</strong> If you're having trouble viewing the form above, you can also access it directly at:{' '}
          <a 
            href="https://cmu.ca1.qualtrics.com/jfe/form/SV_0UkRFM34R8dyPnE" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            https://cmu.ca1.qualtrics.com/jfe/form/SV_0UkRFM34R8dyPnE
          </a>
        </div>
      </div>
    );
  }

  // Show loading message while checking location
  if (!locationStatus.isLocationChecked) {
    return (
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center', 
        backgroundColor: '#e8f4fd', 
        border: '1px solid #0969da', 
        borderRadius: '6px',
        marginBottom: '1rem'
      }}>
        <h3 style={{ color: '#0969da', marginBottom: '1rem' }}>
          Checking your location...
        </h3>
        <p style={{ color: '#0969da', margin: 0 }}>
          Please allow location access to verify you're in class.
        </p>
      </div>
    );
  }

  // Show location error
  if (locationStatus.locationError) {
    return (
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center', 
        backgroundColor: '#f8d7da', 
        border: '1px solid #f5c6cb', 
        borderRadius: '6px',
        marginBottom: '1rem'
      }}>
        <h3 style={{ color: '#721c24', marginBottom: '1rem' }}>
          Location Access Required
        </h3>
        <p style={{ color: '#721c24', margin: 0, marginBottom: '1rem' }}>
          The attendance form requires location verification to ensure you're physically present in class.
        </p>
        <p style={{ color: '#856404', fontSize: '0.9rem', marginBottom: '1rem' }}>
          Error: {locationStatus.locationError}
        </p>
        <button 
          onClick={checkLocation}
          style={{
            backgroundColor: '#0969da',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  // Show location not valid message
  if (!locationStatus.isLocationValid) {
    return (
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center', 
        backgroundColor: '#f8d7da', 
        border: '1px solid #f5c6cb', 
        borderRadius: '6px',
        marginBottom: '1rem'
      }}>
        <h3 style={{ color: '#721c24', marginBottom: '1rem' }}>
          Access Restricted by Location
        </h3>
        <p style={{ color: '#721c24', margin: 0, marginBottom: '1rem' }}>
          The attendance form can only be accessed from within the lecture hall.
        </p>
        {locationStatus.distance && (
          <p style={{ color: '#856404', fontSize: '0.9rem', marginBottom: '1rem' }}>
            You are {locationStatus.distance} meters from class.
          </p>
        )}
        <button 
          onClick={checkLocation}
          style={{
            backgroundColor: '#0969da',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Check Location Again
        </button>
      </div>
    );
  }

  // Show time restriction message (location is valid but time is not)
  return (
    <div style={{ 
      padding: '2rem', 
      textAlign: 'center', 
      backgroundColor: '#fff3cd', 
      border: '1px solid #ffecb5', 
      borderRadius: '6px',
      marginBottom: '1rem'
    }}>
      <h3 style={{ color: '#664d03', marginBottom: '1rem' }}>
        Location Verified - Waiting for class...
      </h3>
      <p style={{ color: '#664d03', margin: 0, marginBottom: '1rem' }}>
        You're in the lecture hall! The attendance form will be available during:
        <br />Tuesdays and Thursdays from 3:30 PM to 3:35 PM Eastern Time
      </p>
      <p style={{ color: '#6c757d', fontSize: '0.9rem', marginTop: '0.5rem' }}>
        It's {currentTime.toLocaleString('en-US', { 
          timeZone: 'America/New_York',
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })} in Pittsburgh
      </p>
      {locationStatus.distance && (
        <p style={{ color: '#6c757d', fontSize: '0.8rem', marginTop: '0.5rem' }}>
          Distance from class: ~{locationStatus.distance} meters
        </p>
      )}
    </div>
  );
};

export default AttendanceForm;
