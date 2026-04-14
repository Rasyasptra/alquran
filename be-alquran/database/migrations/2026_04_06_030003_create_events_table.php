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
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->string('title'); // Judul acara
            $table->text('description')->nullable(); // Deskripsi acara
            $table->string('speaker_name')->nullable(); // Nama penceramah
            $table->string('speaker_title')->nullable(); // Gelar penceramah
            $table->datetime('start_datetime'); // Waktu mulai
            $table->datetime('end_datetime')->nullable(); // Waktu selesai
            $table->string('location')->nullable(); // Lokasi acara
            $table->enum('type', ['kajian', 'pengajian', 'tarawih', 'idul_fitri', 'idul_adha', 'lainnya'])->default('kajian'); // Jenis acara
            $table->boolean('is_recurring')->default(false); // Berulang mingguan
            $table->string('recurring_day')->nullable(); // Hari berulang (senin, selasa, dll)
            $table->string('poster_url')->nullable(); // URL poster acara
            $table->string('streaming_url')->nullable(); // URL streaming
            $table->integer('max_participants')->nullable(); // Maksimal peserta
            $table->boolean('is_active')->default(true); // Status aktif
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
