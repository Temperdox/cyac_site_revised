import React, { useState, useEffect } from 'react';
import styles from './GameLauncher.module.css';

interface Game {
    id: string;
    title: string;
    image: string;
    installed: boolean;
    launchable: boolean;
}

interface GameLauncherProps {
    onClose?: () => void;
}

const GameLauncher: React.FC<GameLauncherProps> = ({ onClose }) => {
    const [games, setGames] = useState<Game[]>([]);
    const [activeTab, setActiveTab] = useState<'library' | 'store'>('library');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [isInstalling, setIsInstalling] = useState<boolean>(false);
    const [installProgress, setInstallProgress] = useState<number>(0);
    const [currentlyInstalling, setCurrentlyInstalling] = useState<string | null>(null);

    // Load games from localStorage if available, or set defaults
    useEffect(() => {
        const savedGames = localStorage.getItem('cyberacme_games');
        if (savedGames) {
            try {
                setGames(JSON.parse(savedGames));
            } catch (e) {
                console.error('Failed to parse saved games', e);
                setDefaultGames();
            }
        } else {
            setDefaultGames();
        }
    }, []);

    // Save games to localStorage when they change
    useEffect(() => {
        localStorage.setItem('cyberacme_games', JSON.stringify(games));
    }, [games]);

    // Set default games
    const setDefaultGames = () => {
        const defaultGames: Game[] = [
            {
                id: 'tetris',
                title: 'Tetris',
                image: '/programIcons/tetris-icon.png',
                installed: true,
                launchable: true
            },
            {
                id: 'snake',
                title: 'Snake',
                image: '/programIcons/snake-icon.png',
                installed: true,
                launchable: true
            },
            {
                id: 'pong',
                title: 'Pong',
                image: '/programIcons/pong-icon.png',
                installed: false,
                launchable: false
            },
            {
                id: 'space-invaders',
                title: 'Space Invaders',
                image: '/programIcons/space-invaders-icon.png',
                installed: false,
                launchable: false
            },
            {
                id: 'pacman',
                title: 'Pac-Man',
                image: '/programIcons/pacman-icon.png',
                installed: false,
                launchable: false
            },
            {
                id: 'chess',
                title: 'Chess',
                image: '/programIcons/chess-icon.png',
                installed: false,
                launchable: false
            }
        ];
        setGames(defaultGames);
    };

    // Filter games based on search query
    const filteredGames = games.filter(game =>
        game.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Library games (installed)
    const libraryGames = filteredGames.filter(game => game.installed);

    // Store games (not installed)
    const storeGames = filteredGames.filter(game => !game.installed);

    // Handle game launch
    const handleLaunch = (game: Game) => {
        if (!game.launchable) return;

        // In a real implementation, this would launch the game
        console.log(`Launching game: ${game.title}`);
        alert(`Launching ${game.title}...\n\nThis is a placeholder. In a real implementation, this would launch the game component.`);
    };

    // Handle game installation
    const handleInstall = (game: Game) => {
        if (isInstalling) return;

        setIsInstalling(true);
        setInstallProgress(0);
        setCurrentlyInstalling(game.id);

        // Simulate installation process
        const installInterval = setInterval(() => {
            setInstallProgress(prev => {
                const newProgress = prev + Math.random() * 10;

                if (newProgress >= 100) {
                    clearInterval(installInterval);
                    setIsInstalling(false);
                    setCurrentlyInstalling(null);

                    // Update game status
                    setGames(prev => prev.map(g =>
                        g.id === game.id
                            ? { ...g, installed: true, launchable: true }
                            : g
                    ));

                    return 100;
                }

                return newProgress;
            });
        }, 300);
    };

    return (
        <div className={styles.gameLauncher}>
            <div className={styles.header}>
                <div className={styles.logo}>
                    <span className={styles.logoIcon}>🎮</span>
                    <span className={styles.logoText}>CYBERACME GAMES</span>
                </div>

                <div className={styles.searchBar}>
                    <input
                        type="text"
                        placeholder="Search games..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className={styles.controls}>
                    <button
                        className={styles.controlButton}
                        onClick={onClose}
                        title="Close"
                    >
                        X
                    </button>
                </div>
            </div>

            <div className={styles.tabs}>
                <button
                    className={`${styles.tabButton} ${activeTab === 'library' ? styles.active : ''}`}
                    onClick={() => setActiveTab('library')}
                >
                    LIBRARY
                </button>
                <button
                    className={`${styles.tabButton} ${activeTab === 'store' ? styles.active : ''}`}
                    onClick={() => setActiveTab('store')}
                >
                    STORE
                </button>
            </div>

            <div className={styles.content}>
                {activeTab === 'library' ? (
                    <div className={styles.gameGrid}>
                        {libraryGames.length > 0 ? (
                            libraryGames.map(game => (
                                <div key={game.id} className={styles.gameCard}>
                                    <div
                                        className={styles.gameImage}
                                        style={{ backgroundImage: `url(${game.image})` }}
                                    ></div>
                                    <div className={styles.gameTitle}>{game.title}</div>
                                    <button
                                        className={styles.gameButton}
                                        onClick={() => handleLaunch(game)}
                                        disabled={!game.launchable}
                                    >
                                        PLAY
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className={styles.emptyState}>
                                <div className={styles.emptyIcon}>📁</div>
                                <div className={styles.emptyText}>
                                    No games in your library.
                                    <br />
                                    Visit the store to find games.
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className={styles.gameGrid}>
                        {storeGames.length > 0 ? (
                            storeGames.map(game => (
                                <div key={game.id} className={styles.gameCard}>
                                    <div
                                        className={styles.gameImage}
                                        style={{ backgroundImage: `url(${game.image})` }}
                                    ></div>
                                    <div className={styles.gameTitle}>{game.title}</div>
                                    {isInstalling && currentlyInstalling === game.id ? (
                                        <div className={styles.installProgress}>
                                            <div
                                                className={styles.installProgressBar}
                                                style={{ width: `${installProgress}%` }}
                                            ></div>
                                            <div className={styles.installProgressText}>
                                                {Math.round(installProgress)}%
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            className={styles.gameButton}
                                            onClick={() => handleInstall(game)}
                                        >
                                            INSTALL
                                        </button>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className={styles.emptyState}>
                                <div className={styles.emptyIcon}>🔍</div>
                                <div className={styles.emptyText}>
                                    No games found in store.
                                    <br />
                                    Try a different search.
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className={styles.footer}>
                <div className={styles.status}>
                    {isInstalling ? (
                        <span className={styles.installing}>INSTALLING...</span>
                    ) : (
                        <span className={styles.online}>ONLINE</span>
                    )}
                </div>
                <div className={styles.copyright}>CYBERACME GAMES © 2025</div>
            </div>
        </div>
    );
};

export default GameLauncher;