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
        Schema::create('mosque_staff_schedules', function (Blueprint $table) {
            $table->id();
            $table->date('date')->unique();
            $table->string('imam')->nullable();
            $table->string('bilal')->nullable();
            $table->string('muadzin')->nullable();
            $table->string('penceramah')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mosque_staff_schedules');
    }
};
