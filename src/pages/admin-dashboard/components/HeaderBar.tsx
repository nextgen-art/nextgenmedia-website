import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { Profile } from "@/lib/auth-context";

interface HeaderBarProps {
  profile: Profile | null;
  onSignOut: () => void;
}

export const HeaderBar = ({ profile, onSignOut }: HeaderBarProps) => (
  <header className="border-b border-border bg-card">
    <div className="container mx-auto px-6 py-4 flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Welcome, {profile?.full_name || profile?.email}
        </p>
      </div>
      <Button variant="outline" onClick={onSignOut} className="rounded-full">
        <LogOut className="mr-2 h-4 w-4" />
        Sign Out
      </Button>
    </div>
  </header>
);

