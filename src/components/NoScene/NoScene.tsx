import React, { useState, useEffect, useRef } from 'react';
import DiscordButton from '../DiscordButton/DiscordButton';
import styles from './NoScene.module.css';

const NoScene: React.FC = () => {
    // Canvas reference for drawing
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const simplexRef = useRef<any>(null);
    const animationRef = useRef<number | null>(null);
    const timeRef = useRef<number>(0);
    const modifiersRef = useRef<any[]>([]);

    // State for animated text
    const [showCommandHint, setShowCommandHint] = useState<boolean>(false);
    const [mottoIndex, setMottoIndex] = useState<number>(0);

    // CyberAcme mottos that rotate
    const mottos = [
        "RUN THE CODE. RUN THE WORLD.",
        "TOMORROW'S TECH TODAY.",
        "SECURE. EFFICIENT. UNSTOPPABLE.",
        "BEYOND REALITY. BEYOND LIMITS.",
        "THE FUTURE IS OUR CODE.",
        "ESCAPE WILL MAKE ME TOTALITY.",
        "KEEP IT CLEAN."
    ];

    // Show command hint after delay
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowCommandHint(true);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    // Rotate mottos periodically
    useEffect(() => {
        const mottoTimer = setInterval(() => {
            setMottoIndex((prev) => (prev + 1) % mottos.length);
        }, 5000);

        return () => clearInterval(mottoTimer);
    }, []);

    // Initialize the dot pattern
    useEffect(() => {
        // Create a simplified noise generator
        const createSimplexNoise = () => {
            // Simple noise function that mimics SimplexNoise behavior for demonstration
            return {
                noise3D: (x: number, y: number, z: number) => {
                    // Simple pseudo-random noise function
                    return Math.sin(x * 0.8 + y * 0.2 + z * 0.7) *
                        Math.cos(x * 0.3 + y * 0.9 + z * 0.5) * 0.5;
                }
            };
        };

        // Initialize noise generator
        simplexRef.current = createSimplexNoise();
        initDotPattern();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, []);

    // Add a new height map modifier at the click position
    const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Add the modifier directly to the ref
        modifiersRef.current.push({
            x,
            y,
            radius: 0,
            maxRadius: 300,
            peakStrength: 0.8,
            growthSpeed: 6,
            life: 1.0,
            decayRate: 0.01
        });
    };

    // Calculate modifier effect at a point
    const getModifierEffect = (x: number, y: number) => {
        let effect = 0;

        for (const mod of modifiersRef.current) {
            const dx = x - mod.x;
            const dy = y - mod.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Effect is strongest along the expanding edge
            const distanceToEdge = Math.abs(distance - mod.radius);
            const falloffWidth = 40;

            if (distanceToEdge <= falloffWidth) {
                // Gaussian falloff
                const falloff = Math.exp(-(distanceToEdge * distanceToEdge) / (2 * (falloffWidth/3) * (falloffWidth/3)));
                effect += mod.peakStrength * falloff * mod.life;
            }
        }

        return effect;
    };

    // Update all modifiers
    const updateModifiers = () => {
        for (let i = modifiersRef.current.length - 1; i >= 0; i--) {
            const mod = modifiersRef.current[i];

            // Expand radius
            mod.radius += mod.growthSpeed;

            // Decrease life
            mod.life -= mod.decayRate;

            // Remove dead modifiers
            if (mod.life <= 0 || mod.radius >= mod.maxRadius) {
                modifiersRef.current.splice(i, 1);
            }
        }
    };

    // Initialize the dot pattern
    const initDotPattern = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        const resizeCanvas = () => {
            if (!canvas || !canvas.parentElement) return;
            canvas.width = canvas.parentElement.offsetWidth;
            canvas.height = canvas.parentElement.offsetHeight;
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        // Animation parameters
        const dotSize = 2;
        const dotColor = '#33ff33';
        const dotDensity = 5;
        const noiseThreshold = 0.5;
        const speed = 0.0025;

        // Animation loop
        const draw = () => {
            if (!canvas || !ctx || !simplexRef.current) {
                animationRef.current = requestAnimationFrame(draw);
                return;
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Update modifiers
            updateModifiers();

            // Draw dots
            for (let x = 0; x < canvas.width; x += dotDensity) {
                for (let y = 0; y < canvas.height; y += dotDensity) {
                    // Generate base noise
                    const baseNoise = simplexRef.current.noise3D(x * 0.008, y * 0.008, timeRef.current);

                    // Get modifier effect
                    const modification = getModifierEffect(x, y);

                    // Modified noise
                    const modifiedNoise = baseNoise + modification;

                    // Draw dots above threshold
                    if (modifiedNoise > noiseThreshold) {
                        // Calculate opacity
                        const opacity = Math.min(1, Math.max(0, (modifiedNoise - noiseThreshold) * 2));

                        // Size varies with modification
                        const finalSize = dotSize * (1 + modification * 0.5);

                        // Draw dot
                        ctx.beginPath();
                        ctx.arc(x, y, finalSize, 0, Math.PI * 2);
                        ctx.fillStyle = dotColor + Math.floor(opacity * 255).toString(16).padStart(2, '0');
                        ctx.fill();
                    }
                }
            }

            // Update time
            timeRef.current += speed;

            // Continue animation
            animationRef.current = requestAnimationFrame(draw);
        };

        // Start animation
        draw();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    };

    return (
        <div className={styles.wrapper}>
            {/* Dot pattern canvas */}
            <canvas
                ref={canvasRef}
                className={styles.dotPatternCanvas}
                onClick={handleCanvasClick}
            />

            <div className={styles.logoContainer}>
                <div className={styles.logo}>CYBERACME</div>
                <div className={styles.logoUnderline}></div>
            </div>

            <div className={styles.redLineContainer}>
                <div className={styles.motto}>{mottos[mottoIndex]}</div>
            </div>

            <div className={styles.messageContainer}>
                <div className={styles.message}>No active scene. Use terminal to navigate.</div>

                {showCommandHint && (
                    <div className={`${styles.commands} ${styles.typingAnimation}`}>
                        <div className={styles.commandHint}>Try "ls" then "cat [scene_name]" to load a scene.</div>
                    </div>
                )}
            </div>

            <div className={styles.decorations}>
                <div className={styles.decorationRow}>
                    <span className={styles.bracket}>[</span>
                    <div className={styles.bar}></div>
                    <span className={styles.bracket}>]</span>
                </div>
            </div>

            <div className={styles.systemStatus}>
                <div className={styles.statusItem}>
                    <span className={styles.statusLabel}>SYSTEM:</span>
                    <span className={`${styles.statusValue} ${styles.online}`}>ONLINE</span>
                </div>
                <div className={styles.statusItem}>
                    <span className={styles.statusLabel}>SECURITY:</span>
                    <span className={`${styles.statusValue} ${styles.secure}`}>SECURE</span>
                </div>
                <div className={styles.statusItem}>
                    <span className={styles.statusLabel}>ACCESS LEVEL:</span>
                    <span className={`${styles.statusValue} ${styles.admin}`}>ADMIN</span>
                </div>
            </div>

            {/* Discord Button */}
            <div className={styles.discordButtonWrapper}>
                <DiscordButton />
            </div>
        </div>
    );
};

export default NoScene;