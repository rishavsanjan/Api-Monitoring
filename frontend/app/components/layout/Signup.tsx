import { useState } from "react";
import { IconArrowRight, IconCheck, IconEye, IconLock, IconMail, IconUser } from "../icons/icons";
import { InputFieldProps, SignupForm } from "@/type/props";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/axios";
import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";

type AuthErrorResponse = {
    error: string;
};
const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score === 0) return { score: 0, label: "", color: "" };
    if (score === 1) return { score: 1, label: "Weak", color: "bg-red-500" };
    if (score === 2) return { score: 2, label: "Fair", color: "bg-amber-400" };
    if (score === 3) return { score: 3, label: "Good", color: "bg-blue-400" };
    return { score: 4, label: "Strong", color: "bg-emerald-400" };
};


const InputField = ({
    id, label, type, placeholder, value, onChange, icon, rightElement, error,
}: InputFieldProps) => (
    <div className="flex flex-col gap-1.5">
        <label htmlFor={id} className="text-sm font-medium text-slate-300">
            {label}
        </label>
        <div className="relative group">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors">
                {icon}
            </span>
            <input
                id={id}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`
          w-full rounded-lg border bg-slate-950/60 px-10 py-3 text-sm text-white placeholder-slate-600
          focus:outline-none focus:ring-2 transition-all
          ${error
                        ? "border-red-500/60 focus:border-red-400 focus:ring-red-500/20"
                        : "border-slate-800 focus:border-blue-500 focus:ring-blue-500/20"
                    }
        `}
            />
            {rightElement && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2">{rightElement}</span>
            )}
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
);


const SignupPage = ({ onSwitch }: { onSwitch: () => void }) => {
    const [form, setForm] = useState<SignupForm>({
        name: "", email: "", password: "", confirmPassword: "", agree: false,
    });
    const [showPw, setShowPw] = useState(false);
    const [showCp, setShowCp] = useState(false);
    const [errors, setErrors] = useState<Partial<Record<keyof SignupForm, string>>>({});

    const strength = getPasswordStrength(form.password);

    const validate = () => {
        const e: typeof errors = {};
        if (!form.name.trim()) e.name = "Full name is required";
        if (!form.email) e.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
        if (!form.password) e.password = "Password is required";
        else if (form.password.length < 8) e.password = "Password must be at least 8 characters";
        if (!form.confirmPassword) e.confirmPassword = "Please confirm your password";
        else if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords don't match";
        if (!form.agree) e.agree = "You must agree to the terms";
        return e;
    };

    const signupMutation = useMutation({
        mutationKey: ['register'],
        mutationFn: async () => {
            const res = await axios({
                url: `http://localhost:8080/api/register`,
                method: 'post',
                data: {
                    email: form.email,
                    password: form.password,
                    name: form.name
                }
            })

            return res.data
        },
        onError: async (error: AxiosError<AuthErrorResponse>) => {
            toast.error(error.response!.data.error)
        }

    })

    const handleSubmit = async (ev: React.FormEvent) => {
        ev.preventDefault();
        const e = validate();
        if (Object.keys(e).length) { setErrors(e); return; }
        setErrors({});
        signupMutation.mutate();

    };

    return (
        <div className="flex flex-col gap-8 w-full max-w-[440px] animate-fadeIn">
            {/* Heading */}
            <div className="flex flex-col gap-2 text-center">
                <h1 className="text-3xl font-bold tracking-tight text-white">Create your account</h1>
                <p className="text-slate-400 text-sm">Start monitoring your APIs in minutes — no credit card required</p>
            </div>

            {/* Card */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-8 shadow-2xl backdrop-blur-sm">
                {signupMutation.isSuccess ? (
                    <div className="flex flex-col items-center gap-4 py-6 text-center">
                        <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                            <svg viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth={2.5} className="w-7 h-7">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-white font-semibold">Account created!</p>
                            <p className="text-slate-400 text-sm mt-1">Check your email to verify your account.</p>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
                        <InputField
                            id="name"
                            label="Full Name"
                            type="text"
                            placeholder="Rishav Sanjan"
                            value={form.name}
                            onChange={(v) => setForm({ ...form, name: v })}
                            icon={<IconUser />}
                            error={errors.name}
                        />
                        <InputField
                            id="email"
                            label="Email"
                            type="email"
                            placeholder="name@email.com"
                            value={form.email}
                            onChange={(v) => setForm({ ...form, email: v })}
                            icon={<IconMail />}
                            error={errors.email}
                        />

                        {/* Password with strength */}
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="pw" className="text-sm font-medium text-slate-300">Password</label>
                            <div className="relative group">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors">
                                    <IconLock />
                                </span>
                                <input
                                    id="pw"
                                    type={showPw ? "text" : "password"}
                                    placeholder="At least 8 characters"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    className={`
                    w-full rounded-lg border bg-slate-950/60 px-10 py-3 text-sm text-white placeholder-slate-600
                    focus:outline-none focus:ring-2 transition-all
                    ${errors.password ? "border-red-500/60 focus:border-red-400 focus:ring-red-500/20" : "border-slate-800 focus:border-blue-500 focus:ring-blue-500/20"}
                  `}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPw(!showPw)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                    <IconEye open={showPw} />
                                </button>
                            </div>
                            {form.password && (
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="flex gap-1 flex-1">
                                        {[1, 2, 3, 4].map((i) => (
                                            <div
                                                key={i}
                                                className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength.score ? strength.color : "bg-slate-800"
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-xs text-slate-400 w-12 text-right">{strength.label}</span>
                                </div>
                            )}
                            {errors.password && <p className="text-xs text-red-400">{errors.password}</p>}
                        </div>

                        {/* Confirm Password */}
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="cp" className="text-sm font-medium text-slate-300">Confirm Password</label>
                            <div className="relative group">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors">
                                    <IconLock />
                                </span>
                                <input
                                    id="cp"
                                    type={showCp ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={form.confirmPassword}
                                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                                    className={`
                    w-full rounded-lg border bg-slate-950/60 px-10 py-3 text-sm text-white placeholder-slate-600
                    focus:outline-none focus:ring-2 transition-all
                    ${errors.confirmPassword ? "border-red-500/60 focus:border-red-400 focus:ring-red-500/20" : "border-slate-800 focus:border-blue-500 focus:ring-blue-500/20"}
                  `}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCp(!showCp)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                    <IconEye open={showCp} />
                                </button>
                            </div>
                            {errors.confirmPassword && <p className="text-xs text-red-400">{errors.confirmPassword}</p>}
                        </div>

                        {/* Terms */}
                        <div className="flex flex-col gap-1">
                            <label className="flex items-start gap-2.5 cursor-pointer select-none group w-fit">
                                <div className="relative mt-0.5 flex-shrink-0">
                                    <input
                                        type="checkbox"
                                        checked={form.agree}
                                        onChange={(e) => setForm({ ...form, agree: e.target.checked })}
                                        className="sr-only"
                                    />
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${form.agree ? "bg-blue-500 border-blue-500" : "border-slate-600 bg-slate-950"}`}>
                                        {form.agree && <IconCheck />}
                                    </div>
                                </div>
                                <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors leading-relaxed">
                                    I agree to the{" "}
                                    <a href="#" className="text-blue-400 hover:underline">Terms of Service</a>
                                    {" "}and{" "}
                                    <a href="#" className="text-blue-400 hover:underline">Privacy Policy</a>
                                </span>
                            </label>
                            {errors.agree && <p className="text-xs text-red-400">{errors.agree}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={signupMutation.isPending}
                            className="w-full bg-blue-500 hover:bg-blue-400 disabled:bg-blue-500/50 text-white font-semibold py-3 rounded-lg transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 group"
                        >
                            {signupMutation.isPending ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                    Creating account…
                                </span>
                            ) : (
                                <>
                                    Create Account
                                    <span className="group-hover:translate-x-0.5 transition-transform">
                                        <IconArrowRight />
                                    </span>
                                </>
                            )}
                        </button>
                    </form>
                )}

                <div className="mt-8 pt-6 border-t border-slate-800 text-center">
                    <p className="text-sm text-slate-400">
                        Already have an account?{" "}
                        <button onClick={onSwitch} className="text-blue-400 font-semibold hover:underline ml-1">
                            Sign in
                        </button>
                    </p>
                </div>
            </div>

            {/* Footer links */}
            <div className="flex flex-wrap justify-center gap-6 text-xs text-slate-600 uppercase tracking-widest font-medium">
                {["Privacy Policy", "Terms of Service", "Status"].map((l) => (
                    <a key={l} href="#" className="hover:text-blue-400 transition-colors">{l}</a>
                ))}
            </div>
        </div>
    );
};

export default SignupPage