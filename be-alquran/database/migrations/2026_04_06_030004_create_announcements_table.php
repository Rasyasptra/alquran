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
        Schema::create('announcements', function (Blueprint $table) {
            $table->id();
            $table->string('title'); // Judul pengumuman
            $table->text('content'); // Isi pengumuman
            $table->enum('priority', ['high', 'medium', 'low'])->default('medium'); // Prioritas
            $table->date('start_date'); // Tanggal mulai tayang
            $table->date('end_date')->nullable(); // Tanggal selesai tayang
            $table->string('image_url')->nullable(); // URL gambar
            $table->string('link_url')->nullable(); // URL link tambahan
            $table->boolean('is_active')->default(true); // Status aktif
            $table->integer('views')->default(0); // Jumlah dilihat
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('announcements');
    }
};
