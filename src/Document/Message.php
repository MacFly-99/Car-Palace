<?php

namespace App\Document;

use Doctrine\ODM\MongoDB\Mapping\Annotations as MongoDB;

#[MongoDB\Document(collection: 'messages')]
class Message
{
    #[MongoDB\Id]
    private ?string $id = null;

    #[MongoDB\Field(type: 'int')]
    private int $expediteurId = 0;

    #[MongoDB\Field(type: 'int')]
    private int $destinataireId = 0;

    #[MongoDB\Field(type: 'int')]
    private int $pieceId = 0;

    #[MongoDB\Field(type: 'string')]
    private string $contenu = '';

    #[MongoDB\Field(type: 'date')]
    private \DateTime $dateEnvoi;

    #[MongoDB\Field(type: 'bool')]
    private bool $lu = false;

    public function __construct()
    {
        $this->dateEnvoi = new \DateTime();
    }

    public function getId(): ?string { return $this->id; }

    public function getExpediteurId(): int { return $this->expediteurId; }
    public function setExpediteurId(int $id): self { $this->expediteurId = $id; return $this; }

    public function getDestinataireId(): int { return $this->destinataireId; }
    public function setDestinataireId(int $id): self { $this->destinataireId = $id; return $this; }

    public function getPieceId(): int { return $this->pieceId; }
    public function setPieceId(int $id): self { $this->pieceId = $id; return $this; }

    public function getContenu(): string { return $this->contenu; }
    public function setContenu(string $contenu): self { $this->contenu = $contenu; return $this; }

    public function getDateEnvoi(): \DateTime { return $this->dateEnvoi; }
    public function setDateEnvoi(\DateTime $date): self { $this->dateEnvoi = $date; return $this; }

    public function isLu(): bool { return $this->lu; }
    public function setLu(bool $lu): self { $this->lu = $lu; return $this; }
}