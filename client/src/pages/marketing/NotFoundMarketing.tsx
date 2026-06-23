import { Container, MButton } from "@/marketing/primitives";
import { ArrowRight } from "lucide-react";

export default function NotFoundMarketing() {
  return (
    <section className="relative overflow-hidden py-32">
      <div className="mkt-grid-bg pointer-events-none absolute inset-0 opacity-50" />
      <Container className="relative flex flex-col items-center text-center">
        <div className="mkt-display text-[clamp(80px,18vw,160px)] leading-none text-[#f7f8f8]">
          404
        </div>
        <h1 className="mkt-display mt-4 text-[clamp(24px,4vw,36px)] text-[#f7f8f8]">
          This page took an unpaid invoice
        </h1>
        <p className="mt-4 max-w-[44ch] text-[16px] text-[#8a8f98]">
          The page you're looking for doesn't exist or may have moved. Let's get
          you back to somewhere useful.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <MButton size="lg" href="/">
            Back home
            <ArrowRight className="h-4 w-4" />
          </MButton>
          <MButton variant="secondary" size="lg" href="/pricing">
            View pricing
          </MButton>
        </div>
      </Container>
    </section>
  );
}
