import { differenceInDays } from "date-fns";
import { ALLOWED_FILE_EXTENSIONS } from "./constants";
import { Client } from "./types";

const ALLOWED_EXTENSION_SET = new Set<string>(ALLOWED_FILE_EXTENSIONS);

export const getFileExtension = (fileName: string) => fileName.split(".").pop()?.toLowerCase() ?? "";

export const isAllowedExtension = (extension: string) =>
  extension && ALLOWED_EXTENSION_SET.has(extension);

export const formatDate = (dateString: string) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatDateForInput = (dateString: string | null): Date | undefined => {
  if (!dateString) return undefined;
  const date = new Date(dateString);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

export const parseBudgetToNumber = (value?: string | null) => {
  if (!value) return 0;

  const matches = value.match(/-?\d[\d,]*(?:\.\d+)?/g);
  if (!matches) return 0;

  const numbers = matches
    .map((match) => Number(match.replace(/,/g, "")))
    .filter((numeric) => Number.isFinite(numeric));

  if (numbers.length === 0) return 0;

  return Math.max(...numbers);
};

export const formatCurrency = (value: number) =>
  value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export const isFullyOnboarded = (client: Client) =>
  Boolean(
    client.payment_received_date &&
    (client.welcome_email_sent_date || client.templates_populated_date || client.onboarding_started_date)
  );

export const isOnboardingInProgress = (client: Client) =>
  Boolean(client.onboarding_started_date && !client.payment_received_date);

export const getOnboardingDurationDays = (client: Client) => {
  if (!client.onboarding_started_date) return null;
  const startDate = new Date(client.onboarding_started_date);
  const endDate = client.payment_received_date ? new Date(client.payment_received_date) : new Date();
  if (Number.isNaN(startDate.getTime())) return null;
  return Math.max(differenceInDays(endDate, startDate), 0);
};

export const isInvoiceOverdue = (client: Client) => {
  if (!client.invoice_sent_date || client.payment_received_date) return false;
  const sentDate = new Date(client.invoice_sent_date);
  if (Number.isNaN(sentDate.getTime())) return false;
  return differenceInDays(new Date(), sentDate) >= 14;
};

export const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    new: "bg-blue-500",
    proposal_sent: "bg-yellow-500",
    approved: "bg-green-500",
    contract_sent: "bg-purple-500",
    contract_signed: "bg-indigo-500",
    invitation_sent: "bg-pink-500",
    complete: "bg-gray-500",
    error: "bg-red-500",
    active: "bg-green-500",
    completed: "bg-gray-500",
  };
  return colors[status] || "bg-gray-500";
};

