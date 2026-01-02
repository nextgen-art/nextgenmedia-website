import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, LogOut, Mail, Phone, Calendar, FileText, FileSignature, Receipt, ClipboardList, File, Download } from "lucide-react";
import ClientResourceLinks from "@/components/client-hub/client-resource-links";

interface ClientData {
  id: string;
  client_id: string;
  client_name: string;
  client_email: string;
  business_name: string;
  company_name: string;
  phone_number: string;
  status: string;
  package_name: string;
  budget: string;
  created_at: string;
  meeting_notes: string;
  proposal_sent_date: string;
  contract_signed_date: string;
  onboarding_started_date: string;
  dropbox_link: string | null;
  rela_link: string | null;
}

interface ClientDocument {
  id: string;
  document_type: string;
  document_name: string;
  document_url: string;
  file_size: number | null;
  mime_type: string | null;
  uploaded_at: string;
  description: string | null;
}

export default function ClientDashboard() {
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<ClientDocument[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(true);
  const { signOut, profile, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchClientData();
    }
  }, [user]);

  useEffect(() => {
    if (clientData?.id) {
      fetchDocuments();

      // Set up real-time subscription for document updates
      const channel = supabase
        .channel(`client-documents-${clientData.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "client_documents",
            filter: `client_id=eq.${clientData.id}`,
          },
          (payload) => {
            console.log("Document change detected:", payload);
            fetchDocuments();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [clientData?.id]);

  async function fetchClientData() {
    try {
      // First try to find by auth_user_id
      let { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("auth_user_id", user?.id)
        .maybeSingle();
      let customError: string | null = null;

      // If not found by auth_user_id, try to find by email and link it
      if (!data && user?.email) {
        console.log("No client found by auth_user_id, trying to link by email:", user.email);
        
        // Find client by email
        const { data: clientByEmail, error: emailError } = await supabase
          .from("clients")
          .select("*")
          .eq("client_email", user.email)
          .maybeSingle();

        if (clientByEmail && !clientByEmail.auth_user_id) {
          // Link the account
          const { error: updateError } = await supabase
            .from("clients")
            .update({
              auth_user_id: user.id,
              account_created_at: new Date().toISOString(),
            })
            .eq("id", clientByEmail.id);

          if (!updateError) {
            // Retry fetching after linking
            const { data: linkedData } = await supabase
              .from("clients")
              .select("*")
              .eq("auth_user_id", user.id)
              .single();
            
            if (linkedData) {
              setClientData(linkedData);
              toast.success("Account linked successfully!");
              setLoading(false);
              return;
            }
          }
        } else if (clientByEmail) {
          // Client exists but already linked to different account
          customError = "Client account already linked to a different user";
        } else {
          // No client found with this email
          customError = `No client record found with email: ${user.email}`;
        }
      }

      if (error || customError) {
        console.error("Error fetching client data:", error ?? customError);
        toast.error(error?.message || customError || "Failed to load your data");
        return;
      }

      if (data) {
        setClientData(data);
      }
    } catch (error: any) {
      console.error("Error fetching client data:", error);
      toast.error(error.message || "Failed to load your data");
    } finally {
      setLoading(false);
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

  function getStatusColor(status: string) {
    const colors: Record<string, string> = {
      new: "bg-blue-500",
      proposal_sent: "bg-yellow-500",
      approved: "bg-green-500",
      contract_sent: "bg-purple-500",
      contract_signed: "bg-indigo-500",
      invitation_sent: "bg-pink-500",
      complete: "bg-gray-500",
      error: "bg-red-500",
    };
    return colors[status] || "bg-gray-500";
  }

  async function fetchDocuments() {
    if (!clientData?.id) return;
    
    try {
      setLoadingDocuments(true);
      const { data, error } = await supabase
        .from("client_documents")
        .select("*")
        .eq("client_id", clientData.id)
        .eq("is_visible_to_client", true)
        .order("uploaded_at", { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error: any) {
      console.error("Error fetching documents:", error);
      toast.error("Failed to load documents");
    } finally {
      setLoadingDocuments(false);
    }
  }

  async function handleDownloadDocument(doc: ClientDocument) {
    try {
      // Check if it's a Supabase Storage path (format: {client_id}/{filename})
      // If it contains a UUID pattern or doesn't start with http/https, assume it's a storage path
      if (!doc.document_url.startsWith('http://') && !doc.document_url.startsWith('https://')) {
        // Supabase Storage path - get signed URL
        const { data, error } = await supabase.storage
          .from('client-documents')
          .createSignedUrl(doc.document_url, 3600); // 1 hour expiry

        if (error) throw error;
        if (data?.signedUrl) {
          window.open(data.signedUrl, '_blank');
        }
      } else {
        // External URL (Google Drive, etc.)
        window.open(doc.document_url, '_blank');
      }
    } catch (error: any) {
      console.error("Error downloading document:", error);
      toast.error("Failed to download document");
    }
  }

  function formatFileSize(bytes: number | null): string {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function getDocumentIcon(type: string) {
    switch (type) {
      case 'proposal':
        return <FileText className="h-5 w-5" />;
      case 'contract':
      case 'contract_signed':
        return <FileSignature className="h-5 w-5" />;
      case 'invoice':
        return <Receipt className="h-5 w-5" />;
      case 'meeting_recap':
        return <ClipboardList className="h-5 w-5" />;
      default:
        return <File className="h-5 w-5" />;
    }
  }

  function formatDate(dateString: string) {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!clientData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>No Client Data Found</CardTitle>
            <CardDescription>
              Your account hasn't been linked to a client profile yet. Please contact Angel.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleSignOut} className="w-full rounded-full">
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-black">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Client Hub</h1>
            <p className="text-sm text-white/70">
              {clientData.business_name || clientData.company_name}
            </p>
          </div>
          <Button
            variant="default"
            onClick={handleSignOut}
            className="rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Welcome Card */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">
                    Welcome back, {clientData.client_name}!
                  </CardTitle>
                  <CardDescription className="mt-2">
                    Here's your project overview and important information
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="text-sm font-medium">{clientData.client_email}</p>
                  </div>
                </div>
                {clientData.phone_number && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="text-sm font-medium">{clientData.phone_number}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <ClientResourceLinks
            dropboxUrl={clientData.dropbox_link}
            relaUrl={clientData.rela_link}
          />

          {/* Project Information */}
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {clientData.package_name && (
                  <div>
                    <p className="text-sm text-muted-foreground">Package</p>
                    <p className="text-lg font-semibold">{clientData.package_name}</p>
                  </div>
                )}
                {clientData.budget && (
                  <div>
                    <p className="text-sm text-muted-foreground">Investment</p>
                    <p className="text-lg font-semibold">{clientData.budget}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Documents Section */}
          <Card>
            <CardHeader>
              <CardTitle>Your Documents</CardTitle>
              <CardDescription>
                Access your proposal, contract, and other important files
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingDocuments ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : documents.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Documents will appear here once uploaded by Angel
                </p>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="text-muted-foreground">
                          {getDocumentIcon(doc.document_type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{doc.document_name}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="outline" className="text-xs">
                              {doc.document_type.replace(/_/g, ' ')}
                            </Badge>
                            {doc.file_size && (
                              <span>• {formatFileSize(doc.file_size)}</span>
                            )}
                            {doc.uploaded_at && (
                              <span>• {formatDate(doc.uploaded_at)}</span>
                            )}
                          </div>
                          {doc.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {doc.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadDocument(doc)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact Angel */}
          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
              <CardDescription>Get in touch with Angel and the NextGen Media team</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="rounded-full">
                <a href="mailto:angel@nextgenmedia.com">
                  <Mail className="mr-2 h-4 w-4" />
                  Contact Angel
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

