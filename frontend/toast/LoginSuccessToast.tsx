"use client"
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

const LoginSuccessToast = () => {
  const params = useSearchParams();
  const isLoggedIn = params.get("isLoggedIn")
  const router = useRouter();
  useEffect(() => {
    if (isLoggedIn === "true") {
      toast.success("Successfully logged in!");
      router.replace("/dashboard");

    }
  }, [isLoggedIn, router])

  return null;
}

export default LoginSuccessToast