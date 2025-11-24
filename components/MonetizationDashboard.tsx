
import React, { useState } from 'react';
import { ArrowLeft, BarChart2, DollarSign, ShoppingBag, Lock, Crown, Globe, TrendingUp, Users, Settings, Wallet, CreditCard, ChevronRight, Plus } from 'lucide-react';

interface MonetizationDashboardProps {
    onClose: () => void;
}

export const MonetizationDashboard: React.FC<MonetizationDashboardProps> = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'shop' | 'subs' | 'ads'>('overview');

    const StatCard = ({ label, value, trend, icon: Icon, color }: any) => (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${color} bg-opacity-10 text-${color.split('-')[1]}-600`}>
                    <Icon size={24} className={color.replace('bg-', 'text-')} />
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${trend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {trend > 0 ? '+' : ''}{trend}%
                </span>
            </div>
            <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wide mb-1">{label}</h3>
            <p className="text-3xl font-black text-gray-900">{value}</p>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[150] bg-gray-50 flex flex-col animate-in fade-in slide-in-from-bottom-4">
            {/* Header */}
            <div className="bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between shadow-sm sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                        <Crown className="text-yellow-500 fill-yellow-500" size={24} /> Business Hub
                    </h1>
                </div>
                <div className="flex gap-4">
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full font-bold text-sm hover:bg-gray-200 transition">
                        <Wallet size={18} /> $4,285.00
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                        <Settings size={24} />
                    </button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <div className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col p-4 space-y-1">
                    <button 
                        onClick={() => setActiveTab('overview')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition ${activeTab === 'overview' ? 'bg-black text-white shadow-lg' : 'text-gray-500 hover:bg-gray-100'}`}
                    >
                        <BarChart2 size={20} /> Overview
                    </button>
                    <button 
                        onClick={() => setActiveTab('shop')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition ${activeTab === 'shop' ? 'bg-emerald-500 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-100'}`}
                    >
                        <ShoppingBag size={20} /> Shop the Look
                    </button>
                    <button 
                        onClick={() => setActiveTab('subs')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition ${activeTab === 'subs' ? 'bg-purple-500 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-100'}`}
                    >
                        <Lock size={20} /> Subscriptions
                    </button>
                    <button 
                        onClick={() => setActiveTab('ads')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition ${activeTab === 'ads' ? 'bg-blue-500 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-100'}`}
                    >
                        <Globe size={20} /> Ad Revenue
                    </button>
                    <div className="mt-auto pt-6 border-t border-gray-100">
                        <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-4 text-white">
                            <h4 className="font-bold text-sm mb-2">Creator Fund</h4>
                            <p className="text-xs opacity-70 mb-3">You're in the top 5% of creators this month.</p>
                            <div className="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden mb-1">
                                <div className="w-[85%] bg-yellow-400 h-full"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto p-8">
                    {activeTab === 'overview' && (
                        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <StatCard label="Total Revenue" value="$12,450" trend={12} icon={DollarSign} color="bg-emerald-100 text-emerald-600" />
                                <StatCard label="Product Clicks" value="8,234" trend={5} icon={ShoppingBag} color="bg-blue-100 text-blue-600" />
                                <StatCard label="New Subscribers" value="145" trend={24} icon={Users} color="bg-purple-100 text-purple-600" />
                                <StatCard label="Avg. Engagement" value="4.8%" trend={-2} icon={TrendingUp} color="bg-orange-100 text-orange-600" />
                            </div>

                            {/* Chart Area */}
                            <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm h-96 relative flex items-end justify-between gap-2">
                                <h3 className="absolute top-8 left-8 text-xl font-bold text-gray-900">Revenue Performance</h3>
                                <div className="absolute top-8 right-8 flex gap-2">
                                    <button className="px-4 py-1.5 bg-gray-100 rounded-full text-xs font-bold hover:bg-gray-200">Weekly</button>
                                    <button className="px-4 py-1.5 bg-black text-white rounded-full text-xs font-bold">Monthly</button>
                                </div>
                                {/* Mock Bars */}
                                {Array.from({length: 12}).map((_, i) => (
                                    <div key={i} className="flex-1 flex flex-col justify-end items-center group">
                                        <div 
                                            className="w-full max-w-[40px] bg-emerald-500 rounded-t-lg transition-all duration-500 group-hover:bg-emerald-600 relative" 
                                            style={{ height: `${Math.random() * 60 + 20}%` }}
                                        >
                                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
                                                ${Math.floor(Math.random() * 1000 + 500)}
                                            </div>
                                        </div>
                                        <span className="text-xs font-bold text-gray-400 mt-2">M{i+1}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'shop' && (
                        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-right-4">
                             <div className="flex justify-between items-center mb-8">
                                 <div>
                                     <h2 className="text-2xl font-black text-gray-900">Shop the Look</h2>
                                     <p className="text-gray-500">Manage tagged products and affiliate links.</p>
                                 </div>
                                 <button className="px-6 py-3 bg-emerald-600 text-white rounded-full font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition flex items-center gap-2">
                                     <Plus size={20} /> Add Product
                                 </button>
                             </div>

                             <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
                                 {[1,2,3,4].map(i => (
                                     <div key={i} className="flex items-center gap-6 p-6 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition">
                                         <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden">
                                             <img src={`https://picsum.photos/seed/prod${i}/200/200`} className="w-full h-full object-cover"/>
                                         </div>
                                         <div className="flex-1">
                                             <h4 className="font-bold text-gray-900 text-lg">Modern Ceramic Vase</h4>
                                             <p className="text-sm text-gray-500 mb-1">Tagged in 3 Pins • 2 Stories</p>
                                             <span className="text-emerald-600 font-bold text-sm">$45.00 Commission earned</span>
                                         </div>
                                         <div className="text-right">
                                             <p className="font-black text-xl">$128.00</p>
                                             <button className="text-gray-400 hover:text-black font-bold text-xs mt-1">Edit Details</button>
                                         </div>
                                     </div>
                                 ))}
                             </div>
                        </div>
                    )}
                    
                    {activeTab === 'subs' && (
                         <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-right-4">
                             <div className="bg-purple-600 rounded-3xl p-8 text-white mb-8 shadow-xl shadow-purple-200 relative overflow-hidden">
                                 <div className="relative z-10">
                                     <h2 className="text-3xl font-black mb-2">Exclusive Content</h2>
                                     <p className="text-purple-100 max-w-lg mb-6">Create locked pins and stories for your paying subscribers. You keep 95% of the revenue.</p>
                                     <button className="px-6 py-3 bg-white text-purple-600 font-bold rounded-full hover:bg-purple-50 transition">
                                         Create Locked Pin
                                     </button>
                                 </div>
                                 <Lock size={200} className="absolute -bottom-10 -right-10 text-purple-500 opacity-50 rotate-12"/>
                             </div>

                             <h3 className="font-bold text-xl mb-4">Subscriber Tiers</h3>
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                 {['Fan ($2.99)', 'Super Fan ($9.99)', 'Inner Circle ($24.99)'].map((tier, i) => (
                                     <div key={i} className="bg-white p-6 rounded-3xl border border-gray-200 hover:border-purple-300 transition shadow-sm cursor-pointer group">
                                         <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mb-4 group-hover:scale-110 transition">
                                             <Crown size={24} />
                                         </div>
                                         <h4 className="font-bold text-lg mb-1">{tier.split(' (')[0]}</h4>
                                         <p className="text-gray-500 text-sm mb-4">Monthly</p>
                                         <p className="font-black text-2xl text-gray-900">{tier.split(' (')[1].replace(')', '')}</p>
                                     </div>
                                 ))}
                             </div>
                         </div>
                    )}
                </div>
            </div>
        </div>
    );
};
