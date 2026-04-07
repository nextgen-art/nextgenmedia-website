import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Copy, Link2, Loader2, RefreshCw } from "lucide-react";
import { Client } from "../types";
import { formatDate } from "../utils";

interface InviteLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client | null;
  inviteUrl: string | null;
  existingInviteExpiry: string | null;
  generating: boolean;
  onGenerate: () => void;
  onRegenerate: () => void;
  onCopy: (text: string, label: string) => void;
}

export const InviteLinkDialog = ({
  open,
  client,
  inviteUrl,
  existingInviteExpiry,
  generating,
  onOpenChange,
  onGenerate,
  onRegenerate,
  onCopy,
}: InviteLinkDialogProps) => {
  if (!client) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {inviteUrl ? "Invite Link Ready" : "Generate Invite Link"}
          </DialogTitle>
          <DialogDescription>
            {inviteUrl
              ? `Share this link with ${client.client_name || client.client_email} to set up their client portal account.`
              : `Create an invite link for ${client.client_name || client.client_email} (${client.client_email}) to access their client portal.`}
          </DialogDescription>
        </DialogHeader>

        {inviteUrl ? (
          <div className="space-y-4 py-4">
            <div className="flex gap-2">
              <Input
                readOnly
                value={inviteUrl}
                className="font-mono text-sm"
              />
              <Button
                size="icon"
                variant="outline"
                onClick={() => onCopy(inviteUrl, "Invite link")}
                title="Copy link"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            {existingInviteExpiry && (
              <p className="text-sm text-muted-foreground">
                Expires: {formatDate(existingInviteExpiry)}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={onRegenerate}
                disabled={generating}
              >
                {generating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Regenerate
              </Button>
              <Button onClick={() => onOpenChange(false)}>Done</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              The invite link will be valid for 7 days. The client will use it to
              create a password and access their portal.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={generating}
              >
                Cancel
              </Button>
              <Button onClick={onGenerate} disabled={generating}>
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Link2 className="mr-2 h-4 w-4" />
                    Generate Link
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
