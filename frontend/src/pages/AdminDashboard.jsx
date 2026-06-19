import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { BarChart2, ShieldAlert, CheckCircle, XCircle, Users, Activity } from 'lucide-react';

export default function AdminDashboard() {
    const [analytics, setAnalytics] = useState(null);
    const [appeals, setAppeals] = useState([]);
    const [isResolving, setIsResolving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [analyticsRes, appealsRes] = await Promise.all([
                api.get('/analytics/dashboard'),
                api.get('/appeals/queue')
            ]);
            setAnalytics(analyticsRes.data);
            setAppeals(appealsRes.data);
        } catch (error) {
            console.error("Error fetching admin data:", error);
        }
    };

    const handleResolveAppeal = async (appealId, status) => {
        if (!window.confirm(`Are you sure you want to ${status.toUpperCase()} this appeal?`)) return;
        
        setIsResolving(true);
        try {
            await api.put(`/appeals/${appealId}/resolve`, {
                status: status,
                admin_response: `Appeal manually ${status.toLowerCase()} by administrator.`
            });
            fetchData(); // Refresh both analytics and the queue
        } catch (error) {
            alert(error.response?.data?.detail || "Failed to resolve appeal");
        } finally {
            setIsResolving(false);
        }
    };

    if (!analytics) return <div className="text-center p-10 text-gray-500">Loading Dashboard...</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Activity className="text-blue-600" /> Platform Analytics
                </h2>
                <Link to="/admin/policies" className="bg-gray-800 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-900 transition-colors">
                    Configure AI Policies
                </Link>
            </div>

            {/* Top Level Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="bg-blue-100 p-3 rounded-lg text-blue-600"><BarChart2 size={24} /></div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total Submissions</p>
                        <p className="text-2xl font-bold text-gray-900">{analytics.total_submissions}</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="bg-red-100 p-3 rounded-lg text-red-600"><ShieldAlert size={24} /></div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Blocked Items</p>
                        <p className="text-2xl font-bold text-gray-900">{analytics.verdict_distribution['Blocked'] || 0}</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="bg-yellow-100 p-3 rounded-lg text-yellow-600"><ShieldAlert size={24} /></div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Flagged Items</p>
                        <p className="text-2xl font-bold text-gray-900">{analytics.verdict_distribution['Flagged for Review'] || 0}</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="bg-purple-100 p-3 rounded-lg text-purple-600"><Users size={24} /></div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Resolution Rate</p>
                        <p className="text-2xl font-bold text-gray-900">{analytics.appeals.resolution_rate}%</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Appeals Queue */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Pending Appeals Queue</h3>
                    <div className="space-y-4">
                        {appeals.map((appeal) => (
                            <div key={appeal.id} className="bg-gray-50 border border-gray-200 p-4 rounded-lg flex flex-col gap-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-xs text-gray-500 font-mono">Submission ID: {appeal.submission_id}</p>
                                        <p className="text-xs text-gray-400">{new Date(appeal.created_at).toLocaleString()}</p>
                                    </div>
                                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Action Required</span>
                                </div>
                                <div className="bg-white p-3 rounded border border-gray-100 text-sm text-gray-700 italic">
                                    "{appeal.justification}"
                                </div>
                                <div className="flex justify-end gap-2 mt-2">
                                    <button 
                                        onClick={() => handleResolveAppeal(appeal.id, 'Rejected')}
                                        disabled={isResolving}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded text-sm font-medium transition-colors"
                                    >
                                        <XCircle size={16} /> Reject & Maintain Block
                                    </button>
                                    <button 
                                        onClick={() => handleResolveAppeal(appeal.id, 'Accepted')}
                                        disabled={isResolving}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded text-sm font-medium transition-colors"
                                    >
                                        <CheckCircle size={16} /> Accept & Override to Clean
                                    </button>
                                </div>
                            </div>
                        ))}
                        {appeals.length === 0 && <p className="text-gray-500 text-center py-6">No pending appeals.</p>}
                    </div>
                </div>

                {/* Top Violators List */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Top Violators</h3>
                    <ul className="space-y-3">
                        {analytics.top_violators.map((user, idx) => (
                            <li key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <span className="text-sm font-mono text-gray-600 truncate w-32" title={user._id}>{user._id.substring(0, 8)}...</span>
                                <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">{user.violation_count} violations</span>
                            </li>
                        ))}
                        {analytics.top_violators.length === 0 && <p className="text-gray-500 text-sm text-center">No violations recorded.</p>}
                    </ul>
                </div>
            </div>
        </div>
    );
}