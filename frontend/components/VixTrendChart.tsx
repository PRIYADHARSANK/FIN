import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { VixHistoryPoint } from '../services/types';

interface VixTrendChartProps {
    data: VixHistoryPoint[];
}

const VixTrendChart: React.FC<VixTrendChartProps> = ({ data }) => {
    if (!data || data.length === 0) return null;

    const formatDate = (dateStr: string) => {
        // Expect YYYY-MM-DD
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }).toUpperCase();
    };

    return (
        <div className="w-full h-72 bg-white rounded-lg p-4 border-[3px] border-retro-border shadow-retro font-mono">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ccc" strokeOpacity={0.6} vertical={false} />
                    <XAxis
                        dataKey="date"
                        tickFormatter={formatDate}
                        stroke="#1A1A1A"
                        tick={{ fontSize: 15, fontWeight: 'bold', fontFamily: 'VT323, monospace' }}
                        interval={Math.ceil(data.length / 8)} // Show ~8 ticks evenly
                        axisLine={{ stroke: '#1A1A1A', strokeWidth: 3 }}
                        tickLine={false}
                        dy={10}
                    />
                    <YAxis
                        stroke="#1A1A1A"
                        domain={['auto', 'auto']}
                        tick={{ fontSize: 15, fontWeight: 'bold', fontFamily: 'VT323, monospace' }}
                        axisLine={{ stroke: '#1A1A1A', strokeWidth: 3 }}
                        tickLine={false}
                        dx={-5}
                    />
                    <Tooltip
                        labelFormatter={(label) => formatDate(label)}
                        contentStyle={{
                            backgroundColor: '#fff',
                            borderRadius: '0px',
                            border: '2px solid #1A1A1A',
                            boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
                            fontFamily: 'VT323, monospace',
                            textTransform: 'uppercase',
                            fontWeight: 'bold',
                            fontSize: '18px'
                        }}
                    />
                    <Line
                        type="step" // 'step' type lines give a great pixel-art feel
                        dataKey="value"
                        stroke="#D9534F"
                        strokeWidth={4}
                        dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#D9534F' }}
                        activeDot={{ r: 6, strokeWidth: 2, fill: '#D9534F', stroke: '#1A1A1A' }}
                        isAnimationActive={true}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default VixTrendChart;
