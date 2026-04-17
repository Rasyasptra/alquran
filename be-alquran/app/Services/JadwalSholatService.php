<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class JadwalSholatService
{
    protected string $apiUrl;
    protected string $provinsi;
    protected string $kabkota;
    protected int $timeout;

    public function __construct()
    {
        $this->apiUrl   = env('PRAYER_API_URL', 'https://equran.id/api/v2/shalat');
        $this->provinsi = env('PRAYER_PROVINSI', 'Jawa Barat');
        $this->kabkota  = env('PRAYER_KABKOTA', 'Kota Bandung');
        $this->timeout  = (int) env('PRAYER_API_TIMEOUT', 10);
    }

    /**
     * Ambil jadwal sholat bulanan.
     * Di-cache selama 1 hari (86400 detik).
     */
    public function getMonthSchedule(int $month, int $year): array
    {
        $cacheKey = sprintf(
            'prayer_schedule:%s:%s:%04d-%02d',
            str_replace(' ', '_', strtolower($this->provinsi)),
            str_replace(' ', '_', strtolower($this->kabkota)),
            $year,
            $month
        );

        return Cache::remember($cacheKey, 86400, function () use ($month, $year) {
            Log::info("[JadwalSholat] Fetching from API eQuran.id", [
                'provinsi' => $this->provinsi,
                'kabkota'  => $this->kabkota,
                'bulan'    => $month,
                'tahun'    => $year,
            ]);
            return $this->fetchFromApi($month, $year);
        });
    }

    /**
     * Ambil jadwal sholat hari ini.
     */
    public function getTodaySchedule(): ?array
    {
        $now   = now();
        $month = (int) $now->format('m');
        $year  = (int) $now->format('Y');
        $today = $now->format('Y-m-d');

        $schedules = $this->getMonthSchedule($month, $year);

        foreach ($schedules as $schedule) {
            if (($schedule['tanggal_lengkap'] ?? '') === $today) {
                return $schedule;
            }
        }

        return null;
    }

    /**
     * Getter untuk provinsi (ditampilkan di response).
     */
    public function getProvinsi(): string
    {
        return $this->provinsi;
    }

    /**
     * Getter untuk kabkota (ditampilkan di response).
     */
    public function getKabkota(): string
    {
        return $this->kabkota;
    }

    /**
     * Panggil API eQuran.id dan kembalikan array jadwal.
     *
     * @throws Exception
     */
    protected function fetchFromApi(int $month, int $year): array
    {
        try {
            $response = Http::timeout($this->timeout)
                ->post($this->apiUrl, [
                    'provinsi' => $this->provinsi,
                    'kabkota'  => $this->kabkota,
                    'bulan'    => $month,
                    'tahun'    => $year,
                ]);

            if (!$response->successful()) {
                throw new Exception(
                    "API eQuran.id mengembalikan status {$response->status()}. " .
                    "Pastikan nama provinsi dan kabupaten/kota sudah benar."
                );
            }

            $body = $response->json();

            if (!isset($body['data']['jadwal']) || !is_array($body['data']['jadwal'])) {
                throw new Exception(
                    "Format response API eQuran.id tidak valid. " .
                    "Periksa konfigurasi PRAYER_PROVINSI dan PRAYER_KABKOTA di file .env."
                );
            }

            return $body['data']['jadwal'];

        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error("[JadwalSholat] Gagal terhubung ke API eQuran.id: " . $e->getMessage());
            throw new Exception(
                "Gagal terhubung ke layanan jadwal sholat (eQuran.id). " .
                "Periksa koneksi internet server Anda dan coba beberapa saat lagi."
            );
        } catch (Exception $e) {
            Log::error("[JadwalSholat] Error: " . $e->getMessage());
            throw $e;
        }
    }
}
