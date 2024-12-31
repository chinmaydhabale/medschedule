import AppointmentCard from './AppointmentCard';

function AppointmentsList({ appointments, userRole }) {
    return (
        <div>
            {appointments.length > 0 ? (
                appointments.map((appointment) => (
                    <AppointmentCard
                        key={appointment._id}
                        appointment={appointment}
                        userRole={userRole}
                    />
                ))
            ) : (
                <p className="text-gray-600">You have no appointments.</p>
            )}
        </div>
    );
}

export default AppointmentsList;