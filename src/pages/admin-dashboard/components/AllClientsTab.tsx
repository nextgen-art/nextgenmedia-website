import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { ClientsTable } from "./ClientsTable";
import type { Client } from "../types";

const TYPEFORM_MEETING_NOTES_URL = "https://admin.typeform.com/form/JKWynac5/create";

interface AllClientsTabProps {
  filteredClients: Client[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  loading: boolean;
  sendingFeedback: Map<string, boolean>;
  onViewDetails: (client: Client) => void;
  onOpenUpload: (client: Client) => void;
  onSendFeedback: (client: Client) => Promise<void>;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
  getStatusColor: (status: string) => string;
  formatDate: (dateString: string) => string;
}

export const AllClientsTab = ({
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
  getStatusColor,
  formatDate,
}: AllClientsTabProps) => {
  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-lg font-semibold">Clients</p>
            <p className="text-sm text-muted-foreground">
              Open the Typeform to import meeting notes and trigger onboarding automatically.
            </p>
          </div>
          <Button
            asChild
            className="rounded-full"
          >
            <a
              href={TYPEFORM_MEETING_NOTES_URL}
              target="_blank"
              rel="noreferrer"
              aria-label="Open meeting notes Typeform"
            >
              Open Typeform
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>

        <ClientsTable
          filteredClients={filteredClients}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          loading={loading}
          sendingFeedback={sendingFeedback}
          onViewDetails={onViewDetails}
          onOpenUpload={onOpenUpload}
          onSendFeedback={onSendFeedback}
          onEdit={onEdit}
          onDelete={onDelete}
          getStatusColor={getStatusColor}
          formatDate={formatDate}
        />
      </CardContent>
    </Card>
  );
};

