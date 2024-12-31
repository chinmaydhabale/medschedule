import { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

function BookAppointment() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [date, setDate] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch list of doctors
    api
      .get('/api/users/doctors')
      .then((res) => {
        console.log('Doctors response:', res.data);
        setDoctors(res.data); // Adjusted here
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  const handleDoctorChange = (e) => {
    const doctorId = e.target.value;
    setSelectedDoctorId(doctorId);
    setDate('');
    setAvailableSlots([]);
    setSelectedSlot(null);
  };

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    setDate(selectedDate);
    // Fetch available slots for the selected doctor and date
    api
      .get(`/api/schedules/doctor/${selectedDoctorId}?date=${selectedDate}`)
      .then((res) => {
        console.log('Available slots response:', res.data);
        const availableSlotsData = res.data.availableSlots;
        let slots = [];
        if (availableSlotsData && availableSlotsData.length > 0 && availableSlotsData[0].slots) {
          slots = availableSlotsData[0].slots;
        }
        setAvailableSlots(slots);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const handleSlotChange = (e) => {
    const slotId = e.target.value;
    const selected = availableSlots.find((slot) => slot._id === slotId);
    setSelectedSlot(selected);
  };

  const handleBook = () => {
    if (!selectedSlot) {
      alert('Please select a time slot.');
      return;
    }
    // Send request to book an appointment
    api
      .post('/api/appointments', {
        doctorId: selectedDoctorId,
        appointmentTime: selectedSlot.startTime,
        appointmentEndTime: selectedSlot.endTime,
      })
      .then((res) => {
        alert('Appointment booked successfully.');
        navigate('/dashboard');
      })
      .catch((err) => {
        console.error(err);
        const errorMessage = err.response?.data?.message || 'Failed to book the appointment.';
        alert(errorMessage);
      });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Book a New Appointment</h1>
      <div className="mb-4">
        <label className="block text-gray-700">Select a Doctor</label>
        <select
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
          value={selectedDoctorId}
          onChange={handleDoctorChange}
        >
          <option value="">-- Select Doctor --</option>
          {doctors?.map((doctor) => (
            <option key={doctor._id} value={doctor._id}>
              Dr. {doctor.name} ({doctor.specialization})
            </option>
          ))}
        </select>
      </div>

      {selectedDoctorId && (
        <>
          <div className="mb-4">
            <label className="block text-gray-700">Select a Date</label>
            <input
              type="date"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              value={date}
              onChange={handleDateChange}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {availableSlots.length > 0 ? (
            <div className="mb-4">
              <label className="block text-gray-700">Select a Time Slot</label>
              <select
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                value={selectedSlot?._id || ''}
                onChange={handleSlotChange}
              >
                <option value="">-- Select Time Slot --</option>
                {availableSlots.map((slot) => (
                  <option key={slot._id} value={slot._id}>
                    {format(new Date(slot.startTime), 'PPpp')} - {format(new Date(slot.endTime), 'pp')}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            date && <p className="text-gray-600">No available slots on this date.</p>
          )}
        </>
      )}

      {selectedDoctorId && date && (
        <button
          onClick={handleBook}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-200"
        >
          Book Appointment
        </button>
      )}
    </div>
  );
}

export default BookAppointment;