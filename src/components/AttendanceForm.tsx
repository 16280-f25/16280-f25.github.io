import React, { useState, useEffect } from 'react';

interface LocationStatus {
  isLocationValid: boolean;
  isLocationChecked: boolean;
  locationError: string | null;
  distance?: number;
}

const AttendanceForm: React.FC = () => {
  const [isFormActive, setIsFormActive] = useState(false);
  const [isTimeValid, setIsTimeValid] = useState(false);
  const [askedForLocation, setAskedForLocation] = useState(false);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>({
    isLocationValid: false,
    isLocationChecked: false,
    locationError: null
  });

  const LECTURE_HALL_COORDINATES = { lat: 40.4435, lon: -79.9459 };
  const ALLOWED_RADIUS_METERS = 150;

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const checkLocation = () => {
    setAskedForLocation(true);
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
        timeout: 20000,   // Safari can be slow to get a fresh GPS fix
        maximumAge: 0     // force fresh reading (don’t use cached)
      }
    );
  };

  useEffect(() => {
    const checkFormAvailability = () => {
      const now = new Date();

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
      const dayOfWeek = easternTime.getDay();
      const hours = easternHour;
      const minutes = easternMinute;
      const currentTimeInMinutes = hours * 60 + minutes;

      const isTuesdayOrThursday = dayOfWeek === 2 || dayOfWeek === 4;

      const startTime = 11 * 60 + 59; // 15 * 60 + 22
      const endTime   = 14 * 60 + 25; // 15 * 60 + 75

      const isWithinTimeWindow = currentTimeInMinutes >= startTime && currentTimeInMinutes < endTime;
      const timeValid = isTuesdayOrThursday && isWithinTimeWindow;

      setIsTimeValid(timeValid);
      setIsFormActive(timeValid && locationStatus.isLocationValid);

      // If time becomes invalid, reset location state and the click gate
      if (!timeValid && locationStatus.isLocationChecked) {
        setLocationStatus({
          isLocationValid: false,
          isLocationChecked: false,
          locationError: null
        });
        setAskedForLocation(false);
      }
    };

    checkFormAvailability();
    const interval = setInterval(checkFormAvailability, 30000);
    return () => clearInterval(interval);
  }, [locationStatus.isLocationValid, locationStatus.isLocationChecked]);

  // 1) Time not valid: generic inactive message
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
        <h3 style={{ color: '#495057', marginBottom: '1rem', fontSize: '1.3rem', fontWeight: 600 }}>
          Form Inactive
        </h3>
        <p style={{ color: '#6c757d', margin: 0, fontSize: '1rem', lineHeight: 1.5 }}>
          The attendance form is not currently accepting responses.
        </p>
      </div>
    );
  }

  // 2) Form active
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
          <h3 style={{ color: '#0f5132', margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>
            Attendance Form Active
          </h3>
          <p style={{ color: '#0a3622', margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>
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

  // 3) Time valid, but haven’t asked for location yet -> show button (Safari needs user gesture)
  if (isTimeValid && !locationStatus.isLocationChecked && !askedForLocation) {
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
        <h3 style={{ color: '#0969da', marginBottom: '1rem' }}>Verify your location</h3>
        <p style={{ color: '#0550ae', marginBottom: '1.5rem' }}>
          Safari requires a click to allow location access.
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
            fontWeight: 500
          }}
        >
          Allow Location
        </button>
      </div>
    );
  }

  // 4) Time valid, we asked, waiting for result -> spinner
  if (isTimeValid && !locationStatus.isLocationChecked && askedForLocation) {
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
        <h3 style={{ color: '#0969da', marginBottom: '1rem' }}>Checking your location...</h3>
        <p style={{ color: '#0550ae', margin: 0 }}>
          Please allow location access to verify you're in the lecture hall.
        </p>
      </div>
    );
  }

  // 5) Error
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
        <h3 style={{ color: '#721c24', marginBottom: '1rem', fontSize: '1.3rem', fontWeight: 600 }}>
          Location Access Required
        </h3>
        <p style={{ color: '#721c24', margin: 0, marginBottom: '1rem', fontSize: '1rem', lineHeight: 1.5 }}>
          The attendance form requires location verification to ensure you're present in the lecture hall.
        </p>
        <p style={{
          color: '#842029',
          fontSize: '0.9rem',
          marginBottom: '1.5rem',
          fontWeight: 500,
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
            fontWeight: 500
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  // 6) Time valid but outside allowed radius
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
        <h3 style={{ color: '#721c24', marginBottom: '1rem', fontSize: '1.3rem', fontWeight: 600 }}>
          Access Restricted by Location
        </h3>
        <p style={{ color: '#721c24', margin: 0, marginBottom: '0.5rem', fontSize: '1rem', lineHeight: 1.5 }}>
          The attendance form can only be accessed from within the lecture hall.
        </p>
        {locationStatus.distance && (
          <p style={{ color: '#721c24', fontSize: '0.9rem', margin: '0 0 1.5rem 0' }}>
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
              fontWeight: 500
            }}
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
