<?php

namespace App\Tests;

use App\Entity\Piece;
use PHPUnit\Framework\TestCase;

class PieceTest extends TestCase
{
    /**
     * Test : on peut définir et récupérer un titre
     */
    public function testTitre(): void
    {
        $piece = new Piece();
        $piece->setTitre('Plaquettes de frein avant');

        $this->assertEquals('Plaquettes de frein avant', $piece->getTitre());
    }

    /**
     * Test : on peut définir et récupérer un prix
     */
    public function testPrix(): void
    {
        $piece = new Piece();
        $piece->setPrix('149.99');

        $this->assertEquals('149.99', $piece->getPrix());
    }

    /**
     * Test : une nouvelle pièce a une collection de photos vide
     */
    public function testPhotosCollectionVide(): void
    {
        $piece = new Piece();

        $this->assertCount(0, $piece->getPhotos(), "Une nouvelle pièce ne doit avoir aucune photo");
    }

    /**
     * Test : on peut définir et récupérer un état
     */
    public function testEtat(): void
    {
        $piece = new Piece();
        $piece->setEtat('Neuf');

        $this->assertEquals('Neuf', $piece->getEtat());
    }

        /**
     * Test : on peut associer une marque à une pièce
     */
    public function testAssociationMarque(): void
    {
        $piece = new Piece();
        $marque = new \App\Entity\Marque();
        $marque->setNom('BMW');

        $piece->setMarque($marque);

        $this->assertSame($marque, $piece->getMarque());
        $this->assertEquals('BMW', $piece->getMarque()->getNom());
    }

    /**
     * Test : on peut ajouter et retirer une photo à une pièce
     */
    public function testAjoutEtRetraitPhoto(): void
    {
        $piece = new Piece();
        $photo = new \App\Entity\Photo();
        $photo->setUrl('https://example.com/photo.jpg');

        // Ajout
        $piece->addPhoto($photo);
        $this->assertCount(1, $piece->getPhotos());
        $this->assertSame($piece, $photo->getPiece());

        // Retrait
        $piece->removePhoto($photo);
        $this->assertCount(0, $piece->getPhotos());
    }
}