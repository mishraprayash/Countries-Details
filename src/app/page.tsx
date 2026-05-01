import { getAllCountries } from "@/lib/api";
import DashboardContent from "@/components/DashboardContent";

export default async function DashboardPage() {
  const countries = await getAllCountries();

  return (
    <main className="flex-1 pb-24 bg-zinc-950 text-zinc-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 sm:py-12">
        <DashboardContent countries={countries} />
      </div>
    </main>
  );
}
