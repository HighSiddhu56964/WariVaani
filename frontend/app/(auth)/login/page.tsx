"use client";

import React, { Suspense, useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../../hooks/useAuth";
import { UserRole } from "../../../types";
import { motion } from "framer-motion";
import { User, ShieldCheck, LogIn, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "../../../components/ui/button";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, role: currentRole, isLoading } = useAuth();
  
  const [role, setRole] = useState<UserRole>("WARKARI");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  // Determine initial role from URL query param
  useEffect(() => {
    const roleParam = searchParams.get("role")?.toUpperCase();
    if ((roleParam === "WARKARI" || roleParam === "AUTHORITY") && role !== roleParam) {
      setRole(roleParam as UserRole);
    }
  }, [searchParams, role]);

  // If already logged in, redirect
  useEffect(() => {
    if (currentRole === "WARKARI") {
      router.push("/app");
    } else if (currentRole === "AUTHORITY") {
      router.push("/authority");
    }
  }, [currentRole, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const defaultName = role === "WARKARI" 
        ? (name.trim() || "विठ्ठल भक्त (Pilgrim)") 
        : (name.trim() || "Control Room Operator");
        
      await login(role, defaultName);
      
      if (role === "WARKARI") {
        router.push("/app");
      } else {
        router.push("/authority");
      }
    } catch (err) {
      setError("लॉगिन करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.");
      console.error(err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md bg-white dark:bg-zinc-900 border border-orange-100 dark:border-zinc-800 shadow-2xl rounded-3xl overflow-hidden p-8"
    >
      {/* Back to landing */}
      <Link href="/" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-primary mb-6 transition-colors group">
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        <span>मुख्यपृष्ठावर जा (Back to Home)</span>
      </Link>

      <div className="flex flex-col items-center mb-8">
        <Image
          src="/logo.png"
          alt="WariVaani Logo"
          width={64}
          height={56}
          className="rounded-xl shadow-sm mb-4"
        />
        <h2 className="text-2xl font-extrabold text-secondary dark:text-white">
          WariVaani लॉगिन (Login)
        </h2>
        <p className="text-xs text-muted-foreground text-center mt-1">
          Select your role to access the Wari assistance platform
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Role Selector Buttons */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
            भूमिका निवडा / Select Role
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setRole("WARKARI")}
              className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2 ${
                role === "WARKARI"
                  ? "border-primary bg-orange-50/50 dark:bg-orange-950/20 text-primary"
                  : "border-border hover:border-muted-foreground/30 text-muted-foreground bg-transparent"
              }`}
            >
              <User className="h-6 w-6" />
              <span className="font-bold text-xs">वारकरी (Warkari)</span>
            </button>
            <button
              type="button"
              onClick={() => setRole("AUTHORITY")}
              className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2 ${
                role === "AUTHORITY"
                  ? "border-secondary dark:border-blue-500 bg-blue-50/30 dark:bg-blue-950/20 text-secondary dark:text-blue-400"
                  : "border-border hover:border-muted-foreground/30 text-muted-foreground bg-transparent"
              }`}
            >
              <ShieldCheck className="h-6 w-6" />
              <span className="font-bold text-xs">प्रशासक (Authority)</span>
            </button>
          </div>
        </div>

        {/* Username input */}
        <div className="space-y-2">
          <label htmlFor="name" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
            नाव / Name (Optional)
          </label>
          <input
            id="name"
            type="text"
            placeholder={role === "WARKARI" ? "विठ्ठल भक्त (e.g. Ramesh Dev)" : "Operator ID (e.g. Officer Joshi)"}
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
            className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm transition-all"
          />
        </div>

        {error && (
          <p className="text-xs font-bold text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/30 p-3 rounded-lg border border-red-100 dark:border-red-900/30">
            {error}
          </p>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          className={`w-full py-4 text-sm font-extrabold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 ${
            role === "WARKARI"
              ? "bg-primary hover:bg-primary/95 text-white active:scale-95"
              : "bg-secondary dark:bg-blue-600 hover:bg-secondary/95 dark:hover:bg-blue-500 text-white active:scale-95"
          }`}
        >
          {isLoading ? (
            <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : (
            <>
              <LogIn className="h-4 w-4" />
              <span>लॉगिन करा / Proceed to Dashboard</span>
            </>
          )}
        </Button>
      </form>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="p-8 bg-white dark:bg-zinc-900 border border-orange-100 dark:border-zinc-800 shadow-2xl rounded-3xl w-full max-w-md flex flex-col items-center justify-center gap-4">
        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-muted-foreground font-semibold">लॉगिन फॉर्म लोड होत आहे...</p>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
