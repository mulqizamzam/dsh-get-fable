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
dsh plugin add mulqizamzam/dsh-get-fable
```

Untuk menambahkan plugin ke profil tertentu (contoh profil `web`):

```bash
dsh plugin --profile web add mulqizamzam/dsh-get-fable
```

Jika pemasangan berhasil, mulai ulang/reload profil DSH bila diminta oleh CLI. Perintah di atas memasang plugin dari repositori GitHub ini; tidak perlu memasang paket npm terpisah untuk menggunakan bundle DSH.

### Memasang dari salinan lokal (pengembangan)

```bash
git clone https://github.com/mulqizamzam/dsh-get-fable.git
cd dsh-get-fable
dsh plugin add .
```

Apabila CLI DSH pada versi Anda tidak menerima path lokal dalam bentuk tersebut, lihat `dsh plugin --help`. Proses build lokal dapat memerlukan Bun dan dependensi pengembangan; pengguna biasa sebaiknya memakai bundle rilis yang telah dibangun.

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

Port mempertahankan kategori workflow sumber: routing/lifecycle, discovery, riset berbasis sumber primer, perencanaan, TDD, eksekusi bertahap, verifikasi, review adversarial, keamanan, pemulihan dari kegagalan, arsitektur, delegasi, evaluasi, memori/konteks, artefak/dokumentasi, operasi proyek jangka panjang, dan release readiness. Lihat direktori `skills/` untuk katalog dan batas pemakaian tiap skill.

## Konfigurasi dan data

- State proyek, rencana, dan bukti sebaiknya disimpan pada workspace proyek yang tepat; jangan menganggap folder kerja terminal selalu sama dengan project root.
- Preview/rencana tidak boleh disamakan dengan perubahan yang sudah diterapkan.
- Bukti verifikasi menjadi usang setelah kode berubah; jalankan ulang tes yang relevan sesudah mutasi.
- Jangan memasukkan token, password, private key, atau data sensitif ke prompt, log, atau berkas contoh.
- Workflow security/red-team hanya dijalankan terhadap target yang Anda miliki atau secara eksplisit berwenang untuk diuji.

## Pemecahan masalah

1. **Perintah `dsh` tidak ditemukan** — pasang atau perbaiki instalasi DSH; plugin tidak memasang host DSH itu sendiri.
2. **Plugin tidak muncul** — jalankan `dsh plugin --help`, pastikan repositori ditambahkan ke profil yang benar, lalu reload DSH.
3. **UI atau endpoint plugin gagal** — periksa log DSH, versi harness, dan kelengkapan bundle; jangan menganggap plugin aktif hanya karena instalasi selesai.
4. **Skill tidak dijalankan otomatis** — sebutkan tugas/workflow secara eksplisit; perilaku pemilihan skill bergantung pada host dan konteks prompt.
5. **Versi lain dari DSH** — jangan menganggap kompatibilitas otomatis; verifikasi pada versi yang dipakai.

## Lisensi dan asal

Port ini diturunkan dari [imMamdouhaboammar/get-fable](https://github.com/imMamdouhaboammar/get-fable). Periksa berkas `LICENSE` dan pertahankan pemberitahuan lisensi/hak cipta saat mendistribusikan perubahan. Proyek ini merupakan port komunitas dan tidak menyatakan afiliasi resmi dengan DeepSeek.

## Pengembangan

Lihat `docs/PORTING.md` untuk keputusan port, target versi harness, komponen yang dipertahankan, batasan, serta status validasi. Untuk perubahan plugin, lakukan validasi format manifest, struktur bundle, katalog skill, dan smoke test pada DSH `0.2.1-rc.2` sebelum menyatakan port siap produksi.
