import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | World Insights",
  description: "Privacy policy for World Insights Hub.",
};

export default function PrivacyPage() {
  return (
    <main className="flex-1 bg-zinc-950 text-zinc-50">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="text-3xl font-black text-white sm:text-4xl mb-8">Privacy Policy</h1>
        <p className="text-sm text-zinc-500 mb-8">Last updated: May 1, 2026</p>

        <div className="space-y-8 text-zinc-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Introduction</h2>
            <p>
              World Insights Hub (&quot;we&quot;, &quot;our&quot;, or &quot;the Service&quot;) respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Information We Collect</h2>
            <h3 className="text-lg font-semibold text-white mt-4 mb-2">Information You Provide</h3>
            <p>We do not require account registration. However, we may collect:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1 text-zinc-400">
              <li>Browser type and version</li>
              <li>Device type and operating system</li>
              <li>Pages visited and time spent on the Service</li>
              <li>Referring URL or source</li>
            </ul>

            <h3 className="text-lg font-semibold text-white mt-4 mb-2">Automatically Collected Information</h3>
            <p>We automatically collect certain information when you visit our Service, including:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1 text-zinc-400">
              <li>IP address (anonymized)</li>
              <li>Browser type and settings</li>
              <li>Date and time of visits</li>
              <li>Pages viewed and click patterns</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Local Storage</h2>
            <p>
              The Service uses your browser&apos;s local storage to save preferences and game statistics (such as quiz scores, favorite countries, and game progress). This data is stored exclusively on your device and is never transmitted to our servers or shared with third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Cookies and Tracking Technologies</h2>
            <p>
              We and our third-party advertising partners may use cookies, web beacons, and similar technologies to serve advertisements, track usage patterns, and improve the Service. You can manage your cookie preferences through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Third-Party Advertising</h2>
            <p>
              We use Google AdSense and other advertising networks to display ads on our Service. These third parties may use cookies, JavaScript, and web beacons to measure ad effectiveness and personalize content. They may collect information about your visits to this and other websites to provide targeted advertisements.
            </p>
            <p className="mt-2">
              Google&apos;s use of advertising cookies enables it and its partners to serve ads based on your visit to our Service and other sites on the Internet. You may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Google Ads Settings</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Analytics</h2>
            <p>
              We may use analytics tools (such as Google Analytics) to understand how visitors interact with the Service. These tools collect information including IP addresses, browser type, and usage patterns to help us improve the user experience.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Data Sharing</h2>
            <p>We do not sell, trade, or rent your personal information. We may share anonymized, aggregated data with partners for analytical purposes. We may also disclose information if required by law or to protect our rights and safety.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">8. Data Security</h2>
            <p>
              We implement reasonable technical and organizational measures to protect your information. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">9. Your Rights</h2>
            <p>Depending on your jurisdiction, you may have the right to:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1 text-zinc-400">
              <li>Access the personal data we hold about you</li>
              <li>Request correction or deletion of your data</li>
              <li>Object to or restrict processing of your data</li>
              <li>Withdraw consent at any time</li>
              <li>Lodge a complaint with a supervisory authority</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">10. Children&apos;s Privacy</h2>
            <p>
              The Service is not directed to children under the age of 13. We do not knowingly collect personal information from children. If you believe we have collected data from a child under 13, please contact us and we will take steps to delete such information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">11. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of changes by posting the new policy on this page with an updated &quot;Last updated&quot; date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">12. Contact Us</h2>
            <p>
              If you have questions or concerns about this Privacy Policy, please contact us at <Link href="/" className="text-blue-400 hover:underline">our homepage</Link>.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
