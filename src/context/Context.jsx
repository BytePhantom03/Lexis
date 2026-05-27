import React, { createContext } from "react";
export const dataContext = createContext();
export const userContext = createContext();
export const themeContext = createContext();
export const commentUIContext = createContext();
export const userProvider = userContext.Provider;
export const themeProvider = themeContext.Provider;
export const dataProvider = dataContext.Provider;
