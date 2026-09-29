<?php

namespace App\Tests;

use App\Entity\Utilisateur;
use PHPUnit\Framework\TestCase;

class UtilisateurTest extends TestCase
{
    /**
     * Test : un utilisateur avec ROLE_ADMIN doit avoir ROLE_ADMIN + ROLE_USER
     */
    public function testRolesAvecAdmin(): void
    {
        $user = new Utilisateur();
        $user->setRole('ROLE_ADMIN');

        $roles = $user->getRoles();

        $this->assertContains('ROLE_ADMIN', $roles, "L'utilisateur doit avoir ROLE_ADMIN");
        $this->assertContains('ROLE_USER', $roles, "L'utilisateur doit toujours avoir ROLE_USER");
    }

    /**
     * Test : un utilisateur classique doit avoir uniquement ROLE_USER
     */
    public function testRolesAvecUser(): void
    {
        $user = new Utilisateur();
        $user->setRole('ROLE_USER');

        $roles = $user->getRoles();

        $this->assertContains('ROLE_USER', $roles);
        $this->assertNotContains('ROLE_ADMIN', $roles, "Un utilisateur normal ne doit pas avoir ROLE_ADMIN");
    }

    /**
     * Test : un utilisateur sans rôle explicite a quand même ROLE_USER
     */
    public function testRolesSansRole(): void
    {
        $user = new Utilisateur();

        $roles = $user->getRoles();

        $this->assertContains('ROLE_USER', $roles, "Tout utilisateur doit au minimum avoir ROLE_USER");
    }
}