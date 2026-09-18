<?php

use App\Models\User;

test('guests are redirected to the login page', function () {
    $this->get('/dashboard')->assertRedirect('/login');
});

test('authenticated admin users can visit the dashboard', function () {
    $this->actingAs($user = User::factory()->create());

    $this->get('/dashboard')->assertOk();
});

test('regular users cannot visit the dashboard and are logged out', function () {
    $user = User::factory()->create(['role' => 'User']);

    $this->actingAs($user)
        ->get('/dashboard')
        ->assertRedirect('/login');

    $this->assertGuest();
});