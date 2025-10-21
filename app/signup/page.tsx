// User registration page
// Renders the signup form component in a centered layout

"use client";

import { SignupForm } from "@/components/signup-form";

// Page component for user signup
export default function SignupPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10  dark:bg-neutral-900 text-neutral-900" >
      <div className="w-full max-w-sm">
        <SignupForm />
      </div>
    </div>
  );
}
