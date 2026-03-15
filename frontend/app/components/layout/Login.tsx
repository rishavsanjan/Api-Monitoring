import { useState } from "react";
import { IconArrowRight, IconCheck, IconEye, IconLock, IconMail } from "../icons/icons";
import { InputFieldProps } from "@/type/props";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface LoginForm {
    email: string;
    password: string;
    remember: boolean;
}

type AuthErrorResponse = {
    error: string;
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

const LoginPage = ({ onSwitch }: { onSwitch: () => void }) => {

    const [form, setForm] = useState<LoginForm>({ email: "", password: "", remember: false });
    const [showPw, setShowPw] = useState(false);
    const [errors, setErrors] = useState<Partial<Record<keyof LoginForm, string>>>({});
    const router = useRouter();

    const loginMutation = useMutation({
        mutationKey: ['login'],
        mutationFn: async () => {

            const res = await axios({
                url: `http://localhost:8080/api/login`,
                method: 'post',
                data: {
                    email: form.email,
                    password: form.password
                }
            })
            return res.data
        },
        onSuccess: async (data) => {
            
            localStorage.setItem("api", data.token);
            router.push("/dashboard?isLoggedIn=true");


        },
        onError: async (error: AxiosError<AuthErrorResponse>) => {
            const e = error.response?.data.error;
            if (e === "record not found") {
                toast.error("User not registered!")
            } else {
                toast.error("Wrong password")
            }
        }
    })

    const validate = () => {
        const e: typeof errors = {};
        if (!form.email) e.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
        if (!form.password) e.password = "Password is required";
        return e;
    };

    const handleSubmit = async (ev: React.FormEvent) => {
        ev.preventDefault();
        const e = validate();
        if (Object.keys(e).length) { setErrors(e); return; }
        setErrors({});
        loginMutation.mutate();
    };

    return (
        <div className="flex flex-col gap-8 w-full max-w-[440px] animate-fadeIn">
            {/* Heading */}
            <div className="flex flex-col gap-2 text-center">
                <h1 className="text-3xl font-bold tracking-tight text-white">Welcome back</h1>
                <p className="text-slate-400 text-sm">Enter your credentials to access your dashboard</p>
            </div>

            {/* Card */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-8 shadow-2xl backdrop-blur-sm">

                <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
                    <InputField
                        id="email"
                        label="Work Email"
                        type="email"
                        placeholder="name@company.com"
                        value={form.email}
                        onChange={(v) => setForm({ ...form, email: v })}
                        icon={<IconMail />}
                        error={errors.email}
                    />
                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                            <label htmlFor="password" className="text-sm font-medium text-slate-300">Password</label>
                            <button type="button" className="text-xs font-semibold text-blue-400 hover:underline">
                                Forgot password?
                            </button>
                        </div>
                        <div className="relative group">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors">
                                <IconLock />
                            </span>
                            <input
                                id="password"
                                type={showPw ? "text" : "password"}
                                placeholder="••••••••"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                className={`
                    w-full rounded-lg border bg-slate-950/60 px-10 py-3 text-sm text-white placeholder-slate-600
                    focus:outline-none focus:ring-2 transition-all
                    ${errors.password
                                        ? "border-red-500/60 focus:border-red-400 focus:ring-red-500/20"
                                        : "border-slate-800 focus:border-blue-500 focus:ring-blue-500/20"
                                    }
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
                        {errors.password && <p className="text-xs text-red-400">{errors.password}</p>}
                    </div>

                    {/* Remember */}
                    <label className="flex items-center gap-2.5 cursor-pointer select-none group w-fit">
                        <div className="relative">
                            <input
                                type="checkbox"
                                checked={form.remember}
                                onChange={(e) => setForm({ ...form, remember: e.target.checked })}
                                className="sr-only"
                            />
                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${form.remember ? "bg-blue-500 border-blue-500" : "border-slate-600 bg-slate-950"}`}>
                                {form.remember && <IconCheck />}
                            </div>
                        </div>
                        <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">Remember this device</span>
                    </label>

                    <button
                        type="submit"
                        disabled={loginMutation.isPending}
                        className="w-full bg-blue-500 hover:bg-blue-400 disabled:bg-blue-500/50 text-white font-semibold py-3 rounded-lg transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 group"
                    >
                        {loginMutation.isPending ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                                Signing in…
                            </span>
                        ) : (
                            <>
                                Sign In
                                <span className="group-hover:translate-x-0.5 transition-transform">
                                    <IconArrowRight />
                                </span>
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-800 text-center">
                    <p className="text-sm text-slate-400">
                        Don&apos;t have an account?{" "}
                        <button onClick={onSwitch} className="text-blue-400 font-semibold hover:underline ml-1">
                            Create an account
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

export default LoginPage