
import React, { useState } from 'react';
import { X, Moon, Sun, Bell, Shield, Smartphone, Monitor, Volume2, Wifi, EyeOff, UserCircle, LogOut } from 'lucide-react';
import { User } from '../types';

interface SettingsModalProps {
    onClose: () => void;
    user: User;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, user }) => {
    const [darkMode, setDarkMode] = useState(false);
    const [dataSaver, setDataSaver] = useState(false);
    const [autoplay, setAutoplay] = useState(true);
    const [privateMode, setPrivateMode] = useState(false);

    const SettingToggle = ({ icon: Icon, title, desc, value, onChange }: any) => (
        <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
            <div className="flex items-start gap-4">
                <div className="p-2 bg-gray-100 rounded-full text-gray-600">
                    <Icon size={20} />
                </div>
                <div>
                    <h4 className="font-bold text-gray-900">{title}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                </div>
            </div>
            <button 
                onClick={() => onChange(!value)}
                className={`w-12 h-7 rounded-full transition-colors relative ${value ? 'bg-emerald-500' : 'bg-gray-300'}`}
            >
                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${value ? 'left-6' : 'left-1'}`}></div>
            </button>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl h-[85vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white z-10">
                    <h2 className="text-2xl font-black text-gray-900">Settings & Privacy</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 scrollbar-thin">
                    
                    {/* Account Section */}
                    <div className="mb-10">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 ml-2">Account</h3>
                        <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                                <img src={user.avatarUrl} className="w-12 h-12 rounded-full" alt="profile" />
                                <div>
                                    <p className="font-bold text-gray-900">{user.username}</p>
                                    <p className="text-sm text-gray-500">{user.username.toLowerCase()}@example.com</p>
                                </div>
                            </div>
                            <button className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-bold shadow-sm hover:bg-gray-50">Edit</button>
                        </div>
                    </div>

                    {/* Display Section */}
                    <div className="mb-10">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 ml-2">Experience</h3>
                        <div className="bg-white rounded-2xl border border-gray-100 p-2 shadow-sm">
                            <SettingToggle 
                                icon={darkMode ? Moon : Sun} 
                                title="Dark Mode" 
                                desc="Adjust the appearance to reduce eye strain."
                                value={darkMode}
                                onChange={setDarkMode}
                            />
                            <SettingToggle 
                                icon={Volume2} 
                                title="Autoplay Video & Audio" 
                                desc="Play videos automatically on Wi-Fi."
                                value={autoplay}
                                onChange={setAutoplay}
                            />
                            <SettingToggle 
                                icon={Wifi} 
                                title="Data Saver" 
                                desc="Reduce image quality to save data."
                                value={dataSaver}
                                onChange={setDataSaver}
                            />
                        </div>
                    </div>

                    {/* Privacy Section */}
                    <div className="mb-8">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 ml-2">Privacy</h3>
                        <div className="bg-white rounded-2xl border border-gray-100 p-2 shadow-sm">
                            <SettingToggle 
                                icon={EyeOff} 
                                title="Private Profile" 
                                desc="Only people you approve can see your pins."
                                value={privateMode}
                                onChange={setPrivateMode}
                            />
                             <SettingToggle 
                                icon={Shield} 
                                title="Personalization" 
                                desc="Use my data to show relevant ads and content."
                                value={true}
                                onChange={() => {}}
                            />
                        </div>
                    </div>

                     <button className="w-full py-4 text-red-500 font-bold bg-red-50 hover:bg-red-100 rounded-xl flex items-center justify-center gap-2 transition">
                        <LogOut size={20} /> Log Out
                     </button>
                     <p className="text-center text-xs text-gray-400 mt-6">Stoc Pro v2.4.0 (Build 2025)</p>
                </div>
            </div>
        </div>
    );
};
