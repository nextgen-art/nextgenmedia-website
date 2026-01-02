import type { ChangeEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ACCEPTED_FILE_TYPES,
  ALLOWED_EXTENSIONS_LABEL,
  MAX_FILE_SIZE_BYTES,
} from "@/pages/admin-dashboard/constants";
import {
  formatDate,
  getFileExtension,
  getStatusColor,
  isAllowedExtension,
} from "@/pages/admin-dashboard/utils";
import { useAdminMetrics } from "@/pages/admin-dashboard/use-admin-metrics";
import { Client, PendingDocument } from "@/pages/admin-dashboard/types";
import { HeaderBar } from "@/pages/admin-dashboard/components/HeaderBar";
import { DashboardTab } from "@/pages/admin-dashboard/components/DashboardTab";
import { PendingContractsTab } from "@/pages/admin-dashboard/components/PendingContractsTab";
import { AllClientsTab } from "@/pages/admin-dashboard/components/AllClientsTab";
import { EditClientDialog } from "@/pages/admin-dashboard/components/EditClientDialog";
import { DeleteClientDialog } from "@/pages/admin-dashboard/components/DeleteClientDialog";
import { InvoiceConfirmDialog } from "@/pages/admin-dashboard/components/InvoiceConfirmDialog";
import { ClientDetailsDialog } from "@/pages/admin-dashboard/components/ClientDetailsDialog";
import { UploadDocumentDialog } from "@/pages/admin-dashboard/components/UploadDocumentDialog";

export default function AdminDashboard() {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);
  const [editForm, setEditForm] = useState<Partial<Client>>({});
  const [saving, setSaving] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedClientForUpload, setSelectedClientForUpload] = useState<Client | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<string>("other");
  const [documentName, setDocumentName] = useState("");
  const [documentDescription, setDocumentDescription] = useState("");
  const [isDocumentNameDirty, setIsDocumentNameDirty] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingDocuments, setPendingDocuments] = useState<PendingDocument[]>([]);
  const [allContractDocuments, setAllContractDocuments] = useState<PendingDocument[]>([]);
  const [loadingPendingDocs, setLoadingPendingDocs] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<Map<string, boolean>>(new Map());
  const [sendingInvoice, setSendingInvoice] = useState<Map<string, boolean>>(new Map());
  const [invoiceConfirmOpen, setInvoiceConfirmOpen] = useState(false);
  const [documentToInvoice, setDocumentToInvoice] = useState<PendingDocument | null>(null);
  const [clientDetailsOpen, setClientDetailsOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientDetailsForm, setClientDetailsForm] = useState<Partial<Client>>({});
  const [hasClientChanges, setHasClientChanges] = useState(false);
  const [savingClientDetails, setSavingClientDetails] = useState(false);
  const [sendingFeedback, setSendingFeedback] = useState<Map<string, boolean>>(new Map());
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();

  const {
    clientSummary,
    onboardingFunnel,
    slowOnboardings,
    pipelineStats,
    billingStats,
    atRiskClients,
    activityFeed,
  } = useAdminMetrics(clients, allContractDocuments);

  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClearSelectedFile = () => {
    setUploadFile(null);
    setFileError(null);
    resetFileInput();
    if (!isDocumentNameDirty) {
      setDocumentName("");
    }
  };

  const pendingContracts = useMemo(
    () =>
      pendingDocuments.filter(
        (doc) => doc.contract_status === "pending" || doc.contract_status === null
      ),
    [pendingDocuments]
  );

  const sentContracts = useMemo(
    () => pendingDocuments.filter((doc) => doc.contract_status === "sent"),
    [pendingDocuments]
  );

  const invoiceSentContracts = useMemo(
    () => pendingDocuments.filter((doc) => doc.contract_status === "invoice_sent"),
    [pendingDocuments]
  );

  useEffect(() => {
    fetchClients();
    fetchPendingDocuments();
    fetchAllContractDocuments();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("admin-contracts-status")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "client_documents",
          filter: "document_type=eq.contract",
        },
        () => {
          // Re-fetch so items automatically move sections / disappear (e.g. invoice_paid)
          fetchPendingDocuments();
          fetchAllContractDocuments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = clients.filter(
        (client) =>
          client.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          client.client_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          client.client_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          client.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          client.company_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredClients(filtered);
      return;
    }
    setFilteredClients(clients);
  }, [searchQuery, clients]);

  async function fetchClients() {
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setClients(data || []);
      setFilteredClients(data || []);
    } catch (error: any) {
      toast.error("Failed to fetch clients");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function handleViewDetails(client: Client) {
    setSelectedClient(client);
    setClientDetailsForm({ ...client });
    setHasClientChanges(false);
    setClientDetailsOpen(true);
  }

  function handleClientDetailsFormChange(field: keyof Client, value: any) {
    setClientDetailsForm((prev) => ({
      ...prev,
      [field]: value,
    }));
    setHasClientChanges(true);
  }

  async function handleSaveClientDetails() {
    if (!selectedClient) return;

    try {
      setSavingClientDetails(true);

      const updatePayload: Partial<Client> = {};
      Object.keys(clientDetailsForm).forEach((key) => {
        const formKey = key as keyof Client;
        if (clientDetailsForm[formKey] !== selectedClient[formKey]) {
          updatePayload[formKey] = clientDetailsForm[formKey];
        }
      });

      const { error } = await supabase.from("clients").update(updatePayload).eq("id", selectedClient.id);
      if (error) throw error;

      toast.success("Client details updated successfully");
      setHasClientChanges(false);
      await fetchClients();
      setSelectedClient({ ...selectedClient, ...updatePayload });
    } catch (error: any) {
      console.error("Error saving client details:", error);
      toast.error("Failed to save changes. Please try again.");
    } finally {
      setSavingClientDetails(false);
    }
  }

  function handleCopyToClipboard(text: string, label: string) {
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success(`${label} copied to clipboard`))
      .catch(() => toast.error("Failed to copy to clipboard"));
  }

  async function handleSendFeedbackEmail(client: Client) {
    if (!client.client_email) {
      toast.error("Client email is missing");
      return;
    }

    try {
      setSendingFeedback((prev) => new Map(prev).set(client.id, true));

      const webhookUrl = "https://primary-production-f0f7.up.railway.app/webhook/2f41f482-36b8-44b1-a1ed-e8a2cf56e46d";
      const payload = {
        id: client.id,
        client_id: client.client_id,
        client_name: client.client_name,
        client_email: client.client_email,
        business_name: client.business_name || client.company_name,
      };

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Webhook failed: ${response.statusText}`);
      }

      const { error: updateError } = await supabase
        .from("clients")
        .update({ feedback_sent_date: new Date().toISOString() })
        .eq("id", client.id);

      if (updateError) throw updateError;

      toast.success(`Feedback email sent to ${client.client_name || client.client_email}`);
      await fetchClients();
    } catch (error: any) {
      console.error("Error sending feedback email:", error);
      toast.error("Failed to send feedback email. Please try again.");
    } finally {
      setSendingFeedback((prev) => {
        const next = new Map(prev);
        next.delete(client.id);
        return next;
      });
    }
  }

  function handleQuickAction(action: "email" | "call" | "viewHub") {
    if (!selectedClient) return;

    if (action === "email") {
      if (selectedClient.client_email) {
        window.location.href = `mailto:${selectedClient.client_email}`;
        return;
      }
      toast.error("No email address available");
      return;
    }

    if (action === "call") {
      if (selectedClient.phone_number) {
        window.location.href = `tel:${selectedClient.phone_number}`;
        return;
      }
      toast.error("No phone number available");
      return;
    }

    if (action === "viewHub") {
      if (selectedClient.auth_user_id) {
        window.open(`/client-dashboard`, "_blank");
        return;
      }
      toast.info("Client hasn't created an account yet");
    }
  }

  function handleDateChange(field: keyof Client, date: Date | undefined) {
    handleClientDetailsFormChange(field, date ? date.toISOString() : null);
  }

  async function fetchPendingDocuments() {
    try {
      setLoadingPendingDocs(true);
      const { data, error } = await supabase
        .from("client_documents")
        .select(
          `
          *,
          clients (
            client_id,
            client_name,
            client_email
          )
        `
        )
        .eq("document_type", "contract")
        .eq("is_visible_to_client", false)
        .or("contract_status.is.null,contract_status.neq.invoice_paid")
        .order("uploaded_at", { ascending: false });

      if (error) throw error;
      setPendingDocuments(data || []);
    } catch (error: any) {
      console.error("Error fetching pending documents:", error);
      toast.error("Failed to load pending contracts");
    } finally {
      setLoadingPendingDocs(false);
    }
  }

  async function fetchAllContractDocuments() {
    try {
      const { data, error } = await supabase
        .from("client_documents")
        .select(
          `
          *,
          clients (
            client_id,
            client_name,
            client_email
          )
        `
        )
        .eq("document_type", "contract")
        .order("uploaded_at", { ascending: false });

      if (error) throw error;
      setAllContractDocuments(data || []);
    } catch (error: any) {
      console.error("Error fetching all contract documents:", error);
    }
  }

  async function handleMarkAsSent(docId: string) {
    try {
      setUpdatingStatus((prev) => new Map(prev).set(docId, true));

      const document = pendingDocuments.find((doc) => doc.id === docId);
      if (!document) {
        throw new Error("Document not found");
      }

      const clientId = document.client_id;
      const currentTimestamp = new Date().toISOString();

      setPendingDocuments((prev) =>
        prev.map((doc) => (doc.id === docId ? { ...doc, contract_status: "sent" as const } : doc))
      );

      const [docUpdateResult, clientUpdateResult] = await Promise.all([
        supabase.from("client_documents").update({ contract_status: "sent" }).eq("id", docId),
        supabase.from("clients").update({ contract_sent_date: currentTimestamp }).eq("id", clientId),
      ]);

      if (docUpdateResult.error) throw docUpdateResult.error;
      if (clientUpdateResult.error) throw clientUpdateResult.error;

      toast.success("Contract marked as sent");
      await fetchPendingDocuments();
      await fetchAllContractDocuments();
      await fetchClients();
    } catch (error: any) {
      console.error("Error marking contract as sent:", error);
      toast.error("Failed to update status. Please try again.");
      await fetchPendingDocuments();
      await fetchAllContractDocuments();
    } finally {
      setUpdatingStatus((prev) => {
        const next = new Map(prev);
        next.delete(docId);
        return next;
      });
    }
  }

  async function triggerInvoiceWebhook(documentId: string, clientId: string) {
    const webhookUrl =
      import.meta.env.VITE_N8N_INVOICE_WEBHOOK_URL ||
      "https://primary-production-f0f7.up.railway.app/webhook/send-invoice";

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ document_id: documentId, client_id: clientId }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Webhook failed: ${response.status} ${errorText}`);
    }

    return response.json();
  }

  async function pollContractStatus(docId: string, maxAttempts = 5) {
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const { data } = await supabase
        .from("client_documents")
        .select("contract_status")
        .eq("id", docId)
        .single();

      if (data?.contract_status === "invoice_sent") {
        await fetchPendingDocuments();
        await fetchAllContractDocuments();
        return true;
      }
    }
    return false;
  }

  function handleSendInvoiceClick(doc: PendingDocument) {
    setDocumentToInvoice(doc);
    setInvoiceConfirmOpen(true);
  }

  async function handleConfirmSendInvoice() {
    if (!documentToInvoice) return;

    const docId = documentToInvoice.id;
    const clientId = documentToInvoice.client_id;

    try {
      setSendingInvoice((prev) => new Map(prev).set(docId, true));
      setInvoiceConfirmOpen(false);

      const currentTimestamp = new Date().toISOString();

      const { error: clientUpdateError } = await supabase
        .from("clients")
        .update({
          contract_signed_date: currentTimestamp,
          invoice_sent_date: currentTimestamp,
        })
        .eq("id", clientId);

      if (clientUpdateError) {
        console.error("Error updating client dates:", clientUpdateError);
        toast.error("Failed to update client dates. Invoice may still be sent.");
      }

      await triggerInvoiceWebhook(docId, clientId);

      toast.success("Invoice sent successfully! Updating status...");

      const statusUpdated = await pollContractStatus(docId);

      if (!statusUpdated) {
        await fetchPendingDocuments();
        await fetchAllContractDocuments();
        toast.info("Status may take a moment to update. Refreshing...");
      }

      await fetchClients();
    } catch (error: any) {
      console.error("Error sending invoice:", error);

      let errorMessage = "Failed to send invoice. Please try again.";
      if (error.message.includes("fetch")) {
        errorMessage = "Connection failed. Please check your internet and try again.";
      } else if (error.message.includes("4")) {
        errorMessage = "Invalid request. Please contact support.";
      } else if (error.message.includes("5")) {
        errorMessage = "Server error. Please try again in a moment.";
      }

      toast.error(errorMessage);
    } finally {
      setSendingInvoice((prev) => {
        const next = new Map(prev);
        next.delete(docId);
        return next;
      });
      setDocumentToInvoice(null);
    }
  }

  async function handleDownloadPendingDocument(doc: PendingDocument) {
    try {
      if (!doc.document_url.startsWith("http://") && !doc.document_url.startsWith("https://")) {
        const { data, error } = await supabase.storage
          .from("client-documents")
          .createSignedUrl(doc.document_url, 3600);

        if (error) throw error;
        if (data?.signedUrl) {
          window.open(data.signedUrl, "_blank");
        }
      } else {
        window.open(doc.document_url, "_blank");
      }
    } catch (error: any) {
      console.error("Error downloading document:", error);
      toast.error("Failed to download document");
    }
  }

  async function handleDeletePendingDocument(docId: string) {
    try {
      const { error } = await supabase.from("client_documents").delete().eq("id", docId);
      if (error) throw error;
      toast.success("Document deleted successfully");
      fetchPendingDocuments();
      fetchAllContractDocuments();
    } catch (error: any) {
      console.error("Error deleting document:", error);
      toast.error("Failed to delete document");
    }
  }

  async function handleSignOut() {
    try {
      await signOut();
      navigate("/");
    } catch (error: any) {
      toast.error("Failed to sign out");
    }
  }

  function handleEditClick(client: Client) {
    setClientToEdit(client);
    setEditForm({
      client_name: client.client_name,
      client_email: client.client_email,
      business_name: client.business_name,
      company_name: client.company_name,
      phone_number: client.phone_number,
      status: client.status,
      package_name: client.package_name,
      budget: client.budget,
      meeting_notes: client.meeting_notes,
      notes: client.notes,
      dropbox_link: client.dropbox_link,
      rela_link: client.rela_link,
    });
    setEditDialogOpen(true);
  }

  async function handleSaveEdit() {
    if (!clientToEdit) return;

    setSaving(true);
    try {
      const { contract_signed_date: _ignoredContractDate, ...editFields } = editForm;
      const sanitizedPayload = {
        ...editFields,
        dropbox_link: editForm.dropbox_link?.trim() || null,
        rela_link: editForm.rela_link?.trim() || null,
        last_updated: new Date().toISOString(),
      };

      const { error } = await supabase.from("clients").update(sanitizedPayload).eq("id", clientToEdit.id);
      if (error) throw error;

      toast.success("Client updated successfully");
      setEditDialogOpen(false);
      fetchClients();
    } catch (error: any) {
      toast.error("Failed to update client");
      console.error(error);
    } finally {
      setSaving(false);
    }
  }

  function handleDeleteClick(client: Client) {
    setClientToDelete(client);
    setDeleteDialogOpen(true);
  }

  async function handleConfirmDelete() {
    if (!clientToDelete) return;
    try {
      const { error } = await supabase.from("clients").delete().eq("id", clientToDelete.id);
      if (error) throw error;
      toast.success("Client deleted successfully");
      setDeleteDialogOpen(false);
      fetchClients();
    } catch (error: any) {
      toast.error("Failed to delete client");
      console.error(error);
    }
  }

  function openUploadDialog(client: Client) {
    setSelectedClientForUpload(client);
    setUploadDialogOpen(true);
    setUploadFile(null);
    setDocumentName("");
    setDocumentDescription("");
    setDocumentType("other");
    setIsDocumentNameDirty(false);
    setFileError(null);
    resetFileInput();
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setUploadFile(null);
      return;
    }

    const extension = getFileExtension(file.name);
    if (!extension || !isAllowedExtension(extension)) {
      const message = `Unsupported file type. Allowed formats: ${ALLOWED_EXTENSIONS_LABEL}.`;
      setUploadFile(null);
      setFileError(message);
      toast.error(message);
      resetFileInput();
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      const message = "File size exceeds the 50 MB limit. Please compress it before uploading.";
      setUploadFile(null);
      setFileError(message);
      toast.error(message);
      resetFileInput();
      return;
    }

    setFileError(null);
    setUploadFile(file);
    if (!isDocumentNameDirty) {
      setDocumentName(file.name);
    }
  };

  async function handleUploadDocument() {
    if (!selectedClientForUpload || !uploadFile) return;

    try {
      setUploading(true);

      const extension = getFileExtension(uploadFile.name) || "file";
      const filePath = `${selectedClientForUpload.id}/${Date.now()}.${extension}`;
      const documentNameToSave = uploadFile.name;
      const descriptionToSave = documentDescription.trim() ? documentDescription.trim() : null;

      const { error: uploadError } = await supabase.storage
        .from("client-documents")
        .upload(filePath, uploadFile, {
          cacheControl: "3600",
          upsert: false,
          contentType: uploadFile.type || "application/octet-stream",
        });
      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase.from("client_documents").insert({
        client_id: selectedClientForUpload.id,
        document_type: documentType,
        document_name: documentNameToSave,
        document_url: filePath,
        file_size: uploadFile.size,
        mime_type: uploadFile.type,
        uploaded_by: profile?.id,
        uploaded_by_name: profile?.full_name || "Admin",
        description: descriptionToSave,
        is_visible_to_client: true,
      });
      if (dbError) throw dbError;

      toast.success("Document uploaded successfully!");
      setUploadDialogOpen(false);
      setUploadFile(null);
      setDocumentName("");
      setDocumentDescription("");
      setDocumentType("other");
      setIsDocumentNameDirty(false);
      setFileError(null);
      resetFileInput();
    } catch (error: any) {
      console.error("Error uploading document:", error);
      const message = error?.message as string | undefined;
      if (message && message.toLowerCase().includes("mime type")) {
        const friendly = `Supabase rejected this file type. Supported formats: ${ALLOWED_EXTENSIONS_LABEL}.`;
        setFileError(friendly);
        toast.error(friendly);
        return;
      }
      toast.error(message || "Failed to upload document");
    } finally {
      setUploading(false);
    }
  }

  const handleClientDetailsOpenChange = (open: boolean) => {
    if (!open && hasClientChanges) {
      if (confirm("You have unsaved changes. Are you sure you want to close?")) {
        setClientDetailsOpen(false);
        setHasClientChanges(false);
      }
      return;
    }
    setClientDetailsOpen(open);
    if (!open) {
      setHasClientChanges(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <HeaderBar profile={profile} onSignOut={handleSignOut} />

      <main className="container mx-auto px-6 py-8">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="inline-flex gap-2 mb-8">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="pending-contracts" className="relative">
              Pending Contracts
              {pendingContracts.length > 0 && (
                <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                  {pendingContracts.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="all-clients">All Clients</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-8">
            <DashboardTab
              clientSummary={clientSummary}
              billingStats={billingStats}
              onboardingFunnel={onboardingFunnel}
              slowOnboardings={slowOnboardings}
              pipelineStats={pipelineStats}
              atRiskClients={atRiskClients}
              activityFeed={activityFeed}
              clients={clients}
            />
          </TabsContent>

          <TabsContent value="pending-contracts" className="space-y-8">
            <PendingContractsTab
              pendingContracts={pendingContracts}
              sentContracts={sentContracts}
              invoiceSentContracts={invoiceSentContracts}
              loadingPendingDocs={loadingPendingDocs}
              updatingStatus={updatingStatus}
              sendingInvoice={sendingInvoice}
              onMarkAsSent={handleMarkAsSent}
              onSendInvoiceClick={handleSendInvoiceClick}
              onDownload={handleDownloadPendingDocument}
              onDelete={handleDeletePendingDocument}
            />
          </TabsContent>

          <TabsContent value="all-clients" className="space-y-8">
            <AllClientsTab
              filteredClients={filteredClients}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              loading={loading}
              sendingFeedback={sendingFeedback}
              onViewDetails={handleViewDetails}
              onOpenUpload={openUploadDialog}
              onSendFeedback={handleSendFeedbackEmail}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              getStatusColor={getStatusColor}
              formatDate={formatDate}
            />
          </TabsContent>
        </Tabs>
      </main>

      <EditClientDialog
        open={editDialogOpen}
        clientToEdit={clientToEdit}
        editForm={editForm}
        saving={saving}
        onOpenChange={setEditDialogOpen}
        onChange={setEditForm}
        onSave={handleSaveEdit}
      />

      <DeleteClientDialog
        open={deleteDialogOpen}
        clientToDelete={clientToDelete}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
      />

      <InvoiceConfirmDialog
        open={invoiceConfirmOpen}
        documentToInvoice={documentToInvoice}
        sendingInvoice={sendingInvoice}
        onOpenChange={setInvoiceConfirmOpen}
        onConfirm={handleConfirmSendInvoice}
      />

      <ClientDetailsDialog
        open={clientDetailsOpen}
        onOpenChange={handleClientDetailsOpenChange}
        selectedClient={selectedClient}
        clientDetailsForm={clientDetailsForm}
        onFieldChange={handleClientDetailsFormChange}
        onDateChange={handleDateChange}
        onCopy={handleCopyToClipboard}
        onQuickAction={handleQuickAction}
        getStatusColor={getStatusColor}
        hasClientChanges={hasClientChanges}
        onSaveClientDetails={handleSaveClientDetails}
        savingClientDetails={savingClientDetails}
      />

      <UploadDocumentDialog
        open={uploadDialogOpen}
        selectedClientForUpload={selectedClientForUpload}
        documentType={documentType}
        onChangeDocumentType={setDocumentType}
        documentName={documentName}
        onChangeDocumentName={setDocumentName}
        onDocumentNameDirty={setIsDocumentNameDirty}
        documentDescription={documentDescription}
        onChangeDocumentDescription={setDocumentDescription}
        uploadFile={uploadFile}
        onFileChange={handleFileChange}
        onClearSelectedFile={handleClearSelectedFile}
        fileError={fileError}
        uploading={uploading}
        onUpload={handleUploadDocument}
        onOpenChange={setUploadDialogOpen}
        acceptedFileTypes={ACCEPTED_FILE_TYPES}
        allowedExtensionsLabel={ALLOWED_EXTENSIONS_LABEL}
      />
    </div>
  );
}

