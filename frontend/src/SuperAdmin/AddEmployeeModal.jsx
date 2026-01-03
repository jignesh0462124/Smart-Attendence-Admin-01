import React, { useState } from 'react';
import { supabase } from '../../supabase/supabase';
// import { X, UserPlus } from 'lucide-react'; // Not used with Material Symbols

export default function AddEmployeeModal({ isOpen, onClose, onUserAdded }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: '',
        phone: '',
        department: 'General',
        role: 'employee'
    });

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Sign Up the user (Creates Entry in auth.users)
            // Note: This might sign in the new user immediately depending on config.
            const { data, error } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.fullName,
                    }
                }
            });

            if (error) throw error;

            // 2. Update the Profile with extra details (Phone, Dept, Role)
            if (data.user) {
                const { error: updateError } = await supabase
                    .from('profiles')
                    .update({
                        phone_number: formData.phone,
                        department: formData.department,
                        role: formData.role
                    })
                    .eq('id', data.user.id);

                if (updateError) {
                    console.error("Profile update failed:", updateError);
                    alert("User created but profile update failed: " + updateError.message);
                } else {
                    alert(`Employee ${formData.fullName} created successfully!`);
                }

                if (onUserAdded) onUserAdded();
                onClose();
            }

        } catch (err) {
            console.error("Signup error:", err);
            alert("Error creating employee: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden transform transition-all scale-100">

                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                            <span className="material-symbols-outlined">person_add</span>
                        </div>
                        Add New Employee
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-red-500">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Full Name</label>
                            <input name="fullName" required onChange={handleChange} className="w-full border border-slate-200 bg-slate-50 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-medium" placeholder="First Last" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Phone Number</label>
                            <input name="phone" type="tel" onChange={handleChange} className="w-full border border-slate-200 bg-slate-50 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-medium" placeholder="+1 (555) 000-0000" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email Address</label>
                        <div className="relative">
                            <span className="absolute left-3.5 top-2.5 text-slate-400 material-symbols-outlined text-[20px]">mail</span>
                            <input name="email" type="email" required onChange={handleChange} className="w-full pl-10 border border-slate-200 bg-slate-50 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-medium" placeholder="employee@company.com" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Password</label>
                        <div className="relative">
                            <span className="absolute left-3.5 top-2.5 text-slate-400 material-symbols-outlined text-[20px]">lock</span>
                            <input name="password" type="password" required onChange={handleChange} className="w-full pl-10 border border-slate-200 bg-slate-50 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-medium" placeholder="Min 6 characters" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Department</label>
                            <div className="relative">
                                <select name="department" onChange={handleChange} className="w-full appearance-none border border-slate-200 bg-slate-50 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-medium text-slate-700">
                                    <option>General</option>
                                    <option>Engineering</option>
                                    <option>Marketing</option>
                                    <option>HR</option>
                                    <option>Product</option>
                                    <option>Sales</option>
                                </select>
                                <span className="absolute right-3 top-2.5 pointer-events-none text-slate-400 material-symbols-outlined text-[20px]">expand_more</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Role</label>
                            <div className="relative">
                                <select name="role" onChange={handleChange} className="w-full appearance-none border border-slate-200 bg-slate-50 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-medium text-slate-700">
                                    <option value="employee">Employee</option>
                                    <option value="manager">Manager</option>
                                    <option value="admin">Admin</option>
                                </select>
                                <span className="absolute right-3 top-2.5 pointer-events-none text-slate-400 material-symbols-outlined text-[20px]">expand_more</span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex gap-3">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-lg bg-[#137fec] text-white font-bold hover:bg-blue-600 shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed">
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                                    Creating...
                                </span>
                            ) : 'Create Employee'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
