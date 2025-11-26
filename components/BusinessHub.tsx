
import React, { useState } from 'react';
import { ArrowLeft, BarChart2, TrendingUp, Users, MousePointer, Download, Info, Plus, Megaphone, Lightbulb, ExternalLink, Calendar, ChevronDown, Filter, HelpCircle } from 'lucide-react';
import { Pin } from '../types';

interface BusinessHubProps {
    onClose: () => void;
    recentPins: Pin[];
}

export const BusinessHub: React.FC<BusinessHubProps> = ({ onClose, recentPins }) => {
    const [timeRange, setTimeRange] = useState('30d');
    
    // Mock Data mimicking Pinterest Business Hub
    const stats = {
        impressions: '124.5k',
        impressionsTrend: 12,
        saves: '4.2k',
        savesTrend: 8,
        outboundClicks: '1.8k',
        outboundTrend: -2,
        monthlyAudience: '850k'
    };

    return (
        <div className="fixed inset-0 z-[150] bg-gray-50 flex flex-col animate-in fade-in slide-in-from-bottom-4 overflow-hidden">
            {/* Header */}
            <div className="bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between shadow-sm sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-xl font-black text-gray-900 tracking-tight">Business Hub</h1>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-black px-3 py-2 rounded-full hover:bg-gray-100">
                        <HelpCircle size={18} /> Help
                    </button>
                    <img src="https://picsum.photos/seed/userPro/100/100" className="w-9 h-9 rounded-full border border-gray-200" />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-8">
                    
                    {/* Performance Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-black text-gray-900">Performance</h2>
                            <p className="text-gray-500">Track how your pins are performing across Nexos.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-full font-bold text-sm hover:bg-gray-50">
                                    Last 30 days <ChevronDown size={16}/>
                                </button>
                            </div>
                            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-full font-bold text-sm hover:bg-gray-50">
                                <Filter size={16}/> Filters
                            </button>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm hover:border-black/20 transition cursor-pointer">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-sm font-bold text-gray-500 flex items-center gap-1">Impressions <Info size={12}/></span>
                                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
                                    <TrendingUp size={12}/> {stats.impressionsTrend}%
                                </span>
                            </div>
                            <p className="text-3xl font-black text-gray-900">{stats.impressions}</p>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm hover:border-black/20 transition cursor-pointer">
                             <div className="flex justify-between items-start mb-2">
                                <span className="text-sm font-bold text-gray-500 flex items-center gap-1">Saves <Info size={12}/></span>
                                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
                                    <TrendingUp size={12}/> {stats.savesTrend}%
                                </span>
                            </div>
                            <p className="text-3xl font-black text-gray-900">{stats.saves}</p>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm hover:border-black/20 transition cursor-pointer">
                             <div className="flex justify-between items-start mb-2">
                                <span className="text-sm font-bold text-gray-500 flex items-center gap-1">Outbound Clicks <Info size={12}/></span>
                                <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
                                    <TrendingUp size={12} className="rotate-180"/> {Math.abs(stats.outboundTrend)}%
                                </span>
                            </div>
                            <p className="text-3xl font-black text-gray-900">{stats.outboundClicks}</p>
                        </div>
                    </div>

                    {/* Chart Area */}
                    <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
                        <h3 className="font-bold text-lg mb-6">Performance over time</h3>
                        <div className="h-64 flex items-end gap-2 relative">
                             {/* Y-Axis Guidelines */}
                             <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                                 <div className="border-t border-gray-400 w-full h-0"></div>
                                 <div className="border-t border-gray-400 w-full h-0"></div>
                                 <div className="border-t border-gray-400 w-full h-0"></div>
                                 <div className="border-t border-gray-400 w-full h-0"></div>
                             </div>

                             {/* Bars */}
                             {Array.from({length: 30}).map((_, i) => {
                                 const height = Math.random() * 80 + 10;
                                 return (
                                     <div key={i} className="flex-1 bg-emerald-100 rounded-t-sm hover:bg-emerald-500 transition-colors relative group cursor-pointer" style={{ height: `${height}%` }}>
                                         <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-black text-white text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10">
                                             {Math.floor(height * 100)} views<br/>
                                             <span className="text-gray-400 font-normal">May {i+1}</span>
                                         </div>
                                     </div>
                                 );
                             })}
                        </div>
                    </div>

                    {/* Recent Pins */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-xl">Recent Pins</h3>
                            <button className="text-sm font-bold text-emerald-600 hover:underline">See all</button>
                        </div>
                        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase">Pin</th>
                                        <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase">Date</th>
                                        <th className="text-right py-4 px-6 text-xs font-bold text-gray-500 uppercase">Impressions</th>
                                        <th className="text-right py-4 px-6 text-xs font-bold text-gray-500 uppercase">Saves</th>
                                        <th className="text-right py-4 px-6 text-xs font-bold text-gray-500 uppercase">Clicks</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentPins.slice(0, 5).map(pin => (
                                        <tr key={pin.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <img src={pin.imageUrl} className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                                                    <span className="font-bold text-sm truncate max-w-[150px]">{pin.title}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-sm text-gray-500">
                                                {new Date().toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                                            </td>
                                            <td className="py-4 px-6 text-right font-medium text-sm">
                                                {(Math.random() * 5000 + 500).toFixed(0)}
                                            </td>
                                            <td className="py-4 px-6 text-right font-medium text-sm">
                                                {(Math.random() * 200 + 10).toFixed(0)}
                                            </td>
                                            <td className="py-4 px-6 text-right font-medium text-sm">
                                                {(Math.random() * 50 + 5).toFixed(0)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Creation & Tools */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="bg-black text-white p-8 rounded-3xl relative overflow-hidden group cursor-pointer">
                             <div className="relative z-10">
                                 <h3 className="text-2xl font-black mb-2">Create an Ad</h3>
                                 <p className="text-gray-300 mb-6 max-w-xs">Reach more people and drive sales with Promoted Pins.</p>
                                 <button className="px-6 py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition">Promote</button>
                             </div>
                             <Megaphone size={140} className="absolute -bottom-10 -right-10 text-gray-800 opacity-50 group-hover:scale-110 transition duration-500"/>
                         </div>

                         <div className="bg-purple-600 text-white p-8 rounded-3xl relative overflow-hidden group cursor-pointer">
                             <div className="relative z-10">
                                 <h3 className="text-2xl font-black mb-2">Audience Insights</h3>
                                 <p className="text-purple-200 mb-6 max-w-xs">Learn what your audience loves and tailor your content.</p>
                                 <button className="px-6 py-3 bg-white text-purple-600 font-bold rounded-full hover:scale-105 transition">View Insights</button>
                             </div>
                             <Users size={140} className="absolute -bottom-10 -right-10 text-purple-800 opacity-50 group-hover:scale-110 transition duration-500"/>
                         </div>
                    </div>

                    {/* Resources Section */}
                    <div>
                        <h3 className="font-bold text-xl mb-4">Resources for you</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white p-4 rounded-2xl border border-gray-200 hover:shadow-md transition cursor-pointer flex gap-4 items-center">
                                <div className="bg-blue-100 p-3 rounded-full text-blue-600"><Lightbulb size={24}/></div>
                                <div>
                                    <h4 className="font-bold text-sm">Best Practices</h4>
                                    <p className="text-xs text-gray-500">How to make great pins</p>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-2xl border border-gray-200 hover:shadow-md transition cursor-pointer flex gap-4 items-center">
                                <div className="bg-orange-100 p-3 rounded-full text-orange-600"><TrendingUp size={24}/></div>
                                <div>
                                    <h4 className="font-bold text-sm">Trends</h4>
                                    <p className="text-xs text-gray-500">What's popular now</p>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-2xl border border-gray-200 hover:shadow-md transition cursor-pointer flex gap-4 items-center">
                                <div className="bg-emerald-100 p-3 rounded-full text-emerald-600"><Calendar size={24}/></div>
                                <div>
                                    <h4 className="font-bold text-sm">Seasonal Planner</h4>
                                    <p className="text-xs text-gray-500">Plan ahead</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
