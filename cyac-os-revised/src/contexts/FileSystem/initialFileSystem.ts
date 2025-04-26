import { FileSystemItem, FileType } from './fileSystemTypes.ts';

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
                        content: 'CYBERACME OS USER MANUAL\n\n1. Basic Commands:\n   - ls: List files and directories\n   - cd: Change directory\n   - cat: View file contents\n   - clear: Clear terminal screen\n   - help: Display help information\n\n2. Navigation:\n   Use "cd" to navigate directories. Example: cd documents\n   Use "ls" to see available files and folders.\n\n3. Running Programs:\n   Use "cat" command on program files to run them.\n   Example: cat tetris'
                    }
                ]
            },
            {
                name: 'programs',
                type: FileType.Directory,
                children: [
                    {
                        name: 'games',
                        type: FileType.Directory,
                        children: [
                            {
                                name: 'tetris',
                                type: FileType.Scene,
                                content: 'TETRIS_GAME_COMPONENT'
                            },
                            {
                                name: 'snake',
                                type: FileType.Scene,
                                content: 'SNAKE_GAME_COMPONENT'
                            }
                        ]
                    },
                    {
                        name: 'utilities',
                        type: FileType.Directory,
                        children: [
                            {
                                name: 'calculator',
                                type: FileType.Scene,
                                content: 'CALCULATOR_COMPONENT'
                            },
                            {
                                name: 'clock',
                                type: FileType.Scene,
                                content: 'CLOCK_COMPONENT'
                            }
                        ]
                    },
                    {
                        name: 'browser',
                        type: FileType.Directory,
                        children: [
                            {
                                name: 'cyberacme_browser',
                                type: FileType.Scene,
                                content: 'BROWSER_COMPONENT'
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
                name: 'welcome',
                type: FileType.Scene,
                content: 'WELCOME_SCREEN_COMPONENT'
            },
            {
                name: 'restricted',
                type: FileType.Directory,
                restricted: true,
                children: [
                    {
                        name: 'admin_panel',
                        type: FileType.Scene,
                        restricted: true,
                        content: 'ADMIN_PANEL_COMPONENT'
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