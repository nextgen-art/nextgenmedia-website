import { useMemo } from "react";
import { differenceInDays, format, startOfMonth } from "date-fns";
import {
  formatCurrency,
  getOnboardingDurationDays,
  isFullyOnboarded,
  isInvoiceOverdue,
  isOnboardingInProgress,
  parseBudgetToNumber,
} from "./utils";
import { ActivityItem, Client, PendingDocument } from "./types";

interface UseAdminMetricsResult {
  clientSummary: {
    totalClients: number;
    activeClients: number;
    newThisMonth: number;
    fullyOnboarded: number;
  };
  onboardingFunnel: {
    notStarted: number;
    inProgress: number;
    completed: number;
  };
  slowOnboardings: { client: Client; days: number }[];
  pipelineStats: {
    proposalsPending: number;
    proposalsAccepted: number;
    contractsPendingSignature: number;
    contractsSigned: number;
  };
  billingStats: {
    invoicesSent: number;
    invoicesPaid: number;
    pendingInvoices: number;
    overdueInvoices: number;
    collectedBudget: number;
    outstandingBudget: number;
    formattedCollected: string;
    formattedOutstanding: string;
  };
  atRiskClients: { client: Client; reason: string; days?: number }[];
  activityFeed: ActivityItem[];
  startOfCurrentMonth: Date;
}

export const useAdminMetrics = (clients: Client[], contractDocuments: PendingDocument[] = []): UseAdminMetricsResult => {
  const startOfCurrentMonth = useMemo(() => startOfMonth(new Date()), []);

  const clientSummary = useMemo(() => {
    const totalClients = clients.length;
    const activeClients = clients.filter((client) => client.status === "active").length;
    const newThisMonth = clients.filter((client) => {
      const createdDate = new Date(client.created_at);
      if (Number.isNaN(createdDate.getTime())) return false;
      return createdDate >= startOfCurrentMonth;
    }).length;

    const fullyOnboarded = clients.filter((client) => isFullyOnboarded(client)).length;

    return {
      totalClients,
      activeClients,
      newThisMonth,
      fullyOnboarded,
    };
  }, [clients, startOfCurrentMonth]);

  const onboardingFunnel = useMemo(() => {
    const notStarted = clients.filter((client) => !client.onboarding_started_date).length;
    const inProgress = clients.filter((client) => isOnboardingInProgress(client)).length;
    const completed = clients.filter((client) => isFullyOnboarded(client)).length;
    return { notStarted, inProgress, completed };
  }, [clients]);

  const slowOnboardings = useMemo(() => {
    const inProgress = clients
      .filter((client) => isOnboardingInProgress(client))
      .map((client) => ({
        client,
        days: getOnboardingDurationDays(client) ?? 0,
      }))
      .sort((a, b) => b.days - a.days)
      .slice(0, 5);
    return inProgress;
  }, [clients]);

  const pipelineStats = useMemo(() => {
    const proposalsPending = clients.filter((client) =>
      ["proposal_sent", "pending_approval"].includes(client.status)
    ).length;
    const proposalsAccepted = clients.filter((client) => Boolean(client.proposal_approved_date)).length;

    // Use contract_status from client_documents instead of client dates
    const contractsPendingSignature = contractDocuments.filter(
      (doc) => doc.contract_status === "sent"
    ).length;
    const contractsSigned = contractDocuments.filter(
      (doc) => doc.contract_status === "invoice_sent" || doc.contract_status === "invoice_paid"
    ).length;

    return { proposalsPending, proposalsAccepted, contractsPendingSignature, contractsSigned };
  }, [clients, contractDocuments]);

  const billingStats = useMemo(() => {
    const invoicesSentClients = clients.filter((client) => Boolean(client.invoice_sent_date));
    const invoicesPaidClients = clients.filter((client) => Boolean(client.payment_received_date));
    const pendingInvoices = invoicesSentClients.filter((client) => !client.payment_received_date).length;
    const overdueInvoices = invoicesSentClients.filter((client) => isInvoiceOverdue(client)).length;

    // Calculate actual revenue: package_price + ad_management_fee (excluding ad spend)
    const collectedBudget = invoicesPaidClients.reduce((sum, client) => {
      const packagePrice = parseBudgetToNumber(client.package_price || client.budget);
      const adManagementFee = parseBudgetToNumber(client.ad_management_fee);
      return sum + packagePrice + adManagementFee;
    }, 0);

    const outstandingBudget = invoicesSentClients
      .filter((client) => !client.payment_received_date)
      .reduce((sum, client) => {
        const packagePrice = parseBudgetToNumber(client.package_price || client.budget);
        const adManagementFee = parseBudgetToNumber(client.ad_management_fee);
        return sum + packagePrice + adManagementFee;
      }, 0);

    return {
      invoicesSent: invoicesSentClients.length,
      invoicesPaid: invoicesPaidClients.length,
      pendingInvoices,
      overdueInvoices,
      collectedBudget,
      outstandingBudget,
      formattedCollected: formatCurrency(collectedBudget),
      formattedOutstanding: formatCurrency(outstandingBudget),
    };
  }, [clients]);

  const atRiskClients = useMemo(() => {
    const risks: { client: Client; reason: string; days?: number }[] = [];

    clients.forEach((client) => {
      const reasons: string[] = [];

      if (isInvoiceOverdue(client)) {
        reasons.push("Invoice overdue >14d");
      }

      const onboardingDays = getOnboardingDurationDays(client);
      if (onboardingDays !== null && onboardingDays > 30 && !client.payment_received_date) {
        reasons.push(`Onboarding stalled ${onboardingDays}d`);
      }

      if (!client.welcome_email_sent_date && client.onboarding_started_date) {
        const daysSinceStart = differenceInDays(new Date(), new Date(client.onboarding_started_date));
        if (daysSinceStart > 14) {
          reasons.push("Welcome email not sent");
        }
      }

      if (reasons.length) {
        risks.push({ client, reason: reasons.join(" • ") });
      }
    });

    return risks.slice(0, 8);
  }, [clients]);

  const activityFeed = useMemo(() => {
    const events: ActivityItem[] = [];

    clients.forEach((client) => {
      const clientName = client.client_name || client.client_email || client.client_id;

      if (client.created_at) {
        events.push({
          id: `${client.id}-created`,
          date: client.created_at,
          label: "Client created",
          type: "created",
          clientName,
        });
      }

      if (client.proposal_sent_date) {
        events.push({
          id: `${client.id}-proposal`,
          date: client.proposal_sent_date,
          label: "Proposal sent",
          type: "proposal",
          clientName,
        });
      }

      if (client.proposal_approved_date) {
        events.push({
          id: `${client.id}-proposal-approved`,
          date: client.proposal_approved_date,
          label: "Proposal approved",
          type: "proposal",
          clientName,
        });
      }

      if (client.contract_sent_date) {
        events.push({
          id: `${client.id}-contract-sent`,
          date: client.contract_sent_date,
          label: "Contract sent",
          type: "contract",
          clientName,
        });
      }

      if (client.contract_signed_date) {
        events.push({
          id: `${client.id}-contract-signed`,
          date: client.contract_signed_date,
          label: "Contract signed",
          type: "contract",
          clientName,
        });
      }

      if (client.invoice_sent_date) {
        events.push({
          id: `${client.id}-invoice-sent`,
          date: client.invoice_sent_date,
          label: "Invoice sent",
          type: "invoice",
          clientName,
        });
      }

      if (client.payment_received_date) {
        events.push({
          id: `${client.id}-payment`,
          date: client.payment_received_date,
          label: "Payment received",
          type: "payment",
          clientName,
        });
      }

      if (client.onboarding_started_date) {
        events.push({
          id: `${client.id}-onboarding`,
          date: client.onboarding_started_date,
          label: "Onboarding started",
          type: "onboarding",
          clientName,
        });
      }
    });

    return events
      .filter((event) => event.date)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 20);
  }, [clients]);

  return {
    clientSummary,
    onboardingFunnel,
    slowOnboardings,
    pipelineStats,
    billingStats,
    atRiskClients,
    activityFeed,
    startOfCurrentMonth,
  };
};

