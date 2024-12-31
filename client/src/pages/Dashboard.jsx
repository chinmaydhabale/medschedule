import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import AppointmentsList from '../components/AppointmentsList';

function Dashboard() {
    const user = JSON.parse(localStorage.getItem('user'));
    const [appointments, setAppointments] = useState([]);
    const [stats, setStats] = useState({
        todayAppointments: 0,
        missedAppointments: 0,
        completedToday: 0,
        totalPatients: 0,
    });
    const [error, setError] = useState('');

    useEffect(() => {
        // Fetch user's appointments and stats
        const fetchData = async () => {
            try {
                // Fetch appointments
                const appointmentsRes = await api.get('/api/appointments');
                setAppointments(appointmentsRes.data.appointments);

                // Fetch stats for doctors
                if (user.role === 'doctor') {
                    const statsRes = await api.get('/api/appointments/stats');
                    setStats(statsRes.data);
                }

                // For patients, you can set stats as needed
            } catch (err) {
                console.error(err);
                setError('Failed to fetch data.');
            }
        };

        fetchData();
    }, [user.role]);

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">
                Welcome{user.role === 'doctor' ? ` Dr. ${user.name}` : `, ${user.name}`}
            </h1>

            {error && <p className="text-red-500 mb-4">{error}</p>}

            {user.role === 'doctor' && (
                <>
                    {/* Statistics Section */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-green-100 p-4 rounded">
                            <h3 className="text-lg font-semibold">Today's Appointments</h3>
                            <p className="text-2xl font-bold">{stats.todayAppointments}</p>
                        </div>
                        <div className="bg-red-100 p-4 rounded">
                            <h3 className="text-lg font-semibold">Missed Appointments</h3>
                            <p className="text-2xl font-bold">{stats.missedAppointments}</p>
                        </div>
                        <div className="bg-blue-100 p-4 rounded">
                            <h3 className="text-lg font-semibold">Completed Today</h3>
                            <p className="text-2xl font-bold">{stats.completedToday}</p>
                        </div>
                        <div className="bg-yellow-100 p-4 rounded">
                            <h3 className="text-lg font-semibold">Total Patients</h3>
                            <p className="text-2xl font-bold">{stats.totalPatients}</p>
                        </div>
                    </div>

                    {/* Appointments Section */}
                    <h2 className="text-xl font-semibold mb-2">Appointments</h2>
                    <AppointmentsList appointments={appointments} userRole={user.role} />
                </>
            )}

            {user.role === 'patient' && (
                <>
                    {/* Patient-specific dashboard content */}
                    <h2 className="text-xl font-semibold mb-2">Your Appointments</h2>
                    {appointments.length > 0 ? (
                        <AppointmentsList appointments={appointments} userRole={user.role} />
                    ) : (
                        <p className="text-gray-600">You have no appointments.</p>
                    )}

                    {/* Book Appointment Button */}
                    {!appointments.some((a) => ['scheduled'].includes(a.status)) && (
                        <div className="mt-6">
                            <Link
                                to="/book-appointment"
                                className="inline-block bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-200"
                            >
                                Book a New Appointment
                            </Link>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default Dashboard;