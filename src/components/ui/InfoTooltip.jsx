"use client";

import { useState } from 'react';
import { Info } from 'lucide-react';
import './InfoTooltip.css';

function InfoTooltip({ text }) {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div className="info-tooltip-container">
            <button
                className="info-tooltip-trigger"
                onMouseEnter={() => setIsVisible(true)}
                onMouseLeave={() => setIsVisible(false)}
                onClick={(e) => {
                    e.stopPropagation();
                    setIsVisible(!isVisible);
                }}
                aria-label="Más información"
            >
                <Info size={14} />
            </button>
            {isVisible && (
                <div className="info-tooltip-content">
                    {text}
                </div>
            )}
        </div>
    );
}

export default InfoTooltip;
