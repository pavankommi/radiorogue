import React from 'react';
import { EnvelopeIcon } from '@heroicons/react/24/outline';

const Footer = React.forwardRef<HTMLDivElement, {}>((props, ref) => (
    <footer
        className="bg-white text-black py-6 border-t border-gray-200 bottom-0 left-0 right-0"
        ref={ref}
        role="contentinfo"
    >
        <div className="max-w-6xl mx-auto flex flex-col items-center space-y-4">
            <section
                aria-labelledby="contact-info"
                className="flex flex-col items-center space-y-1"
            >
                <div className="flex items-center space-x-2">
                    <EnvelopeIcon className="h-5 w-5 text-red-600" aria-hidden="true" />
                    <a
                        href="mailto:contact@radiorogue.com"
                        className="text-sm md:text-base hover:underline"
                        aria-label="Email contact at Radiorogue"
                    >
                        radiorogue@protonmail.com
                    </a>
                </div>
            </section>

            <section aria-labelledby="footer-legal" className="text-center space-y-1">
                <p id="ai-disclaimer" className="italic text-xs md:text-sm text-gray-500">
                    FYI: All posts here are AI-generated, powered by Google Trends.
                </p>
                <p id="footer-legal" className="text-xs md:text-sm text-gray-500">
                    &copy; 2024 Radiorogue. All rights reserved.
                </p>
                <p className="text-xs md:text-sm text-gray-500">
                    Icons by
                    <a href="https://www.flaticon.com/authors/freepik" title="Freepik" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline"> Freepik</a> via
                    <a href="https://www.flaticon.com/" title="Flaticon" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline"> Flaticon.</a>
                </p>
            </section>
        </div>
    </footer>
));

Footer.displayName = 'Footer';

export default Footer;
