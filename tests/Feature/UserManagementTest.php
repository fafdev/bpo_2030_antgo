<?php

use App\Models\Rol;
use App\Models\User;
use Illuminate\Http\UploadedFile;

function usersAdmin(): User
{
    $adminRol = Rol::factory()->create([
        'code' => 'admin',
        'name' => 'Administrador',
    ]);

    return User::factory()->create([
        'rol_id' => $adminRol->id,
    ]);
}

function usersNonAdmin(): User
{
    $basicRol = Rol::factory()->create([
        'code' => 'user',
        'name' => 'Usuari',
    ]);

    return User::factory()->create([
        'rol_id' => $basicRol->id,
    ]);
}

it('shows the users page for admin users', function () {
    $user = usersAdmin();

    $response = $this->actingAs($user)->get(route('users.index'));

    $response->assertOk();
});

it('forbids non-admin users from seeing users page', function () {
    $user = usersNonAdmin();

    $response = $this->actingAs($user)->get(route('users.index'));

    $response->assertForbidden();
});

it('creates a user', function () {
    $user = usersAdmin();
    $rol = Rol::factory()->create([
        'code' => 'editor',
        'name' => 'Editor',
    ]);

    $response = $this->actingAs($user)->post(route('users.store'), [
        'name' => 'New User',
        'email' => 'new-user@example.com',
        'password' => 'secret1234',
        'rol_id' => $rol->id,
    ]);

    $response->assertRedirect(route('users.index'));

    $this->assertDatabaseHas('users', [
        'email' => 'new-user@example.com',
        'rol_id' => $rol->id,
    ]);
});

it('updates a user', function () {
    $admin = usersAdmin();
    $managedUser = User::factory()->create([
        'email' => 'managed@example.com',
    ]);
    $rol = Rol::factory()->create([
        'code' => 'finance',
        'name' => 'Finances',
    ]);

    $response = $this->actingAs($admin)->patch(route('users.update', $managedUser), [
        'name' => 'Managed User Updated',
        'email' => 'managed@example.com',
        'password' => '',
        'rol_id' => $rol->id,
    ]);

    $response->assertRedirect(route('users.index'));

    $this->assertDatabaseHas('users', [
        'id' => $managedUser->id,
        'name' => 'Managed User Updated',
        'rol_id' => $rol->id,
    ]);
});

it('deletes a user', function () {
    $admin = usersAdmin();
    $managedUser = User::factory()->create();

    $response = $this->actingAs($admin)->delete(route('users.destroy', $managedUser));

    $response->assertRedirect(route('users.index'));

    $this->assertDatabaseMissing('users', [
        'id' => $managedUser->id,
    ]);
});

it('does not allow admin to delete self', function () {
    $admin = usersAdmin();

    $response = $this->actingAs($admin)->delete(route('users.destroy', $admin));

    $response->assertRedirect(route('users.index'));

    $this->assertDatabaseHas('users', [
        'id' => $admin->id,
    ]);
});

it('imports users from csv for admin users', function () {
    $admin = usersAdmin();
    Rol::factory()->create([
        'code' => 'editor',
        'name' => 'Editor',
    ]);

    $file = UploadedFile::fake()->createWithContent(
        'users.csv',
        "name,email,password,rol_code\nAnna,anna@example.com,secret1234,editor\nMarc,marc@example.com,secret1234,\n",
    );

    $response = $this->actingAs($admin)->post(route('users.import'), [
        'file' => $file,
    ]);

    $response->assertRedirect(route('users.index'));

    $this->assertDatabaseHas('users', [
        'email' => 'anna@example.com',
    ]);

    $this->assertDatabaseHas('users', [
        'email' => 'marc@example.com',
    ]);
});

it('forbids non-admin users from importing users', function () {
    $user = usersNonAdmin();

    $file = UploadedFile::fake()->createWithContent(
        'users.csv',
        "name,email\nMarta,marta@example.com\n",
    );

    $response = $this->actingAs($user)->post(route('users.import'), [
        'file' => $file,
    ]);

    $response->assertForbidden();
});
