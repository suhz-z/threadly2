
"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LoaderIcon } from "lucide-react";

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {

  // form state
  
  const [email, setEmail] = useState("");           // User's email input
  const [password, setPassword] = useState("");    // User's password input
  const [error, setError] = useState("");          // Error message to display
  const [isLoading, setIsLoading] = useState(false); // Loading state during login
  const router = useRouter();                      // For navigation after login


  // This function runs when user submits the email/password form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Try to sign in with email and password
    const res = await signIn("credentials", {
      redirect: false,  // Don't redirect automatically
      email,
      password,
    });

    if (res?.error) {
    
      setError("Invalid email or password");
      setIsLoading(false);
    } else {
    
      router.replace("/feed");
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Field>
              <Field>
                <Button type="submit" disabled={isLoading} className="cursor-pointer">
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
               
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => signIn("google", { callbackUrl: "/feed" })}
                  disabled={isLoading}
                  className="cursor-pointer"
                >
                  {isLoading ? <LoaderIcon className="animate-spin" /> : "Login with Google" }
                </Button>
                {error && <p className="text-red-500 text-center mt-1">{error}</p>}
                <FieldDescription className="text-center mt-2">
                  Don&apos;t have an account? <a href="/signup">Sign up</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
