"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SignupForm } from "@/components/signup-form";

export default function SignupPage() {
 
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10  dark:bg-neutral-900 text-neutral-900" >
          <div className="w-full max-w-sm">
            <SignupForm />
          </div>
        </div>
  );
}
