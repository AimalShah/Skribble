import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import AuthForm from "./components/AuthForm";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import CreateRoomPage from "./pages/CreateRoomPage";
import FeedPage from "./pages/FeedPage";
import GameRoomPage from "./pages/GameRoomPage";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-[#0d1222]">
      <div className="text-center">
        <div className="animate-bounce mb-4"><span className="text-4xl">✏️</span></div>
        <p className="text-slate-400 font-display text-lg">Loading...</p>
      </div>
    </div>
  );
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-[#0d1222]">
      <div className="text-center">
        <div className="animate-bounce mb-4"><span className="text-4xl">✏️</span></div>
        <p className="text-slate-400 font-display text-lg">Loading...</p>
      </div>
    </div>
  );
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><AuthForm /></PublicRoute>} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Navbar />
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/feed"
        element={
          <ProtectedRoute>
            <Navbar />
            <FeedPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/create-room"
        element={
          <ProtectedRoute>
            <Navbar />
            <CreateRoomPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Navbar />
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/room/:roomId"
        element={
          <ProtectedRoute>
            <GameRoomPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
