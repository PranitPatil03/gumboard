"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Mail } from "lucide-react";

export default function TestMagicLink() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>("");

  const handleTestMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setResult("");

    try {
      const response = await authClient.signIn.magicLink({
        email,
        callbackURL: "/dashboard",
      });

      if (response.data) {
        setResult("✅ Magic link sent successfully! Check your console for the URL.");
      } else if (response.error) {
        setResult(`❌ Error: ${response.error.message || "Unknown error"}`);
      }
    } catch (error) {
      setResult(`❌ Exception: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-slate-50 dark:from-zinc-950 dark:to-zinc-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Magic Link Test
          </CardTitle>
          <CardDescription>
            Test the magic link authentication flow. Check your console for the magic link URL.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleTestMagicLink} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="test@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !email}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                "Send Magic Link"
              )}
            </Button>
          </form>

          {result && (
            <div className="mt-4 p-3 rounded-md bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-300">{result}</p>
            </div>
          )}

          <div className="mt-4 p-3 rounded-md bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-800 dark:text-yellow-300">
              💡 <strong>Development Tip:</strong> The magic link URL will be logged in your console. 
              Copy and paste it in your browser to test the complete flow.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 