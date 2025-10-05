"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

const navItems = [
    { href: '/', label: 'Home', imgSrc: '/images/house.png', imgAlt: "Home" },
    { href: '/whats-hot', label: "What's Hot", imgSrc: '/images/whats-hot.gif', imgAlt: "What's Hot" },
    { href: '/rogues-pick', label: "Rogue's Pick", imgSrc: '/images/rogues-pick.gif', imgAlt: "Rogue's Pick" },
    { href: '/tech-pulse', label: "Tech Pulse", imgSrc: '/images/tech-pulse.gif', imgAlt: "Tech Pulse" },
    { href: '/money-moves', label: "Money Moves", imgSrc: '/images/money-moves.gif', imgAlt: "Money Moves" },
    { href: '/sport', label: "Sport", imgSrc: '/images/sport.gif', imgAlt: "Sport" },
];

const NavItem = ({ href, label, imgSrc, imgAlt, isActive, onClick }: {
    href: string;
    label: any;
    imgSrc: string;
    imgAlt: string;
    isActive: boolean;
    onClick?: () => void;
}) => (
    <li>
        <Link
            href={href}
            className={`flex items-center ${isActive ? 'text-black' : 'hover:text-gray-400 text-black'}`}
            onClick={onClick}
            aria-current={isActive ? 'page' : undefined}
        >
            {isActive && (
                <>
                    <span className="text-red-600 mr-1">[</span>
                    {label}
                    <span className="text-red-600 ml-1 flex items-center">
                        <img src={imgSrc} alt="" aria-hidden="true" className="w-5 h-5 inline-block mx-1" loading="lazy" />
                        ]
                    </span>
                </>
            )}
            {!isActive && (
                <>
                    {label}
                    <span className="text-red-600 ml-1 flex items-center">
                        <img src={imgSrc} alt="" aria-hidden="true" className="w-5 h-5 inline-block mx-1" loading="lazy" />
                    </span>
                </>
            )}
        </Link>
    </li>
);

const Header = () => {
    const pathname = usePathname();
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    const handleNavItemClick = () => {
        setSidebarOpen(false);
    };

    return (
        <>
            <header className="text-black p-4 md:p-6 mt-0 border-b border-gray-200 fixed top-0 left-0 right-0 z-40 bg-white" role="banner">
                <div className="flex justify-between items-center">
                    {/* Menu Icon */}
                    <button
                        className="lg:hidden p-1 rounded-md text-gray-600"
                        onClick={() => setSidebarOpen(!isSidebarOpen)}
                        aria-label={isSidebarOpen ? 'Close menu' : 'Open menu'}
                    >
                        {isSidebarOpen ? (
                            <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                        ) : (
                            <Bars3Icon className="h-5 w-5" aria-hidden="true" />
                        )}
                    </button>

                    {/* Header Title */}
                    <h1 className="flex-grow text-center text-xl font-extrabold italic text-red-600 lg:text-3xl">
                        <Link href="/" aria-label="Go to homepage">RADIOROGUE</Link>
                    </h1>

                    {/* Empty div for spacing alignment */}
                    <div className="flex-none lg:hidden" style={{ width: '24px' }}></div>
                </div>

                <nav className="hidden lg:flex justify-center pt-2" aria-label="Main navigation">
                    <ul className="flex space-x-7">
                        {navItems.map(item => (
                            <NavItem
                                key={item.href}
                                href={item.href}
                                label={item.label}
                                imgSrc={item.imgSrc}
                                imgAlt={item.imgAlt}
                                isActive={pathname === item.href.toLowerCase() || (item.href !== '/' && pathname.startsWith(item.href.toLowerCase()))}
                            />
                        ))}
                    </ul>
                </nav>
            </header>

            <nav
                className={`fixed inset-0 top-0 left-0 z-30 bg-white shadow-lg transform transition-transform lg:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
                aria-label="Mobile navigation"
            >
                <div className="flex flex-col p-4 pt-20 space-y-4">
                    <ul className="flex flex-col space-y-4">
                        {navItems.map(item => (
                            <NavItem
                                key={item.href}
                                href={item.href}
                                label={item.label}
                                imgSrc={item.imgSrc}
                                imgAlt={item.imgAlt}
                                isActive={pathname === item.href.toLowerCase() || (item.href !== '/' && pathname.startsWith(item.href.toLowerCase()))}
                                onClick={handleNavItemClick}
                            />
                        ))}
                    </ul>
                </div>
            </nav>
        </>
    );
};

export default Header;
