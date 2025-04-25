import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { ThemeType, ThemeProperties, themes } from './themeData.ts';

// Context interface
interface ThemeContextType {
    currentTheme: ThemeType;
    themes: Record<ThemeType, ThemeProperties>;
    setTheme: (theme: ThemeType) => void;
    themeProperties: ThemeProperties;
}

// Default context
const defaultContext: ThemeContextType = {
    currentTheme: ThemeType.Default,
    themes,
    setTheme: () => {},
    themeProperties: themes[ThemeType.Default]
};

// Create context
export const ThemeContext = createContext<ThemeContextType>(defaultContext);

// Provider props
interface ThemeProviderProps {
    children: ReactNode;
}

// Provider component
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const [currentTheme, setCurrentTheme] = useState<ThemeType>(() => {
        // Try to load saved theme from localStorage
        const savedTheme = localStorage.getItem('cyberacmeTheme');
        return savedTheme && Object.values(ThemeType).includes(savedTheme as ThemeType)
            ? savedTheme as ThemeType
            : ThemeType.Default;
    });

    // Apply theme to CSS variables when theme changes
    useEffect(() => {
        const themeProps = themes[currentTheme];
        const root = document.documentElement;

        // Apply all theme properties as CSS variables
        Object.entries(themeProps).forEach(([key, value]) => {
            // Convert camelCase to kebab-case for CSS variables
            const cssVarName = key.replace(/([A-Z])/g, '-$1').toLowerCase();
            root.style.setProperty(`--${cssVarName}`, value);
        });

        // Save theme selection to localStorage
        localStorage.setItem('cyberacmeTheme', currentTheme);
    }, [currentTheme]);

    // Set theme
    const setTheme = (theme: ThemeType) => {
        setCurrentTheme(theme);
    };

    // Context value
    const contextValue: ThemeContextType = {
        currentTheme,
        themes,
        setTheme,
        themeProperties: themes[currentTheme]
    };

    return (
        <ThemeContext.Provider value={contextValue}>
            {children}
        </ThemeContext.Provider>
    );
};