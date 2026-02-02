"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

type Photo = {
    id: number;
    src: string;
    title: string;
    desc: string;
};

const PHOTOS: Photo[] = [
    {
        id: 1,
        src: "/photos/1.jpg",
        title: "Memory One",
        desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam.",
    },
    {
        id: 2,
        src: "/photos/2.jpg",
        title: "Memory Two",
        desc: "Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta.",
    },
    {
        id: 3,
        src: "/photos/3.jpg",
        title: "Memory Three",
        desc: "Mauris massa. Vestibulum lacinia arcu eget nulla. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.",
    },
    {
        id: 4,
        src: "/photos/4.jpg",
        title: "Memory Four",
        desc: "Curabitur sodales ligula in libero. Sed dignissim lacinia nunc. Curabitur tortor. Pellentesque nibh. Aenean quam. In scelerisque sem at dolor.",
    },
    {
        id: 5,
        src: "/photos/5.jpg",
        title: "Memory Five",
        desc: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.",
    },
];

type Scatter = {
    x: number;
    y: number;
    rotate: number;
};

type PhotoState = {
    top: number;
    left: number;
    rotate: number;
    zIndex: number;
};

const GALLERY_TOP = 80;
const GALLERY_LEFT = 80;
const ENLARGED_WIDTH = 600;

// Mobile breakpoint and dimensions
const MOBILE_BREAKPOINT = 768;
const MOBILE_GALLERY_LEFT = 20;
const MOBILE_ENLARGED_WIDTH = 320;
const MOBILE_SMALL_WIDTH = 100;

export default function Gallery() {
    const [activeId, setActiveId] = useState<number | null>(null);
    const [photoStates, setPhotoStates] = useState<{ [key: number]: PhotoState }>({});
    const [minZ, setMinZ] = useState(100);
    const [maxZ, setMaxZ] = useState(200);
    const [mounted, setMounted] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Check if mobile viewport
    const checkMobile = () => window.innerWidth < MOBILE_BREAKPOINT;

    // Get responsive dimensions
    const getDimensions = () => {
        const mobile = isMobile;
        // For mobile, position at bottom-right
        const mobileGalleryTop = mobile ? window.innerHeight - 250 : GALLERY_TOP;
        const mobileGalleryLeft = mobile ? window.innerWidth - 150 : GALLERY_LEFT;
        return {
            galleryTop: mobile ? mobileGalleryTop : GALLERY_TOP,
            galleryLeft: mobile ? mobileGalleryLeft : MOBILE_GALLERY_LEFT,
            enlargedWidth: mobile ? MOBILE_ENLARGED_WIDTH : ENLARGED_WIDTH,
            smallWidth: mobile ? MOBILE_SMALL_WIDTH : 180,
        };
    };

    // Generate random scatter position
    const generateScatter = (): Scatter => {
        const mobile = isMobile;
        return {
            x: Math.round(Math.random() * (mobile ? 30 : 50) - (mobile ? 15 : 25)),
            y: Math.round(Math.random() * (mobile ? 30 : 50) - (mobile ? 15 : 25)),
            rotate: Math.round(Math.random() * 30 - 15),
        };
    };

    // Calculate center position for enlarged photo that fits in viewport
    const getCenterPosition = () => {
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        const dims = getDimensions();
        const mobile = isMobile;

        // Estimated enlarged photo height (smaller on mobile)
        const estimatedHeight = mobile ? 450 : 550;

        // For mobile, we want absolute center of viewport
        // For desktop, we calculate relative to gallery position
        if (mobile) {
            // Absolute center X (relative to gallery origin)
            const absoluteCenterX = (viewportWidth / 2) - (dims.enlargedWidth / 2);
            const centerX = absoluteCenterX - dims.galleryLeft;

            // Absolute center Y (relative to gallery origin)
            const absoluteCenterY = (viewportHeight / 2) - (estimatedHeight / 2);
            const centerY = absoluteCenterY - dims.galleryTop;

            return { centerX, centerY };
        } else {
            // Desktop: Calculate center X position relative to gallery
            const centerX = (viewportWidth / 2) - dims.galleryLeft - (dims.enlargedWidth / 2);

            // Calculate center Y, but ensure it doesn't go off screen
            let centerY = (viewportHeight / 2) - dims.galleryTop - (estimatedHeight / 2);

            // Ensure minimum top position
            const minTop = 20;

            // Ensure maximum bottom position
            const maxTop = viewportHeight - dims.galleryTop - estimatedHeight - 20;

            // Clamp centerY between min and max
            centerY = Math.max(minTop, Math.min(centerY, maxTop));

            return { centerX, centerY };
        }
    };

    // Initialize photo states on mount (avoid hydration mismatch)
    useEffect(() => {
        // Set mobile state
        setIsMobile(checkMobile());

        const initialStates: { [key: number]: PhotoState } = {};

        PHOTOS.forEach((photo, index) => {
            const scatter = generateScatter();
            initialStates[photo.id] = {
                top: scatter.y,
                left: scatter.x,
                rotate: scatter.rotate,
                zIndex: 100 + index,
            };
        });

        setPhotoStates(initialStates);
        setMounted(true);
    }, []);

    // Handle window resize to re-center active photo and update mobile state
    useEffect(() => {
        const handleResize = () => {
            const wasMobile = isMobile;
            const nowMobile = checkMobile();

            // Update mobile state if changed
            if (wasMobile !== nowMobile) {
                setIsMobile(nowMobile);
            }

            // Re-center active photo if exists
            if (activeId !== null) {
                const { centerX, centerY } = getCenterPosition();
                setPhotoStates(prev => ({
                    ...prev,
                    [activeId]: {
                        ...prev[activeId],
                        top: centerY,
                        left: centerX,
                    }
                }));
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [activeId, isMobile]);

    const handlePhotoClick = (id: number) => {
        if (activeId === id) {
            // Close: Send to bottom of stack
            const scatter = generateScatter();
            setPhotoStates(prev => ({
                ...prev,
                [id]: {
                    top: scatter.y,
                    left: scatter.x,
                    rotate: scatter.rotate,
                    zIndex: minZ - 1,
                }
            }));
            setMinZ(prev => prev - 1);
            setActiveId(null);
        } else {
            // Close previous active photo if exists
            if (activeId !== null) {
                const scatter = generateScatter();
                setPhotoStates(prev => ({
                    ...prev,
                    [activeId]: {
                        top: scatter.y,
                        left: scatter.x,
                        rotate: scatter.rotate,
                        zIndex: minZ - 1,
                    }
                }));
                setMinZ(prev => prev - 1);
            }

            // Open clicked photo: Bring to top and center
            const { centerX, centerY } = getCenterPosition();
            setPhotoStates(prev => ({
                ...prev,
                [id]: {
                    top: centerY,
                    left: centerX,
                    rotate: 0,
                    zIndex: maxZ + 1,
                }
            }));
            setMaxZ(prev => prev + 1);
            setActiveId(id);
        }
    };

    // Don't render until mounted to avoid hydration mismatch
    if (!mounted) return null;

    const dims = getDimensions();

    return (
        <div className="relative w-full h-full">
            <ul
                className="absolute list-none p-0 m-0"
                style={{
                    top: `${dims.galleryTop}px`,
                    left: `${dims.galleryLeft}px`,
                    width: 0,
                    height: 0,
                }}
            >
                {PHOTOS.map((photo) => {
                    const isActive = activeId === photo.id;
                    const state = photoStates[photo.id];

                    if (!state) return null;

                    return (
                        <li
                            key={photo.id}
                            onClick={() => handlePhotoClick(photo.id)}
                            className="absolute block bg-white border border-gray-300 rounded-sm select-none"
                            style={{
                                top: `${state.top}px`,
                                left: `${state.left}px`,
                                width: isActive ? `${dims.enlargedWidth}px` : `${dims.smallWidth}px`,
                                padding: isActive ? (isMobile ? '10px 10px 20px 10px' : '15px 15px 30px 15px') : (isMobile ? '6px' : '10px'),
                                transform: `rotate(${state.rotate}deg)`,
                                zIndex: state.zIndex,
                                boxShadow: isActive
                                    ? '0 15px 50px rgba(0,0,0,0.4)'
                                    : '2px 2px 8px rgba(0,0,0,0.2)',
                                cursor: isActive ? 'zoom-out' : 'pointer',
                                transition: 'transform 0.5s ease, width 0.6s ease, padding 0.6s ease, top 0.6s ease, left 0.6s ease, box-shadow 0.5s ease',
                                boxSizing: 'border-box',
                            }}
                        >
                            <div className="w-full pointer-events-none">
                                <Image
                                    src={photo.src}
                                    alt={photo.title}
                                    width={640}
                                    height={480}
                                    className="w-full h-auto block"
                                    draggable={false}
                                />

                                <span
                                    className="block text-center font-bold text-[#333]"
                                    style={{
                                        fontSize: isActive ? (isMobile ? '16px' : '22px') : (isMobile ? '10px' : '13px'),
                                        marginTop: isActive ? (isMobile ? '10px' : '15px') : (isMobile ? '5px' : '8px'),
                                        marginBottom: isActive ? (isMobile ? '10px' : '15px') : '0',
                                        whiteSpace: isActive ? 'normal' : 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        transition: 'font-size 0.5s ease, margin 0.5s ease',
                                    }}
                                >
                                    {photo.title}
                                </span>

                                <div
                                    className="overflow-hidden text-[#555] leading-relaxed text-center"
                                    style={{
                                        fontSize: isMobile ? '12px' : '15px',
                                        maxHeight: isActive ? '300px' : '0',
                                        opacity: isActive ? 1 : 0,
                                        marginTop: isActive ? (isMobile ? '10px' : '15px') : '0',
                                        paddingTop: isActive ? (isMobile ? '10px' : '15px') : '0',
                                        borderTop: isActive ? '1px dashed #ccc' : 'none',
                                        transition: 'max-height 0.5s ease, opacity 0.5s ease, margin 0.5s ease, padding 0.5s ease',
                                    }}
                                >
                                    <p className="m-0">{photo.desc}</p>
                                </div>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
