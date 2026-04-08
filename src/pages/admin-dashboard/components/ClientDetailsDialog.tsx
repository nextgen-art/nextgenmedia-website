import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon, Copy, ExternalLink, Mail, Phone, Loader2 } from "lucide-react";
import { Client } from "../types";
import { formatDate, formatDateForInput } from "../utils";
import { format } from "date-fns";

interface ClientDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedClient: Client | null;
  clientDetailsForm: Partial<Client>;
  onFieldChange: (field: keyof Client, value: any) => void;
  onDateChange: (field: keyof Client, date: Date | undefined) => void;
  onCopy: (text: string, label: string) => void;
  onQuickAction: (action: "email" | "call" | "viewHub") => void;
  getStatusColor: (status: string) => string;
  hasClientChanges: boolean;
  onSaveClientDetails: () => void;
  savingClientDetails: boolean;
}

export const ClientDetailsDialog = ({
  open,
  onOpenChange,
  selectedClient,
  clientDetailsForm,
  onFieldChange,
  onDateChange,
  onCopy,
  onQuickAction,
  getStatusColor,
  hasClientChanges,
  onSaveClientDetails,
  savingClientDetails,
}: ClientDetailsDialogProps) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        {selectedClient && (
          <>
          <DialogHeader>
            <DialogTitle className="text-2xl">Client Details</DialogTitle>
            <DialogDescription>
              View and manage all information for {selectedClient.client_name || selectedClient.client_email}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-2xl font-bold text-primary">
                      {selectedClient.client_name?.[0]?.toUpperCase() || selectedClient.client_email[0]?.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold">{selectedClient.client_name || "No Name"}</h3>
                    <p className="text-lg text-muted-foreground">{selectedClient.business_name || selectedClient.company_name || "No Business Name"}</p>
                    <div className="mt-2">
                      {selectedClient.status && (
                        <Badge className={getStatusColor(selectedClient.status)}>
                          {selectedClient.status.replace(/_/g, " ").toUpperCase()}
                        </Badge>
                      )}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Email:</span>
                        <span className="font-medium">{selectedClient.client_email}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => onCopy(selectedClient.client_email, "Email")}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      {selectedClient.phone_number && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Phone:</span>
                          <span className="font-medium">{selectedClient.phone_number}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => onCopy(selectedClient.phone_number || "", "Phone")}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => onQuickAction("email")}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email
                  </Button>
                  {selectedClient.phone_number && (
                    <Button
                      variant="outline"
                      onClick={() => onQuickAction("call")}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Call
                    </Button>
                  )}
                  {selectedClient.auth_user_id && (
                    <Button
                      variant="outline"
                      onClick={() => onQuickAction("viewHub")}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Client Hub
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="client_id">Client ID</Label>
                  <Input
                    id="client_id"
                    value={selectedClient.client_id}
                    disabled
                    className="font-mono"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="package_name">Package</Label>
                  <Input
                    id="package_name"
                    value={clientDetailsForm.package_name || ""}
                    onChange={(e) => onFieldChange("package_name", e.target.value)}
                    placeholder="Enter package name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="budget">Budget</Label>
                  <Input
                    id="budget"
                    value={clientDetailsForm.budget || ""}
                    onChange={(e) => onFieldChange("budget", e.target.value)}
                    placeholder="Enter budget"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    value={clientDetailsForm.status || ""}
                    onChange={(e) => onFieldChange("status", e.target.value)}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                  >
                    <option value="new">New</option>
                    <option value="proposal_sent">Proposal Sent</option>
                    <option value="pending_approval">Pending Approval</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="contract_sent">Contract Sent</option>
                    <option value="contract_signed">Contract Signed</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                {clientDetailsForm.services_needed !== undefined && (
                  <div className="grid gap-2">
                    <Label htmlFor="services_needed">Services Needed</Label>
                    <Textarea
                      id="services_needed"
                      value={clientDetailsForm.services_needed || ""}
                      onChange={(e) => onFieldChange("services_needed", e.target.value)}
                      placeholder="Enter services needed"
                      rows={3}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "Proposal Sent", field: "proposal_sent_date" as const },
                  { label: "Proposal Approved", field: "proposal_approved_date" as const },
                  { label: "Contract Sent", field: "contract_sent_date" as const },
                  { label: "Contract Signed", field: "contract_signed_date" as const },
                  { label: "Onboarding Started", field: "onboarding_started_date" as const },
                ].map(({ label, field }) => (
                  <div className="grid gap-2" key={field}>
                    <Label>{label}</Label>
                    {(() => {
                      const selectedDate = formatDateForInput(clientDetailsForm[field] || null);
                      const displayText = selectedDate ? format(selectedDate, "PPP") : "Pick a date";
                      return (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !selectedDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {displayText}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={selectedDate}
                              onSelect={(date) => onDateChange(field, date || undefined)}
                              initialFocus
                            />
                            <div className="p-2 border-t">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full"
                                onClick={() => onDateChange(field, undefined)}
                              >
                                Clear Date
                              </Button>
                            </div>
                          </PopoverContent>
                        </Popover>
                      );
                    })()}
                  </div>
                ))}

                <div className="grid gap-2">
                  <Label>Created</Label>
                  <Input
                    value={formatDate(selectedClient.created_at) || ""}
                    disabled
                    className="text-muted-foreground"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resource Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label>Dropbox Link</Label>
                  <div className="flex gap-2">
                    <Input
                      value={clientDetailsForm.dropbox_link || ""}
                      onChange={(e) => onFieldChange("dropbox_link", e.target.value)}
                      placeholder="https://www.dropbox.com/s/..."
                    />
                    {clientDetailsForm.dropbox_link && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onCopy(clientDetailsForm.dropbox_link || "", "Dropbox link")}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(clientDetailsForm.dropbox_link || "", "_blank")}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Rela Link</Label>
                  <div className="flex gap-2">
                    <Input
                      value={clientDetailsForm.rela_link || ""}
                      onChange={(e) => onFieldChange("rela_link", e.target.value)}
                      placeholder="https://rela.com/..."
                    />
                    {clientDetailsForm.rela_link && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onCopy(clientDetailsForm.rela_link || "", "Rela link")}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(clientDetailsForm.rela_link || "", "_blank")}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Strategy Call Link</Label>
                  <div className="flex gap-2">
                    <Input
                      value={clientDetailsForm.strategy_call_link || ""}
                      onChange={(e) => onFieldChange("strategy_call_link", e.target.value)}
                      placeholder="https://calendly.com/..."
                    />
                    {clientDetailsForm.strategy_call_link && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onCopy(clientDetailsForm.strategy_call_link || "", "Strategy call link")}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(clientDetailsForm.strategy_call_link || "", "_blank")}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Filming Date Link</Label>
                  <div className="flex gap-2">
                    <Input
                      value={clientDetailsForm.filming_date_link || ""}
                      onChange={(e) => onFieldChange("filming_date_link", e.target.value)}
                      placeholder="https://calendly.com/..."
                    />
                    {clientDetailsForm.filming_date_link && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onCopy(clientDetailsForm.filming_date_link || "", "Filming date link")}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(clientDetailsForm.filming_date_link || "", "_blank")}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Meeting Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={clientDetailsForm.meeting_notes || ""}
                  onChange={(e) => onFieldChange("meeting_notes", e.target.value)}
                  placeholder="Enter meeting notes..."
                  rows={6}
                  className="resize-none"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Admin Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={clientDetailsForm.notes || ""}
                  onChange={(e) => onFieldChange("notes", e.target.value)}
                  placeholder="Enter admin notes..."
                  rows={4}
                  className="resize-none"
                />
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={savingClientDetails}
            >
              Cancel
            </Button>
            <Button
              onClick={onSaveClientDetails}
              disabled={!hasClientChanges || savingClientDetails}
            >
              {savingClientDetails ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </>
      )}
    </DialogContent>
  </Dialog>
);

