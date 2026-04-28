"use client"
import NotificationsTab from "@/app/components/layout/NotificationsTab";
import SecurityTab from "@/app/components/layout/SecurityTab";
import { useUser } from "@/context/UserContext";
import api from "@/lib/axios";
import { User } from "@/type/props";
import { useMutation } from "@tanstack/react-query";
import axios, { Axios, AxiosError } from "axios";
import { ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { JSX, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ClipLoader } from "react-spinners";

type Tab = "profile" | "notifications" | "security";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [saved, setSaved] = useState(false);
  const { user, isFetchingUser } = useUser();
  const router = useRouter();

  const [profile, setProfile] = useState<User>({
    name: "Fetching",
    email: "",
    isVerified: false
  });
  console.log(profile)
  useEffect(() => {

    const getProfile = async () => {
      if (user) {
        setProfile({
          name: user.name ?? "",
          email: user.email ?? "",
          isVerified: user.isVerified ?? false
        });
      }
    }

    getProfile();

  }, [user]);

  const sendOtpMutation = useMutation({
    mutationKey: ['otp'],
    mutationFn: async () => {
      const res = await api.get(`/api/send-otp`);

      return res.data
    },
    onSuccess: async () => {
      toast.success('Otp sent successfully!');

      setTimeout(() => {
        router.push('/verification');
      }, 200);
    },
    onError: async (error:AxiosError<{error:string}>) => {
      console.log(error.response?.data)
      toast.error("Error sending OTP!")
    }
  })


  if (isFetchingUser) {
    return <ClipLoader color="white" />;
  }

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };






  const tabs: { id: Tab; label: string; icon: JSX.Element }[] = [
    {
      id: "profile",
      label: "Profile",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      ),
    },
    {
      id: "security",
      label: "Security",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
    },
  ];


  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#101722] text-slate-900 dark:text-slate-100 font-sans">
      {/* Sidebar */}


      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Nav */}
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-10">
          <h1 className="text-lg font-bold">Settings</h1>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </button>
            <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </button>
          </div>
        </header>

        <div className="p-8 max-w-4xl mx-auto w-full">
          {/* Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 mb-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${activeTab === tab.id
                  ? "border-blue-500 text-blue-500 font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          <div className="space-y-12">
            {/* ── Profile Tab ── */}
            {activeTab === "profile" && (
              <>
                <section>
                  <div className="mb-6">
                    <h2 className="text-xl font-bold">User Details</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Update your personal information and profile picture.
                    </p>
                  </div>

                  <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="p-6 space-y-6">
                      {/* Avatar */}
                      <div className="flex items-center gap-6">
                        <div className="relative group">
                          <div className="w-24 h-24 rounded-full border-4 border-slate-100 dark:border-slate-800 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-3xl font-bold">
                            {profile.name[0].toUpperCase()}
                          </div>
                          <button className="absolute bottom-0 right-0 bg-blue-500 text-white p-1.5 rounded-full border-2 border-white dark:border-slate-900 shadow-lg hover:bg-blue-600 transition-colors">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" />
                            </svg>
                          </button>
                        </div>
                        <div>
                          <div className="flex flex-row items-center space-x-2 ">
                            <h4 className="font-semibold mb-1 text-sm">{profile.name}</h4>
                            <ShieldCheck color={`${profile.isVerified ? 'blue' : 'gray'} `} size={20} />
                          </div>

                          {/* <p className="text-xs text-slate-500 mb-3">PNG or JPG, max 5MB.</p>
                          <div className="flex gap-2">
                            <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                              Upload New
                            </button>
                            <button className="px-4 py-2 text-red-500 text-xs font-bold hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                              Remove
                            </button> 
                          </div>*/}
                          {
                            profile.isVerified ?
                              <span className="text-gray-500 text-sm">Verified</span>
                              :
                              <button
                                onClick={() => { sendOtpMutation.mutate() }}
                                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                Verify Now
                              </button>
                          }

                        </div>
                      </div>

                      {/* Form Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">


                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block">
                            Name
                          </label>
                          <input
                            type="text"
                            value={profile.name}
                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block">
                            Email
                          </label>
                          <input
                            type="email"
                            value={profile.email}
                            // onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
                      <button className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={(user?.name === profile.name && user.email === profile.email) || profile?.name.trim().length === 0 || profile?.email.trim().length === 0}
                        className="px-6 py-2 bg-blue-500 text-white text-sm font-bold rounded-lg shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition-all active:scale-[0.98] flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-75"
                      >
                        {saved ? (
                          <>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Saved!
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </button>
                    </div>
                  </div>
                </section>
              </>
            )}

            {/* ── Notifications Tab ── */}
            {(activeTab === "notifications" || activeTab === "profile") && activeTab === "notifications" && (
              <NotificationsTab />
            )}

            {/* ── Security Tab ── */}
            {activeTab === "security" && (
              <SecurityTab />
            )}
          </div>


        </div>
      </main>
    </div>
  );
}