import { LogIn } from "lucide-react";
import { AppFrame, EmptyState, MobileViewport } from "@/components/design-system";
import { Button } from "@/components/ui";
import { t } from "@/localization";

export default function LoginPage() {
  return (
    <AppFrame className="flex items-center justify-center px-4 py-8">
      <MobileViewport className="flex min-h-[70dvh] items-center justify-center">
        <EmptyState
          icon={<LogIn />}
          title={t("auth.signInRequired")}
          description={t("auth.signInDescription")}
          action={<Button>{t("auth.continue")}</Button>}
        />
      </MobileViewport>
    </AppFrame>
  );
}
