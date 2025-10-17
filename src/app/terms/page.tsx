import Link from 'next/link';

export default function TermsOfUse() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Terms of Use</h1>
        <p className="text-gray-600">Last updated: October 17, 2025</p>
      </header>

      <div className="prose max-w-none">
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">1. Acceptance of Terms</h2>
          <p className="mb-4">
            By accessing and using ChatAadi, you accept and agree to be bound by the terms and conditions described in this document.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">2. Use of Service</h2>
          <p className="mb-4">
            ChatAadi provides AI-powered chat services. You agree to use the service only for lawful purposes and in accordance with these Terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">3. User Responsibilities</h2>
          <p className="mb-2">You agree not to:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Use the service for any illegal purpose</li>
            <li>Attempt to gain unauthorized access to any part of the service</li>
            <li>Upload or transmit any harmful or malicious code</li>
            <li>Violate any applicable laws or regulations</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">4. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. We will notify users of any changes by updating the "Last updated" date.
          </p>
        </section>

        <div className="mt-12 pt-6 border-t border-gray-200">
          <Link href="/login" className="text-blue-600 hover:underline">
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
