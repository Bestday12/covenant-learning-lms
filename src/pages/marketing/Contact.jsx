import { useState } from "react";
import Button from "@/components/ui/Button.jsx";

export default function Contact() {
  const [sent, setSent] = useState(false);
  return (
    <div className="max-w-xl mx-auto px-6 py-20">
      <h1 className="font-serif text-4xl font-bold text-covenant-800 text-center mb-4">Contact Us</h1>
      <p className="text-covenant-500 text-center mb-10">Questions about a course, church partnership, or facilitator licensing? Reach out.</p>
      {sent ? (
        <div className="bg-covenant-50 border border-covenant-100 rounded-xl p-8 text-center text-covenant-700">
          Thank you — we've received your message and will respond within 1–2 business days.
        </div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="space-y-4">
          <input required placeholder="Full name" className="w-full rounded-lg border border-covenant-100 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500" />
          <input required type="email" placeholder="Email address" className="w-full rounded-lg border border-covenant-100 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500" />
          <textarea required rows={5} placeholder="Your message" className="w-full rounded-lg border border-covenant-100 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500" />
          <Button type="submit" variant="accent" className="w-full">Send Message</Button>
        </form>
      )}
    </div>
  );
}
