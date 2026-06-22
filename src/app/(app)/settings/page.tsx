import { ShieldCheck, Store, Users } from "lucide-react";
import { PageHeading } from "@/components/app/page-heading";
import { PageSection, StatusChip } from "@/components/design-system";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";

const settingsGroups = [
  { title: "Store", description: "Location, hours, taxes, and receipt defaults.", icon: Store },
  { title: "Team", description: "Users, roles, access, and shift permissions.", icon: Users },
  { title: "Security", description: "Authentication policies and protected routes.", icon: ShieldCheck }
];

export default function SettingsPage() {
  return (
    <>
      <PageHeading
        eyebrow="Admin"
        title="Settings"
        description="Operational configuration for owners and administrators."
        actions={<StatusChip tone="neutral">Restricted</StatusChip>}
      />
      <PageSection className="grid gap-3 lg:grid-cols-3">
        {settingsGroups.map((group) => {
          const Icon = group.icon;

          return (
            <Card key={group.title}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon className="size-4 text-primary" />
                  {group.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-6 text-muted-foreground">
                {group.description}
              </CardContent>
            </Card>
          );
        })}
      </PageSection>
    </>
  );
}
