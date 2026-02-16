"use client";

import { useState, type FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const COUNTRY_CODES = [
  { code: "+1", label: "US +1" },
  { code: "+44", label: "UK +44" },
  { code: "+34", label: "ES +34" },
  { code: "+52", label: "MX +52" },
  { code: "+33", label: "FR +33" },
  { code: "+49", label: "DE +49" },
  { code: "+39", label: "IT +39" },
  { code: "+55", label: "BR +55" },
  { code: "+57", label: "CO +57" },
  { code: "+54", label: "AR +54" },
  { code: "+56", label: "CL +56" },
  { code: "+51", label: "PE +51" },
  { code: "+58", label: "VE +58" },
  { code: "+81", label: "JP +81" },
  { code: "+82", label: "KR +82" },
  { code: "+86", label: "CN +86" },
  { code: "+91", label: "IN +91" },
  { code: "+61", label: "AU +61" },
  { code: "+64", label: "NZ +64" },
  { code: "+351", label: "PT +351" },
  { code: "+31", label: "NL +31" },
  { code: "+46", label: "SE +46" },
  { code: "+41", label: "CH +41" },
  { code: "+43", label: "AT +43" },
  { code: "+48", label: "PL +48" },
  { code: "+90", label: "TR +90" },
  { code: "+971", label: "AE +971" },
  { code: "+966", label: "SA +966" },
  { code: "+20", label: "EG +20" },
  { code: "+27", label: "ZA +27" },
  { code: "+234", label: "NG +234" },
  { code: "+254", label: "KE +254" },
];

type Status = "idle" | "loading" | "success" | "error";

export default function SignUpModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  function reset() {
    setFirstName("");
    setLastName("");
    setEmail("");
    setCountryCode("+1");
    setPhone("");
    setStatus("idle");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");

    const url = process.env.NEXT_PUBLIC_GOOGLE_SHEET_URL;
    if (!url) {
      setStatus("error");
      return;
    }

    try {
      await fetch(url, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone: `${countryCode}${phone}`,
        }),
      });
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
  }

  if (status === "success") {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="border-neutral-800 bg-neutral-950 text-white sm:max-w-md">
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-xl text-black">
              ✓
            </div>
            <p className="text-lg font-medium">You&apos;re on the list!</p>
            <p className="text-sm text-neutral-400">
              We&apos;ll be in touch soon.
            </p>
            <Button
              variant="outline"
              className="mt-2 border-neutral-700 bg-transparent text-white hover:bg-neutral-800"
              onClick={() => handleOpenChange(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="border-neutral-800 bg-neutral-950 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Sign Up</DialogTitle>
          <DialogDescription className="text-neutral-400">
            Join the waitlist to get early access.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="firstName" className="text-neutral-300">
                First Name
              </Label>
              <Input
                id="firstName"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
                className="border-neutral-700 bg-neutral-900 text-white placeholder:text-neutral-600"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="lastName" className="text-neutral-300">
                Last Name
              </Label>
              <Input
                id="lastName"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                className="border-neutral-700 bg-neutral-900 text-white placeholder:text-neutral-600"
              />
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="email" className="text-neutral-300">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              className="border-neutral-700 bg-neutral-900 text-white placeholder:text-neutral-600"
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="phone" className="text-neutral-300">
              Phone
            </Label>
            <div className="flex gap-2">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="h-9 rounded-md border border-neutral-700 bg-neutral-900 px-2 text-sm text-white outline-none focus:border-ring focus:ring-ring/50 focus:ring-[3px]"
              >
                {COUNTRY_CODES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
              <Input
                id="phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="555 123 4567"
                className="border-neutral-700 bg-neutral-900 text-white placeholder:text-neutral-600"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={status === "loading"}
            className="mt-1 w-full bg-white text-black hover:bg-neutral-200 disabled:opacity-50"
          >
            {status === "loading" ? "Submitting..." : "Submit"}
          </Button>

          {status === "error" && (
            <p className="text-center text-sm text-red-400">
              Something went wrong. Please try again.
            </p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
