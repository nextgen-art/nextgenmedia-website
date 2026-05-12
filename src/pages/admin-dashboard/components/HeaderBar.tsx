import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { Profile } from "@/lib/auth-context";

interface HeaderBarProps {
  profile: Profile | null;
  onSignOut: () => void;
}

export const HeaderBar = ({ profile, onSignOut }: HeaderBarProps) => (
  <header className="border-b border-primary/30 bg-card/80 backdrop-blur-sm sticky top-0 z-40">
    <div className="container mx-auto px-6 py-3 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <img
          src="/nextgen-logo.png"
          alt="NextGen Media"
          className="h-10 w-auto object-contain"
        />
        <div className="h-6 w-px bg-primary/30" />
        <div>
          <p className="text-xs text-primary font-semibold uppercase tracking-widest">
            Operations
          </p>
          <p className="text-xs text-muted-foreground">
            {profile?.full_name || profile?.email}
          </p>
        </div>
      </div>
      <Button
        variant="outline"
        onClick={onSignOut}
        className="rounded-full border-primary/40 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
        size="sm"
      >
        <LogOut className="mr-2 h-3.5 w-3.5" />
        Sign Out
      </Button>
    </div>
  </header>
);
