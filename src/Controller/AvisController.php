<?php

namespace App\Controller;

use App\Entity\Avis;
use App\Entity\Piece;
use App\Entity\Utilisateur;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

class AvisController extends AbstractController
{
    /**
     * Récupère tous les avis d'une pièce (avec données auteur formatées).
     */
    #[Route('/api/pieces/{id}/avis', name: 'api_piece_avis', methods: ['GET'])]
    public function getAvisByPiece(int $id, EntityManagerInterface $em): JsonResponse
    {
        $piece = $em->getRepository(Piece::class)->find($id);
        if (!$piece) {
            return new JsonResponse(['error' => 'Pièce introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $avis = $em->getRepository(Avis::class)->findBy(
            ['piece' => $piece],
            ['dateAvis' => 'DESC']
        );

        $data = [];
        foreach ($avis as $a) {
            $data[] = [
                'id' => $a->getId(),
                'note' => $a->getNote(),
                'titre' => $a->getTitre(),
                'description' => $a->getDescription(),
                'dateAvis' => $a->getDateAvis()?->format('d/m/Y'),
                'auteurEmail' => $a->getAuteur()?->getEmail(),
            ];
        }

        return new JsonResponse($data);
    }

    /**
     * Crée un avis sur une pièce. Nécessite d'être connecté.
     */
    #[Route('/api/avis/create', name: 'api_avis_create', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function create(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['pieceId']) || !isset($data['note']) || !isset($data['titre'])) {
            return new JsonResponse(['error' => 'Champs obligatoires manquants.'], Response::HTTP_BAD_REQUEST);
        }

        $piece = $em->getRepository(Piece::class)->find($data['pieceId']);
        if (!$piece) {
            return new JsonResponse(['error' => 'Pièce introuvable.'], Response::HTTP_NOT_FOUND);
        }

        /** @var Utilisateur $user */
        $user = $this->getUser();

        // 🔒 SÉCURITÉ : On empêche un utilisateur de laisser plusieurs avis sur la même pièce
        $existing = $em->getRepository(Avis::class)->findOneBy([
            'piece' => $piece,
            'auteur' => $user,
        ]);

        if ($existing) {
            return new JsonResponse(['error' => 'Tu as déjà laissé un avis sur cette pièce.'], Response::HTTP_CONFLICT);
        }

        // Validation de la note entre 1 et 5
        $note = (int) $data['note'];
        if ($note < 1 || $note > 5) {
            return new JsonResponse(['error' => 'La note doit être entre 1 et 5.'], Response::HTTP_BAD_REQUEST);
        }

        $avis = new Avis();
        $avis->setNote($note);
        $avis->setTitre($data['titre']);
        $avis->setDescription($data['description'] ?? '');
        $avis->setDateAvis(new \DateTime());
        $avis->setAuteur($user);
        $avis->setPiece($piece);

        $em->persist($avis);
        $em->flush();

        return new JsonResponse([
            'message' => 'Avis ajouté avec succès.',
            'id' => $avis->getId(),
        ], Response::HTTP_CREATED);
    }
}