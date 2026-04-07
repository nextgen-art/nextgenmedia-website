import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Client } from "../types";
import {
  Edit,
  Eye,
  FileText,
  Heart,
  Link2,
  Loader2,
  Search,
  Trash2,
} from "lucide-react";

interface ClientsTableProps {
  filteredClients: Client[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  loading: boolean;
  sendingFeedback: Map<string, boolean>;
  onViewDetails: (client: Client) => void;
  onOpenUpload: (client: Client) => void;
  onSendFeedback: (client: Client) => void;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
  onGenerateInvite: (client: Client) => void;
  getStatusColor: (status: string) => string;
  formatDate: (dateString: string) => string;
}

export const ClientsTable = ({
  filteredClients,
  searchQuery,
  onSearchChange,
  loading,
  sendingFeedback,
  onViewDetails,
  onOpenUpload,
  onSendFeedback,
  onEdit,
  onDelete,
  onGenerateInvite,
  getStatusColor,
  formatDate,
}: ClientsTableProps) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-lg font-semibold">All Clients</h2>
        <p className="text-sm text-muted-foreground">
          {filteredClients.length} {filteredClients.length === 1 ? "client" : "clients"} total
        </p>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 w-[300px]"
          />
        </div>
      </div>
    </div>

    {loading ? (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    ) : filteredClients.length === 0 ? (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          {searchQuery ? "No clients found matching your search." : "No clients yet."}
        </p>
      </div>
    ) : (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Package</TableHead>
              <TableHead>Ad Spend</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.map((client) => (
              <TableRow key={client.id}>
                <TableCell className="font-mono text-sm">
                  {client.client_id}
                </TableCell>
                <TableCell className="font-medium">
                  {client.client_name || "—"}
                </TableCell>
                <TableCell>
                  {client.business_name || client.company_name || "—"}
                </TableCell>
                <TableCell>{client.client_email}</TableCell>
                <TableCell>
                  {client.status ? (
                    <Badge className={getStatusColor(client.status)}>
                      {client.status.replace(/_/g, " ").toUpperCase()}
                    </Badge>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell>{client.package_name || "—"}</TableCell>
                <TableCell>
                  {client.ad_spend ? (
                    <span className="font-medium text-orange-600">{client.ad_spend}</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>{formatDate(client.created_at)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onViewDetails(client)}
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onOpenUpload(client)}
                      title="Upload Document"
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onSendFeedback(client)}
                      title={
                        client.feedback_sent_date
                          ? `Last sent: ${formatDate(client.feedback_sent_date)}`
                          : "Send Feedback Email"
                      }
                      disabled={sendingFeedback.get(client.id)}
                      className={client.feedback_sent_date ? "text-green-600 border-green-200" : ""}
                    >
                      {sendingFeedback.get(client.id) ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Heart className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onGenerateInvite(client)}
                      title={
                        client.client_email
                          ? "Generate Invite Link"
                          : "Email required for invite"
                      }
                      disabled={!client.client_email}
                    >
                      <Link2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(client)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDelete(client)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )}
  </div>
);

