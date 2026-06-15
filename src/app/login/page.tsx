"use client";

import React, { useState, useEffect } from "react";
import { Label } from "@radix-ui/react-label";
import { Input } from "@/components/ui/input";
import { cn } from "@/utils/cn";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { z } from "zod";
import { signInSchema } from "@/schemas/signinSchema";
import { BackgroundBeams } from "@/components/ui/background-beams";
import {
  IconBrandGithub,
  IconBrandGoogle,
  IconLoader2,
} from "@tabler/icons-react";

type SigninForm = z.infer<typeof signInSchema>;

export default function LoginFormDemo() {
  const router = useRouter();
  const [form, setForm] = useState<SigninForm>({ identifier: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [oauthStatus, setOauthStatus] = useState({ github: false, google: false });
  const [oauthLoading, setOauthLoading] = useState<"github" | "google" | null>(null);

  useEffect(() => {
    fetch("/api/auth/providers-status")
      .then((r) => r.json())
      .then(setOauthStatus)
      .catch(() => {});
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const result = await signIn("credentials", {
      redirect: false,
      identifier: form.identifier,
      password: form.password,
    });
    if (result?.error) {
      setError(result.error);
    } else if (result?.ok) {
      localStorage.setItem("identifier", form.identifier);
      router.push("/");
    }
  };

  const handleOAuth = async (provider: "github" | "google") => {
    if (!oauthStatus[provider]) {
      setError(`${provider === "github" ? "GitHub" : "Google"} login is not configured yet. Please add API keys in .env`);
      return;
    }
    setOauthLoading(provider);
    await signIn(provider, { callbackUrl: "/" });
    setOauthLoading(null);
  };

  return (
    <div className="min-h-screen w-full bg-neutral-950 flex items-center justify-center relative antialiased">
      <BackgroundBeams className="absolute inset-0 z-0" />
      <div className="max-w-md w-full mx-auto rounded-2xl p-6 md:p-8 shadow-2xl bg-black/60 backdrop-blur-md border border-neutral-800 relative z-10 my-12">
        <h2 className="font-bold text-3xl text-neutral-200 mt-4 text-center">
          Login to MusicNext
        </h2>
        <form className="my-6" onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
              {error}
            </div>
          )}
          <LabelInputContainer className="mb-3">
            <Label htmlFor="identifier" className="text-neutral-300">Email or Username</Label>
            <Input id="identifier" type="text" placeholder="projectmayhem@fc.com"
              value={form.identifier} onChange={handleChange} required />
          </LabelInputContainer>
          <LabelInputContainer className="mb-3">
            <Label htmlFor="password" className="text-neutral-300">Password</Label>
            <Input id="password" type="password" placeholder="••••••••"
              value={form.password} onChange={handleChange} required />
          </LabelInputContainer>

          <button type="submit"
            className="bg-gradient-to-br relative group/btn from-zinc-900 to-neutral-600 w-full text-white rounded-md h-10 font-medium mt-4 hover:opacity-90 transition-all">
            Login &rarr;
            <BottomGradient />
          </button>
          <p className="text-center mt-3 text-neutral-400 text-sm">
            New user?{" "}
            <Link href="/signup" className="text-purple-400 hover:text-purple-300 transition-colors">Sign up</Link>
          </p>
        </form>

        <div className="bg-gradient-to-r from-transparent via-neutral-700 to-transparent my-4 h-[1px] w-full" />
        <p className="text-center text-neutral-500 text-xs mb-4">or continue with</p>

        <div className="flex flex-col space-y-3">
          {/* GitHub */}
          <button type="button" onClick={() => handleOAuth("github")}
            disabled={!!oauthLoading}
            className={`relative group/btn flex items-center justify-center gap-2 px-4 w-full rounded-md h-10 font-medium transition-all
              ${oauthStatus.github
                ? "bg-zinc-900 border border-neutral-700 text-neutral-300 hover:border-neutral-500 hover:text-white"
                : "bg-zinc-900/40 border border-neutral-800 text-neutral-600 cursor-not-allowed"}`}>
            {oauthLoading === "github"
              ? <IconLoader2 className="h-4 w-4 animate-spin" />
              : <IconBrandGithub className="h-4 w-4" />}
            <span className="text-sm">
              {oauthStatus.github ? "Login with GitHub" : "GitHub (not configured)"}
            </span>
            {oauthStatus.github && <BottomGradient />}
          </button>

          {/* Google */}
          <button type="button" onClick={() => handleOAuth("google")}
            disabled={!!oauthLoading}
            className={`relative group/btn flex items-center justify-center gap-2 px-4 w-full rounded-md h-10 font-medium transition-all
              ${oauthStatus.google
                ? "bg-zinc-900 border border-neutral-700 text-neutral-300 hover:border-neutral-500 hover:text-white"
                : "bg-zinc-900/40 border border-neutral-800 text-neutral-600 cursor-not-allowed"}`}>
            {oauthLoading === "google"
              ? <IconLoader2 className="h-4 w-4 animate-spin" />
              : <IconBrandGoogle className="h-4 w-4" />}
            <span className="text-sm">
              {oauthStatus.google ? "Login with Google" : "Google (not configured)"}
            </span>
            {oauthStatus.google && <BottomGradient />}
          </button>

          {(!oauthStatus.github || !oauthStatus.google) && (
            <p className="text-neutral-600 text-[11px] text-center mt-1">
              Add OAuth keys in <span className="font-mono text-neutral-500">.env</span> to enable social login
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
      <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  );
};
