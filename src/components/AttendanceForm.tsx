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
  const [isTimeValid, setIsTimeValid] = useState(false);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>({
    isLocationValid: false,
    isLocationChecked: false,
    locationError: null
  });

  const LECTURE_HALL_COORDINATES = {
    lat: 40.4435, // latitude
    lon: -79.9459 // longitude
  };
  const ALLOWED_RADIUS_METERS = 150;

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
          LECTURE_HALL_COORDINATES.lat, 
          LECTURE_HALL_COORDINATES.lon
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
        maximumAge: 60000
      }
    );
  };

  useEffect(() => {
    const checkFormAvailability = () => {
      const now = new Date();
      
      setCurrentTime(now);
      
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
      const easternMonth = parseInt(easternParts.find(p => p.type === 'month')?.value || '1') - 1;
      const easternDay = parseInt(easternParts.find(p => p.type === 'day')?.value || '1');
      const easternHour = parseInt(easternParts.find(p => p.type === 'hour')?.value || '0');
      const easternMinute = parseInt(easternParts.find(p => p.type === 'minute')?.value || '0');
      
      const easternTime = new Date(easternYear, easternMonth, easternDay, easternHour, easternMinute);
      
      const dayOfWeek = easternTime.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      const hours = easternHour;
      const minutes = easternMinute;
      const currentTimeInMinutes = hours * 60 + minutes;
      
      const isTuesdayOrThursday = dayOfWeek === 2 || dayOfWeek === 4;
      
      const startTime = 15 * 60 + 30; // 15:30 in minutes
      const endTime = 15 * 60 + 45;   // 15:35 in minutes
      
      const isWithinTimeWindow = currentTimeInMinutes >= startTime && currentTimeInMinutes < endTime;
      const timeIsValid = isTuesdayOrThursday && isWithinTimeWindow;
      
      setIsTimeValid(timeIsValid);
      
      // Form is active only if both time and location are valid
      setIsFormActive(timeIsValid && locationStatus.isLocationValid);
    };

    // Check time immediately
    checkFormAvailability();
    
    // Only check location if time is valid, reset location status if time is invalid
    if (isTimeValid && !locationStatus.isLocationChecked) {
      checkLocation();
    } else if (!isTimeValid && locationStatus.isLocationChecked) {
      // Reset location status when time becomes invalid to prevent info leakage
      setLocationStatus({
        isLocationValid: false,
        isLocationChecked: false,
        locationError: null
      });
    }
    
    // Update every 30 seconds to keep it current
    const interval = setInterval(checkFormAvailability, 30000);
    
    return () => clearInterval(interval);
  }, [locationStatus.isLocationValid, locationStatus.isLocationChecked, isTimeValid]);

  // If time is not valid, show generic inactive message (don't reveal location info)
  if (!isTimeValid) {
    return (
      <div style={{ 
        padding: '2.5rem', 
        textAlign: 'center', 
        backgroundColor: '#f8f9fa', 
        border: '2px solid #6c757d', 
        borderRadius: '12px',
        marginBottom: '1rem',
        boxShadow: '0 4px 12px rgba(108, 117, 125, 0.1)'
      }}>
        <h3 style={{ 
          color: '#495057', 
          marginBottom: '1rem',
          fontSize: '1.3rem',
          fontWeight: '600'
        }}>
          Form Inactive
        </h3>
        <p style={{ 
          color: '#6c757d', 
          margin: 0,
          fontSize: '1rem',
          lineHeight: '1.5'
        }}>
          The attendance form is not currently accepting responses.
        </p>
      </div>
    );
  }

  if (isFormActive) {
    return (
      <div>
        <div style={{ 
          marginBottom: '1.5rem', 
          padding: '1.5rem', 
          backgroundColor: '#d1e7dd', 
          border: '2px solid #198754', 
          borderRadius: '12px',
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(25, 135, 84, 0.1)'
        }}>

          <h3 style={{ 
            color: '#0f5132', 
            margin: 0, 
            fontSize: '1.2rem',
            fontWeight: '600'
          }}>
            Attendance Form Active
          </h3>
          <p style={{ 
            color: '#0a3622', 
            margin: '0.5rem 0 0 0',
            fontSize: '0.9rem'
          }}>
            You may now submit your attendance
          </p>
        </div>
        
        <div style={{
          border: '2px solid #198754',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(25, 135, 84, 0.1)'
        }}>
          <iframe 
            src="https://cmu.ca1.qualtrics.com/jfe/form/SV_0UkRFM34R8dyPnE" 
            width="100%" 
            height="600px" 
            style={{ border: 'none', display: 'block' }}
            title="Attendance Form"
          />
        </div>
      </div>
    );
  }

  // Show loading message while checking location
  if (!locationStatus.isLocationChecked) {
    return (
      <div style={{ 
        padding: '2.5rem', 
        textAlign: 'center', 
        backgroundColor: '#e8f4fd', 
        border: '2px solid #0969da', 
        borderRadius: '12px',
        marginBottom: '1rem',
        boxShadow: '0 4px 12px rgba(9, 105, 218, 0.1)'
      }}>

        <h3 style={{ 
          color: '#0969da', 
          marginBottom: '1rem',
          fontSize: '1.3rem',
          fontWeight: '600'
        }}>
          Checking your location...
        </h3>
        <p style={{ 
          color: '#0550ae', 
          margin: 0,
          fontSize: '1rem',
          lineHeight: '1.5'
        }}>
          Please allow location access to verify you're in the lecture hall.
        </p>
      </div>
    );
  }

  // Show location error
  if (locationStatus.locationError) {
    return (
      <div style={{ 
        padding: '2.5rem', 
        textAlign: 'center', 
        backgroundColor: '#f8d7da', 
        border: '2px solid #dc3545', 
        borderRadius: '12px',
        marginBottom: '1rem',
        boxShadow: '0 4px 12px rgba(220, 53, 69, 0.1)'
      }}>

        <h3 style={{ 
          color: '#721c24', 
          marginBottom: '1rem',
          fontSize: '1.3rem',
          fontWeight: '600'
        }}>
          Location Access Required
        </h3>
        <p style={{ 
          color: '#721c24', 
          margin: 0, 
          marginBottom: '1rem',
          fontSize: '1rem',
          lineHeight: '1.5'
        }}>
          The attendance form requires location verification to ensure you're present in the lecture hall.
        </p>
        <p style={{ 
          color: '#842029', 
          fontSize: '0.9rem', 
          marginBottom: '1.5rem',
          fontWeight: '500',
          backgroundColor: '#f1aeb5',
          padding: '8px 12px',
          borderRadius: '6px',
          display: 'inline-block'
        }}>
          Error: {locationStatus.locationError}
        </p>
        <button 
          onClick={checkLocation}
          style={{
            backgroundColor: '#0969da',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '500',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0550ae'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#0969da'}
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
        padding: '2.5rem', 
        textAlign: 'center', 
        backgroundColor: '#f8d7da', 
        border: '2px solid #dc3545', 
        borderRadius: '12px',
        marginBottom: '1rem',
        boxShadow: '0 4px 12px rgba(220, 53, 69, 0.1)'
      }}>

        <h3 style={{ 
          color: '#721c24', 
          marginBottom: '1rem',
          fontSize: '1.3rem',
          fontWeight: '600'
        }}>
          Access Restricted by Location
        </h3>
                <p style={{ 
          color: '#721c24', 
          margin: 0, 
          marginBottom: '0.5rem',
          fontSize: '1rem',
          lineHeight: '1.5'
        }}>
          The attendance form can only be accessed from within the lecture hall.
        </p>
        {locationStatus.distance && (
          <p style={{ 
            color: '#721c24', 
            fontSize: '0.9rem', 
            margin: '0 0 1.5rem 0'
          }}>
            You are approximately {locationStatus.distance} meters from the lecture hall.
          </p>
        )}
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <button 
            onClick={checkLocation}
            style={{
              backgroundColor: '#842029',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '500',
              transition: 'background-color 0.2s',
              boxShadow: '0 2px 4px rgba(132, 32, 41, 0.3)'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#6f1d1b'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#842029'}
          >
            Check Location Again
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default AttendanceForm;
