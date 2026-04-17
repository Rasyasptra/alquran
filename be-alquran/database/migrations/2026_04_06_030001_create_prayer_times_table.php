<?php

/**
 * DEPRECATED — 2026-04-16
 *
 * Migration ini tidak lagi digunakan secara aktif.
 * Jadwal sholat kini diambil dari API eksternal eQuran.id
 * melalui App\Services\JadwalSholatService (di-cache 1 hari).
 *
 * Table `prayer_times` di database dibiarkan untouched untuk menghindari
 * kerusakan pada data lama. Hapus migration ini hanya jika Anda yakin
 * tidak ada data penting di table tersebut dan sudah menjalankan rollback.
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('prayer_times', function (Blueprint $table) {
            $table->id();
            $table->date('date')->unique(); // Tanggal
            $table->time('fajr'); // Waktu Subuh
            $table->time('dhuhr'); // Waktu Dzuhur
            $table->time('asr'); // Waktu Ashar
            $table->time('maghrib'); // Waktu Maghrib
            $table->time('isha'); // Waktu Isya
            $table->time('fajr_iqama')->nullable(); // Waktu Iqamah Subuh
            $table->time('dhuhr_iqama')->nullable(); // Waktu Iqamah Dzuhur
            $table->time('asr_iqama')->nullable(); // Waktu Iqamah Ashar
            $table->time('maghrib_iqama')->nullable(); // Waktu Iqamah Maghrib
            $table->time('isha_iqama')->nullable(); // Waktu Iqamah Isya
            $table->string('hijri_date')->nullable(); // Tanggal Hijriah
            $table->string('month')->nullable(); // Bulan Hijriah
            $table->string('year')->nullable(); // Tahun Hijriah
            $table->boolean('is_ramadan')->default(false); // Status Ramadhan
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('prayer_times');
    }
};
