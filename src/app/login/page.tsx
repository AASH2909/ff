import { LogIn } from "lucide-react";
import { AppFrame, EmptyState, MobileViewport } from "@/components/design-system";
import { Button } from "@/components/ui";

export default function LoginPage() {
  return (
    <AppFrame className="flex items-center justify-center px-4 py-8">
      <MobileViewport className="flex min-h-[70dvh] items-center justify-center">
        <EmptyState
          icon={<LogIn />}
          title="Sign in required"
          description="Connect this screen to Supabase Auth when the login flow is ready."
          action={<Button>Continue</Button>}
        />
      </MobileViewport>
    </AppFrame>
  );
}
