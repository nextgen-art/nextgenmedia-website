import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarCheck, ClipboardList, ExternalLink, Folder, Share2, Video } from "lucide-react";
import { ReactNode } from "react";

interface Props {
  dropboxUrl?: string | null;
  relaUrl?: string | null;
  strategyCallUrl?: string | null;
  filmingDateUrl?: string | null;
}

interface ResourceLink {
  key: string;
  label: string;
  description: string;
  href: string;
  icon: ReactNode;
}

const ONBOARDING_FORM_LINK = "https://form.jotform.com/261514202653044";

const openResource = (href: string) => {
  window.open(href, "_blank", "noopener,noreferrer");
};

const createClickHandler =
  (href: string) => (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    openResource(href);
  };

const createKeyDownHandler =
  (href: string) => (event: React.KeyboardEvent<HTMLAnchorElement>) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }
    event.preventDefault();
    openResource(href);
  };

const ClientResourceLinks = ({ dropboxUrl, relaUrl, strategyCallUrl, filmingDateUrl }: Props) => {
  const resources: ResourceLink[] = [
    {
      key: "typeform",
      label: "Client Intake Form",
      description: "Complete this onboarding form so our team can get started.",
      href: ONBOARDING_FORM_LINK,
      icon: <ClipboardList className="h-5 w-5 text-primary" />,
    },
  ];

  if (dropboxUrl) {
    resources.push({
      key: "dropbox",
      label: "Shared Dropbox Folder",
      description: "View your shot footage, edits, and delivered social content inside this shared folder.",
      href: dropboxUrl,
      icon: <Folder className="h-5 w-5 text-primary" />,
    });
  }

  if (relaUrl) {
    resources.push({
      key: "rela",
      label: "Content Calendar",
      description: "View your content calendar and upcoming publish schedule.",
      href: relaUrl,
      icon: <Share2 className="h-5 w-5 text-primary" />,
    });
  }

  if (strategyCallUrl) {
    resources.push({
      key: "strategy-call",
      label: "Strategy Call",
      description: "Schedule or join your strategy call with the NextGen Media team.",
      href: strategyCallUrl,
      icon: <CalendarCheck className="h-5 w-5 text-primary" />,
    });
  }

  if (filmingDateUrl) {
    resources.push({
      key: "filming-date",
      label: "Filming Date",
      description: "View or schedule your upcoming filming session.",
      href: filmingDateUrl,
      icon: <Video className="h-5 w-5 text-primary" />,
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Links</CardTitle>
        <CardDescription>Everything you need for onboarding and collaboration.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {resources.map((resource) => (
          <div
            key={resource.key}
            className="flex flex-col gap-3 rounded-lg border border-border p-4 md:flex-row md:items-center md:justify-between"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                {resource.icon}
              </div>
              <div>
                <p className="font-medium">{resource.label}</p>
                <p className="text-sm text-muted-foreground">{resource.description}</p>
              </div>
            </div>
            <Button variant="outline" className="rounded-full" asChild>
              <a
                href={resource.href}
                target="_blank"
                rel="noreferrer"
                tabIndex={0}
                aria-label={`Open ${resource.label}`}
                onClick={createClickHandler(resource.href)}
                onKeyDown={createKeyDownHandler(resource.href)}
                className="inline-flex items-center gap-2"
              >
                Open Link
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ClientResourceLinks;

