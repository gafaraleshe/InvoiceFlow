import { useState } from "react";
import { toast } from "sonner";
import { Container, Eyebrow, MButton } from "@/marketing/primitives";
import {
  Mail,
  MessageSquare,
  Building2,
  ArrowRight,
  Check,
} from "lucide-react";

const inputClass =
  "w-full rounded-lg border border-[#23252a] bg-[#0f1011] px-3.5 py-2.5 text-[14px] text-[#f7f8f8] placeholder:text-[#62666d] transition-colors focus:border-[#5e6ad2] focus:outline-none focus:ring-2 focus:ring-[#5e69d1]/30";

const labelClass = "mb-1.5 block text-[13px] font-medium text-[#d0d6e0]";

const channels = [
  {
    icon: Mail,
    title: "Email us",
    body: "We reply to every message within one business day.",
    value: "hello@invoiceflow.com",
  },
  {
    icon: MessageSquare,
    title: "Sales",
    body: "Talk through plans, migrations, and volume pricing.",
    value: "sales@invoiceflow.com",
  },
  {
    icon: Building2,
    title: "Office",
    body: "Drop by — coffee's on us.",
    value: "12 Old Street, London EC1V",
  },
];

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    toast.success("Thanks! We'll be in touch within one business day.");
  };

  return (
    <>
      <section className="relative overflow-hidden pt-20 pb-12">
        <div
          className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full opacity-25 blur-[120px]"
          style={{
            background:
              "radial-gradient(circle, rgba(94,106,210,0.5), transparent 70%)",
          }}
        />
        <Container className="relative flex flex-col items-center text-center">
          <Eyebrow>Contact</Eyebrow>
          <h1 className="mkt-display mt-4 max-w-[18ch] text-[clamp(36px,6vw,60px)] text-[#f7f8f8]">
            Let's talk about getting you paid
          </h1>
          <p className="mt-5 max-w-[52ch] text-[18px] leading-relaxed text-[#8a8f98]">
            Questions about plans, a migration, or just want a demo? Send us a
            note and a real human will get back to you.
          </p>
        </Container>
      </section>

      <section className="pb-28">
        <Container>
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.2fr]">
            {/* Channels */}
            <div className="space-y-4">
              {channels.map(c => (
                <div key={c.title} className="mkt-panel rounded-xl p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#23252a] bg-[#141516] text-[#828fff]">
                      <c.icon className="h-[18px] w-[18px]" />
                    </div>
                    <h3 className="text-[16px] font-medium text-[#f7f8f8]">
                      {c.title}
                    </h3>
                  </div>
                  <p className="mt-3 text-[14px] leading-relaxed text-[#8a8f98]">
                    {c.body}
                  </p>
                  <p className="mt-2 text-[14px] font-medium text-[#d0d6e0]">
                    {c.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Form */}
            <div className="mkt-panel rounded-2xl p-7 sm:p-9">
              {submitted ? (
                <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#27a644]/15 text-[#7fe0a0]">
                    <Check className="h-7 w-7" />
                  </div>
                  <h3 className="mkt-display mt-5 text-[26px] text-[#f7f8f8]">
                    Message sent
                  </h3>
                  <p className="mt-3 max-w-[40ch] text-[15px] text-[#8a8f98]">
                    Thanks for reaching out. We'll get back to you within one
                    business day.
                  </p>
                  <MButton
                    variant="secondary"
                    className="mt-6"
                    onClick={() => setSubmitted(false)}
                  >
                    Send another message
                  </MButton>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label className={labelClass} htmlFor="name">
                        Full name
                      </label>
                      <input
                        id="name"
                        required
                        placeholder="Jane Doe"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="email">
                        Work email
                      </label>
                      <input
                        id="email"
                        type="email"
                        required
                        placeholder="jane@company.com"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label className={labelClass} htmlFor="company">
                        Company
                      </label>
                      <input
                        id="company"
                        placeholder="Acme Inc."
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="topic">
                        I'm interested in
                      </label>
                      <select id="topic" className={inputClass}>
                        <option>Getting started</option>
                        <option>Pricing & plans</option>
                        <option>Migrating from another tool</option>
                        <option>A product demo</option>
                        <option>Something else</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="message">
                      How can we help?
                    </label>
                    <textarea
                      id="message"
                      required
                      rows={5}
                      placeholder="Tell us a little about your team and what you're looking for…"
                      className={`${inputClass} resize-none`}
                    />
                  </div>

                  <MButton size="lg" className="w-full">
                    Send message
                    <ArrowRight className="h-4 w-4" />
                  </MButton>
                  <p className="text-center text-[12px] text-[#62666d]">
                    By submitting, you agree to our privacy policy. We'll never
                    share your details.
                  </p>
                </form>
              )}
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
