<?php

use App\Models\Rol;
use App\Models\User;
use Illuminate\Http\UploadedFile;

function adminUser(): User
{
    $adminRol = Rol::factory()->create([
        'code' => 'admin',
        'name' => 'Administrador',
    ]);

    return User::factory()->create([
        'rol_id' => $adminRol->id,
    ]);
}

function nonAdminUser(): User
{
    $userRol = Rol::factory()->create([
        'code' => 'user',
        'name' => 'Usuari',
    ]);

    return User::factory()->create([
        'rol_id' => $userRol->id,
    ]);
}

it('shows the roles page for authenticated users', function () {
    $user = adminUser();

    $response = $this->actingAs($user)->get(route('rols.index'));

    $response->assertOk();
});

it('forbids non-admin users from seeing roles page', function () {
    $user = nonAdminUser();

    $response = $this->actingAs($user)->get(route('rols.index'));

    $response->assertForbidden();
});

it('creates a role', function () {
    $user = adminUser();

    $response = $this->actingAs($user)->post(route('rols.store'), [
        'code' => 'editor',
        'name' => 'Editor',
        'description' => 'Permisos complets',
    ]);

    $response->assertRedirect(route('rols.index'));

    $this->assertDatabaseHas('rols', [
        'code' => 'editor',
        'name' => 'Editor',
    ]);
});

it('forbids non-admin users from creating a role', function () {
    $user = nonAdminUser();

    $response = $this->actingAs($user)->post(route('rols.store'), [
        'code' => 'new-role',
        'name' => 'Nou rol',
        'description' => null,
    ]);

    $response->assertForbidden();
});

it('updates a role', function () {
    $user = adminUser();
    $rol = Rol::factory()->create([
        'code' => 'editor',
        'name' => 'Editor',
    ]);

    $response = $this->actingAs($user)->patch(route('rols.update', $rol), [
        'code' => 'manager',
        'name' => 'Manager',
        'description' => 'Gestio de contingut',
    ]);

    $response->assertRedirect(route('rols.index'));

    $this->assertDatabaseHas('rols', [
        'id' => $rol->id,
        'code' => 'manager',
        'name' => 'Manager',
    ]);
});

it('forbids non-admin users from updating a role', function () {
    $user = nonAdminUser();
    $rol = Rol::factory()->create([
        'code' => 'editor',
        'name' => 'Editor',
    ]);

    $response = $this->actingAs($user)->patch(route('rols.update', $rol), [
        'code' => 'manager',
        'name' => 'Manager',
        'description' => null,
    ]);

    $response->assertForbidden();
});

it('deletes a role', function () {
    $user = adminUser();
    $rol = Rol::factory()->create();

    $response = $this->actingAs($user)->delete(route('rols.destroy', $rol));

    $response->assertRedirect(route('rols.index'));

    $this->assertDatabaseMissing('rols', [
        'id' => $rol->id,
    ]);
});

it('forbids non-admin users from deleting a role', function () {
    $user = nonAdminUser();
    $rol = Rol::factory()->create();

    $response = $this->actingAs($user)->delete(route('rols.destroy', $rol));

    $response->assertForbidden();
});

it('imports roles from csv for admin users', function () {
    $user = adminUser();

    $file = UploadedFile::fake()->createWithContent(
        'roles.csv',
        "code,name,description\neditor,Editor,Gestio editorial\nfinance,Finances,Gestio financera\n",
    );

    $response = $this->actingAs($user)->post(route('rols.import'), [
        'file' => $file,
    ]);

    $response->assertRedirect(route('rols.index'));

    $this->assertDatabaseHas('rols', [
        'code' => 'editor',
        'name' => 'Editor',
    ]);

    $this->assertDatabaseHas('rols', [
        'code' => 'finance',
        'name' => 'Finances',
    ]);
});

it('forbids non-admin users from importing roles', function () {
    $user = nonAdminUser();

    $file = UploadedFile::fake()->createWithContent(
        'roles.csv',
        "code,name\nviewer,Viewer\n",
    );

    $response = $this->actingAs($user)->post(route('rols.import'), [
        'file' => $file,
    ]);

    $response->assertForbidden();
});
