import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function Register() {
    // State variables for form inputs
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phoneNumber: '',
        password: '',
        role: 'patient', // default role
        specialization: '', // required if role is doctor
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;

        // If the role is changed, reset specialization if not doctor
        if (name === 'role' && value !== 'doctor') {
            setFormData({ ...formData, [name]: value, specialization: '' });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await api.post('/api/users/register', formData);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <form className="bg-white p-6 rounded shadow-md w-full max-w-md" onSubmit={handleSubmit}>
                <h2 className="text-2xl font-semibold mb-4 text-center">Register</h2>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                {/* Name Input */}
                <div className="mb-4">
                    <label className="block text-gray-700">Full Name</label>
                    <input
                        type="text"
                        name="name"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>
                {/* Email Input */}
                <div className="mb-4">
                    <label className="block text-gray-700">Email Address</label>
                    <input
                        type="email"
                        name="email"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                {/* Phone Number Input */}
                <div className="mb-4">
                    <label className="block text-gray-700">Phone Number</label>
                    <input
                        type="text"
                        name="phoneNumber"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                    />
                </div>
                {/* Password Input */}
                <div className="mb-4">
                    <label className="block text-gray-700">Password</label>
                    <input
                        type="password"
                        name="password"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                {/* Role Selection */}
                <div className="mb-4">
                    <label className="block text-gray-700">I am a:</label>
                    <select
                        name="role"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                        value={formData.role}
                        onChange={handleChange}
                        required
                    >
                        <option value="patient">Patient</option>
                        <option value="doctor">Doctor</option>
                    </select>
                </div>
                {/* Specialization Input (Only for Doctors) */}
                {formData.role === 'doctor' && (
                    <div className="mb-4">
                        <label className="block text-gray-700">Specialization</label>
                        <input
                            type="text"
                            name="specialization"
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                            value={formData.specialization}
                            onChange={handleChange}
                            required
                        />
                    </div>
                )}
                {/* Submit Button */}
                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition duration-200"
                >
                    Register
                </button>
                <p className="mt-4 text-sm text-center">
                    Already have an account?{' '}
                    <a href="/login" className="text-blue-500 hover:underline">
                        Login
                    </a>
                </p>
            </form>
        </div>
    );
}

export default Register;