"use client";

import { Card, CardContent, CardTitle } from "@/components/ui/card";

export function WelcomeMessage() {
  return (
    <Card className="w-full max-w-md mx-auto p-4">
      <CardTitle>Welcome to Threadly</CardTitle>
      <CardContent>
        <p>Start some conversations! Login or signup to join the fun.</p>
      </CardContent>
    </Card>
  );
}
