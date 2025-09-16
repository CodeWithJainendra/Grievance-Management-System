import { clearCache } from "@/helpers/cache";
import { getUserData, loginUser } from "@/services/auth";
import React, { createContext, useEffect, useState, useContext } from "react";

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(localStorage.getItem("User") ?? 'null');

  useEffect(() => {
    localStorage.setItem("User", user);

  }, [user]);

  return (
    <UserContext.Provider value={[user, setUser]}>
      {children}
    </UserContext.Provider>
  );
};

export function useFilter() {
    return useContext(UserContext);
  }

export function getUser() {
  let userString = window.sessionStorage.getItem('User')

  // if( userString == null || userString == 'null' )
  //   logout()

  return userString ? JSON.parse(userString) : null
}

export function setUser(userData = null, relaod = true) {
  if( !userData )
    window.sessionStorage.clear()
  else
    window.sessionStorage.setItem('User', JSON.stringify(userData))

  if( relaod )
    window.location.reload()
}

export function logout() {
  // httpService.auth.post('/logout')
  //   .finally( () => setUser(null) )
  clearCache()
  setUser(null)
}

export function login(username, password) {
  // Mock authentication for local development
  if (username === 'admin' && password === 'admin') {
    const mockUser = {
      username: 'admin',
      accessToken: 'mock-token-' + Date.now(),
      role: 'admin',
      is_authenticated: true
    };
    
    setUser(mockUser, false);
    
    // Mock user data fetch
    const mockUserData = {
      username: 'admin',
      email: 'admin@igms.local',
      first_name: 'Admin',
      last_name: 'User',
      role: 'admin'
    };
    
    setTimeout(() => {
      setUser({
        ...mockUser,
        ...mockUserData
      });
    }, 500);
    
    return Promise.resolve({ data: { success: true } });
  } else {
    return Promise.reject(new Error('Invalid credentials'));
  }
}