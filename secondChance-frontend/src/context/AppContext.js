import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext(null);
export const AppProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(sessionStorage.getItem('auth-token')));
  const [userName, setUserName] = useState(() => sessionStorage.getItem('name') || '');
  return <AppContext.Provider value={{ isLoggedIn, setIsLoggedIn, userName, setUserName }}>{children}</AppContext.Provider>;
};
export const useAppContext = () => useContext(AppContext);