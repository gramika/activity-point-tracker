import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext, AuthProvider } from './context/AuthContext';
import Header from './components/common/Header';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import StudentDashboard from './pages/Student/Dashboard';
import TeacherDashboard from './pages/Teacher/Dashboard';

// Protected route component
const ProtectedRoute = ({ element, requiredRole }) => {
  const { userInfo } = useContext(AuthContext);
  
  // Redirect to login if not authenticated
  if (!userInfo) {
    return <Navigate to="/login" replace />;
  }
  
  // Redirect based on role if requiredRole is specified
  if (requiredRole && userInfo.role !== requiredRole) {
    return <Navigate to={`/${userInfo.role}/dashboard`} replace />;
  }
  
  return element;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Header />
          <main className="py-4">
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              <Route 
                path="/student/dashboard" 
                element={
                  <ProtectedRoute 
                    element={<StudentDashboard />} 
                    requiredRole="student" 
                  />
                } 
              />
              
              <Route 
                path="/teacher/dashboard" 
                element={
                  <ProtectedRoute 
                    element={<TeacherDashboard />} 
                    requiredRole="teacher" 
                  />
                } 
              />
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;