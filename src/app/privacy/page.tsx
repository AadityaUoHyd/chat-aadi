import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-gray-600">Last updated: October 17, 2025</p>
      </header>

      <div className="prose max-w-none">
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">1. Information We Collect</h2>
          <p className="mb-4">
            We collect information that you provide directly to us, such as when you create an account, use our services, or communicate with us. This may include:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Your name, email address, and profile information</li>
            <li>Messages and other content you submit through our services</li>
            <li>Information about how you use our services</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">2. How We Use Your Information</h2>
          <p className="mb-2">We use the information we collect to:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Provide, maintain, and improve our services</li>
            <li>Respond to your comments, questions, and requests</li>
            <li>Send you technical notices and support messages</li>
            <li>Monitor and analyze trends and usage</li>
            <li>Detect, investigate, and prevent fraudulent transactions</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">3. Information Sharing</h2>
          <p className="mb-4">
            We do not sell or share your personal information with third parties except as described in this Privacy Policy.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">4. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your personal information. However, no method of transmission over the Internet is 100% secure.
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
