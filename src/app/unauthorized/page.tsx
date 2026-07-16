import { ShieldAlert } from "lucide-react";
import Link from "next/link";
import { AppFrame, EmptyState, MobileViewport } from "@/components/design-system";
import { Button } from "@/components/ui";
import { t } from "@/localization";

export default function UnauthorizedPage() {
  return (
    <AppFrame className="flex items-center justify-center px-4 py-8">
      <MobileViewport className="flex min-h-[70dvh] items-center justify-center">
        <EmptyState
          icon={<ShieldAlert />}
          title={t("auth.accessRestricted")}
          description={t("auth.accessDescription")}
          action={
            <Button asChild variant="secondary">
              <Link href="/dashboard">{t("auth.backDashboard")}</Link>
            </Button>
          }
        />
      </MobileViewport>
    </AppFrame>
  );
}
