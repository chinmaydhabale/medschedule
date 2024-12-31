import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useState } from 'react';
import api from '../services/api';

function AppointmentCard({ appointment, userRole }) {
    const appointmentDate = new Date(appointment.appointmentTime);
    const [status, setStatus] = useState(appointment.status);

    // Determine the other party (patient or doctor)
    const otherParty = userRole === 'patient' ? appointment.doctorId : appointment.patientId;

    const handleCheckIn = () => {
        api
            .put(`/api/appointments/${appointment._id}/check-in`)
            .then((res) => {
                alert('Checked in successfully.');
                setStatus('checked-in');
            })
            .catch((err) => {
                console.error(err);
                const errorMessage = err.response?.data?.message || 'Failed to check in.';
                alert(errorMessage);
            });
    };

    const handleCancel = (appointmentId) => {
        // Confirm cancellation
        if (window.confirm('Are you sure you want to cancel this appointment?')) {
            api
                .delete(`/api/appointments/${appointmentId}`)
                .then(() => {
                    alert('Appointment cancelled successfully.');
                    // Optionally, refresh the appointments list
                    window.location.reload();
                })
                .catch((err) => {
                    console.error(err);
                    alert('Failed to cancel the appointment.');
                });
        }
    };

    return (
        <div className="border border-gray-300 rounded-md p-4 mb-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">
                        {userRole === 'patient' ? `Dr. ${otherParty.name}` : otherParty.name}
                    </h3>
                    {userRole === 'patient' && otherParty.specialization && (
                        <p className="text-sm text-gray-600">{otherParty.specialization}</p>
                    )}
                    <p className="text-sm text-gray-600">
                        {format(appointmentDate, 'PPpp')}
                    </p>
                    <p className="text-sm text-gray-500 capitalize">Status: {status}</p>
                </div>
                <div className="flex items-center space-x-2">
                    {userRole === 'patient' && (
                        <>
                            {/* Patient Actions */}
                            {status === 'scheduled' && (
                                <>
                                    {/* Check-In Button */}
                                    <button
                                        onClick={handleCheckIn}
                                        className="text-green-500 hover:underline text-sm"
                                    >
                                        Check-In
                                    </button>
                                    {/* Reschedule Button */}
                                    <Link
                                        to={`/appointments/${appointment._id}/reschedule`}
                                        className="text-blue-500 hover:underline text-sm"
                                    >
                                        Reschedule
                                    </Link>
                                    {/* Cancel Button */}
                                    <button
                                        className="text-red-500 hover:underline text-sm"
                                        onClick={() => handleCancel(appointment._id)}
                                    >
                                        Cancel
                                    </button>
                                </>
                            )}
                            {status === 'no-show' && (
                                <>
                                    {/* Reschedule Button */}
                                    <Link
                                        to={`/appointments/${appointment._id}/reschedule`}
                                        className="text-blue-500 hover:underline text-sm"
                                    >
                                        Reschedule
                                    </Link>
                                    {/* Cancel Button */}
                                    <button
                                        className="text-red-500 hover:underline text-sm"
                                        onClick={() => handleCancel(appointment._id)}
                                    >
                                        Cancel
                                    </button>
                                </>
                            )}
                        </>
                    )}

                    {userRole === 'doctor' && (
                        <>
                            {/* Doctor Actions */}
                            {status === 'scheduled' && (
                                <>
                                    {/* Check-In Button */}
                                    <button
                                        onClick={handleCheckIn}
                                        className="text-green-500 hover:underline text-sm"
                                    >
                                        Check-In Patient
                                    </button>
                                    {/* Additional doctor-specific actions can go here */}
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AppointmentCard;