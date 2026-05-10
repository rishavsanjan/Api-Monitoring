import api from '@/lib/axios';
import { useMutation } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react'

interface Errors {
    currentPasswordError: string;
    newPasswordError: string;
}

const SecurityTab = () => {
    const [saved, setSaved] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [currentPasswordDebounced, setCurrentPasswordDebounced] = useState("");
    const [errors, setErrors] = useState<Errors>({
        currentPasswordError: "",
        newPasswordError: ""
    });

    // Fix 1: cleanup function must be returned from the effect, not from the timer callback
    useEffect(() => {
        const timer = window.setTimeout(() => {
            setCurrentPasswordDebounced(currentPassword);
        }, 500);
        return () => window.clearTimeout(timer); // <-- moved here
    }, [currentPassword]);

    // Fix 2: trigger the checker when debounced value changes
    useEffect(() => {
        if (currentPasswordDebounced) {
            currentPasswordCheckerMutation.mutate();
        }
    }, [currentPasswordDebounced]);

    // Fix 3: unique mutationKey
    const currentPasswordCheckerMutation = useMutation({
        mutationKey: ['check-current-password'],
        mutationFn: async () => {
            await api.post(`/api/password-checker`, {
                password: currentPasswordDebounced
            });
        },
        onSuccess: () => {
            setErrors(prev => ({ ...prev, currentPasswordError: "" }));
        },
        onError: () => {
            setErrors(prev => ({ ...prev, currentPasswordError: "Wrong password!" }));
        }
    });

    // Fix 4: unique mutationKey
    const changePasswordMutation = useMutation({
        mutationKey: ['change-password'],
        mutationFn: async () => {
            await api.post(`/api/change-password`, { password: newPassword });
        },
        onSuccess: () => {
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        }
    });

    // Fix 5: validate before saving
    const handleSave = () => {
        let hasError = false;

        if (newPassword.length < 8) {
            setErrors(prev => ({ ...prev, newPasswordError: "Password must be at least 8 characters." }));
            hasError = true;
        } else if (newPassword !== confirmPassword) {
            setErrors(prev => ({ ...prev, newPasswordError: "Passwords do not match." }));
            hasError = true;
        } else {
            setErrors(prev => ({ ...prev, newPasswordError: "" }));
        }

        if (!hasError && !errors.currentPasswordError) {
            changePasswordMutation.mutate();
        }
    };

    return (
        <section>
            <div className="mb-6">
                <h2 className="text-xl font-bold">Security</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Manage your password, two-factor authentication, and active sessions.
                </p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-6 space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block">
                            Current Password
                        </label>
                        <input
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            value={currentPassword}
                            type="password"
                            placeholder="••••••••"
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                        {errors.currentPasswordError && (
                            <p className="text-xs text-red-500">{errors.currentPasswordError}</p>
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block">
                                New Password
                            </label>
                            {/* Fix 6: wired to newPassword state */}
                            <input
                                onChange={(e) => setNewPassword(e.target.value)}
                                value={newPassword}
                                type="password"
                                placeholder="••••••••"
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block">
                                Confirm New Password
                            </label>
                            {/* Fix 7: wired to confirmPassword state */}
                            <input
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                value={confirmPassword}
                                type="password"
                                placeholder="••••••••"
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            />
                            {errors.newPasswordError && (
                                <p className="text-xs text-red-500">{errors.newPasswordError}</p>
                            )}
                        </div>
                    </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 flex justify-end border-t border-slate-200 dark:border-slate-800">
                    <button
                        onClick={handleSave}
                        disabled={changePasswordMutation.isPending}
                        className="px-6 py-2 bg-blue-500 text-white text-sm font-bold rounded-lg shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition-all active:scale-[0.98] disabled:opacity-60"
                    >
                        {saved ? "Saved!" : changePasswordMutation.isPending ? "Saving..." : "Update Password"}
                    </button>
                </div>
            </div>
        </section>
    );
};

export default SecurityTab;