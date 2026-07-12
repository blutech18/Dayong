import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TermsContent, PrivacyContent, LEGAL_EFFECTIVE_DATE } from "@/lib/legal-content";

export function ConsentDialog({
  open,
  onOpenChange,
  onAccept,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept: () => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [reachedBottom, setReachedBottom] = useState(false);

  // Reset the scroll gate whenever the dialog is (re)opened.
  useEffect(() => {
    if (!open) return;
    setReachedBottom(false);
    // After the content mounts: start at the top, and if it already fits
    // without scrolling, unlock the Accept button right away.
    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (!el) return;
      el.scrollTop = 0;
      if (el.scrollHeight - el.clientHeight < 24) setReachedBottom(true);
    });
  }, [open]);

  function handleScroll(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 24) {
      setReachedBottom(true);
    }
  }

  function scrollToBottom() {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[92vh] max-h-[92vh] w-[calc(100%-1.5rem)] max-w-4xl flex-col gap-0 p-0 sm:w-full sm:h-auto sm:max-h-[88vh]">
        <DialogHeader className="flex flex-row items-center gap-3 space-y-0 border-b border-border p-5 text-left sm:p-6">
          <img src="/dayong.png" alt="DAYONG logo" className="h-11 w-11 shrink-0 object-contain" />
          <div className="min-w-0">
            <DialogTitle className="truncate text-base sm:text-lg">
              Terms of Service & Privacy Policy
            </DialogTitle>
            <DialogDescription className="truncate">
              Please review before continuing · Effective {LEGAL_EFFECTIVE_DATE}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="relative min-h-0 flex-1">
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="h-full overflow-y-auto px-5 py-6 sm:max-h-[64vh] sm:px-8 [scrollbar-width:thin] [scrollbar-color:var(--border)_transparent] [&::-webkit-scrollbar]:w-2.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-solid [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:bg-clip-content [&::-webkit-scrollbar-track]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/50"
          >
            <section>
              <h3 className="font-display text-lg font-semibold tracking-tight text-foreground">
                Terms of Service
              </h3>
              <div className="mt-3">
                <TermsContent />
              </div>
            </section>

            <div className="my-6 border-t border-border" />

            <section>
              <h3 className="font-display text-lg font-semibold tracking-tight text-foreground">
                Privacy Policy
              </h3>
              <div className="mt-3">
                <PrivacyContent />
              </div>
            </section>
          </div>

          {/* Scroll hint — fades away once the bottom is reached */}
          <button
            type="button"
            onClick={scrollToBottom}
            className={cn(
              "absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-border bg-background/90 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur transition-opacity",
              reachedBottom ? "pointer-events-none opacity-0" : "opacity-100",
            )}
          >
            <ChevronDown className="h-3.5 w-3.5" />
            Scroll to the bottom to continue
          </button>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-border p-5 sm:flex-row sm:justify-end sm:p-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="gap-2"
            disabled={!reachedBottom}
            onClick={() => {
              onAccept();
              onOpenChange(false);
            }}
          >
            <Check className="h-4 w-4" />
            {reachedBottom ? "Accept & continue" : "Scroll to accept"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
