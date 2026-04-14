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
        Schema::create('daily_prayers', function (Blueprint $table) {
            $table->id();
            $table->string('category'); // Kategori: doa_adzan, doa_makan, doa_pagi, doa_petang, dll
            $table->string('title_ar'); // Judul dalam bahasa Arab
            $table->string('title_id'); // Judul dalam bahasa Indonesia
            $table->text('arabic_text'); // Teks doa dalam bahasa Arab
            $table->text('latin_text')->nullable(); // Teks doa dalam latin
            $table->text('translation_id'); // Terjemahan dalam bahasa Indonesia
            $table->text('source')->nullable(); // Sumber doa (HR. Bukhari, dll)
            $table->string('audio_url')->nullable(); // URL audio doa
            $table->integer('order')->default(0); // Urutan tampilan
            $table->boolean('is_active')->default(true); // Status aktif
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('daily_prayers');
    }
};
