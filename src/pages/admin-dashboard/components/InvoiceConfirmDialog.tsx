import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import { PendingDocument } from "../types";

interface InvoiceConfirmDialogProps {
  open: boolean;
  documentToInvoice: PendingDocument | null;
  sendingInvoice: Map<string, boolean>;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export const InvoiceConfirmDialog = ({
  open,
  documentToInvoice,
  sendingInvoice,
  onOpenChange,
  onConfirm,
}: InvoiceConfirmDialogProps) => (
  <AlertDialog open={open} onOpenChange={onOpenChange}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Send Invoice?</AlertDialogTitle>
        <AlertDialogDescription>
          This will create a Stripe invoice and email it to{" "}
          <span className="font-semibold">
            {documentToInvoice?.clients?.client_name || documentToInvoice?.clients?.client_email}
          </span>
          . Continue?
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel disabled={sendingInvoice.get(documentToInvoice?.id || "") || false}>
          Cancel
        </AlertDialogCancel>
        <AlertDialogAction
          onClick={onConfirm}
          disabled={sendingInvoice.get(documentToInvoice?.id || "") || false}
          className="bg-green-600 hover:bg-green-700"
        >
          {sendingInvoice.get(documentToInvoice?.id || "") ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            "Send Invoice"
          )}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

