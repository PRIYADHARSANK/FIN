import React from 'react';
import { Briefcase } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { FiiDiiResponse } from '../services/types';

interface FiiDiiActivityProps {
    data: FiiDiiResponse;
}

const FiiDiiActivity: React.FC<FiiDiiActivityProps> = ({ data }) => {
    const { daily_data, summary } = data;

    // Prepare data for chart (reverse to show oldest to newest left-to-right)
    const chartData = [...daily_data].reverse().map(item => ({
        ...item,
        total: item.fii + item.dii
    }));

    const formatCurrency = (value: number) => {
        return value.toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    const formatKCr = (value: number) => {
        if (Math.abs(value) >= 1000) {
            return `${(value / 1000).toFixed(1)}k`;
        }
        return value.toString();
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border-2 border-retro-border shadow-retro rounded-lg">
                    <p className="font-bold text-retro-border mb-2 uppercase tracking-wide">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-base uppercase tracking-wider">
                            <div className="w-3 h-3 rounded-none border-[1px] border-retro-border" style={{ backgroundColor: entry.color }} />
                            <span className="font-bold text-retro-border">{entry.name}:</span>
                            <span className={`font-mono font-bold ${entry.value > 0 ? 'text-retro-green' : 'text-retro-red'}`}>
                                {formatCurrency(entry.value)} CR
                            </span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    const getColorClass = (value: number) => {
        return value > 0 ? 'text-retro-green' : value < 0 ? 'text-retro-red' : 'text-retro-muted';
    };

    return (
        <div className="bg-retro-card p-6 rounded-xl border-[3px] border-retro-border shadow-retro mb-8 font-mono">
            <div className="flex items-center gap-4 mb-6">
                <Briefcase size={36} className="text-retro-border" />
                <h2 className="text-3xl font-bold text-retro-border uppercase tracking-widest leading-none">FII/DII Activity (Net Crores)</h2>
            </div>

            {/* Chart Section */}
            <div className="mb-8 h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} stroke="#000" />
                        <XAxis
                            dataKey="date"
                            tick={{ fill: '#000', fontSize: 10, fontWeight: 'bold' }}
                            axisLine={{ stroke: '#000', strokeWidth: 2 }}
                            tickLine={false}
                        />
                        <YAxis
                            tickFormatter={formatKCr}
                            tick={{ fill: '#000', fontSize: 10, fontWeight: 'bold' }}
                            axisLine={{ stroke: '#000', strokeWidth: 2 }}
                            tickLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ paddingTop: '10px' }} />
                        <ReferenceLine y={0} stroke="#000" strokeWidth={1} />
                        <Bar
                            dataKey="fii"
                            name="Net FII"
                            fill="#3b82f6"
                            radius={[4, 4, 0, 0]}
                            barSize={12}
                        />
                        <Bar
                            dataKey="dii"
                            name="Net DII"
                            fill="#f59e0b"
                            radius={[4, 4, 0, 0]}
                            barSize={12}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="border-[3px] border-retro-border rounded-lg bg-white overflow-hidden shadow-sm">
                <table className="w-full text-lg">
                    <thead>
                        <tr className="bg-retro-green-light border-b-[3px] border-retro-border uppercase tracking-widest">
                            <th className="py-3 px-4 text-left font-bold text-retro-border">Period</th>
                            <th className="py-3 px-4 text-right font-bold text-retro-border">FII (CR)</th>
                            <th className="py-3 px-4 text-right font-bold text-retro-border">DII (CR)</th>
                        </tr>
                    </thead>
                    <tbody className="bg-retro-card">
                        {daily_data.map((item, index) => (
                            <tr key={index} className="border-b-2 border-retro-border/20 last:border-0 hover:bg-white/50 transition-colors uppercase">
                                <td className="py-3 px-4 font-bold text-retro-border tracking-wider">{item.date}</td>
                                <td className={`py-3 px-4 text-right font-bold text-xl tracking-wider ${getColorClass(item.fii)}`}>
                                    {formatCurrency(item.fii)}
                                </td>
                                <td className={`py-3 px-4 text-right font-bold text-xl tracking-wider ${getColorClass(item.dii)}`}>
                                    {formatCurrency(item.dii)}
                                </td>
                            </tr>
                        ))}

                        {/* Last 7 Days Summary */}
                        <tr className="bg-retro-green-light border-t-[3px] border-retro-border uppercase">
                            <td className="py-3 px-4 font-bold text-retro-border tracking-wider">Last 7 Days</td>
                            <td className={`py-3 px-4 text-right font-bold text-xl tracking-wider ${getColorClass(summary.last_7_days.fii)}`}>
                                {formatCurrency(summary.last_7_days.fii)}
                            </td>
                            <td className={`py-3 px-4 text-right font-bold text-xl tracking-wider ${getColorClass(summary.last_7_days.dii)}`}>
                                {formatCurrency(summary.last_7_days.dii)}
                            </td>
                        </tr>

                        {/* Last 10 Days Summary */}
                        <tr className="bg-retro-green-light border-t-2 border-retro-border/20 uppercase">
                            <td className="py-3 px-4 font-bold text-retro-border tracking-wider">Last 10 Days</td>
                            <td className={`py-3 px-4 text-right font-bold text-xl tracking-wider ${getColorClass(summary.last_10_days.fii)}`}>
                                {formatCurrency(summary.last_10_days.fii)}
                            </td>
                            <td className={`py-3 px-4 text-right font-bold text-xl tracking-wider ${getColorClass(summary.last_10_days.dii)}`}>
                                {formatCurrency(summary.last_10_days.dii)}
                            </td>
                        </tr>

                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default FiiDiiActivity;
