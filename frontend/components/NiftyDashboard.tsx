import React from 'react';
import { NiftyDashboardData } from '../services/types';

interface RangeSliderProps {
  low: number;
  high: number;
  current: number;
  label: string;
}

const RangeSlider: React.FC<RangeSliderProps> = ({ low, high, current, label }) => {
  const percentage = high > low ? ((current - low) / (high - low)) * 100 : 50;
  const safePercentage = Math.max(0, Math.min(100, percentage));

  const currentFormatted = current.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const lowFormatted = low.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const highFormatted = high.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="w-full flex-grow flex flex-col">
      <div className="w-full text-left font-bold text-xl tracking-widest uppercase text-retro-border mb-2">
        {label}
      </div>
      <div className="w-full relative mt-16 mb-8">
        {/* Track */}
        <div className="absolute top-1/2 -translate-y-1/2 w-full h-3 bg-gradient-to-r from-retro-red via-amber-400 to-retro-green rounded-full border-2 border-retro-border"></div>
        {/* Thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2"
          style={{ left: `calc(${safePercentage}% - 12px)` }}
        >
          <div className="relative flex justify-center">
            {/* Tooltip Bubble */}
            <div className="absolute -top-10">
              <div className="px-3 py-1 bg-retro-border text-white text-base font-bold rounded-md shadow-sm whitespace-nowrap">
                {currentFormatted}
              </div>
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-[6px] border-t-retro-border"></div>
            </div>
            {/* Slider Knob */}
            <div className="w-6 h-6 bg-white rounded-full border-[3px] border-retro-border shadow-sm"></div>
          </div>
        </div>
      </div>
      {/* Labels below the track */}
      <div className="flex justify-between items-center w-full uppercase tracking-wider">
        <div className="text-left leading-tight">
          <span className="text-retro-border text-base font-bold block">LOW</span>
          <p className="font-bold text-lg">{lowFormatted}</p>
        </div>
        <div className="text-right leading-tight">
          <span className="text-retro-border text-base font-bold block">HIGH</span>
          <p className="font-bold text-lg">{highFormatted}</p>
        </div>
      </div>
    </div>
  );
};


const NiftyDashboard: React.FC<{ data: NiftyDashboardData }> = ({ data }) => {
  if (!data) return null;

  const isZero = parseFloat(data.changeValue.replace(/,/g, '')) === 0;

  const changeBg = isZero
    ? 'bg-slate-300 text-retro-border'
    : data.isPositive ? 'bg-retro-green text-white' : 'bg-retro-red text-white';

  const ChangeIcon = isZero
    ? null
    : data.isPositive ? '↑' : '↓';

  return (
    <div className="bg-retro-card border-2 border-retro-border rounded-lg p-5 font-mono text-retro-border shadow-retro">
      {/* Top section: Title, Current Price and Change Pill */}
      <div className="flex justify-between items-center bg-retro-green-light border-2 border-retro-border rounded-lg p-4 mb-4">
        <h2 className="text-3xl font-bold uppercase tracking-widest pl-2">NIFTY 50</h2>
        <div className="flex items-center gap-6 pr-2">
          <span className="text-4xl font-bold">₹{data.currentValue}</span>
          <div className={`flex items-center gap-2 font-bold px-3 py-2 rounded-md border-2 border-retro-border ${changeBg} shadow-sm`}>
            {ChangeIcon && <span className="text-xl leading-none">{ChangeIcon}</span>}
            <span className="text-xl tracking-wider">{data.changeValue} ({data.changePercent})</span>
          </div>
        </div>
      </div>

      {/* Mid section: Prev Close, Open, Volume Cards */}
      <div className="grid grid-cols-3 gap-6 text-center mb-6">
        <div className="bg-white border-[2px] border-retro-border rounded-lg p-3">
          <p className="text-sm text-retro-border font-bold uppercase tracking-widest mb-1">PREV. CLOSE</p>
          <p className="font-bold text-2xl">{data.prevClose}</p>
        </div>
        <div className="bg-white border-[2px] border-retro-border rounded-lg p-3">
          <p className="text-sm text-retro-border font-bold uppercase tracking-widest mb-1">OPEN</p>
          <p className="font-bold text-2xl">₹{data.open}</p>
        </div>
        <div className="bg-white border-[2px] border-retro-border rounded-lg p-3">
          <p className="text-sm text-retro-border font-bold uppercase tracking-widest mb-1">VOLUME (LAKHS)</p>
          <p className="font-bold text-2xl">{data.volume}</p>
        </div>
      </div>

      {/* Bottom section: Sliders */}
      <div className="flex gap-12 mt-4 px-4 pb-2">
        <div className="w-1/2 flex">
          <RangeSlider
            label="52 WEEK"
            low={data.week52.low}
            high={data.week52.high}
            current={data.week52.current}
          />
        </div>
        <div className="w-1/2 flex">
          <RangeSlider
            label="INTRADAY"
            low={data.intraday.low}
            high={data.intraday.high}
            current={data.intraday.current}
          />
        </div>
      </div>
    </div>
  );
};

export default NiftyDashboard;