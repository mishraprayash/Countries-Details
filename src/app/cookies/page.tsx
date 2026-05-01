import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cookie Policy | World Insights",
  description: "Cookie policy for World Insights Hub.",
};

export default function CookiesPage() {
  return (
    <main className="flex-1 bg-zinc-950 text-zinc-50">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="text-3xl font-black text-white sm:text-4xl mb-8">Cookie Policy</h1>
        <p className="text-sm text-zinc-500 mb-8">Last updated: May 1, 2026</p>

        <div className="space-y-8 text-zinc-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. What Are Cookies</h2>
            <p>
              Cookies are small text files that are stored on your device when you visit a website. They help the website remember your preferences and understand how you use the site, enabling a better user experience.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. How We Use Cookies</h2>
            <p>World Insights Hub uses cookies for the following purposes:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1 text-zinc-400">
              <li><strong className="text-white">Essential cookies:</strong> Required for the Service to function properly, such as remembering your theme preference and favorite countries.</li>
              <li><strong className="text-white">Analytics cookies:</strong> Help us understand how visitors interact with the Service so we can improve the experience.</li>
              <li><strong className="text-white">Advertising cookies:</strong> Used by our advertising partners (including Google AdSense) to serve relevant ads and measure ad performance.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Local Storage vs Cookies</h2>
            <p>
              In addition to cookies, the Service uses browser LocalStorage to save game statistics, quiz scores, and country favorites. This data remains entirely on your device and is not shared with any third party.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Third-Party Cookies</h2>
            <p>
              Our advertising and analytics partners may set their own cookies. These third parties have their own privacy policies and we recommend reviewing them:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-2 text-zinc-400">
              <li><a href="https://policies.google.com/technologies/cookies" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Google Ads &amp; Analytics Cookie Policy</a></li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Managing Cookies</h2>
            <p>
              You can control and/or delete cookies as you wish. Most web browsers allow you to refuse cookies or delete them through their settings. Please note that disabling cookies may affect the functionality of the Service and prevent some features from working correctly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Changes to This Policy</h2>
            <p>
              We may update this Cookie Policy from time to time. Any changes will be posted on this page with an updated date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Contact</h2>
            <p>
              If you have any questions about our use of cookies, please contact us at <Link href="/" className="text-blue-400 hover:underline">our homepage</Link>.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
