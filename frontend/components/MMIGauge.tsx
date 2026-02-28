import React from 'react';

interface MMIGaugeProps {
    value: number;
    date?: string;
}

const MMIGauge: React.FC<MMIGaugeProps> = ({ value, date }) => {
    // 0-100 scale map to -90 to 90 degrees
    // We want the gauge to be a semi-circle (180 deg).
    // Let's say zones:
    // 0-30: Ext Fear (Red)
    // 30-50: Fear (Yellow)
    // 50-70: Greed (Lime)
    // 70-100: Ext Greed (Green)

    // Normalize value to 0-100 range just in case
    const safeValue = Math.min(100, Math.max(0, value));

    // Calculate rotation: 0 -> -90deg, 100 -> 90deg
    const rotation = (safeValue / 100) * 180 - 90;

    return (
        <div className="w-full flex flex-col items-center font-mono">
            <svg viewBox="0 0 300 170" className="w-full max-w-md">
                <defs>
                    <filter id="retro-shadow" x="-10%" y="-10%" width="130%" height="130%">
                        <feDropShadow dx="4" dy="4" stdDeviation="0" floodColor="#1A1A1A" />
                    </filter>
                </defs>

                {/* Arcs & Needle grouped for shadow */}
                <g filter="url(#retro-shadow)">
                    {/* Zones Arcs */}
                    {/* Red: 0-30 */}
                    <path d="M 30 130 A 120 120 0 0 1 65.5 48.6" fill="none" stroke="#D9534F" strokeWidth="25" />
                    {/* Yellow: 30-50 */}
                    <path d="M 69.5 44.5 A 120 120 0 0 1 150 10" fill="none" stroke="#FBBF24" strokeWidth="25" />
                    {/* Lime: 50-70 */}
                    <path d="M 150 10 A 120 120 0 0 1 230.5 44.5" fill="none" stroke="#A3E635" strokeWidth="25" />
                    {/* Green: 70-100 */}
                    <path d="M 234.5 48.6 A 120 120 0 0 1 270 130" fill="none" stroke="#5CB85C" strokeWidth="25" />
                </g>

                {/* Needle */}
                <g transform={`translate(150, 130) rotate(${rotation})`}>
                    <path d="M -4 0 L 0 -110 L 4 0 Z" fill="#1A1A1A" />
                    <circle cx="0" cy="0" r="10" fill="#1A1A1A" />
                    <circle cx="0" cy="0" r="4" fill="#F4F0E6" />
                </g>

                {/* Tick Marks (Moved safely inside the arc shadow, centered) */}
                <text x="50" y="135" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#1A1A1A" fontFamily="VT323, monospace">0</text>
                <text x="94" y="63" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#1A1A1A" fontFamily="VT323, monospace">30</text>
                <text x="150" y="38" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#1A1A1A" fontFamily="VT323, monospace">50</text>
                <text x="206" y="63" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#1A1A1A" fontFamily="VT323, monospace">70</text>
                <text x="250" y="135" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#1A1A1A" fontFamily="VT323, monospace">100</text>

                {/* Zone Labels (Moved further inside, centrally anchored and rotated perfectly along the curve) */}
                <text x="80" y="105" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#1A1A1A" transform="rotate(-55, 80, 105)" fontFamily="VT323, monospace" letterSpacing="1px">EXT FEAR</text>
                <text x="120" y="67" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#1A1A1A" transform="rotate(-15, 120, 67)" fontFamily="VT323, monospace" letterSpacing="1px">FEAR</text>
                <text x="180" y="67" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#1A1A1A" transform="rotate(15, 180, 67)" fontFamily="VT323, monospace" letterSpacing="1px">GREED</text>
                <text x="220" y="105" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#1A1A1A" transform="rotate(55, 220, 105)" fontFamily="VT323, monospace" letterSpacing="1px">EXT GREED</text>

                {/* Value Text display */}
                <text x="150" y="165" textAnchor="middle" fontSize="30" fontWeight="bold" fill="#1A1A1A" fontFamily="VT323, monospace">
                    {safeValue.toFixed(2)}
                </text>
            </svg>
            <div className="mt-2 text-center">
                {date && <p className="text-base text-retro-muted font-bold tracking-widest uppercase">Updated: {date}</p>}
            </div>
        </div>
    );
};

export default MMIGauge;