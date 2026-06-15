"use client";
import React, { useEffect, useState } from "react";
import { useDebounceCallback } from "usehooks-ts";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import { z } from "zod";
import { signUpSchema } from "@/schemas/signupSchema";
import { Label } from "@radix-ui/react-label";
import { Input } from "@/components/ui/input";
import { cn } from "@/utils/cn";
import Link from "next/link";
import { ApiResponse } from "@/types/ApiResponse";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { signIn } from "next-auth/react";
import {
  IconBrandGithub,
  IconBrandGoogle,
  IconLoader2,
} from "@tabler/icons-react";

type SignupForm = z.infer<typeof signUpSchema>;

export default function SignupFormDemo() {
  const [form, setForm] = useState<SignupForm>({ username: "", email: "", password: "" });
  const [username, setUsername] = useState("");
  const [usernameMessage, setUsernameMessage] = useState("");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [oauthStatus, setOauthStatus] = useState({ github: false, google: false });
  const [oauthLoading, setOauthLoading] = useState<"github" | "google" | null>(null);

  const debounced = useDebounceCallback(setUsername, 700);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/providers-status")
      .then((r) => r.json())
      .then(setOauthStatus)
      .catch(() => {});
  }, []);

  useEffect(() => {
    const checkUsernameUnique = async () => {
      if (username) {
        setIsCheckingUsername(true);
        setUsernameMessage("");
        try {
          const response = await axios.get<ApiResponse>(
            `/api/check-username-unique?username=${username}`
          );
          setUsernameMessage(response.data.message);
        } catch (error) {
          const axiosError = error as AxiosError<ApiResponse>;
          setUsernameMessage(axiosError.response?.data.message ?? "Error checking username");
        } finally {
          setIsCheckingUsername(false);
        }
      }
    };
    checkUsernameUnique();
  }, [username]);

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
    if (id === "username") debounced(value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await axios.post("/api/sign-up", form);
      router.replace(`/verify/${form.username}`);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      setError(axiosError.response?.data.message ?? "Signup failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOAuth = async (provider: "github" | "google") => {
    if (!oauthStatus[provider]) {
      setError(
        `${provider === "github" ? "GitHub" : "Google"} login is not configured yet. Add API keys in .env`
      );
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
          Welcome to MusicNext
        </h2>

        <form className="my-6" onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
              {error}
            </div>
          )}
          <LabelInputContainer className="mb-3">
            <Label htmlFor="username" className="text-neutral-300">Username</Label>
            <Input
              id="username"
              placeholder="Tyler"
              type="text"
              value={form.username}
              onChange={handleOnChange}
            />
            <p
              className={`text-xs mt-1 ${
                usernameMessage === "Username is unique" ? "text-green-500" : "text-red-400"
              }`}
            >
              {isCheckingUsername ? "Checking..." : usernameMessage}
            </p>
          </LabelInputContainer>
          <LabelInputContainer className="mb-3">
            <Label htmlFor="email" className="text-neutral-300">Email Address</Label>
            <Input
              id="email"
              placeholder="you@example.com"
              type="email"
              value={form.email}
              onChange={handleOnChange}
            />
          </LabelInputContainer>
          <LabelInputContainer className="mb-3">
            <Label htmlFor="password" className="text-neutral-300">Password</Label>
            <Input
              id="password"
              placeholder="••••••••"
              type="password"
              value={form.password}
              onChange={handleOnChange}
            />
          </LabelInputContainer>

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-gradient-to-br relative group/btn from-zinc-900 to-neutral-600 w-full text-white rounded-md h-10 font-medium mt-2 hover:opacity-90 transition-all disabled:opacity-50"
          >
            {isSubmitting ? "Creating account..." : "Sign up \u2192"}
            <BottomGradient />
          </button>
          <p className="text-center mt-3 text-neutral-400 text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-purple-400 hover:text-purple-300 transition-colors">
              Login
            </Link>
          </p>
        </form>

        <div className="bg-gradient-to-r from-transparent via-neutral-700 to-transparent my-4 h-[1px] w-full" />
        <p className="text-center text-neutral-500 text-xs mb-4">or sign up with</p>

        <div className="flex flex-col space-y-3">
          <button
            type="button"
            onClick={() => handleOAuth("github")}
            disabled={!!oauthLoading}
            className={`relative group/btn flex items-center justify-center gap-2 px-4 w-full rounded-md h-10 font-medium transition-all ${
              oauthStatus.github
                ? "bg-zinc-900 border border-neutral-700 text-neutral-300 hover:border-neutral-500 hover:text-white"
                : "bg-zinc-900/40 border border-neutral-800 text-neutral-600 cursor-not-allowed"
            }`}
          >
            {oauthLoading === "github" ? (
              <IconLoader2 className="h-4 w-4 animate-spin" />
            ) : (
              <IconBrandGithub className="h-4 w-4" />
            )}
            <span className="text-sm">
              {oauthStatus.github ? "Continue with GitHub" : "GitHub (not configured)"}
            </span>
            {oauthStatus.github && <BottomGradient />}
          </button>

          <button
            type="button"
            onClick={() => handleOAuth("google")}
            disabled={!!oauthLoading}
            className={`relative group/btn flex items-center justify-center gap-2 px-4 w-full rounded-md h-10 font-medium transition-all ${
              oauthStatus.google
                ? "bg-zinc-900 border border-neutral-700 text-neutral-300 hover:border-neutral-500 hover:text-white"
                : "bg-zinc-900/40 border border-neutral-800 text-neutral-600 cursor-not-allowed"
            }`}
          >
            {oauthLoading === "google" ? (
              <IconLoader2 className="h-4 w-4 animate-spin" />
            ) : (
              <IconBrandGoogle className="h-4 w-4" />
            )}
            <span className="text-sm">
              {oauthStatus.google ? "Continue with Google" : "Google (not configured)"}
            </span>
            {oauthStatus.google && <BottomGradient />}
          </button>

          {(!oauthStatus.github || !oauthStatus.google) && (
            <p className="text-neutral-600 text-[11px] text-center mt-1">
              Add OAuth keys in{" "}
              <span className="font-mono text-neutral-500">.env</span> to enable social login
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

const BottomGradient = () => (
  <>
    <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
    <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
  </>
);

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
