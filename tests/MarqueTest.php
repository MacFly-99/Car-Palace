<?php

namespace App\Tests;

use App\Entity\Marque;
use App\Entity\Modele;
use PHPUnit\Framework\TestCase;

class MarqueTest extends TestCase
{
    /**
     * Test : on peut définir et récupérer un nom
     */
    public function testNom(): void
    {
        $marque = new Marque();
        $marque->setNom('Renault');

        $this->assertEquals('Renault', $marque->getNom());
    }

    /**
     * Test : une nouvelle marque n'a aucun modèle
     */
    public function testAucunModeleAuDepart(): void
    {
        $marque = new Marque();

        $this->assertCount(0, $marque->getModeles(), "Une nouvelle marque ne doit avoir aucun modèle");
    }

    /**
     * Test : on peut ajouter des modèles à une marque
     */
    public function testAjoutDeModeles(): void
    {
        $marque = new Marque();
        $marque->setNom('Renault');

        $modele1 = new Modele();
        $modele1->setNom('Clio');
        $modele1->setMarque($marque);

        $modele2 = new Modele();
        $modele2->setNom('Megane');
        $modele2->setMarque($marque);

        $marque->addModele($modele1);
        $marque->addModele($modele2);

        $this->assertCount(2, $marque->getModeles());
        $this->assertContains($modele1, $marque->getModeles());
        $this->assertContains($modele2, $marque->getModeles());
    }

    /**
     * Test : on ne peut pas ajouter deux fois le même modèle
     */
    public function testPasDeDoublonDeModele(): void
    {
        $marque = new Marque();
        $modele = new Modele();
        $modele->setNom('Clio');

        $marque->addModele($modele);
        $marque->addModele($modele);

        $this->assertCount(1, $marque->getModeles(), "On ne doit pas ajouter deux fois le même modèle");
    }
}