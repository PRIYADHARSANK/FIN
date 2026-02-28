import React from 'react';
import { HeatmapStock } from '../services/types';

interface HeatmapGridProps {
    stocks: HeatmapStock[];
}

const HeatmapGrid: React.FC<HeatmapGridProps> = ({ stocks }) => {
    // Sort by Change descending (Green to Red) for clear visual trend
    const sortedStocks = [...stocks].sort((a, b) => b.change - a.change);

    const getColor = (change: number) => {
        if (change === 0) return 'bg-gray-200 text-retro-border';
        const absChange = Math.abs(change);

        // Green Shades (Adjusted to match retro palette, solid block colors)
        if (change > 0) {
            if (absChange >= 3) return 'bg-[#2E7D32] text-white'; // Darker green
            if (absChange >= 2) return 'bg-[#388E3C] text-white';
            if (absChange >= 1) return 'bg-[#4CAF50] text-white'; // retro-green roughly
            if (absChange >= 0.5) return 'bg-[#81C784] text-retro-border';
            return 'bg-[#C8E6C9] text-retro-border'; // light green
        }
        // Red Shades
        else {
            if (absChange >= 3) return 'bg-[#B71C1C] text-white'; // Darker red
            if (absChange >= 2) return 'bg-[#C62828] text-white';
            if (absChange >= 1) return 'bg-[#D32F2F] text-white'; // retro-red roughly
            if (absChange >= 0.5) return 'bg-[#E57373] text-retro-border';
            return 'bg-[#FFCDD2] text-retro-border'; // light red
        }
    };

    return (
        <div className="grid grid-cols-5 md:grid-cols-8 gap-0.5 w-full h-full border-[3px] border-retro-border bg-retro-border p-1 shadow-retro">
            {sortedStocks.map((stock) => (
                <div
                    key={stock.symbol}
                    className={`${getColor(stock.change)} flex flex-col justify-center items-center p-1 text-center transition-all hover:scale-[1.02] hover:z-10 aspect-square sm:aspect-auto`}
                >
                    <span className="font-bold text-xs sm:text-sm leading-tight w-full px-0.5 whitespace-normal break-words tracking-widest">{stock.name || stock.symbol}</span>
                    <span className="text-xs sm:text-sm font-mono font-bold mt-1 tracking-wider">
                        {stock.change > 0 ? '+' : ''}{stock.change.toFixed(2)}%
                    </span>
                    <span className="text-[0.65rem] mt-0.5 font-bold opacity-90">
                        {Math.round(stock.value)}
                    </span>
                </div>
            ))}
        </div>
    );
};

export default HeatmapGrid;
