import React, { useState } from 'react';
import { Lock, Mail, AlertCircle, UserPlus, Key } from 'lucide-react';
import api from '../services/api';

export default function Login() {
    const [isRegistering, setIsRegistering] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (isRegistering) {
                // 1. Register the user (Backend securely defaults this to role: "user")
                await api.post('/auth/register', {
                    email: email,
                    password: password
                });
                // After successful registration, automatically flip to login mode
                setIsRegistering(false);
                setError("Account created successfully! Please sign in.");
                setIsLoading(false);
                return;
            }

            // 2. Login Flow
            const formData = new URLSearchParams();
            formData.append('username', email);
            formData.append('password', password);

            const res = await api.post('/auth/login', formData, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });
            
            const token = res.data.access_token;
            const payloadBase64 = token.split('.')[1];
            const decodedPayload = JSON.parse(atob(payloadBase64));
            
            localStorage.setItem('access_token', token);
            localStorage.setItem('role', decodedPayload.role);
            window.location.reload();
            
        } catch (err) {
            setError(err.response?.data?.detail || "An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[85vh] py-10">
            <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <div className="text-center mb-8">
                    <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        {isRegistering ? <UserPlus className="text-blue-600" size={32} /> : <Lock className="text-blue-600" size={32} />}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        {isRegistering ? 'Create Account' : 'Welcome Back'}
                    </h2>
                    <p className="text-gray-500 text-sm mt-2">
                        {isRegistering ? 'Register to submit content for screening' : 'Sign in to access the moderation platform'}
                    </p>
                </div>

                {error && (
                    <div className={`p-3 rounded-lg flex items-center gap-2 text-sm mb-6 border ${error.includes('successfully') ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail size={18} className="text-gray-400" />
                            </div>
                            <input 
                                type="email" 
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                placeholder="name@example.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Key size={18} className="text-gray-400" />
                            </div>
                            <input 
                                type="password" 
                                required
                                minLength="6"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all disabled:bg-blue-400"
                    >
                        {isLoading ? "Processing..." : (isRegistering ? "Sign Up" : "Sign In")}
                    </button>
                </form>

                {/* Toggle Login/Register */}
                <div className="mt-6 text-center text-sm">
                    <span className="text-gray-600">
                        {isRegistering ? "Already have an account? " : "Don't have an account? "}
                    </span>
                    <button 
                        type="button"
                        onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
                        className="text-blue-600 font-semibold hover:underline"
                    >
                        {isRegistering ? "Sign In" : "Sign Up"}
                    </button>
                </div>

                {/* Evaluator Cheat Sheet */}
                {!isRegistering && (
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 text-center">Evaluator Demo Accounts</p>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="bg-gray-50 p-3 rounded border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                                 onClick={() => {setEmail('admin@test.com'); setPassword('admin123');}}>
                                <span className="font-bold text-gray-700 block mb-1">Admin Access</span>
                                <span className="text-gray-500 block">admin@test.com</span>
                                <span className="text-gray-500">admin123</span>
                            </div>
                            <div className="bg-gray-50 p-3 rounded border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                                 onClick={() => {setEmail('user@test.com'); setPassword('user123');}}>
                                <span className="font-bold text-gray-700 block mb-1">User Access</span>
                                <span className="text-gray-500 block">user@test.com</span>
                                <span className="text-gray-500">user123</span>
                            </div>
                        </div>
                        <p className="text-[10px] text-gray-400 text-center mt-2">(Click a box to auto-fill credentials)</p>
                    </div>
                )}
            </div>
        </div>
    );
}