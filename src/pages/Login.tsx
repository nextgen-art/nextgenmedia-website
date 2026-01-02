import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, profile, isAdmin, isClient } = useAuth();
  const navigate = useNavigate();

  const handleTogglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  useEffect(() => {
    if (profile) {
      if (isAdmin) {
        navigate("/admin", { replace: true });
      } else if (isClient) {
        navigate("/client-dashboard", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    }
  }, [profile, isAdmin, isClient, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn(email, password);
      toast.success("Signed in successfully!");
      
      // Wait for profile to load, then redirect based on role
      // The useEffect will handle the redirect once profile is loaded
      // But we also check here as a fallback
      const checkAndRedirect = () => {
        if (profile) {
          if (isAdmin) {
            navigate("/admin", { replace: true });
          } else if (isClient) {
            navigate("/client-dashboard", { replace: true });
          } else {
            // Default to client dashboard
            navigate("/client-dashboard", { replace: true });
          }
        } else {
          // If profile not loaded yet, wait a bit more
          setTimeout(checkAndRedirect, 200);
        }
      };
      
      setTimeout(checkAndRedirect, 300);
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Failed to log in");
      setLoading(false);
    }
  };

  return (
    <div className="landing-theme min-h-screen bg-gradient-to-b from-background via-background to-muted text-foreground">
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md space-y-6">
          <Link
            to="/"
            aria-label="Return to NextGen Media home"
            className="mx-auto flex h-24 w-32 items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <img src="/angellogo2.jpg" alt="NextGen Media logo" className="h-full w-auto object-contain" />
          </Link>

          <Card className="w-full border border-border/70 bg-card/90 shadow-2xl shadow-primary/20 backdrop-blur">
            <CardHeader className="space-y-3 text-center">
              <CardTitle className="text-3xl font-semibold tracking-tight">Sign In</CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                Enter your credentials to access your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-foreground">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-secondary/60 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary focus-visible:ring-offset-background"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-foreground">
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="bg-secondary/60 pr-12 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary focus-visible:ring-offset-background"
                    />
                    <button
                      type="button"
                      onClick={handleTogglePasswordVisibility}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      aria-pressed={showPassword}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Eye className="h-4 w-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary/90"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

