import { Link } from 'react-router-dom';

function Home() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-200 to-indigo-200">
            <h1 className="text-4xl font-bold text-gray-800 mb-6">Welcome to the Appointment System</h1>
            <p className="text-xl text-gray-700 mb-8 text-center max-w-xl">
                Manage your appointments efficiently. Patients can easily book appointments, and doctors can manage their schedules seamlessly.
            </p>
            <div className="flex space-x-4">
                <Link
                    to="/dashboard"
                    className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200"
                >
                    Dashboard
                </Link>
            </div>
        </div>
    );
}

export default Home;