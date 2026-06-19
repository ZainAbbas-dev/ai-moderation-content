import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { UploadCloud, AlertTriangle, CheckCircle, ShieldBan, Info, Clock } from 'lucide-react';

export default function SubmissionView() {
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [history, setHistory] = useState([]);
    
    // Appeal Modal State
    const [appealModalOpen, setAppealModalOpen] = useState(false);
    const [appealSubmissionId, setAppealSubmissionId] = useState(null);
    const [appealText, setAppealText] = useState('');
    const [isAppealing, setIsAppealing] = useState(false);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await api.get('/submissions/history');
            setHistory(res.data);
        } catch (error) {
            console.error("Error fetching history:", error);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            await api.post('/submissions/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFile(null);
            fetchHistory(); // Refresh the list
        } catch (error) {
            alert(error.response?.data?.detail || "Upload failed");
        } finally {
            setIsUploading(false);
        }
    };

    const submitAppeal = async () => {
        if (appealText.length < 10) {
            alert("Please provide a more detailed justification (min 10 characters).");
            return;
        }
        setIsAppealing(true);
        try {
            await api.post('/appeals/', {
                submission_id: appealSubmissionId,
                justification: appealText
            });
            setAppealModalOpen(false);
            setAppealText('');
            fetchHistory(); // Refresh to show "Appealed" status
        } catch (error) {
            alert(error.response?.data?.detail || "Appeal failed");
        } finally {
            setIsAppealing(false);
        }
    };

    const getStatusBadge = (status) => {
        switch(status) {
            case 'Clean': return <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center gap-1"><CheckCircle size={14}/> Clean</span>;
            case 'Clean (Overridden)': return <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center gap-1"><CheckCircle size={14}/> Overridden to Clean</span>;
            case 'Pending': return <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full flex items-center gap-1"><AlertTriangle size={14}/> Flagged</span>;
            case 'Appealed': return <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full flex items-center gap-1"><Clock size={14}/> Appeal Pending</span>;
            case 'Appeal Rejected': return <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full flex items-center gap-1"><ShieldBan size={14}/> Rejected</span>;
            default: return <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">{status}</span>;
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Upload Section */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold mb-4 text-gray-800">Submit Content for Screening</h2>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center hover:bg-gray-50 transition-colors">
                    <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        id="file-upload" 
                        onChange={handleFileChange}
                    />
                    <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                        <UploadCloud size={48} className="text-blue-500 mb-3" />
                        <span className="text-gray-700 font-medium">{file ? file.name : "Click to browse or drag image here"}</span>
                        <span className="text-gray-400 text-sm mt-1">Supports JPG, PNG</span>
                    </label>
                </div>
                <button 
                    onClick={handleUpload}
                    disabled={!file || isUploading}
                    className="mt-4 w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                >
                    {isUploading ? "Scanning with AI..." : "Upload & Analyze"}
                </button>
            </div>

            {/* History Section */}
            <div>
                <h2 className="text-xl font-bold mb-4 text-gray-800">Submission History</h2>
                <div className="space-y-4">
                    {history.map((sub) => (
                        <div key={sub.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-start mb-4 border-b pb-4">
                                <div>
                                    <p className="text-sm text-gray-500 font-mono">ID: {sub.id}</p>
                                    <p className="text-xs text-gray-400">{new Date(sub.created_at).toLocaleString()}</p>
                                </div>
                                <div className="flex gap-3 items-center">
                                    {getStatusBadge(sub.status)}
                                    
                                    {/* Appeal Button Logic */}
                                    {(sub.verdict.overall_outcome === 'Flagged for Review' || sub.verdict.overall_outcome === 'Blocked') && sub.status === 'Pending' && (
                                        <button 
                                            onClick={() => { setAppealSubmissionId(sub.id); setAppealModalOpen(true); }}
                                            className="text-sm text-blue-600 hover:text-blue-800 font-medium underline"
                                        >
                                            File Appeal
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Category Breakdown Bars */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {sub.verdict.category_breakdown.map((cat, idx) => (
                                    <div key={idx} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-medium text-gray-700">{cat.category}</span>
                                            <span className={`font-bold ${cat.is_detected ? 'text-red-500' : 'text-green-500'}`}>
                                                {cat.confidence_score.toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                            <div 
                                                className={`h-2 rounded-full ${cat.is_detected ? 'bg-red-500' : 'bg-green-500'}`} 
                                                style={{ width: `${Math.min(cat.confidence_score, 100)}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-xs text-gray-500 italic flex items-start gap-1">
                                            <Info size={12} className="mt-0.5 flex-shrink-0" />
                                            {cat.reasoning}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                    {history.length === 0 && <p className="text-gray-500 text-center py-8">No submissions yet.</p>}
                </div>
            </div>

            {/* Appeal Modal */}
            {appealModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">File an Appeal</h3>
                        <p className="text-sm text-gray-600 mb-4">Please explain why you believe the AI verdict was incorrect for this image.</p>
                        <textarea 
                            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none mb-4"
                            rows="4"
                            placeholder="My image was flagged for X, but it is actually Y..."
                            value={appealText}
                            onChange={(e) => setAppealText(e.target.value)}
                        ></textarea>
                        <div className="flex justify-end gap-3">
                            <button 
                                onClick={() => { setAppealModalOpen(false); setAppealText(''); }}
                                className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={submitAppeal}
                                disabled={isAppealing}
                                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                            >
                                {isAppealing ? "Submitting..." : "Submit Appeal"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}