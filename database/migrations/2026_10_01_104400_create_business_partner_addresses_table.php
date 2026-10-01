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
        Schema::create('business_partner_addresses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('business_partner_id')->constrained('business_partners')->cascadeOnDelete();
            $table->string('address_type')->default('main');
            $table->string('line_1');
            $table->string('line_2')->nullable();
            $table->string('city');
            $table->string('state')->nullable();
            $table->string('postal_code')->nullable();
            $table->string('country_code', 2);
            $table->boolean('is_primary')->default(false);
            $table->timestamps();

            $table->index(['business_partner_id', 'is_primary']);
            $table->index('address_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('business_partner_addresses');
    }
};
