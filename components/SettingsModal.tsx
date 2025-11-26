
import React, { useState } from 'react';
import { X, Moon, Bell, Shield, Sliders, AtSign, Globe, Lock, CreditCard, ChevronRight, Download, HelpCircle, Instagram, Youtube, UserCircle, CheckCircle2 } from 'lucide-react';
import { User } from '../types';

interface SettingsModalProps {
    onClose: () => void;
    user: User;
}

type SettingsTab = 'profile' | 'account' | 'claimed' | 'permissions' | 'notifications' | 'privacy';

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, user }) => {
    const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
    
    // Form State
    const [firstName, setFirstName] = useState('Design');
    const [lastName, setLastName] = useState('Pro');
    const [username, setUsername] = useState(user.username.toLowerCase());
    const [about, setAbout] = useState(user.bio || "");
    const [website, setWebsite] = useState(user.website || "");
    const [pronouns, setPronouns] = useState(user.pronouns || "");
    
    // Toggles
    const [darkMode, setDarkMode] = useState(false);
    
    // Permissions
    const [allowMessages, setAllowMessages] = useState('everyone');
    const [allowMentions, setAllowMentions] = useState('everyone');
    
    // Claimed Accounts Mock
    const [claimed, setClaimed] = useState({
        instagram: false,
        youtube: false,
        etsy: false
    });

    const MENU_ITEMS: { id: SettingsTab; label: string; icon: any }[] = [
        { id: 'profile', label: 'Public Profile', icon: UserCircle },
        { id: 'account', label: 'Account Management', icon: Sliders },
        { id: 'claimed', label: 'Claimed Accounts', icon: CheckCircle2 },
        { id: 'permissions', label: 'Social Permissions', icon: AtSign },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'privacy', label: 'Privacy & Data', icon: Shield },
    ];

    const Toggle = ({ checked, onChange }: { checked: boolean, onChange: (v: boolean) => void }) => (
        <button 
            onClick={() => onChange(!checked)}
            className={`w-12 h-7 rounded-full transition-colors relative ${checked ? 'bg-black' : 'bg-gray-300'}`}
        >
            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${checked ? 'left-6' : 'left-1'}`}></div>
        </button>
    );

    const handleClaim = (platform: keyof typeof claimed) => {
        // Simulate OAuth Popup
        setTimeout(() => {
            setClaimed(prev => ({ ...prev, [platform]: !prev[platform] }));
        }, 500);
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div>
                            <h3 className="text-xl font-bold mb-1">Public Profile</h3>
                            <p className="text-gray-500 text-sm">People visiting your profile will see the following info</p>
                        </div>
                        
                        <div className="flex items-center gap-6">
                            <div className="relative">
                                <img src={user.avatarUrl} className="w-24 h-24 rounded-full border-4 border-gray-100 object-cover" />
                                <button className="absolute bottom-0 right-0 bg-gray-100 p-1.5 rounded-full border-2 border-white hover:bg-gray-200">
                                    <Sliders size={14}/>
                                </button>
                            </div>
                            <button className="px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-full font-bold text-sm transition">Change</button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">First Name</label>
                                <input type="text" className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 ring-black outline-none" value={firstName} onChange={e => setFirstName(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Last Name</label>
                                <input type="text" className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 ring-black outline-none" value={lastName} onChange={e => setLastName(e.target.value)} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Pronouns</label>
                            <select 
                                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 ring-black outline-none bg-white"
                                value={pronouns}
                                onChange={e => setPronouns(e.target.value)}
                            >
                                <option value="">Add pronouns...</option>
                                <option value="she/her">she/her</option>
                                <option value="he/him">he/him</option>
                                <option value="they/them">they/them</option>
                                <option value="other">Prefer not to say</option>
                            </select>
                            <p className="text-xs text-gray-400">Choose how you want to be addressed.</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">About</label>
                            <textarea className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 ring-black outline-none h-24 resize-none" value={about} onChange={e => setAbout(e.target.value)} />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Website</label>
                            <input type="text" className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 ring-black outline-none" value={website} onChange={e => setWebsite(e.target.value)} placeholder="Add a link to drive traffic to your site" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Username</label>
                            <div className="flex items-center gap-2 p-3 border border-gray-200 rounded-xl bg-gray-50">
                                <span className="text-gray-500 font-bold">nexos.app/</span>
                                <input type="text" className="bg-transparent outline-none flex-1 font-bold" value={username} onChange={e => setUsername(e.target.value)} />
                            </div>
                        </div>
                    </div>
                );

            case 'claimed':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div>
                            <h3 className="text-xl font-bold mb-1">Claimed Accounts</h3>
                            <p className="text-gray-500 text-sm">Monitor analytics and ensure your content gets attributed to you.</p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-2xl">
                                <div className="flex items-center gap-3">
                                    <Instagram className="text-pink-600" />
                                    <div>
                                        <p className="font-bold">Instagram</p>
                                        <p className="text-xs text-gray-500">Claim your account to get attribution.</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleClaim('instagram')}
                                    className={`px-4 py-2 rounded-full font-bold text-sm transition ${claimed.instagram ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`}
                                >
                                    {claimed.instagram ? 'Unclaim' : 'Claim'}
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-2xl">
                                <div className="flex items-center gap-3">
                                    <Youtube className="text-red-600" />
                                    <div>
                                        <p className="font-bold">YouTube</p>
                                        <p className="text-xs text-gray-500">Drive traffic to your channel.</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleClaim('youtube')}
                                    className={`px-4 py-2 rounded-full font-bold text-sm transition ${claimed.youtube ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`}
                                >
                                    {claimed.youtube ? 'Unclaim' : 'Claim'}
                                </button>
                            </div>

                             <div className="flex items-center justify-between p-4 border border-gray-200 rounded-2xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded bg-orange-500 text-white font-serif flex items-center justify-center font-bold text-xs">E</div>
                                    <div>
                                        <p className="font-bold">Etsy</p>
                                        <p className="text-xs text-gray-500">Attribute products to your shop.</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleClaim('etsy')}
                                    className={`px-4 py-2 rounded-full font-bold text-sm transition ${claimed.etsy ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`}
                                >
                                    {claimed.etsy ? 'Unclaim' : 'Claim'}
                                </button>
                            </div>
                        </div>
                    </div>
                );

            case 'permissions':
                return (
                     <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div>
                            <h3 className="text-xl font-bold mb-1">Social Permissions</h3>
                            <p className="text-gray-500 text-sm">Control how others interact with you on Nexos.</p>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h4 className="font-bold text-sm mb-3">@Mentions</h4>
                                <div className="space-y-2">
                                    {['Anyone', 'Only people you follow', 'Turn off'].map(opt => (
                                        <label key={opt} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded-lg">
                                            <input type="radio" name="mentions" className="w-5 h-5 accent-black" defaultChecked={opt === 'Anyone'} />
                                            <span className="text-sm font-medium">{opt}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h4 className="font-bold text-sm mb-3">Direct Messages</h4>
                                <div className="space-y-2">
                                     {['Anyone', 'Only people you follow', 'No one'].map(opt => (
                                        <label key={opt} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded-lg">
                                            <input type="radio" name="messages" className="w-5 h-5 accent-black" defaultChecked={opt === 'Anyone'} />
                                            <span className="text-sm font-medium">{opt}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                             <div>
                                <div className="flex justify-between items-center mb-1">
                                    <h4 className="font-bold text-sm">Comments on your Pins</h4>
                                    <Toggle checked={true} onChange={() => {}} />
                                </div>
                                <p className="text-xs text-gray-500">Allow other people to comment on your pins.</p>
                            </div>
                        </div>
                    </div>
                );

            case 'account':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                         <div>
                            <h3 className="text-xl font-bold mb-1">Account Management</h3>
                            <p className="text-gray-500 text-sm">Make changes to your personal information or account type.</p>
                        </div>

                        <div className="space-y-6">
                            <div className="flex justify-between items-center py-2">
                                <div>
                                    <p className="font-bold">Email Address</p>
                                    <p className="text-sm text-gray-500">{username}@nexos.net</p>
                                </div>
                                <button className="px-4 py-2 bg-gray-100 rounded-full font-bold text-xs hover:bg-gray-200">Edit</button>
                            </div>
                             <div className="flex justify-between items-center py-2">
                                <div>
                                    <p className="font-bold">Password</p>
                                    <p className="text-sm text-gray-500">••••••••••••</p>
                                </div>
                                <button className="px-4 py-2 bg-gray-100 rounded-full font-bold text-xs hover:bg-gray-200">Change</button>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <div>
                                    <p className="font-bold">App Theme</p>
                                    <p className="text-sm text-gray-500">{darkMode ? 'Dark Mode' : 'System Default'}</p>
                                </div>
                                <Toggle checked={darkMode} onChange={setDarkMode} />
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-100">
                             <h4 className="font-bold text-sm text-gray-900 mb-4">Account Changes</h4>
                             <div className="space-y-4">
                                 <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-black transition group">
                                     <div className="flex items-center gap-3">
                                         <CreditCard size={20} className="text-gray-400 group-hover:text-black"/>
                                         <div className="text-left">
                                             <p className="font-bold text-sm">Convert to Business Account</p>
                                             <p className="text-xs text-gray-500">Get analytics and ad tools</p>
                                         </div>
                                     </div>
                                     <ChevronRight size={16} className="text-gray-400"/>
                                 </button>
                                 <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-red-200 hover:bg-red-50 transition group">
                                     <div className="flex items-center gap-3">
                                         <Download size={20} className="text-gray-400 group-hover:text-red-500"/>
                                         <div className="text-left">
                                             <p className="font-bold text-sm text-gray-900 group-hover:text-red-600">Download your data</p>
                                             <p className="text-xs text-gray-500 group-hover:text-red-400">Get a copy of your data</p>
                                         </div>
                                     </div>
                                 </button>
                             </div>
                        </div>
                    </div>
                );
            
            default:
                return (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 animate-in fade-in">
                        <Sliders size={48} className="mb-4 opacity-20"/>
                        <p>Select a setting category</p>
                    </div>
                );
        }
    }

    return (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-5xl h-[85vh] rounded-3xl shadow-2xl overflow-hidden flex animate-in zoom-in-95 duration-300">
                
                {/* Sidebar */}
                <div className="w-72 border-r border-gray-100 flex flex-col bg-gray-50/50">
                    <div className="p-8 pb-4">
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Settings</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto px-4 space-y-1">
                        {MENU_ITEMS.map(item => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                                    activeTab === item.id 
                                        ? 'bg-black text-white shadow-lg' 
                                        : 'text-gray-500 hover:bg-gray-200/50 hover:text-gray-900'
                                }`}
                            >
                                <item.icon size={18} />
                                {item.label}
                            </button>
                        ))}
                    </div>
                    <div className="p-6 border-t border-gray-200">
                        <button className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-gray-600 mb-4">
                            <HelpCircle size={14} /> Help Center
                        </button>
                        <p className="text-[10px] text-gray-400">
                            Nexos v3.1.0<br/>
                            © 2025 Nexos Inc.
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col min-w-0 bg-white">
                    <div className="p-4 flex justify-end">
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
                            <X size={24} />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto px-12 pb-12">
                        {renderContent()}
                    </div>
                    <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-white sticky bottom-0 z-10">
                        <button onClick={onClose} className="px-6 py-2.5 rounded-full font-bold text-gray-500 hover:bg-gray-100 transition">Cancel</button>
                        <button onClick={onClose} className="px-8 py-2.5 rounded-full font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-lg shadow-emerald-200">Save Changes</button>
                    </div>
                </div>

            </div>
        </div>
    );
};
