import React from 'react';

interface TrendGaugeProps {
    score: number; // 0 to 100
    label?: string;
}

const TrendGauge: React.FC<TrendGaugeProps> = ({ score, label = "Trend Strength" }) => {
    // Determine color and text based on score
    let color = 'text-amber-500';
    let text = 'Neutral';

    if (score >= 80) {
        color = 'text-retro-green';
        text = 'Strong Buy';
    } else if (score >= 60) {
        color = 'text-retro-green';
        text = 'Buy';
    } else if (score <= 20) {
        color = 'text-retro-red';
        text = 'Strong Sell';
    } else if (score <= 40) {
        color = 'text-retro-red';
        text = 'Sell';
    }

    // Rotation for needle: 0 to 180 degrees.
    // score 0 -> -90deg, 50 -> 0deg, 100 -> 90deg ? No, let's map 0-100 to 0-180 for a semi-circle.
    const rotation = (score / 100) * 180;

    return (
        <div className="flex flex-col items-center justify-center p-5 bg-retro-card rounded-lg border-[3px] border-retro-border shadow-retro font-mono">
            <h3 className="text-xl font-bold uppercase tracking-widest mb-4 text-retro-border">{label}</h3>

            {/* Gauge Container */}
            <div className="relative w-48 h-24 overflow-hidden mb-2">
                {/* Background Arc */}
                <div className="absolute top-0 left-0 w-48 h-48 rounded-full border-[20px] border-retro-paper box-border"></div>

                {/* Colored Arc - simplified as zones or just gradient? Gradient is nice */}
                <div
                    className="absolute top-0 left-0 w-48 h-48 rounded-full border-[20px] border-transparent box-border"
                    style={{
                        background: `conic-gradient(from 180deg, #D9534F 0deg, #FBBF24 90deg, #5CB85C 180deg)`,
                        maskImage: 'radial-gradient(transparent 55%, black 56%)',
                        WebkitMaskImage: 'radial-gradient(transparent 55%, black 56%)'
                    }}
                ></div>

                {/* Needle */}
                <div
                    className="absolute bottom-0 left-1/2 w-1.5 h-24 bg-retro-border origin-bottom transform transition-transform duration-1000 ease-out"
                    style={{ transform: `translateX(-50%) rotate(${rotation - 90}deg)` }}
                >
                    <div className="absolute -top-1.5 -left-1.5 w-4 h-4 rounded-full bg-retro-border border-2 border-white"></div>
                </div>
            </div>

            {/* Value Text */}
            <div className="text-center mt-[-5px] z-10">
                <div className="text-3xl font-bold">{score}</div>
                <div className={`text-base font-bold uppercase tracking-wider ${color} bg-white px-2 py-0.5 border-2 border-retro-border mt-1`}>{text}</div>
            </div>
        </div>
    );
};

export default TrendGauge;
