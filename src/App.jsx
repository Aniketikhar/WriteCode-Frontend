import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "./App.css"
import Home from './pages/Home';
import NoPage from './pages/NoPage';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import EditorPage from './pages/EditorPage';
import { setAccessToken } from './api';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // On app mount, attempt a silent refresh to restore session
  useEffect(() => {
    const tryRefresh = async () => {
      const hasSession = localStorage.getItem("isLoggedIn");
      if (!hasSession) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });
        const data = await res.json();

        if (data.success && data.accessToken) {
          setAccessToken(data.accessToken);
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem("isLoggedIn");
          setIsAuthenticated(false);
        }
      } catch {
        localStorage.removeItem("isLoggedIn");
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    tryRefresh();
  }, []);

  if (isLoading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-xl text-gray-400 animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: "#1A1919", color: "#fff", border: "1px solid #2764c0" },
          success: { iconTheme: { primary: "#2764c0", secondary: "#fff" } },
          error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
          duration: 3000,
        }}
      />
      <BrowserRouter>
        <Routes>
          <Route path='/' element={isAuthenticated ? <Home /> : <Navigate to="/login"/>} />
          <Route path='/signUp' element={<SignUp />} />
          <Route path='/login' element={<Login />} />
          <Route path='/editor/:projectID' element={isAuthenticated ? <EditorPage /> : <Navigate to="/login"/>} />
          <Route path="*" element={isAuthenticated ? <NoPage />: <Navigate to="/login"/>} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App