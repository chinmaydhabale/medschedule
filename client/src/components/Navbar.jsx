import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-blue-600">
          MedSchedule
        </Link>
        <div className="flex items-center">
          {user ? (
            <>
              <div className="mr-4">
                <Link to="/dashboard" className="mr-4">
                  Dashboard
                </Link>
                {user.role === 'doctor' && (
                  <>
                    <Link to="/schedule" className="mr-4">
                      Schedule
                    </Link>
                  </>
                )}
              </div>
              <span className="mr-4">Welcome, {user.name}</span>
              <button onClick={handleLogout} className="text-red-500">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="mr-4">
                Login
              </Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;