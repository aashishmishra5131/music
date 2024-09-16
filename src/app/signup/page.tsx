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

type SignupForm = z.infer<typeof signUpSchema>;

export default function SignupFormDemo() {
  const [form, setForm] = useState<SignupForm>({
    username: "",
    email: "",
    password: "",
  });
  const [username, setUsername] = useState("");
  const [usernameMessage, setUsernameMessage] = useState("");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const debounced = useDebounceCallback(setUsername, 700);
  const router = useRouter();

  useEffect(() => {
    const checkUsernameUnique = async () => {
      if (username) {
        console.log(username);
        setIsCheckingUsername(true);
        setUsernameMessage(""); // Reset message

        try {
          const response = await axios.get<ApiResponse>(
            `/api/check-username-unique?username=${username}`
          );
          //console.log(response.data.message)
          const message = response.data.message;
          setUsernameMessage(message);
        } catch (error) {
          const axiosError = error as AxiosError<ApiResponse>;
          setUsernameMessage(
            axiosError.response?.data.message ?? "Error checking username"
          );
        } finally {
          setIsCheckingUsername(false);
        }
      }
    };

    checkUsernameUnique();
  }, [username]);

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [id]: value,
    }));
    debounced(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await axios.post("/api/sign-up", form);
      console.log(response.data.message);
      router.replace(`/verify/${form.username}`);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      console.log("Error in signup of user", axiosError.response?.data.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-black mt-11">
      <h2 className="font-bold text-3xl text-neutral-800 dark:text-neutral-200 mt-14 text-center">
        Welcome to MusicNext
      </h2>

      <form className="my-4" onSubmit={handleSubmit}>
        <LabelInputContainer className="mb-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            placeholder="Tyler"
            type="text"
            value={form.username}
            onChange={handleOnChange}
          />
          <p
            className={`text-sm ${
              usernameMessage === "Username is unique"
                ? "text-green-500"
                : "text-red-500"
            }`}
          >
            {isCheckingUsername ? "Checking..." : usernameMessage}
          </p>
        </LabelInputContainer>
        <LabelInputContainer className="mb-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={handleOnChange}
          />
        </LabelInputContainer>
        <LabelInputContainer className="mb-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={handleOnChange}
          />
        </LabelInputContainer>

        <button
          className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Sign up →"}
          <BottomGradient />
        </button>
        <p className="text-center mt-3">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-700">
            Login
          </Link>
        </p>
      </form>
      <div className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-8 h-[1px] w-full" />
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
