import React, { useState, useEffect, useRef } from 'react';
import styles from './Browser.module.css';

// Define the Bookmark interface
interface Bookmark {
    title: string;
    url: string;
    icon: string;
    bgColor?: string;
}

// Define the HistoryItem interface
interface HistoryItem {
    title: string;
    url: string;
    timestamp: number;
}

// Browser component
const Browser: React.FC = () => {
    // State
    const [currentUrl, setCurrentUrl] = useState<string>('home.html');
    const [urlInput, setUrlInput] = useState<string>('home.html');
    const [pageTitle, setPageTitle] = useState<string>('CyberAcme Browser');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [showBookmarks, setShowBookmarks] = useState<boolean>(true);
    const [historyIndex, setHistoryIndex] = useState<number>(-1);
    const [canGoBack, setCanGoBack] = useState<boolean>(false);
    const [canGoForward, setCanGoForward] = useState<boolean>(false);
    const [showAddBookmarkModal, setShowAddBookmarkModal] = useState<boolean>(false);
    const [newBookmarkTitle, setNewBookmarkTitle] = useState<string>('');
    const [newBookmarkIcon, setNewBookmarkIcon] = useState<string>('');
    const [showSettings, setShowSettings] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const iframeRef = useRef<HTMLIFrameElement>(null);

    // Initial setup - load saved bookmarks and history
    useEffect(() => {
        // Load bookmarks from localStorage if available
        const savedBookmarks = localStorage.getItem('cyberacme_browser_bookmarks');
        if (savedBookmarks) {
            try {
                setBookmarks(JSON.parse(savedBookmarks));
            } catch (e) {
                console.error('Failed to parse saved bookmarks', e);
            }
        } else {
            // Default bookmarks with image icons - these will need to be updated with actual paths
            setBookmarks([
                { title: 'Home', url: 'home.html', icon: '🏠', bgColor: '#001800' },
                { title: 'Factions', url: 'factions/factions.html', icon: '📊', bgColor: '#180018' },
                { title: 'Propaganda', url: 'propaganda/propaganda.html', icon: '📢', bgColor: '#181800' },
                { title: 'Games', url: 'games.html', icon: '🎮', bgColor: '#001818' },
                { title: 'News', url: 'news.html', icon: '📰', bgColor: '#180000' },
                { title: 'Tools', url: 'tools.html', icon: '🔧', bgColor: '#101010' }
            ]);
        }

        // Load history from localStorage if available
        const savedHistory = localStorage.getItem('cyberacme_browser_history');
        if (savedHistory) {
            try {
                const parsedHistory = JSON.parse(savedHistory);
                setHistory(parsedHistory);
            } catch (e) {
                console.error('Failed to parse saved history', e);
            }
        }

        // Load the home page by default
        loadPage('home.html');
    }, []);

    // Save bookmarks and history when they change
    useEffect(() => {
        localStorage.setItem('cyberacme_browser_bookmarks', JSON.stringify(bookmarks));
    }, [bookmarks]);

    useEffect(() => {
        localStorage.setItem('cyberacme_browser_history', JSON.stringify(history));
    }, [history]);

    // Update browser navigation buttons state
    useEffect(() => {
        setCanGoBack(historyIndex > 0);
        setCanGoForward(historyIndex < history.length - 1);
    }, [historyIndex, history]);

    // Function to load page content from actual HTML files
    const loadPage = (url: string) => {
        setError(null);
        setIsLoading(true);

        // Parse the URL to extract the title
        let newPageTitle = 'Unknown Page';
        if (url.includes('home')) {
            newPageTitle = 'Browser Home';
        } else if (url.includes('factions')) {
            newPageTitle = 'Factions';
        } else if (url.includes('propaganda')) {
            newPageTitle = 'CyberAcme Propaganda';
        } else {
            // Extract title from URL by removing extensions and paths
            const urlParts = url.split('/');
            const fileName = urlParts[urlParts.length - 1];
            newPageTitle = fileName.replace(/\.[^/.]+$/, ""); // Remove extension
            newPageTitle = newPageTitle.charAt(0).toUpperCase() + newPageTitle.slice(1); // Capitalize
        }

        setPageTitle(newPageTitle);

        // If URL doesn't start with sites/, prepend it
        if (!url.startsWith('sites/') && !url.startsWith('http')) {
            url = `sites/${url}`;
        }

        // Update browser bar with a simplified version (without 'sites/' prefix)
        const displayUrl = url.replace('sites/', '');
        setUrlInput(displayUrl);
        setCurrentUrl(displayUrl);

        // Set the iframe source to load the actual HTML file
        if (iframeRef.current) {
            // Fix no-self-assign warning by using a variable
            const newSource = url;
            iframeRef.current.src = newSource;
        }

        // Simulate a short loading delay
        setTimeout(() => {
            setIsLoading(false);

            // Add to history if this is a new navigation, not back/forward
            if (historyIndex === history.length - 1 || historyIndex === -1) {
                const newHistoryItem = {
                    title: newPageTitle,
                    url: displayUrl,
                    timestamp: Date.now()
                };

                setHistory(prev => [...prev, newHistoryItem]);
                setHistoryIndex(prev => prev + 1);
            }
        }, 300);
    };

    // Handle iframe load event
    const handleIframeLoad = () => {
        setIsLoading(false);

        // Try to extract title from the loaded page
        try {
            if (iframeRef.current && iframeRef.current.contentDocument) {
                const iframeTitle = iframeRef.current.contentDocument.title;
                if (iframeTitle) {
                    setPageTitle(iframeTitle);
                }
            }
        } catch (e) {
            // Ignore cross-origin errors
            console.warn('Could not access iframe content:', e);
        }
    };

    // Handle URL input submission
    const handleUrlSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        loadPage(urlInput);
    };

    // Navigate back in history
    const goBack = () => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            const prevPage = history[newIndex];
            setHistoryIndex(newIndex);
            setCurrentUrl(prevPage.url);
            setUrlInput(prevPage.url);
            loadPage(prevPage.url);
        }
    };

    // Navigate forward in history
    const goForward = () => {
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            const nextPage = history[newIndex];
            setHistoryIndex(newIndex);
            setCurrentUrl(nextPage.url);
            setUrlInput(nextPage.url);
            loadPage(nextPage.url);
        }
    };

    // Go to new tab/home page
    const newTab = () => {
        loadPage('home.html');
    };

    // Add a bookmark
    const addBookmark = () => {
        // If title was not provided, use the page title
        const bookmarkTitle = newBookmarkTitle || pageTitle;

        // Check if this URL is already bookmarked
        if (!bookmarks.some(bookmark => bookmark.url === currentUrl)) {
            const newBookmark: Bookmark = {
                title: bookmarkTitle,
                url: currentUrl,
                icon: newBookmarkIcon || '🔖' // Use custom icon or default emoji
            };

            setBookmarks(prev => [...prev, newBookmark]);
        }

        setShowAddBookmarkModal(false);
        setNewBookmarkTitle('');
        setNewBookmarkIcon('');
    };

    // Handle error when iframe fails to load
    const handleIframeError = () => {
        setError(`Failed to load: ${currentUrl}`);
        setIsLoading(false);
    };

    // Handle bookmark click
    const handleBookmarkClick = (bookmark: Bookmark) => {
        loadPage(bookmark.url);
    };

    // Function to handle refresh
    const handleRefresh = () => {
        if (iframeRef.current) {
            const currentSrc = iframeRef.current.src;
            iframeRef.current.src = '';
            setTimeout(() => {
                if (iframeRef.current) {
                    iframeRef.current.src = currentSrc;
                }
            }, 10);
        }
    };

    return (
        <div className={styles.browserContainer}>
            {/* Browser toolbar */}
            <div className={styles.browserToolbar}>
                <div className={styles.navigationButtons}>
                    <button
                        className={styles.navButton}
                        onClick={goBack}
                        disabled={!canGoBack}
                        title="Back"
                    >
                        ◀
                    </button>
                    <button
                        className={styles.navButton}
                        onClick={goForward}
                        disabled={!canGoForward}
                        title="Forward"
                    >
                        ▶
                    </button>
                    <button
                        className={styles.navButton}
                        onClick={newTab}
                        title="Home"
                    >
                        ⌂
                    </button>
                    <button
                        className={styles.navButton}
                        onClick={handleRefresh}
                        title="Refresh"
                    >
                        ↻
                    </button>
                </div>

                {/* URL input */}
                <form className={styles.urlBar} onSubmit={handleUrlSubmit}>
                    <input
                        type="text"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        className={styles.urlInput}
                    />
                    <button
                        type="submit"
                        className={styles.goButton}
                        title="Go"
                    >
                        GO
                    </button>
                </form>

                {/* Browser controls */}
                <div className={styles.browserControls}>
                    <button
                        className={styles.controlButton}
                        onClick={() => setShowAddBookmarkModal(true)}
                        title="Add Bookmark"
                    >
                        🔖
                    </button>
                    <button
                        className={styles.controlButton}
                        onClick={() => setShowBookmarks(!showBookmarks)}
                        title={showBookmarks ? "Hide Bookmarks" : "Show Bookmarks"}
                    >
                        📚
                    </button>
                    <button
                        className={styles.controlButton}
                        onClick={() => setShowSettings(!showSettings)}
                        title="Settings"
                    >
                        ⚙️
                    </button>
                </div>
            </div>

            {/* Bookmarks bar */}
            {showBookmarks && (
                <div className={styles.bookmarksBar}>
                    {bookmarks.map((bookmark, index) => (
                        <div
                            key={index}
                            className={styles.bookmarkItem}
                            onClick={() => handleBookmarkClick(bookmark)}
                            title={bookmark.title}
                            style={bookmark.bgColor ? { backgroundColor: bookmark.bgColor } : {}}
                        >
                            {bookmark.icon.startsWith('img:') ? (
                                <div
                                    className={styles.bookmarkImage}
                                    style={{
                                        backgroundImage: `url(${bookmark.icon.substring(4)})`
                                    }}
                                ></div>
                            ) : (
                                <span className={styles.bookmarkIcon}>{bookmark.icon}</span>
                            )}
                            <span className={styles.bookmarkTitle}>{bookmark.title}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Browser content */}
            <div className={styles.browserContent}>
                {isLoading && (
                    <div className={styles.loadingOverlay}>
                        <div className={styles.loadingSpinner}></div>
                        <div className={styles.loadingText}>LOADING...</div>
                    </div>
                )}

                {error && (
                    <div className={styles.errorOverlay}>
                        <div className={styles.errorIcon}>⚠️</div>
                        <div className={styles.errorText}>{error}</div>
                        <button
                            className={styles.errorButton}
                            onClick={() => setError(null)}
                        >
                            DISMISS
                        </button>
                    </div>
                )}

                <iframe
                    ref={iframeRef}
                    className={styles.browserFrame}
                    title="CyberAcme Browser"
                    onLoad={handleIframeLoad}
                    onError={handleIframeError}
                    sandbox="allow-same-origin allow-scripts"
                ></iframe>
            </div>

            {/* Add bookmark modal */}
            {showAddBookmarkModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>ADD BOOKMARK</div>
                        <div className={styles.modalContent}>
                            <div className={styles.modalField}>
                                <label>URL:</label>
                                <input
                                    type="text"
                                    value={currentUrl}
                                    readOnly
                                    className={styles.modalInput}
                                />
                            </div>
                            <div className={styles.modalField}>
                                <label>TITLE:</label>
                                <input
                                    type="text"
                                    value={newBookmarkTitle}
                                    onChange={(e) => setNewBookmarkTitle(e.target.value)}
                                    placeholder={pageTitle}
                                    className={styles.modalInput}
                                />
                            </div>
                            <div className={styles.modalField}>
                                <label>ICON:</label>
                                <input
                                    type="text"
                                    value={newBookmarkIcon}
                                    onChange={(e) => setNewBookmarkIcon(e.target.value)}
                                    placeholder="🔖 or img:/path/to/icon.png"
                                    className={styles.modalInput}
                                />
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <button
                                className={styles.modalButton}
                                onClick={addBookmark}
                            >
                                SAVE
                            </button>
                            <button
                                className={styles.modalButton}
                                onClick={() => setShowAddBookmarkModal(false)}
                            >
                                CANCEL
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Settings modal */}
            {showSettings && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>BROWSER SETTINGS</div>
                        <div className={styles.modalContent}>
                            <div className={styles.settingSection}>
                                <h3>SECURITY</h3>
                                <div className={styles.settingItem}>
                                    <label>
                                        <input type="checkbox" defaultChecked />
                                        Enable security protocols
                                    </label>
                                </div>
                                <div className={styles.settingItem}>
                                    <label>
                                        <input type="checkbox" defaultChecked />
                                        Block unauthorized sites
                                    </label>
                                </div>
                                <div className={styles.settingItem}>
                                    <label>
                                        <input type="checkbox" defaultChecked />
                                        Report suspicious activity
                                    </label>
                                </div>
                            </div>

                            <div className={styles.settingSection}>
                                <h3>PRIVACY</h3>
                                <div className={styles.settingItem}>
                                    <label>
                                        <input type="checkbox" defaultChecked />
                                        Clear history on exit
                                    </label>
                                </div>
                                <div className={styles.settingItem}>
                                    <label>
                                        <input type="checkbox" defaultChecked />
                                        Block trackers
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <button
                                className={styles.modalButton}
                                onClick={() => setShowSettings(false)}
                            >
                                CLOSE
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Browser;