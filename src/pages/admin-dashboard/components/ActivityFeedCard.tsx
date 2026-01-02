import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { ActivityItem } from "../types";
import { formatDate } from "../utils";
import { cn } from "@/lib/utils";

interface ActivityFeedCardProps {
  activityFeed: ActivityItem[];
}

export const ActivityFeedCard = ({ activityFeed }: ActivityFeedCardProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-3">
          <CollapsibleTrigger className="flex w-full items-center justify-between hover:opacity-80 transition-opacity">
            <div className="text-left">
              <CardTitle>Recent activity</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Based on existing client dates (proposal, contract, invoice, payment)
              </p>
            </div>
            <ChevronDown
              className={cn(
                "h-5 w-5 text-muted-foreground transition-transform duration-200",
                isOpen && "transform rotate-180"
              )}
            />
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="pt-0">
            {activityFeed.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent activity to show.</p>
            ) : (
              <div className="space-y-1.5">
                {activityFeed.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-md border p-2 hover:bg-muted/50 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{item.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.clientName} • {formatDate(item.date)}
                      </p>
                    </div>
                    <Badge variant="secondary" className="shrink-0 capitalize text-xs ml-2">
                      {item.type}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

