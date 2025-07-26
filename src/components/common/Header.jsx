import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Header = () => {
  const { userInfo, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">Activity Point Tracker</Link>
        
        <nav className="flex items-center">
          {userInfo ? (
            <>
              <span className="mr-4">Welcome, {userInfo.name}</span>
              <button 
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="space-x-4">
              <Link to="/login" className="hover:underline">Login</Link>
              <Link to="/register" className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded">
                Register
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;