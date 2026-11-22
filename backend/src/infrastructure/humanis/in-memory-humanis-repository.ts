import { randomUUID } from 'node:crypto';
import type {
  ExecutiveReflection,
  HumanisField,
  HumanisKpi,
  HumanisPeriod,
  HumanisRepository,
  HumanisSubmission,
  SchoolProfile,
} from '../../application/humanis/ports/humanis-repository-port';

/**
 * Penyimpanan in-memory Humanis Insight dengan Data Demo sintetis.
 *
 * shortcut: data kembali ke seed saat server restart selama DATABASE_URL belum
 * terhubung ke migrasi tabel Humanis di PostgreSQL.
 */
export class InMemoryHumanisRepository implements HumanisRepository {
  private periods: HumanisPeriod[] = [
    {
      id: 'period-2026-2027-ganjil',
      academicYear: '2026/2027',
      semester: 'GANJIL',
      label: 'Tahun Ajaran 2026/2027 - Semester Ganjil',
      isActive: true,
    },
    {
      id: 'period-2026-2027-genap',
      academicYear: '2026/2027',
      semester: 'GENAP',
      label: 'Tahun Ajaran 2026/2027 - Semester Genap',
      isActive: false,
    },
  ];

  private fields: HumanisField[] = [
    { id: 'field-kurikulum', code: 'KUR', name: 'Kurikulum' },
    { id: 'field-kesiswaan', code: 'KES', name: 'Kesiswaan' },
    { id: 'field-bk', code: 'BK', name: 'Bimbingan dan Konseling' },
    { id: 'field-tu', code: 'TU', name: 'Tata Usaha' },
    { id: 'field-sarpras', code: 'SRP', name: 'Sarpras' },
    { id: 'field-hubin', code: 'HBN', name: 'Hubungan Industri' },
    { id: 'field-branding', code: 'BRD', name: 'Branding' },
    { id: 'field-lab', code: 'LAB', name: 'Laboratorium' },
  ];

  private kpis: HumanisKpi[] = [
    {
      id: 'kpi-demo-1',
      fieldId: 'field-kurikulum',
      periodId: 'period-2026-2027-ganjil',
      title: 'Kelengkapan perangkat ajar dan modul proyek kelas XI (Data Demo)',
      weightPercent: 30,
      targetOperator: '>=',
      targetValue: 90,
      unit: '%',
      priority: 'P1',
      frequency: 'BULANAN',
      picUserId: 'demo-user-guru',
      picDisplayName: 'Demo Guru',
    },
    {
      id: 'kpi-demo-2',
      fieldId: 'field-kurikulum',
      periodId: 'period-2026-2027-ganjil',
      title: 'Pelaksanaan supervisi pembelajaran dan umpan balik siswa (Data Demo)',
      weightPercent: 25,
      targetOperator: '>=',
      targetValue: 85,
      unit: '%',
      priority: 'P2',
      frequency: 'SEMESTER',
      picUserId: 'demo-user-guru',
      picDisplayName: 'Demo Guru',
    },
    {
      id: 'kpi-demo-3',
      fieldId: 'field-bk',
      periodId: 'period-2026-2027-ganjil',
      title: 'Tindak lanjut layanan konseling dan pemetaan minat siswa (Data Demo)',
      weightPercent: 25,
      targetOperator: '>=',
      targetValue: 95,
      unit: '%',
      priority: 'P1',
      frequency: 'BULANAN',
      picUserId: 'demo-user-bk',
      picDisplayName: 'Demo Bimbingan Konseling',
    },
    {
      id: 'kpi-demo-4',
      fieldId: 'field-tu',
      periodId: 'period-2026-2027-ganjil',
      title: 'Ketepatan rekapitulasi administrasi bulanan tata usaha (Data Demo)',
      weightPercent: 20,
      targetOperator: '=',
      targetValue: 100,
      unit: '%',
      priority: 'P1',
      frequency: 'BULANAN',
      picUserId: 'demo-user-tata-usaha',
      picDisplayName: 'Demo Tata Usaha',
    },
  ];

  private submissions: HumanisSubmission[] = [
    {
      id: 'sub-demo-1',
      kpiId: 'kpi-demo-1',
      fieldId: 'field-kurikulum',
      periodId: 'period-2026-2027-ganjil',
      authorUserId: 'demo-user-guru',
      authorName: 'Demo Guru',
      progressPercent: 75,
      humanisValue: 'UNGGUL',
      evidenceUrl: null,
      evidenceLabel: 'Berkas contoh perangkat ajar (Data Demo)',
      reflection: 'Sebagian besar modul ajar sudah disusun; dua topik proyek masih difinalisasi.',
      followUpPlan: 'Menyelesaikan modul proyek bersama tim mata pelajaran pada pekan depan.',
      status: 'MENUNGGU_VALIDASI',
      reviewNote: null,
      reviewedByName: null,
      reviewedAt: null,
      submittedAt: '2026-11-18T08:30:00.000Z',
      isDemo: true,
    },
    {
      id: 'sub-demo-2',
      kpiId: 'kpi-demo-3',
      fieldId: 'field-bk',
      periodId: 'period-2026-2027-ganjil',
      authorUserId: 'demo-user-bk',
      authorName: 'Demo Bimbingan Konseling',
      progressPercent: 100,
      humanisValue: 'NYAMAN',
      evidenceUrl: null,
      evidenceLabel: 'Rekap layanan konseling bulanan (Data Demo)',
      reflection: 'Seluruh sesi konseling terjadwal terlaksana dengan partisipasi aktif wali kelas.',
      followUpPlan: 'Menjadwalkan pemantauan lanjutan untuk siswa kelas XII menjelang ujian.',
      status: 'DISETUJUI',
      reviewNote: 'Pelaksanaan sudah rapi dan terdokumentasi dengan baik.',
      reviewedByName: 'Demo Kepala Sekolah',
      reviewedAt: '2026-11-19T09:15:00.000Z',
      submittedAt: '2026-11-17T10:00:00.000Z',
      isDemo: true,
    },
    {
      id: 'sub-demo-3',
      kpiId: 'kpi-demo-4',
      fieldId: 'field-tu',
      periodId: 'period-2026-2027-ganjil',
      authorUserId: 'demo-user-tata-usaha',
      authorName: 'Demo Tata Usaha',
      progressPercent: 50,
      humanisValue: 'AKSES_TERBUKA',
      evidenceUrl: null,
      evidenceLabel: 'Draf rekap arsip bulanan (Data Demo)',
      reflection: 'Masih menunggu kelengkapan dokumen pendukung dari dua bidang.',
      followUpPlan: 'Melakukan koordinasi pengumpulan berkas sebelum penutupan bulan.',
      status: 'PERLU_REVISI',
      reviewNote: 'Lengkapi rincian lampiran berkas sebelum diajukan kembali.',
      reviewedByName: 'Demo Kepala Sekolah',
      reviewedAt: '2026-11-20T07:45:00.000Z',
      submittedAt: '2026-11-16T11:20:00.000Z',
      isDemo: true,
    },
  ];

  private reflections = new Map<string, ExecutiveReflection>([
    [
      'period-2026-2027-ganjil',
      {
        periodId: 'period-2026-2027-ganjil',
        summary:
          'Catatan Demo: Prioritaskan penyelesaian perangkat ajar dan kelengkapan arsip bulanan sebelum evaluasi akhir semester.',
        updatedByName: 'Demo Kepala Sekolah',
        updatedAt: '2026-11-20T10:00:00.000Z',
      },
    ],
  ]);

  private schoolProfile: SchoolProfile = {
    schoolName: 'SMK Tiara Nusa One',
    address: 'Alamat sekolah contoh (Data Demo)',
    principalName: 'Demo Kepala Sekolah',
    reportHeaderNote: 'Laporan Kinerja Internal Berbasis Nilai HUMANIS (Data Demo)',
    updatedAt: '2026-11-20T10:00:00.000Z',
  };

  async listPeriods(): Promise<readonly HumanisPeriod[]> {
    return [...this.periods];
  }

  async createPeriod(input: {
    readonly academicYear: string;
    readonly semester: 'GANJIL' | 'GENAP';
  }): Promise<HumanisPeriod> {
    const labelSemester = input.semester === 'GANJIL' ? 'Semester Ganjil' : 'Semester Genap';
    const created: HumanisPeriod = {
      id: `period-${randomUUID().slice(0, 8)}`,
      academicYear: input.academicYear,
      semester: input.semester,
      label: `Tahun Ajaran ${input.academicYear} - ${labelSemester}`,
      isActive: false,
    };
    this.periods = [...this.periods, created];
    return created;
  }

  async activatePeriod(periodId: string): Promise<HumanisPeriod | null> {
    const exists = this.periods.some((p) => p.id === periodId);
    if (!exists) {
      return null;
    }
    this.periods = this.periods.map((period) => ({
      ...period,
      isActive: period.id === periodId,
    }));
    return this.periods.find((p) => p.id === periodId) ?? null;
  }

  async deletePeriod(periodId: string): Promise<boolean> {
    const before = this.periods.length;
    this.periods = this.periods.filter((p) => p.id !== periodId);
    return this.periods.length < before;
  }

  async listFields(): Promise<readonly HumanisField[]> {
    return [...this.fields];
  }

  async createField(input: { readonly code: string; readonly name: string }): Promise<HumanisField> {
    const created: HumanisField = {
      id: `field-${randomUUID().slice(0, 8)}`,
      code: input.code,
      name: input.name,
    };
    this.fields = [...this.fields, created];
    return created;
  }

  async updateField(
    fieldId: string,
    input: { readonly code: string; readonly name: string },
  ): Promise<HumanisField | null> {
    const index = this.fields.findIndex((f) => f.id === fieldId);
    if (index === -1) {
      return null;
    }
    const updated: HumanisField = { id: fieldId, code: input.code, name: input.name };
    this.fields = [...this.fields.slice(0, index), updated, ...this.fields.slice(index + 1)];
    return updated;
  }

  async deleteField(fieldId: string): Promise<boolean> {
    const before = this.fields.length;
    this.fields = this.fields.filter((f) => f.id !== fieldId);
    return this.fields.length < before;
  }

  async listKpis(periodId?: string): Promise<readonly HumanisKpi[]> {
    return periodId ? this.kpis.filter((kpi) => kpi.periodId === periodId) : [...this.kpis];
  }

  async findKpiById(kpiId: string): Promise<HumanisKpi | null> {
    return this.kpis.find((kpi) => kpi.id === kpiId) ?? null;
  }

  async createKpi(input: Omit<HumanisKpi, 'id'>): Promise<HumanisKpi> {
    const created: HumanisKpi = {
      ...input,
      id: `kpi-${randomUUID().slice(0, 8)}`,
    };
    this.kpis = [...this.kpis, created];
    return created;
  }

  async updateKpi(kpiId: string, input: Omit<HumanisKpi, 'id'>): Promise<HumanisKpi | null> {
    const index = this.kpis.findIndex((k) => k.id === kpiId);
    if (index === -1) {
      return null;
    }
    const updated: HumanisKpi = { ...input, id: kpiId };
    this.kpis = [...this.kpis.slice(0, index), updated, ...this.kpis.slice(index + 1)];
    return updated;
  }

  async deleteKpi(kpiId: string): Promise<boolean> {
    const before = this.kpis.length;
    this.kpis = this.kpis.filter((k) => k.id !== kpiId);
    return this.kpis.length < before;
  }

  async listSubmissions(periodId?: string): Promise<readonly HumanisSubmission[]> {
    const items = periodId
      ? this.submissions.filter((sub) => sub.periodId === periodId)
      : [...this.submissions];
    return items.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  }

  async findSubmissionById(submissionId: string): Promise<HumanisSubmission | null> {
    return this.submissions.find((sub) => sub.id === submissionId) ?? null;
  }

  async createSubmission(input: Omit<HumanisSubmission, 'id'>): Promise<HumanisSubmission> {
    const created: HumanisSubmission = {
      ...input,
      id: `sub-${randomUUID().slice(0, 8)}`,
    };
    this.submissions = [created, ...this.submissions];
    return created;
  }

  async reviewSubmission(input: {
    readonly submissionId: string;
    readonly status: 'DISETUJUI' | 'PERLU_REVISI';
    readonly reviewNote: string;
    readonly reviewedByName: string;
    readonly reviewedAt: string;
  }): Promise<HumanisSubmission | null> {
    const index = this.submissions.findIndex((sub) => sub.id === input.submissionId);
    if (index === -1) {
      return null;
    }
    const updated: HumanisSubmission = {
      ...this.submissions[index]!,
      status: input.status,
      reviewNote: input.reviewNote || null,
      reviewedByName: input.reviewedByName,
      reviewedAt: input.reviewedAt,
    };
    this.submissions = [
      ...this.submissions.slice(0, index),
      updated,
      ...this.submissions.slice(index + 1),
    ];
    return updated;
  }

  async getExecutiveReflection(periodId: string): Promise<ExecutiveReflection | null> {
    return this.reflections.get(periodId) ?? null;
  }

  async saveExecutiveReflection(input: ExecutiveReflection): Promise<ExecutiveReflection> {
    this.reflections.set(input.periodId, input);
    return input;
  }

  async getSchoolProfile(): Promise<SchoolProfile> {
    return { ...this.schoolProfile };
  }

  async updateSchoolProfile(input: SchoolProfile): Promise<SchoolProfile> {
    this.schoolProfile = { ...input };
    return { ...this.schoolProfile };
  }
}
