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
import { Loader2, Upload } from "lucide-react";
import { Client } from "../types";

interface UploadDocumentDialogProps {
  open: boolean;
  selectedClientForUpload: Client | null;
  documentType: string;
  onChangeDocumentType: (value: string) => void;
  documentName: string;
  onChangeDocumentName: (value: string) => void;
  onDocumentNameDirty: (dirty: boolean) => void;
  documentDescription: string;
  onChangeDocumentDescription: (value: string) => void;
  uploadFile: File | null;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClearSelectedFile: () => void;
  fileError: string | null;
  uploading: boolean;
  onUpload: () => void;
  onOpenChange: (open: boolean) => void;
  acceptedFileTypes: string;
  allowedExtensionsLabel: string;
}

export const UploadDocumentDialog = ({
  open,
  selectedClientForUpload,
  documentType,
  onChangeDocumentType,
  documentName,
  onChangeDocumentName,
  onDocumentNameDirty,
  documentDescription,
  onChangeDocumentDescription,
  uploadFile,
  onFileChange,
  onClearSelectedFile,
  fileError,
  uploading,
  onUpload,
  onOpenChange,
  acceptedFileTypes,
  allowedExtensionsLabel,
}: UploadDocumentDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>Upload Document</DialogTitle>
        <DialogDescription>
          Upload a document for {selectedClientForUpload?.client_name}
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div>
          <Label htmlFor="document-type">Document Type</Label>
          <select
            id="document-type"
            value={documentType}
            onChange={(e) => onChangeDocumentType(e.target.value)}
            className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
          >
            <option value="proposal">Proposal</option>
            <option value="contract">Contract</option>
            <option value="contract_signed">Signed Contract</option>
            <option value="invoice">Invoice</option>
            <option value="meeting_recap">Meeting Recap</option>
            <option value="content_usage_guide">Content Usage Guide</option>
            <option value="monthly_outlook">Monthly Outlook</option>
            <option value="onboarding_form">Onboarding Form</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <Label htmlFor="document-file">File</Label>
          <div className="mt-2 space-y-2">
            <label
              htmlFor="document-file"
              className="relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/10 hover:bg-muted/20 transition-colors"
            >
              <Input
                id="document-file"
                type="file"
                accept={acceptedFileTypes}
                onChange={onFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center pt-5 pb-6 pointer-events-none">
                <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                <p className="mb-1 text-sm font-medium text-foreground">
                  {uploadFile ? uploadFile.name : "Click to upload file"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {uploadFile
                    ? `${(uploadFile.size / (1024 * 1024)).toFixed(2)} MB`
                    : "Must be less than 50MB"}
                </p>
              </div>
            </label>
            {uploadFile && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full text-destructive hover:text-destructive"
                onClick={onClearSelectedFile}
              >
                Clear file
              </Button>
            )}
            {fileError && <p className="text-sm text-destructive">{fileError}</p>}
          </div>
        </div>
        <div>
          <Label htmlFor="document-description">Description (Optional)</Label>
          <Textarea
            id="document-description"
            value={documentDescription}
            onChange={(e) => onChangeDocumentDescription(e.target.value)}
            placeholder="Add a description..."
            rows={3}
          />
        </div>
        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={uploading}
          >
            Cancel
          </Button>
          <Button
            onClick={onUpload}
            disabled={!uploadFile || Boolean(fileError) || uploading}
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              "Upload"
            )}
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);

