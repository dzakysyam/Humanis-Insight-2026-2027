import { describe, expect, it } from 'vitest';
import { visibleNavGroups } from '../src/lib/navigation';

function allHrefs(roles: Parameters<typeof visibleNavGroups>[0]): string[] {
  return visibleNavGroups(roles).flatMap((group) => group.items.map((item) => item.href));
}

describe('navigasi berbasis role', () => {
  it('menampilkan 4 grup lengkap untuk Kepala Sekolah sesuai desain navbar', () => {
    const groups = visibleNavGroups(['KEPALA_SEKOLAH']).map((group) => group.key);
    expect(groups).toEqual([
      'UMUM',
      'PENGAWASAN & EVALUASI',
      'KONFIGURASI & MASTER DATA',
      'SISTEM',
    ]);

    const hrefs = allHrefs(['KEPALA_SEKOLAH']);
    expect(hrefs).toContain('/dashboard');
    expect(hrefs).toContain('/modul/tata_usaha');
    expect(hrefs).toContain('/modul/alumni');
    expect(hrefs).toContain('/modul/presta');
    expect(hrefs).toContain('/humanis/persetujuan');
    expect(hrefs).toContain('/humanis/monitoring');
    expect(hrefs).toContain('/humanis/master-bidang');
    expect(hrefs).toContain('/pengaturan');
    expect(hrefs).toContain('/humanis/master-kpi');
    expect(hrefs).toContain('/humanis/pengaturan-sistem');
    expect(hrefs).toContain('/modul');
  });

  it('tidak menampilkan Kelola User & Akses atau menu pimpinan kepada Guru, BK, atau TU', () => {
    expect(allHrefs(['ADMIN'])).toContain('/pengaturan');
    expect(allHrefs(['GURU'])).not.toContain('/pengaturan');
    expect(allHrefs(['GURU'])).not.toContain('/humanis/persetujuan');
    expect(allHrefs(['BK'])).not.toContain('/pengaturan');
    expect(allHrefs(['TATA_USAHA'])).not.toContain('/pengaturan');
  });

  it('membatasi role Siswa hanya ke Beranda Siswa', () => {
    const siswaHrefs = allHrefs(['SISWA']);
    expect(siswaHrefs).toEqual(['/siswa']);
    expect(siswaHrefs).not.toContain('/dashboard');
    expect(siswaHrefs).not.toContain('/modul');
    expect(siswaHrefs).not.toContain('/pengaturan');
  });
});
