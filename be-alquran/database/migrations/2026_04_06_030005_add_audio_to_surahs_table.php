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
        Schema::table('surahs', function (Blueprint $table) {
            $table->string('audio_url')->nullable()->after('revelation'); // URL audio murattal
            $table->string('reciter')->nullable()->after('audio_url'); // Nama qori
            $table->string('audio_duration')->nullable()->after('reciter'); // Durasi audio (HH:MM:SS)
            $table->integer('file_size')->nullable()->after('audio_duration'); // Ukuran file dalam bytes
            $table->string('audio_format')->default('mp3')->after('file_size'); // Format audio
            $table->boolean('has_audio')->default(false)->after('audio_format'); // Status audio tersedia
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('surahs', function (Blueprint $table) {
            $table->dropColumn([
                'audio_url',
                'reciter',
                'audio_duration',
                'file_size',
                'audio_format',
                'has_audio'
            ]);
        });
    }
};
