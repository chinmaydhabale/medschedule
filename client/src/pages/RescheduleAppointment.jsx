import { useState, useEffect } from 'react';
import api from '../services/api';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

function RescheduleAppointment() {
    const { id } = useParams(); // Appointment ID from the URL
    const [appointment, setAppointment] = useState(null);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState('');
    const [date, setDate] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch appointment details
        api
            .get(`/api/appointments/${id}`)
            .then((res) => {
                setAppointment(res.data.appointment);
            })
            .catch((err) => {
                console.error(err);
                setError('Failed to fetch appointment details.');
            });
    }, [id]);

    const handleDateChange = (e) => {
        const selectedDate = e.target.value;
        setDate(selectedDate);
        // Fetch available slots for the doctor and date
        api
            .get(`/api/schedules/doctor/${appointment.doctorId._id}?date=${selectedDate}`)
            .then((res) => {
                const availableSlotsData = res.data.availableSlots;
                let slots = [];
                if (availableSlotsData && availableSlotsData.length > 0 && availableSlotsData[0].slots) {
                    slots = availableSlotsData[0].slots;
                }
                setAvailableSlots(slots);
            })
            .catch((err) => {
                console.error(err);
                setError('Failed to fetch available slots.');
            });
    };

    const handleReschedule = () => {
        if (!selectedSlot) {
            alert('Please select a new time slot.');
            return;
        }
        // Send request to reschedule the appointment
        api
            .put(`/api/appointments/${id}/reschedule`, {
                newAppointmentTime: selectedSlot,
            })
            .then((res) => {
                alert('Appointment rescheduled successfully.');
                navigate('/dashboard');
            })
            .catch((err) => {
                console.error(err);
                const errorMessage = err.response?.data?.message || 'Failed to reschedule the appointment.';
                alert(errorMessage);
            });
    };

    return (
        <div className="container mx-auto p-4">
            {error && <p className="text-red-500 mb-4">{error}</p>}
            {appointment ? (
                <>
                    <h1 className="text-2xl font-bold mb-4">Reschedule Appointment</h1>
                    <p className="mb-4">
                        Current Appointment: {format(new Date(appointment.appointmentTime), 'PPpp')} with Dr.{' '}
                        {appointment.doctorId.name}
                    </p>
                    <div className="mb-4">
                        <label className="block text-gray-700">Select a New Date</label>
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
                            <label className="block text-gray-700">Select a New Time Slot</label>
                            <select
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                                value={selectedSlot}
                                onChange={(e) => setSelectedSlot(e.target.value)}
                            >
                                <option value="">-- Select Time Slot --</option>
                                {availableSlots.map((slot) => (
                                    <option key={slot._id} value={slot.startTime}>
                                        {format(new Date(slot.startTime), 'PPpp')}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ) : (
                        date && <p className="text-gray-600">No available slots on this date.</p>
                    )}
                    {date && (
                        <button
                            onClick={handleReschedule}
                            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-200"
                        >
                            Reschedule Appointment
                        </button>
                    )}
                </>
            ) : (
                <p>Loading appointment details...</p>
            )}
        </div>
    );
}

export default RescheduleAppointment;