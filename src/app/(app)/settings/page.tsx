import { ShieldCheck, Store, Users } from "lucide-react";
import { PageHeading } from "@/components/app/page-heading";
import { PageSection, StatusChip } from "@/components/design-system";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { t } from "@/localization";

export default function SettingsPage() {
  const settingsGroups = [
    { title: t("pages.settings.store"), description: t("pages.settings.storeDescription"), icon: Store },
    { title: t("pages.settings.team"), description: t("pages.settings.teamDescription"), icon: Users },
    { title: t("pages.settings.security"), description: t("pages.settings.securityDescription"), icon: ShieldCheck }
  ];
  return (
    <>
      <PageHeading
        eyebrow={t("pages.settings.eyebrow")}
        title={t("pages.settings.title")}
        description={t("pages.settings.description")}
        actions={<StatusChip tone="neutral">{t("status.restricted")}</StatusChip>}
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
