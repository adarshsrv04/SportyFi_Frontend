import React, { useState, useEffect } from 'react';

interface BookedSlot {
  startTime: string;
  endTime: string;
}

interface TimelineBookingProps {
  bookedSlots: BookedSlot[];
  startTime: string;
  endTime: string;
  onChange: (startTime: string, endTime: string) => void;
}

const TimelineBooking: React.FC<TimelineBookingProps> = ({ bookedSlots, onChange }) => {
  const [selectedStart, setSelectedStart] = useState<string | null>(null);
  const [selectedEnd, setSelectedEnd] = useState<string | null>(null);

  // Generate timeline in 15-min steps
  const times: string[] = [];
  for (let h = 6; h <= 23; h++) {
    for (let m = 0; m < 60; m += 30) {
      times.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
    }
  }
  times.push('23:59')

  const isTimeBooked = (time: string) => {
    return bookedSlots.some(slot => time >= slot.startTime && time < slot.endTime);
  };

  const handleClick = (time: string) => {
    if (isTimeBooked(time)) return;

    if (!selectedStart || (selectedStart && selectedEnd)) {
      setSelectedStart(time);
      setSelectedEnd(null);
      onChange(time, '');
    } else {
      if (time <= selectedStart) {
        setSelectedStart(time);
        setSelectedEnd(null);
        onChange(time, '');
      } else {
        setSelectedEnd(time);
        onChange(selectedStart, time);
      }
    }
  };

  return (
    <div className="border rounded p-2 max-h-72 overflow-y-auto grid grid-cols-6 gap-1">
      {times.map(time => {
        const booked = isTimeBooked(time);
        const selected =
          selectedStart && selectedEnd
            ? time >= selectedStart && time <= selectedEnd
            : time === selectedStart;
        return (
          <button
            key={time}
            type="button"
            className={`px-2 py-1 rounded text-sm ${
              booked
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : selected
                ? 'bg-green-400 text-white'
                : 'bg-green-100 hover:bg-green-200'
            }`}
            onClick={() => handleClick(time)}
            disabled={booked}
          >
            {time}
          </button>
        );
      })}
    </div>
  );
};

export default TimelineBooking;
