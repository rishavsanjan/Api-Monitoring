import { useUser } from '@/context/UserContext';
import api from '@/lib/axios';
import { User } from '@/type/props';
import { useMutation } from '@tanstack/react-query';
import { ShieldCheck } from 'lucide-react'
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast';
import { ClipLoader } from 'react-spinners';

const ProfileTab = () => {

    const { user, isFetchingUser, setUser, logOut } = useUser();
    const router = useRouter();

    const [profile, setProfile] = useState<User>({
        name: "Fetching",
        email: "",
        isVerified: false
    });
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

    const handleSaveMutation = useMutation({
        mutationKey: ['profile-update'],
        mutationFn: async () => {
            const res = await api.post(`/api/update-profile`, {
                name: profile.name
            })

            return res.data
        },
        onSuccess: () => {
            toast.success("Profile updated successfully!")
            setUser(prev =>
                prev
                    ? { ...prev, name: profile.name }
                    : null
            );

        },
        onError: () => {
            toast.error("Error updating profile!")
        }
    })


    if (isFetchingUser) {
        return <ClipLoader color="white" />;
    }

    const handleSave = () => {
        handleSaveMutation.mutate();

    };



    return (
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
                                        onClick={() => { router.push('/verification'); }}
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

                <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 flex justify-between gap-3 border-t border-slate-200 dark:border-slate-800">
                    <button
                        onClick={() => {
                            logOut()
                            router.push("/")
                        }}
                        className="inline-flex items-center justify-center rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-red-600 hover:shadow-md active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer" >
                        Log out
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={(user?.name === profile.name && user.email === profile.email) || profile?.name.trim().length === 0 || profile?.email.trim().length === 0}
                        className="px-6 py-2 bg-blue-500 text-white text-sm font-bold rounded-lg shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition-all active:scale-[0.98] flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-75"
                    >
                        {handleSaveMutation.isSuccess ? (
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
    )
}

export default ProfileTab