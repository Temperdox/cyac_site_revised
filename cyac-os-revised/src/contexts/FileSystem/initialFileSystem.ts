import { FileSystemItem, FileType } from './fileSystemTypes.ts';
import Browser from "../../computers/myComputer/programs/public/browser/Browser.tsx";
// When you actually implement, import the Browser and GameLauncher components
// import Browser from '../components/Browser/Browser';
// import GameLauncher from '../components/GameLauncher/GameLauncher';

/**
 * Initial file system structure
 */
export const initialFileSystem: FileSystemItem[] = [
    {
        name: 'home',
        type: FileType.Directory,
        children: [
            {
                name: 'documents',
                type: FileType.Directory,
                children: [
                    {
                        name: 'readme.txt',
                        type: FileType.File,
                        content: 'Welcome to CyberAcme OS v3.4.0\n\nThis is a secure terminal system for managing and accessing CyberAcme resources. Please use the "help" command for more information.\n\nCyberAcme - Tomorrow\'s Tech Today'
                    },
                    {
                        name: 'user_manual.txt',
                        type: FileType.File,
                        content: 'CYBERACME OS USER MANUAL\n\n1. Basic Commands:\n   - ls: List files and directories\n   - cd: Change directory\n   - cat: View file contents\n   - clear: Clear terminal screen\n   - help: Display help information\n\n2. Navigation:\n   Use "cd" to navigate directories. Example: cd documents\n   Use "ls" to see available files and folders.\n\n3. Running Programs:\n   Use "cat" command on program files to run them.\n   Example: cat game_launcher.exe'
                    }
                ]
            },
            {
                name: 'programs',
                type: FileType.Directory,
                children: [
                    {
                        name: 'game_launcher.exe',
                        type: FileType.File,
                        content: 'GAME_LAUNCHER_COMPONENT',
                        // When you implement GameLauncher, uncomment this:
                        // component: GameLauncher,
                        metadata: {
                            icon: 'img:/programIcons/game-launcher-icon.png'
                        }
                    },
                    {
                        name: 'utilities',
                        type: FileType.Directory,
                        children: [
                            {
                                name: 'calculator.exe',
                                type: FileType.File,
                                content: 'CALCULATOR_COMPONENT',
                                metadata: {
                                    icon: 'img:/programIcons/calculator-icon.png'
                                }
                            },
                            {
                                name: 'clock.exe',
                                type: FileType.File,
                                content: 'CLOCK_COMPONENT',
                                metadata: {
                                    icon: 'img:/programIcons/clock-icon.png'
                                }
                            }
                        ]
                    },
                    {
                        name: 'browser',
                        type: FileType.Directory,
                        children: [
                            {
                                name: 'cyberacme_browser.exe',
                                type: FileType.File,
                                content: 'BROWSER_COMPONENT',
                                component: Browser,
                                metadata: {
                                    icon: 'img:/programIcons/browser-icon.png'
                                }
                            }
                        ]
                    }
                ]
            },
            {
                name: 'system',
                type: FileType.Directory,
                children: [
                    {
                        name: 'security',
                        type: FileType.Directory,
                        restricted: true,
                        children: [
                            {
                                name: 'access_log.txt',
                                type: FileType.File,
                                restricted: true,
                                content: 'ACCESS LOG - RESTRICTED\n\n2025-04-22 08:15:23 - Admin login successful\n2025-04-22 09:30:12 - System backup initiated\n2025-04-23 14:22:56 - Security scan completed\n2025-04-24 10:11:32 - System update applied'
                            }
                        ]
                    },
                    {
                        name: 'config',
                        type: FileType.Directory,
                        children: [
                            {
                                name: 'system_info.txt',
                                type: FileType.File,
                                content: 'SYSTEM INFORMATION\n\nOS Version: CyberAcme OS v3.4.0\nKernel: CyberKernel 5.2.3\nCPU: Quantum Core i9-X 5.2GHz\nRAM: 32GB Quantum Memory\nStorage: 2TB Quantum SSD, 16TB Holographic Array\nNetwork: Quantum Entanglement Module v4.2'
                            }
                        ]
                    }
                ]
            },
            {
                name: 'welcome.exe',
                type: FileType.File,
                content: 'WELCOME_SCREEN_COMPONENT',
                metadata: {
                    icon: 'img:/programIcons/welcome-icon.png'
                }
            },
            {
                name: 'restricted',
                type: FileType.Directory,
                restricted: true,
                children: [
                    {
                        name: 'admin_panel.exe',
                        type: FileType.File,
                        restricted: true,
                        content: 'ADMIN_PANEL_COMPONENT',
                        metadata: {
                            icon: 'img:/programIcons/admin-icon.png'
                        }
                    },
                    {
                        name: 'secret_files',
                        type: FileType.Directory,
                        restricted: true,
                        children: [
                            {
                                name: 'project_omega.txt',
                                type: FileType.File,
                                restricted: true,
                                content: 'PROJECT OMEGA - TOP SECRET\n\nProject Omega represents our most ambitious initiative to date. The development of a completely autonomous AI security system with predictive capabilities beyond anything currently in existence.\n\nCurrent progress: 78%\nExpected completion: Q3 2025\n\nSECURITY LEVEL: ALPHA - AUTHORIZED PERSONNEL ONLY'
                            }
                        ]
                    }
                ]
            }
        ]
    }
];