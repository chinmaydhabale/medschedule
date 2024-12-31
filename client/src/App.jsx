import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BookAppointment from './pages/BookAppointment';
import DoctorSchedule from './pages/DoctorSchedule';
import Notifications from './pages/Notifications';
import NotFound from './pages/NotFound';
import RescheduleAppointment from './pages/RescheduleAppointment';

function App() {
  return (
    <Router>
      <Navbar />
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={
            localStorage.getItem('token') ? <Navigate to="/dashboard" /> : <Login />
          } />
          <Route path="/register" element={
            localStorage.getItem('token') ? <Navigate to="/dashboard" /> : <Register />
          } />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/book-appointment" element={<ProtectedRoute><BookAppointment /></ProtectedRoute>} />
          <Route path="/schedule" element={<ProtectedRoute><DoctorSchedule /></ProtectedRoute>} />
          <Route
            path="/appointments/:id/reschedule"
            element={<ProtectedRoute roles={['patient']}><RescheduleAppointment /></ProtectedRoute>}
          />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      {/* Optional Footer */}
    </Router>
  );
}

export default App;