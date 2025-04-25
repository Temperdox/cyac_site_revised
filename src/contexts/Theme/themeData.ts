// Theme options
export enum ThemeType {
    Default = 'default',
    HighContrast = 'high-contrast',
    BlueTint = 'blue-tint',
    GreenMatrix = 'green-matrix',
    AmberTerm = 'amber-terminal',
    RedAlert = 'red-alert'
}

// Theme properties interface
export interface ThemeProperties {
    primaryColor: string;
    primaryColorDim: string;
    secondaryColor: string;
    backgroundColor: string;
    textColor: string;
    terminalBg: string;
    terminalText: string;
    windowBg: string;
    windowBorder: string;
    taskbarBg: string;
    taskbarBorder: string;
}

// Define themes
export const themes: Record<ThemeType, ThemeProperties> = {
    [ThemeType.Default]: {
        primaryColor: '#33ff33',
        primaryColorDim: '#228822',
        secondaryColor: '#ff3333',
        backgroundColor: '#000900',
        textColor: '#ccffcc',
        terminalBg: '#000000',
        terminalText: '#33ff33',
        windowBg: '#001122',
        windowBorder: '#0066cc',
        taskbarBg: '#220000',
        taskbarBorder: '#cc0000'
    },
    [ThemeType.HighContrast]: {
        primaryColor: '#ffffff',
        primaryColorDim: '#aaaaaa',
        secondaryColor: '#ffff00',
        backgroundColor: '#000000',
        textColor: '#ffffff',
        terminalBg: '#000000',
        terminalText: '#ffffff',
        windowBg: '#000000',
        windowBorder: '#ffffff',
        taskbarBg: '#000000',
        taskbarBorder: '#ffffff'
    },
    [ThemeType.BlueTint]: {
        primaryColor: '#33aaff',
        primaryColorDim: '#2266aa',
        secondaryColor: '#ff33cc',
        backgroundColor: '#000022',
        textColor: '#bbddff',
        terminalBg: '#000033',
        terminalText: '#33aaff',
        windowBg: '#001133',
        windowBorder: '#3366cc',
        taskbarBg: '#000055',
        taskbarBorder: '#3366cc'
    },
    [ThemeType.GreenMatrix]: {
        primaryColor: '#00ff00',
        primaryColorDim: '#008800',
        secondaryColor: '#88ff88',
        backgroundColor: '#000500',
        textColor: '#00ff00',
        terminalBg: '#000800',
        terminalText: '#00ff00',
        windowBg: '#001100',
        windowBorder: '#00aa00',
        taskbarBg: '#001800',
        taskbarBorder: '#00cc00'
    },
    [ThemeType.AmberTerm]: {
        primaryColor: '#ffb000',
        primaryColorDim: '#cc7000',
        secondaryColor: '#ff6600',
        backgroundColor: '#100a00',
        textColor: '#ffcc88',
        terminalBg: '#000000',
        terminalText: '#ffb000',
        windowBg: '#1a0a00',
        windowBorder: '#cc7000',
        taskbarBg: '#2a1000',
        taskbarBorder: '#cc7000'
    },
    [ThemeType.RedAlert]: {
        primaryColor: '#ff0000',
        primaryColorDim: '#aa0000',
        secondaryColor: '#ffffff',
        backgroundColor: '#220000',
        textColor: '#ffaaaa',
        terminalBg: '#330000',
        terminalText: '#ff0000',
        windowBg: '#220000',
        windowBorder: '#ff0000',
        taskbarBg: '#550000',
        taskbarBorder: '#ff0000'
    }
};