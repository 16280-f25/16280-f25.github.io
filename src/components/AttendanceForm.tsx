import React, { useState, useEffect } from 'react';

const AttendanceForm: React.FC = () => {
  const [isFormActive, setIsFormActive] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

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
      
      setIsFormActive(isTuesdayOrThursday && isWithinTimeWindow);
    };

    // Check immediately
    checkFormAvailability();
    
    // Update every 30 seconds to keep it current
    const interval = setInterval(checkFormAvailability, 30000);
    
    return () => clearInterval(interval);
  }, []);

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
        The attendance form is not currently accepting responses.
      </h3>
      <p style={{ color: '#664d03', margin: 0 }}>
        The form is open on Tuesdays and Thursdays from 3:30 PM to 3:35 PM Eastern Time during lecture.
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
    </div>
  );
};

export default AttendanceForm;
