// src/utils/AuthContext.js
import { createContext, useContext, useState, useEffect } from "react";
import UserService from "../services/userService";
import * as jwt_decode from "jwt-decode";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore authentication state on page load
    const restoreAuth = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("currentUser");

        if (token && storedUser) {
          // Temporarily set the user from localStorage to avoid flickering
          setCurrentUser(JSON.parse(storedUser));

          // Validate the token with the backend
          try {
            const response = await UserService.getCurrentUser();
            setCurrentUser(response.data); // Update with fresh data from the backend
          } catch (error) {
            console.error("Token validation failed:", error);
            // If token validation fails, clear the user state
            localStorage.removeItem("currentUser");
            localStorage.removeItem("token");
            setCurrentUser(null);
          }
        }
      } catch (error) {
        console.error("Error restoring authentication:", error);
      } finally {
        setLoading(false);
      }
    };

    restoreAuth();
  }, []);

  const login = (userData) => {
    setCurrentUser(userData.user || userData);
    localStorage.setItem(
      "currentUser",
      JSON.stringify(userData.user || userData)
    );
    if (userData.token) {
      localStorage.setItem("token", userData.token);
    }
  };

  // Handle Google OAuth login
  const loginWithGoogle = async (googleResponse) => {
    try {
      // Extract the credential from the Google response
      const { credential } = googleResponse;
      
      // Send the credential to the backend for verification
      const response = await UserService.loginWithGoogle({ credential });
      
      // Store the user data and token just like regular login
      login(response.data);
      
      return response.data;
    } catch (error) {
      console.error("Google login failed:", error);
      throw error;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
    localStorage.removeItem("token");
  };

  const updateCurrentUser = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem("currentUser", JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        login,
        loginWithGoogle,
        logout,
        loading,
        updateCurrentUser,
        isAuthenticated: !!currentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
