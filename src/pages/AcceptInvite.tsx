import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react";

interface Invitation {
  id: string;
  invite_token: string;
  client_email: string;
  expires_at: string;
  status: string;
  clients: {
    id: string;
    client_id: string;
    client_name: string;
    business_name: string;
    company_name: string;
  };
}

export default function AcceptInvite() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    validateInvitation();
  }, [token]);

  async function validateInvitation() {
    try {
      const { data, error } = await supabase
        .from("client_invitations")
        .select(`
          *,
          clients (
            id,
            client_id,
            client_name,
            business_name,
            company_name
          )
        `)
        .eq("invite_token", token)
        .eq("status", "pending")
        .single();

      if (error || !data) {
        toast.error("Invalid invitation link");
        setTimeout(() => navigate("/"), 2000);
        return;
      }

      // Check if expired
      const expiresAt = new Date(data.expires_at);
      if (expiresAt < new Date()) {
        toast.error("This invitation has expired. Please contact support for a new one.");
        
        // Update status to expired
        await supabase
          .from("client_invitations")
          .update({ status: "expired" })
          .eq("id", data.id);
        
        setTimeout(() => navigate("/"), 2000);
        return;
      }

      setInvitation(data);
    } catch (error: any) {
      console.error("Error validating invitation:", error);
      toast.error("Something went wrong");
      setTimeout(() => navigate("/"), 2000);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateAccount(e: React.FormEvent) {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    
    if (!invitation) return;
    
    setCreating(true);

    const invitationClientName = invitation.clients?.client_name;
    const invitationClientId = invitation.clients?.client_id || invitation.client_id;
    const invitationClientRecordId = invitation.clients?.id || invitation.client_id;
    
    // Clean email: remove whitespace and normalize
    const inviteEmail = invitation.client_email
      .replace(/\s+/g, '')
      .trim()
      .toLowerCase();

    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: inviteEmail,
        password: password,
        options: {
          data: {
            full_name: invitationClientName || inviteEmail,
            client_id: invitationClientId,
          },
        },
      });

      if (authError) {
        console.error("Signup error:", authError);
        toast.error(authError.message || "Failed to create account");
        setCreating(false);
        return;
      }

      if (!authData.user) {
        toast.error("Failed to create user");
        setCreating(false);
        return;
      }

      // Check if we have a session (user is automatically signed in if email confirmation is disabled)
      // If no session, sign in with the password we just created
      let session = authData.session;
      if (!session) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: inviteEmail,
          password: password,
        });
        
        if (signInError) {
          console.error("Auto sign-in error:", signInError);
          toast.error("Account created but failed to sign in. Please sign in manually.");
          setCreating(false);
          return;
        }
        
        session = signInData.session;
      }

      // 2. Update profile with role = 'client'
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          role: "client",
          full_name: invitationClientName || invitation.client_email,
        })
        .eq("id", authData.user.id);

      if (profileError) {
        console.error("Profile update error:", profileError);
        toast.error("Failed to update profile");
        setCreating(false);
        return;
      }

      // 3 & 4. Link auth user to client record AND mark invitation as accepted
      // Use database function that bypasses RLS to ensure success
      const { data: linkResult, error: linkError } = await supabase.rpc(
        'link_client_on_signup',
        {
          p_client_email: inviteEmail,
          p_auth_user_id: authData.user.id,
          p_invitation_id: invitation.id
        }
      );

      if (linkError) {
        console.error("Link function error:", linkError);
        toast.error("Failed to link account. Please contact support.");
        setCreating(false);
        return;
      }

      if (linkResult && !linkResult.success) {
        console.error("Link function failed:", linkResult.error);
        toast.error("Failed to link account. Please contact support.");
        setCreating(false);
        return;
      }

      // Ensure we have a valid session before redirecting
      if (!session) {
        console.error("No session after signup/signin");
        toast.error("Account created but session failed. Please sign in manually.");
        navigate("/login");
        setCreating(false);
        return;
      }

      toast.success("Account created successfully! Redirecting...");
      
      // Wait for auth state to propagate, then redirect
      setTimeout(() => {
        // Use window.location.href to force full page reload and auth state refresh
        window.location.href = "/client-dashboard";
      }, 1000);

    } catch (error: any) {
      console.error("Error creating account:", error);
      toast.error(error.message || "Failed to create account");
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!invitation) {
    return null;
  }

  const fullName =
    invitation.clients?.client_name ||
    invitation.clients?.business_name ||
    invitation.clients?.company_name ||
    invitation.client_email;
  const displayName = fullName?.split(" ")[0] || invitation.client_email;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
              <CheckCircle2 className="h-6 w-6 text-success" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Welcome to NextGen Media!
          </CardTitle>
          <CardDescription className="text-center">
            Hi {displayName}, create your password to access your client hub
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateAccount} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={invitation.client_email}
                disabled
                className="bg-muted"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Choose a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
              />
              <p className="text-xs text-muted-foreground">
                Minimum 8 characters
              </p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full rounded-full"
              disabled={creating}
            >
              {creating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create My Account"
              )}
            </Button>
          </form>

          <p className="text-xs text-center text-muted-foreground mt-4">
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
