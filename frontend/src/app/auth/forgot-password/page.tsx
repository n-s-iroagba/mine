"use client";
import { useState, useEffect } from "react";

import {
  UserCircleIcon,
  EnvelopeIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { API_ROUTES, apiService } from "@/services";
import { ApiError } from "@/types/api";



interface FormState {
  email: string;
}

export default function LoginPage() {

  const router = useRouter()
  
  const [isMounted, setIsMounted] = useState(false);
  const [form, setForm] = useState<FormState>({
    email: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage]= useState('')

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    setSubmitting(true);
    try {
      const payload = {
        email: form.email,
      };

     await apiService.post(API_ROUTES.AUTH.FORGOT_PASSWORD, payload);

     setMessage('A password reset email has been sent to your email address.')
    } catch (err: unknown) {
      let msg = "Unexpected error";
    const error = err as ApiError
      console.error("Error in  forgot password handleSubmit function", err);
      setError(error.response.data.message||msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white rounded-2xl shadow-sm border-2 border-slate-50 relative max-w-md w-full p-8">
        {/* Decorative Corner Borders */}
        <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-slate-800 opacity-20" />
        <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-slate-800 opacity-20" />

        <h1 className="text-2xl font-bold text-slate-900 mb-8 text-center flex items-center justify-center gap-2">
          <UserCircleIcon className="w-8 h-8 text-slate-700" />
        {message?'Kindly Check Your Mail'  :'Enter your email'}
        </h1>

        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-700 text-center rounded-xl border-2 border-red-100">
            {error}
          </div>
        )}

            {message && (
          <div className="mb-6 p-3 bg-slate-100 text-slate-800 text-center rounded-xl border-2 border-slate-200">
            {message}
          </div>
        )}

            {!message?
        <form onSubmit={handleSubmit} className="space-y-6">
          {[
            {
              label: "Email",
              name: "email",
              type: "email",
              Icon: EnvelopeIcon,
            },
          ].map(({ label, name, type, Icon }) => (
            <div key={name}>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1">
                <Icon className="w-4 h-4" />
                {label}
              </label>
              <input
                type={type}
                name={name}
                value={form[name as keyof FormState]}
                onChange={handleChange}
                required
                className={`w-full p-3 rounded-xl border-2 ${
                  error?.toLowerCase().includes(name)
                    ? "border-red-300"
                    : "border-slate-100"
                } focus:border-slate-500 focus:ring-2 focus:ring-slate-200 transition-all`}
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-800 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <ArrowPathIcon className="w-5 h-5 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit"
            )}
          </button>
:   </form>:
            <button

             onClick={()=>router.push('/login')}
            className="w-full py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-800 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
        
                <ArrowPathIcon className="w-5 h-5 " />
                Log in
      
          </button>
}
      
      </div>
    </div>
  );
}