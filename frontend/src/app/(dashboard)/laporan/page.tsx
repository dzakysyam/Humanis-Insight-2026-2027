import { listAccessibleModules, listModuleRegistry, MODULE_LABELS } from '@humanis/backend';
import { PageHeader, Panel } from '@/components/ui/page-header';
import { PeriodSelector } from '@/components/reporting/period-selector';
import { getCurrentUser } from '@/lib/server/session';
import { getServices } from '@/lib/server/services';

/**
 * Pusat Laporan.
 *
 * Kerangka antarmuka untuk pelaporan bulanan, per semester, dan tahunan.
 * Pemilih modul dibatasi oleh role pengguna. Belum ada angka laporan
 * karena data modul belum tersedia.
 */
export default async function LaporanPage() {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  const services = getServices();
  const accessible = listAccessibleModules(user.roles);
  const registry = listModuleRegistry().filter((entry) => accessible.includes(entry.key));

  const now = new Date();
  const periods = services.listReportingPeriods.execute({
    calendarYear: now.getFullYear(),
    academicYear: `${now.getFullYear()}/${now.getFullYear() + 1}`,
  });

  return (
    <>
      <PageHeader
        title="Pusat Laporan"
        description="Pelaporan berkala untuk modul yang dapat diakses Anda. Periode semester dan tahunan mengikuti tahun ajaran, bukan tahun kalender."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel
          title="Pemilih periode"
          description="Frekuensi dan periode laporan."
          className="lg:col-span-2"
        >
          <PeriodSelector
            periods={periods.map((period) => ({
              key: period.key,
              kind: period.kind,
              label: period.label,
              provisional: period.provisional,
            }))}
          />
        </Panel>

        <Panel title="Modul pelapor" description="Hanya modul sesuai akses Anda.">
          {registry.length === 0 ? (
            <p className="text-sm text-muted">Belum ada modul yang dapat diakses pada role ini.</p>
          ) : (
            <ul className="space-y-2">
              {registry.map((entry) => (
                <li key={entry.key} className="text-sm text-ink">
                  {MODULE_LABELS[entry.key]}
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 text-sm text-muted">
            Belum ada laporan per modul. Modul belum mengirim ringkasan ke pusat monitoring.
          </p>
        </Panel>
      </div>
    </>
  );
}
