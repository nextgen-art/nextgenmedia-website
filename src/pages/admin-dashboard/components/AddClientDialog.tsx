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

interface AddClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  addClientForm: Partial<Client>;
  onChange: (data: Partial<Client>) => void;
  onSave: () => void;
  saving: boolean;
}

export const AddClientDialog = ({
  open,
  addClientForm,
  saving,
  onOpenChange,
  onChange,
  onSave,
}: AddClientDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Add New Client</DialogTitle>
        <DialogDescription>
          Create a new client record manually. Name and email are required.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="add_client_name">
            Client Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="add_client_name"
            placeholder="Full name"
            value={addClientForm.client_name || ""}
            onChange={(e) =>
              onChange({ ...addClientForm, client_name: e.target.value })
            }
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="add_client_email">
            Email <span className="text-red-500">*</span>
          </Label>
          <Input
            id="add_client_email"
            type="email"
            placeholder="client@example.com"
            value={addClientForm.client_email || ""}
            onChange={(e) =>
              onChange({ ...addClientForm, client_email: e.target.value })
            }
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="add_business_name">Business Name</Label>
          <Input
            id="add_business_name"
            placeholder="Company or business name"
            value={addClientForm.business_name || ""}
            onChange={(e) =>
              onChange({ ...addClientForm, business_name: e.target.value })
            }
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="add_phone_number">Phone Number</Label>
          <Input
            id="add_phone_number"
            placeholder="(555) 123-4567"
            value={addClientForm.phone_number || ""}
            onChange={(e) =>
              onChange({ ...addClientForm, phone_number: e.target.value })
            }
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="add_package_name">Package</Label>
          <Input
            id="add_package_name"
            placeholder="e.g. Starter, Growth, Premium"
            value={addClientForm.package_name || ""}
            onChange={(e) =>
              onChange({ ...addClientForm, package_name: e.target.value })
            }
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="add_budget">Budget</Label>
          <Input
            id="add_budget"
            placeholder="e.g. $1,500/mo"
            value={addClientForm.budget || ""}
            onChange={(e) =>
              onChange({ ...addClientForm, budget: e.target.value })
            }
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="add_notes">Notes</Label>
          <Textarea
            id="add_notes"
            placeholder="Any relevant notes about this client..."
            value={addClientForm.notes || ""}
            onChange={(e) =>
              onChange({ ...addClientForm, notes: e.target.value })
            }
            rows={3}
          />
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
              Adding...
            </>
          ) : (
            "Add Client"
          )}
        </Button>
      </div>
    </DialogContent>
  </Dialog>
);
