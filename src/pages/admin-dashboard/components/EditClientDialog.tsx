import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Client } from "../types";

interface EditClientDialogProps {
  open: boolean;
  clientToEdit: Client | null;
  editForm: Partial<Client>;
  saving: boolean;
  onOpenChange: (open: boolean) => void;
  onChange: (data: Partial<Client>) => void;
  onSave: () => void;
}

export const EditClientDialog = ({
  open,
  clientToEdit,
  editForm,
  saving,
  onOpenChange,
  onChange,
  onSave,
}: EditClientDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Edit Client</DialogTitle>
        <DialogDescription>
          Update client information for {clientToEdit?.client_id}
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="client_name">Client Name</Label>
          <Input
            id="client_name"
            value={editForm.client_name || ""}
            onChange={(e) =>
              onChange({ ...editForm, client_name: e.target.value })
            }
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="client_email">Email</Label>
          <Input
            id="client_email"
            type="email"
            value={editForm.client_email || ""}
            onChange={(e) =>
              onChange({ ...editForm, client_email: e.target.value })
            }
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="business_name">Business Name</Label>
          <Input
            id="business_name"
            value={editForm.business_name || ""}
            onChange={(e) =>
              onChange({ ...editForm, business_name: e.target.value })
            }
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="phone_number">Phone Number</Label>
          <Input
            id="phone_number"
            value={editForm.phone_number || ""}
            onChange={(e) =>
              onChange({ ...editForm, phone_number: e.target.value })
            }
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="status">Status</Label>
          <Input
            id="status"
            value={editForm.status || ""}
            onChange={(e) =>
              onChange({ ...editForm, status: e.target.value })
            }
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="package_name">Package</Label>
          <Input
            id="package_name"
            value={editForm.package_name || ""}
            onChange={(e) =>
              onChange({ ...editForm, package_name: e.target.value })
            }
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="budget">Budget</Label>
          <Input
            id="budget"
            value={editForm.budget || ""}
            onChange={(e) =>
              onChange({ ...editForm, budget: e.target.value })
            }
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="meeting_notes">Meeting Notes</Label>
          <Textarea
            id="meeting_notes"
            value={editForm.meeting_notes || ""}
            onChange={(e) =>
              onChange({ ...editForm, meeting_notes: e.target.value })
            }
            rows={4}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="notes">Admin Notes</Label>
          <Textarea
            id="notes"
            value={editForm.notes || ""}
            onChange={(e) =>
              onChange({ ...editForm, notes: e.target.value })
            }
            rows={3}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="dropbox_link">Dropbox Link</Label>
          <Input
            id="dropbox_link"
            type="url"
            value={editForm.dropbox_link || ""}
            placeholder="https://www.dropbox.com/s/..."
            onChange={(e) =>
              onChange({ ...editForm, dropbox_link: e.target.value })
            }
          />
          <p className="text-xs text-muted-foreground">
            Paste the shared Dropbox folder URL clients should use for assets.
          </p>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="rela_link">Content Calendar URL</Label>
          <Input
            id="rela_link"
            type="url"
            value={editForm.rela_link || ""}
            placeholder="https://calendar.google.com/calendar/embed?src=..."
            onChange={(e) =>
              onChange({ ...editForm, rela_link: e.target.value })
            }
          />
          <p className="text-xs text-muted-foreground">
            Paste any embeddable calendar URL (Google Calendar, Notion, RELLA, etc.)
          </p>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="strategy_call_link">Strategy Call Link</Label>
          <Input
            id="strategy_call_link"
            type="url"
            value={editForm.strategy_call_link || ""}
            placeholder="https://calendly.com/..."
            onChange={(e) =>
              onChange({ ...editForm, strategy_call_link: e.target.value })
            }
          />
          <p className="text-xs text-muted-foreground">
            Link for the client to schedule or join their strategy call.
          </p>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="filming_date_link">Filming Date Link</Label>
          <Input
            id="filming_date_link"
            type="url"
            value={editForm.filming_date_link || ""}
            placeholder="https://calendly.com/..."
            onChange={(e) =>
              onChange({ ...editForm, filming_date_link: e.target.value })
            }
          />
          <p className="text-xs text-muted-foreground">
            Link for the client to view or schedule their filming session.
          </p>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button onClick={onSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </DialogContent>
  </Dialog>
);

