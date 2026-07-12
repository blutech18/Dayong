import { createFileRoute, Outlet, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/auth")({
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <div className="flex min-h-screen">
      {/* Left side - Content */}
      <div className="flex w-full flex-col bg-background px-6 py-6 sm:px-10 lg:w-[45%] lg:py-10 xl:w-[40%]">
        <div className="mb-auto">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <img src="/dayong.png" alt="DAYONG logo" className="h-9 w-9 object-contain" />
            <div className="font-display text-base font-semibold tracking-tight">DAYONG</div>
          </Link>
        </div>

        <div className="flex w-full flex-1 flex-col items-center justify-center py-8 lg:py-12">
          <div className="w-full max-w-sm">
            <Outlet />
          </div>
        </div>

        <div className="mt-auto text-xs text-muted-foreground">
          © {new Date().getFullYear()} DAYONG · Member Assistance & Collection Management
        </div>
      </div>

      {/* Right side - Image Background Placeholder */}
      <div className="relative hidden w-full lg:block lg:w-[55%] xl:w-[60%]">
        <div className="relative h-full w-full">
          <img
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80"
            alt="Office building placeholder"
            className="h-full w-full object-cover"
          />
          {/* Dark gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-background/20 mix-blend-multiply" />

          {/* Text Overlay */}
          <div className="absolute inset-0 flex flex-col justify-between p-12 pl-[10%] text-white">
            <div className="text-sm font-medium opacity-90">
              A modern platform for community mutual-aid organizations
            </div>
            <div className="pb-12">
              <div className="font-display text-5xl font-semibold leading-tight tracking-tight">
                Manage members,
                <br />
                collections and
                <br />
                assistance — beautifully.
              </div>
              <p className="mt-4 max-w-md text-base opacity-90 drop-shadow-sm">
                One workspace for member records, contribution ledgers, assistance workflows, and
                financial reporting.
              </p>
              <div className="mt-10 grid grid-cols-3 gap-6">
                {[
                  "Member records & digital IDs",
                  "Contribution ledgers & receipts",
                  "Assistance request workflows",
                ].map((label) => (
                  <div
                    key={label}
                    className="rounded-xl border border-white/20 bg-black/20 p-4 backdrop-blur-md shadow-xl"
                  >
                    <div className="text-xs opacity-90">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
