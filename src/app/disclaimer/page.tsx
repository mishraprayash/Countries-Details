import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Disclaimer | World Insights",
  description: "Disclaimer for World Insights Hub.",
};

export default function DisclaimerPage() {
  return (
    <main className="flex-1 bg-zinc-950 text-zinc-50">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="text-3xl font-black text-white sm:text-4xl mb-8">Disclaimer</h1>
        <p className="text-sm text-zinc-500 mb-8">Last updated: May 1, 2026</p>

        <div className="space-y-8 text-zinc-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. General Disclaimer</h2>
            <p>
              The information provided on World Insights Hub is for general informational and educational purposes only. While we make reasonable efforts to ensure the accuracy and timeliness of the information on the Service, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability of the information, products, services, or related graphics contained on the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Data Sources</h2>
            <p>
              All demographic, geographic, and statistical data displayed on World Insights Hub is sourced from publicly available third-party APIs, including but not limited to the REST Countries API (restcountries.com) and the World Bank Open Data platform (data.worldbank.org). We do not own or control the underlying data and cannot guarantee its accuracy, completeness, or timeliness.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Not Professional Advice</h2>
            <p>
              The information on this Service does not constitute professional, legal, financial, or travel advice. Any reliance you place on such information is strictly at your own risk. Always consult with qualified professionals before making decisions based on data presented on this Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. External Links</h2>
            <p>
              World Insights Hub may contain links to external websites that are not operated by us. We have no control over the content and practices of these websites and accept no responsibility for them. Visiting linked websites is done at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Affiliate Disclosure</h2>
            <p>
              Some links on this Service may be affiliate links, meaning we may earn a commission if you click through and make a purchase, at no additional cost to you.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Changes to This Disclaimer</h2>
            <p>
              We reserve the right to update or modify this Disclaimer at any time without prior notice. Continued use of the Service constitutes acceptance of any changes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Contact</h2>
            <p>
              If you have any questions about this Disclaimer, please contact us at <Link href="/" className="text-blue-400 hover:underline">our homepage</Link>.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
