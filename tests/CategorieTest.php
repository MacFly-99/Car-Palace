<?php

namespace App\Tests;

use App\Entity\Categorie;
use App\Entity\Piece;
use PHPUnit\Framework\TestCase;

class CategorieTest extends TestCase
{
    /**
     * Test : on peut définir et récupérer un nom
     */
    public function testNom(): void
    {
        $categorie = new Categorie();
        $categorie->setNom('Freinage');

        $this->assertEquals('Freinage', $categorie->getNom());
    }

    /**
     * Test : une nouvelle catégorie n'a aucune pièce associée
     */
    public function testAucunePieceAuDepart(): void
    {
        $categorie = new Categorie();

        $this->assertCount(0, $categorie->getPieces(), "Une nouvelle catégorie ne doit avoir aucune pièce");
    }

    /**
     * Test : on peut associer une pièce à une catégorie
     */
    public function testAssociationPieceCategorie(): void
    {
        $categorie = new Categorie();
        $categorie->setNom('Moteur');

        $piece = new Piece();
        $piece->setTitre('Vilebrequin');
        $piece->setCategorie($categorie);

        $categorie->addPiece($piece);

        $this->assertCount(1, $categorie->getPieces());
        $this->assertSame($categorie, $piece->getCategorie());
    }
}