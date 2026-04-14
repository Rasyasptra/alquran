<?php

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
        Schema::create('mosque_info', function (Blueprint $table) {
            $table->id();
            $table->string('name');              // Nama mesjid
            $table->text('address')->nullable(); // Alamat lengkap
            $table->string('phone')->nullable(); // Kontak telepon
            $table->string('email')->nullable(); // Email
            $table->decimal('latitude', 10, 8)->nullable(); // Latitude untuk hitung jadwal sholat
            $table->decimal('longitude', 11, 8)->nullable(); // Longitude untuk hitung jadwal sholat
            $table->string('timezone')->default('Asia/Jakarta'); // Zona waktu
            $table->text('description')->nullable(); // Deskripsi mesjid
            $table->string('logo_url')->nullable(); // URL logo mesjid
            $table->string('website_url')->nullable(); // Website mesjid
            $table->string('social_media')->nullable(); // Social media links (JSON)
            $table->boolean('is_active')->default(true); // Status aktif
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mosque_info');
    }
};
