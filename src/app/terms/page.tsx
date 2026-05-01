import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | World Insights",
  description: "Terms and conditions for using World Insights Hub.",
};

export default function TermsPage() {
  return (
    <main className="flex-1 bg-atlas-950 text-text-primary min-h-screen">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="text-3xl font-black text-text-primary sm:text-4xl mb-8 font-instrument-serif">Terms of Service</h1>
        <p className="text-sm text-muted mb-8 font-dm-mono">Last updated: May 1, 2026</p>

        <div className="space-y-8 text-text-secondary leading-relaxed font-sora">
          <section>
            <h2 className="text-xl font-bold text-text-primary mb-3 font-sora">1. Acceptance of Terms</h2>
            <p>
              By accessing and using World Insights Hub (&quot;the Service&quot;), you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary mb-3 font-sora">2. Description of Service</h2>
            <p>
              World Insights Hub is a web-based platform that provides information about countries worldwide, including demographic data, geographic details, and interactive features such as quizzes and map exploration games. The data is sourced from public APIs, including the REST Countries API and World Bank Open Data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary mb-3 font-sora">3. Use of the Service</h2>
            <p>You agree to use the Service only for lawful purposes and in a way that does not infringe the rights of others or restrict their use and enjoyment of the Service. You must not:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1 text-muted">
              <li>Use the Service in any way that violates applicable laws or regulations</li>
              <li>Attempt to gain unauthorized access to the Service or its servers</li>
              <li>Use automated systems to access the Service without prior permission</li>
              <li>Collect personal data from the Service for commercial purposes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary mb-3 font-sora">4. Intellectual Property</h2>
            <p>
              The content, design, graphics, and code of the Service are protected by intellectual property laws. You may not reproduce, distribute, modify, or create derivative works from the Service without express written permission.
            </p>
            <p className="mt-2">
              Country data, flags, and demographic information displayed on the Service are sourced from third-party public APIs and are used under their respective terms of use.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary mb-3 font-sora">5. Data Accuracy</h2>
            <p>
              While we strive to provide accurate and up-to-date information, we make no warranties about the completeness, reliability, or accuracy of the data presented. All data is provided &quot;as is&quot; and may contain errors or become outdated.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary mb-3 font-sora">6. Third-Party Links and Content</h2>
            <p>
              The Service may contain links to third-party websites or services. We are not responsible for the content, privacy policies, or practices of any third-party websites. You access third-party links at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary mb-3 font-sora">7. Advertising</h2>
            <p>
              The Service may display advertisements provided by third-party advertising networks, including Google AdSense. These ads may use cookies and web beacons to deliver relevant content and measure ad performance. By using the Service, you consent to the use of advertising technologies as described in our Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary mb-3 font-sora">8. Limitation of Liability</h2>
            <p>
              World Insights Hub shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use the Service. This includes but is not limited to loss of data, accuracy of information, or interruption of service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary mb-3 font-sora">9. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. Continued use of the Service after changes constitutes acceptance of the new Terms. We encourage you to review this page periodically.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary mb-3 font-sora">10. Contact</h2>
            <p>
              If you have questions about these Terms of Service, please contact us at <Link href="/" className="text-cyan-glow hover:underline font-sora">our homepage</Link>.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
