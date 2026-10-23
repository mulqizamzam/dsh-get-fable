# DSH Get Fable

**Port DeepSeek-native dari workflow engineering dan produktivitas get-fable** untuk DeepSeek Harness (DSH), dengan target kompatibilitas **DSH `0.2.1-rc.2`**.

Plugin ini membantu coding agent bekerja lebih disiplin: menemukan jalur eksekusi sebelum mengubah kode, merencanakan langkah, memakai TDD, memverifikasi perubahan dengan bukti terbaru, meninjau diff, menyelidiki kegagalan berulang, mengelola keamanan, dan menyiapkan rilis. Plugin tidak mengganti model DeepSeek atau menjamin hasil tertentu.

> Status: port komunitas/prarilis. Target harness ditetapkan ke DSH `0.2.1-rc.2`; validasi runtime perlu dijalankan pada instalasi DSH sungguhan sebelum dipakai untuk pekerjaan penting.

## Untuk pemula

### Apa itu?

- **DeepSeek Harness (DSH)** adalah host yang menjalankan plugin.
- **get-fable** adalah kumpulan alur kerja/skill yang memberi agent langkah kerja dan gerbang verifikasi.
- Plugin ini membawa alur kerja tersebut ke DSH. Instruksi skill bukan izin otomatis untuk menjalankan command, mengakses file, atau melakukan tindakan destruktif; agent tetap harus memakai kemampuan yang benar-benar tersedia dan meminta persetujuan saat diperlukan.

## Cara memasang di DSH

### Prasyarat

1. Pasang DSH terlebih dahulu dan pastikan perintah `dsh` tersedia di terminal.
2. Gunakan versi harness yang dituju, **`0.2.1-rc.2`**.
3. Periksa bantuan CLI bila sintaks pada versi DSH Anda berbeda: `dsh plugin --help`.

### Instalasi dari GitHub

Jalankan di terminal:

```bash
dsh plugin add "github:mulqizamzam/dsh-get-fable#main"
```

Untuk menambahkan plugin ke profil tertentu (contoh profil `web`):

```bash
dsh plugin --profile web add "github:mulqizamzam/dsh-get-fable#main"
```

Jika pemasangan berhasil, mulai ulang/reload profil DSH bila diminta oleh CLI. Perintah ini memasang paket GitHub pada branch `main`. Paket memakai manifest `package.json` native DSH dan menargetkan DSH `0.2.1-rc.2`; dashboard upstream dan layanan REST tidak termasuk dalam port ini. Untuk deployment yang membutuhkan commit yang tetap, ganti `#main` dengan hash commit yang sudah Anda tinjau.

### Memasang dari salinan lokal (pengembangan)

```bash
git clone https://github.com/mulqizamzam/dsh-get-fable.git
cd dsh-get-fable
dsh plugin add .
```

Apabila CLI DSH pada versi Anda tidak menerima path lokal dalam bentuk tersebut, lihat `dsh plugin --help`. Port skill-only ini tidak memerlukan proses kompilasi UI; Node.js digunakan untuk menjalankan entry point plugin.

## Cara menggunakan

Setelah plugin aktif, beri agent tugas seperti biasa. Minta workflow tertentu secara eksplisit saat ingin hasil lebih terarah.

### Contoh permintaan

**Memperbaiki bug dengan TDD**
```text
Perbaiki race condition pada refresh token. Temukan jalur eksekusi yang sebenarnya,
buat tes regresi yang gagal karena alasan yang benar, lakukan perubahan terkecil,
lalu jalankan verifikasi baru dan tinjau diff.
```

**Merencanakan fitur**
```text
Rencanakan fitur ekspor CSV. Petakan dependensi dan risiko, pecah menjadi kartu kerja
yang bisa diverifikasi, lalu tunggu persetujuan sebelum mengubah file.
```

**Menyelidiki kegagalan berulang**
```text
Tes masih gagal setelah beberapa percobaan. Hentikan perubahan spekulatif,
urutkan hipotesis penyebab, usulkan probe yang membedakan hipotesis, dan baru
lakukan satu perbaikan terarah setelah ada bukti.
```

**Audit keamanan**
```text
Tinjau perubahan ini dengan menelusuri input yang tidak tepercaya melewati batas
keamanan. Laporkan temuan yang bisa dibuktikan, dampak, dan bukti reproduksinya.
Jangan mengklaim sistem aman hanya karena satu scanner lolos.
```

**Menyiapkan rilis**
```text
Audit kesiapan rilis. Pastikan tes dan artefak distribusi saat ini benar-benar
terverifikasi, working tree bersih, versi konsisten, dan bedakan siap rilis
dari sudah dipublikasikan.
```

### Alur kerja yang disediakan

Port ini membawa **46 skill canonical** dari katalog sumber ke direktori `skills/`, termasuk lifecycle routing, discovery, riset, planning, TDD, bounded execution, verification, recovery, review/security, test engineering, release readiness, handoff, evaluasi, learning, arsitektur, delegasi, pengelolaan konteks, artefak, dan workflow produktivitas. Skill diiklankan melalui registry skill native DSH dan dimuat on-demand. Catatan port di `docs/PORTING.md` memisahkan workflow yang dipertahankan dari layanan upstream yang belum direplikasi.

## Konfigurasi dan data

- State proyek, rencana, dan bukti sebaiknya disimpan pada workspace proyek yang tepat; jangan menganggap folder kerja terminal selalu sama dengan project root.
- Preview/rencana tidak boleh disamakan dengan perubahan yang sudah diterapkan.
- Bukti verifikasi menjadi usang setelah kode berubah; jalankan ulang tes yang relevan sesudah mutasi.
- Jangan memasukkan token, password, private key, atau data sensitif ke prompt, log, atau berkas contoh.
- Workflow security/red-team hanya dijalankan terhadap target yang Anda miliki atau secara eksplisit berwenang untuk diuji.

## Pemecahan masalah

1. **Perintah `dsh` tidak ditemukan** — pasang atau perbaiki instalasi DSH; plugin tidak memasang host DSH itu sendiri.
2. **Plugin tidak muncul** — jalankan `dsh plugin --help`, pastikan repositori ditambahkan ke profil yang benar, lalu reload DSH.
3. **Mencari dashboard atau endpoint REST** — UI dashboard dan endpoint `/api/fable/*` upstream belum termasuk port ini. Port saat ini menyediakan katalog dan instruksi skill melalui mekanisme skill native DSH.
4. **Skill tidak dijalankan otomatis** — sebutkan tugas/workflow secara eksplisit; perilaku pemilihan skill bergantung pada host dan konteks prompt.
5. **Versi lain dari DSH** — jangan menganggap kompatibilitas otomatis; verifikasi pada versi yang dipakai.

## Lisensi dan asal

Port ini diturunkan dari [imMamdouhaboammar/get-fable](https://github.com/imMamdouhaboammar/get-fable). Periksa berkas `LICENSE` dan pertahankan pemberitahuan lisensi/hak cipta saat mendistribusikan perubahan. Proyek ini merupakan port komunitas dan tidak menyatakan afiliasi resmi dengan DeepSeek.

## Pengembangan

Lihat `docs/PORTING.md` untuk keputusan port, target versi harness, komponen yang dipertahankan, batasan, serta status validasi. Untuk perubahan plugin, lakukan validasi format manifest, struktur bundle, katalog skill, dan smoke test pada DSH `0.2.1-rc.2` sebelum menyatakan port siap produksi.
