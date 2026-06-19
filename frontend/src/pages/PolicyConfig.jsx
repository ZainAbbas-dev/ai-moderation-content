import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Sliders, Save, Shield, ArrowLeft } from 'lucide-react';

export default function PolicyConfig() {
    const [policies, setPolicies] = useState([]);
    const [isSaving, setIsSaving] = useState(null); // Track which category is saving

    useEffect(() => {
        fetchPolicies();
    }, []);

    const fetchPolicies = async () => {
        try {
            const res = await api.get('/admin/policies');
            setPolicies(res.data);
        } catch (error) {
            console.error("Error fetching policies:", error);
        }
    };

    const handleUpdate = (categoryName, field, value) => {
        setPolicies(policies.map(p => 
            p.category === categoryName ? { ...p, [field]: value } : p
        ));
    };

    const savePolicy = async (policy) => {
        setIsSaving(policy.category);
        try {
            await api.put(`/admin/policies/${policy.category}`, policy);
            // Flash a quick success color or notification here if desired
        } catch (error) {
            alert(error.response?.data?.detail || "Failed to save policy");
        } finally {
            setIsSaving(null);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <Link to="/admin" className="text-gray-500 hover:text-blue-600 transition-colors">
                        <ArrowLeft size={24} />
                    </Link>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Sliders className="text-blue-600" /> AI Policy Configuration
                    </h2>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-100 text-sm text-gray-600 font-medium">
                    Adjust the sensitivity and automated behaviors for the Gemini evaluation model. Changes apply to all new submissions instantly.
                </div>
                
                <div className="divide-y divide-gray-100">
                    {policies.map((policy) => (
                        <div key={policy.category} className={`p-6 transition-colors ${!policy.is_enabled ? 'bg-gray-50 opacity-75' : 'bg-white'}`}>
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-3">
                                    <Shield className={policy.is_enabled ? 'text-blue-500' : 'text-gray-400'} size={20} />
                                    <h3 className="text-lg font-bold text-gray-800">{policy.category}</h3>
                                </div>
                                <label className="flex items-center cursor-pointer">
                                    <div className="relative">
                                        <input 
                                            type="checkbox" 
                                            className="sr-only" 
                                            checked={policy.is_enabled}
                                            onChange={(e) => handleUpdate(policy.category, 'is_enabled', e.target.checked)}
                                        />
                                        <div className={`block w-14 h-8 rounded-full transition-colors ${policy.is_enabled ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                                        <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${policy.is_enabled ? 'transform translate-x-6' : ''}`}></div>
                                    </div>
                                    <span className="ml-3 text-sm font-medium text-gray-700">{policy.is_enabled ? 'Active' : 'Disabled'}</span>
                                </label>
                            </div>

                            {policy.is_enabled && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                                    {/* Slider Control */}
                                    <div>
                                        <div className="flex justify-between mb-2 text-sm font-medium text-gray-700">
                                            <label>Confidence Threshold</label>
                                            <span className="text-blue-600 font-bold">{policy.confidence_threshold}%</span>
                                        </div>
                                        <input 
                                            type="range" 
                                            min="0" max="100" step="1" 
                                            value={policy.confidence_threshold}
                                            onChange={(e) => handleUpdate(policy.category, 'confidence_threshold', parseFloat(e.target.value))}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                        />
                                        <p className="text-xs text-gray-500 mt-2">Detections below this score are ignored as inconclusive.</p>
                                    </div>

                                    {/* Behavior Control */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Enforcement Behavior</label>
                                        <select 
                                            value={policy.enforcement_behavior}
                                            onChange={(e) => handleUpdate(policy.category, 'enforcement_behavior', e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        >
                                            <option value="Flag for Review">Flag for Review (Queue)</option>
                                            <option value="Auto-Block">Auto-Block (Immediate)</option>
                                        </select>
                                        <div className="mt-4 flex justify-end">
                                            <button 
                                                onClick={() => savePolicy(policy)}
                                                disabled={isSaving === policy.category}
                                                className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-900 transition-colors disabled:bg-gray-400"
                                            >
                                                <Save size={16} />
                                                {isSaving === policy.category ? "Saving..." : "Save Rules"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}