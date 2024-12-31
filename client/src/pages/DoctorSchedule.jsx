import { useState } from 'react';
import api from '../services/api';
import { format, addMinutes } from 'date-fns';

function DoctorSchedule() {
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [slotDuration, setSlotDuration] = useState(30); // slot duration in minutes
  const [slots, setSlots] = useState([]);
  const [message, setMessage] = useState('');

  const generateSlots = () => {
    if (!date || !startTime || !endTime) {
      alert('Please select date, start time, and end time.');
      return;
    }

    const start = new Date(`${date}T${startTime}`);
    const end = new Date(`${date}T${endTime}`);

    if (start >= end) {
      alert('End time must be after start time.');
      return;
    }

    let current = start;
    const generatedSlots = [];

    while (current < end) {
      const slotEnd = addMinutes(current, slotDuration);
      if (slotEnd > end) break;

      generatedSlots.push({
        startTime: current.toISOString(),
        endTime: slotEnd.toISOString(),
      });
      current = slotEnd;
    }

    setSlots(generatedSlots);
  };

  const handleSaveSchedule = () => {
    if (slots.length === 0) {
      alert('No slots to save.');
      return;
    }
    api.post('/api/schedules', { date, slots })
      .then(() => {
        setMessage('Schedule saved successfully.');
        setSlots([]);
        setStartTime('');
        setEndTime('');
      })
      .catch((err) => {
        console.error(err);
        alert('Failed to save schedule.');
      });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Your Schedule</h1>
      {message && <p className="text-green-600 mb-4">{message}</p>}
      <div className="mb-4">
        <label className="block text-gray-700">Select a Date</label>
        <input
          type="date"
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
        />
      </div>
      <div className="mb-4 flex space-x-4">
        <div className="w-1/2">
          <label className="block text-gray-700">Start Time</label>
          <input
            type="time"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>
        <div className="w-1/2">
          <label className="block text-gray-700">End Time</label>
          <input
            type="time"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Slot Duration (minutes)</label>
        <input
          type="number"
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
          value={slotDuration}
          onChange={(e) => setSlotDuration(Number(e.target.value))}
          min={10}
          max={120}
        />
      </div>
      <button
        onClick={generateSlots}
        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-200 mb-4"
      >
        Generate Slots
      </button>
      {slots.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mb-2">Generated Slots</h2>
          <ul className="mb-4">
            {slots.map((slot, index) => (
              <li key={index} className="text-gray-700">
                {format(new Date(slot.startTime), 'PPpp')} - {format(new Date(slot.endTime), 'pp')}
              </li>
            ))}
          </ul>
          <button
            onClick={handleSaveSchedule}
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition duration-200"
          >
            Save Schedule
          </button>
        </>
      )}
    </div>
  );
}

export default DoctorSchedule;