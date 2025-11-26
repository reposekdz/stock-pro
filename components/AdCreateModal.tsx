
import React, { useState } from 'react';
import { X, ArrowRight, ArrowLeft, Target, Users, DollarSign, Image as ImageIcon, CheckCircle2, HelpCircle, ChevronDown, Search, Calendar } from 'lucide-react';
import { Pin } from '../types';

interface AdCreateModalProps {
    onClose: () => void;
    userPins: Pin[];
}

type Step = 'campaign' | 'targeting' | 'budget' | 'creative';

const OBJECTIVES = [
    { id: 'awareness', label: 'Brand Awareness', desc: 'Help people discover your brand.' },
    { id: 'video_views', label: 'Video Views', desc: 'Get more people to watch your videos.' },
    { id: 'consideration', label: 'Consideration', desc: 'Get more people to click your Pin.' },
    { id: 'conversions', label: 'Conversions', desc: 'Drive actions on your website.' },
    { id: 'catalog', label: 'Catalog Sales', desc: 'Promote your product inventory.' },
];

const INTERESTS = ['Design', 'DIY', 'Beauty', 'Fashion', 'Home', 'Travel', 'Food', 'Tech', 'Art', 'Education'];

export const AdCreateModal: React.FC<AdCreateModalProps> = ({ onClose, userPins }) => {
    const [currentStep, setCurrentStep] = useState<Step>('campaign');
    const [campaignName, setCampaignName] = useState('New Campaign ' + new Date().toLocaleDateString());
    const [objective, setObjective] = useState('consideration');
    const [budgetType, setBudgetType] = useState('daily');
    const [budgetAmount, setBudgetAmount] = useState(20);
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const [selectedPin, setSelectedPin] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const steps: Step[] = ['campaign', 'targeting', 'budget', 'creative'];
    const currentStepIndex = steps.indexOf(currentStep);

    const handleNext = () => {
        if (currentStepIndex < steps.length - 1) {
            setCurrentStep(steps[currentStepIndex + 1]);
        } else {
            handleSubmit();
        }
    };

    const handleBack = () => {
        if (currentStepIndex > 0) {
            setCurrentStep(steps[currentStepIndex - 1]);
        }
    };

    const handleSubmit = () => {
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            onClose();
            alert("Ad Campaign Created Successfully! It is now under review.");
        }, 1500);
    };

    const toggleInterest = (interest: string) => {
        if (selectedInterests.includes(interest)) {
            setSelectedInterests(prev => prev.filter(i => i !== interest));
        } else {
            setSelectedInterests(prev => [...prev, interest]);
        }
    };

    return (
        <div className="fixed inset-0 z-[250] bg-gray-50 flex flex-col animate-in slide-in-from-bottom-full duration-300">
            {/* Header */}
            <div className="bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
                        <X size={24} />
                    </button>
                    <h1 className="text-xl font-black text-gray-900 tracking-tight">Create Campaign</h1>
                </div>
                <div className="flex items-center gap-4 text-sm font-bold text-gray-500">
                    <span className={currentStep === 'campaign' ? 'text-emerald-600' : ''}>1. Campaign</span>
                    <span className="text-gray-300">&gt;</span>
                    <span className={currentStep === 'targeting' ? 'text-emerald-600' : ''}>2. Targeting</span>
                    <span className="text-gray-300">&gt;</span>
                    <span className={currentStep === 'budget' ? 'text-emerald-600' : ''}>3. Budget</span>
                    <span className="text-gray-300">&gt;</span>
                    <span className={currentStep === 'creative' ? 'text-emerald-600' : ''}>4. Creative</span>
                </div>
                <div></div> {/* Spacer */}
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Main Content */}
                <div className="flex-1 overflow-y-auto p-8 md:p-12">
                    <div className="max-w-3xl mx-auto">
                        
                        {currentStep === 'campaign' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-8">
                                <div>
                                    <h2 className="text-3xl font-black mb-2">Choose campaign objective</h2>
                                    <p className="text-gray-500">What do you want to achieve with this campaign?</p>
                                </div>

                                <div className="space-y-4">
                                    <label className="block text-xs font-bold text-gray-500 uppercase">Campaign Name</label>
                                    <input 
                                        type="text" 
                                        value={campaignName}
                                        onChange={(e) => setCampaignName(e.target.value)}
                                        className="w-full p-4 border border-gray-300 rounded-xl font-bold text-lg focus:ring-2 ring-emerald-500 outline-none"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {OBJECTIVES.map(obj => (
                                        <div 
                                            key={obj.id}
                                            onClick={() => setObjective(obj.id)}
                                            className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${objective === obj.id ? 'border-emerald-600 bg-emerald-50' : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'}`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <Target className={objective === obj.id ? 'text-emerald-600' : 'text-gray-400'} size={24}/>
                                                {objective === obj.id && <CheckCircle2 className="text-emerald-600" size={20}/>}
                                            </div>
                                            <h3 className="font-bold text-gray-900 mb-1">{obj.label}</h3>
                                            <p className="text-sm text-gray-500">{obj.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {currentStep === 'targeting' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-8">
                                <div>
                                    <h2 className="text-3xl font-black mb-2">Targeting</h2>
                                    <p className="text-gray-500">Define who sees your ads.</p>
                                </div>

                                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Users size={20}/> Audience Interests</h3>
                                    <div className="flex flex-wrap gap-3">
                                        {INTERESTS.map(interest => (
                                            <button 
                                                key={interest}
                                                onClick={() => toggleInterest(interest)}
                                                className={`px-4 py-2 rounded-full font-bold text-sm border transition ${selectedInterests.includes(interest) ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                                            >
                                                {interest}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                                    <h3 className="font-bold text-lg mb-2">Demographics</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Genders</label>
                                            <select className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 font-bold text-sm outline-none">
                                                <option>All genders</option>
                                                <option>Female</option>
                                                <option>Male</option>
                                                <option>Custom</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Ages</label>
                                            <select className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 font-bold text-sm outline-none">
                                                <option>All ages</option>
                                                <option>18-24</option>
                                                <option>25-34</option>
                                                <option>35-44</option>
                                                <option>45+</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                         <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Locations</label>
                                         <input type="text" placeholder="Add locations..." className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 font-bold text-sm outline-none"/>
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep === 'budget' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-8">
                                <div>
                                    <h2 className="text-3xl font-black mb-2">Budget & Schedule</h2>
                                    <p className="text-gray-500">Control how much you spend.</p>
                                </div>

                                <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
                                    <div className="flex gap-4 mb-8">
                                        <button 
                                            onClick={() => setBudgetType('daily')}
                                            className={`flex-1 py-3 rounded-xl font-bold border-2 transition ${budgetType === 'daily' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-500'}`}
                                        >
                                            Daily Budget
                                        </button>
                                        <button 
                                            onClick={() => setBudgetType('lifetime')}
                                            className={`flex-1 py-3 rounded-xl font-bold border-2 transition ${budgetType === 'lifetime' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-500'}`}
                                        >
                                            Lifetime Budget
                                        </button>
                                    </div>

                                    <div className="mb-8">
                                        <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Amount</label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>
                                            <input 
                                                type="number" 
                                                value={budgetAmount}
                                                onChange={(e) => setBudgetAmount(parseInt(e.target.value))}
                                                className="w-full pl-10 pr-4 py-4 text-3xl font-black border-b-2 border-gray-200 outline-none focus:border-emerald-500 transition"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Start Date</label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                                                <input type="date" className="w-full pl-10 py-3 bg-gray-50 rounded-xl font-bold text-sm outline-none"/>
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">End Date (Optional)</label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                                                <input type="date" className="w-full pl-10 py-3 bg-gray-50 rounded-xl font-bold text-sm outline-none"/>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep === 'creative' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-8">
                                <div>
                                    <h2 className="text-3xl font-black mb-2">Select Pin</h2>
                                    <p className="text-gray-500">Choose content to promote.</p>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {userPins.map(pin => (
                                        <div 
                                            key={pin.id}
                                            onClick={() => setSelectedPin(pin.id)}
                                            className={`relative rounded-xl overflow-hidden cursor-pointer aspect-[2/3] group transition-all ${selectedPin === pin.id ? 'ring-4 ring-emerald-500 ring-offset-2' : 'hover:opacity-90'}`}
                                        >
                                            <img src={pin.imageUrl} className="w-full h-full object-cover"/>
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                                <span className="bg-white text-black font-bold px-4 py-2 rounded-full text-xs">Select</span>
                                            </div>
                                            {selectedPin === pin.id && (
                                                <div className="absolute top-2 right-2 bg-emerald-500 text-white p-1 rounded-full shadow-md">
                                                    <CheckCircle2 size={16} />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    <div className="aspect-[2/3] bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-50 hover:border-emerald-300 hover:text-emerald-500 transition">
                                        <div className="p-3 bg-white rounded-full mb-2 shadow-sm"><ImageIcon size={24}/></div>
                                        <span className="font-bold text-sm">Create New Pin</span>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>

                {/* Right Sidebar - Summary */}
                <div className="w-80 bg-white border-l border-gray-200 hidden lg:flex flex-col p-6">
                    <h3 className="font-black text-gray-900 mb-6">Summary</h3>
                    
                    <div className="space-y-6 flex-1">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Campaign</p>
                            <p className="font-bold text-sm truncate">{campaignName}</p>
                            <p className="text-xs text-gray-500 capitalize">{objective.replace('_', ' ')}</p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Audience Size</p>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <p className="font-bold text-sm">Broad (12M - 15M)</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Estimated Results</p>
                            <p className="font-bold text-2xl text-gray-900">1.2k - 3.4k</p>
                            <p className="text-xs text-gray-500">Daily Clicks</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="flex justify-between mb-2">
                                <span className="text-xs font-bold text-gray-500">Budget</span>
                                <span className="text-xs font-bold text-gray-900">${budgetAmount}.00</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-xs font-bold text-gray-500">Duration</span>
                                <span className="text-xs font-bold text-gray-900">Ongoing</span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100">
                        <div className="flex justify-between items-center mb-4">
                            <button onClick={handleBack} disabled={currentStepIndex === 0} className="font-bold text-gray-500 hover:text-black disabled:opacity-30">Back</button>
                            <span className="text-xs font-bold text-gray-400">Step {currentStepIndex + 1} of 4</span>
                        </div>
                        <button 
                            onClick={handleNext}
                            disabled={isSubmitting || (currentStep === 'creative' && !selectedPin)}
                            className="w-full py-4 bg-red-600 text-white font-bold rounded-full hover:bg-red-700 transition shadow-lg shadow-red-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? 'Launching...' : (currentStep === 'creative' ? 'Launch Campaign' : 'Next')}
                            {!isSubmitting && <ArrowRight size={18}/>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
