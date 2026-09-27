<?php

namespace App\Controller;

use App\Entity\Piece;
use App\Entity\Utilisateur;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

class PieceController extends AbstractController
{
    /**
     * Créer une nouvelle pièce liée à l'utilisateur connecté.
     */
    #[Route('/api/pieces/create', name: 'api_piece_create', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function create(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
        return new JsonResponse(['error' => 'Utilisateur non connecté.'], 401);
        }
        
        $data = json_decode($request->getContent(), true);

        // Vérification des champs obligatoires
        if (!isset($data['titre']) || !isset($data['prix']) || !isset($data['marque']) || !isset($data['categorie'])) {
            return new JsonResponse(['error' => 'Champs obligatoires manquants.'], Response::HTTP_BAD_REQUEST);
        }

        /** @var Utilisateur $user */
        $user = $this->getUser();

        $piece = new Piece();
        $piece->setTitre($data['titre']);
        $piece->setDescription($data['description'] ?? '');
        $piece->setPrix((float) $data['prix']);
        $piece->setEtat($data['etat'] ?? 'Bon état');
        $piece->setAnnee((int) ($data['annee'] ?? date('Y')));
        $piece->setStatut('Disponible');
        
        // On récupère les entités liées par leur IRI (ex: "/api/marques/1")
        $marque = $em->getRepository(\App\Entity\Marque::class)->find($this->extractIdFromIri($data['marque']));
        $modele = null;
        if (!empty($data['modele'])) {
            $modele = $em->getRepository(\App\Entity\Modele::class)->find($this->extractIdFromIri($data['modele']));
            }
        $categorie = $em->getRepository(\App\Entity\Categorie::class)->find($this->extractIdFromIri($data['categorie']));

        if (!$marque || !$categorie) {
            return new JsonResponse(['error' => 'Marque ou catégorie introuvable.'], Response::HTTP_BAD_REQUEST);
        }

        $piece->setMarque($marque);
        $piece->setModele($modele);
        $piece->setCategorie($categorie);
        
        // 🔒 SÉCURITÉ : On force le vendeur à être l'utilisateur connecté
        $piece->setVendeur($user);

        $em->persist($piece);
        $em->flush();

        return new JsonResponse([
            'message' => 'Pièce créée avec succès.',
            'id' => $piece->getId(),
        ], Response::HTTP_CREATED);
    }

    /**
     * Récupérer les pièces de l'utilisateur connecté.
     */
    #[Route('/api/mes-pieces', name: 'api_mes_pieces', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function mesPieces(EntityManagerInterface $em): JsonResponse
    {
        /** @var Utilisateur $user */
        $user = $this->getUser();

        $pieces = $em->getRepository(Piece::class)->findBy(['vendeur' => $user]);

        $data = [];
        foreach ($pieces as $piece) {
            $data[] = [
                'id' => $piece->getId(),
                'titre' => $piece->getTitre(),
                'description' => $piece->getDescription(),
                'prix' => $piece->getPrix(),
                'etat' => $piece->getEtat(),
                'annee' => $piece->getAnnee(),
                'statut' => $piece->getStatut(),
                'marque' => $piece->getMarque()?->getNom(),
                'categorie' => $piece->getCategorie()?->getNom(),
            ];
        }

        return new JsonResponse($data);
    }

    /**
     * Récupérer les données brutes d'une pièce pour le formulaire d'édition.
     */
    #[Route('/api/pieces/{id}/edit-data', name: 'api_piece_edit_data', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function editData(int $id, EntityManagerInterface $em): JsonResponse
    {
        $piece = $em->getRepository(Piece::class)->find($id);

        if (!$piece) {
            return new JsonResponse(['error' => 'Pièce introuvable.'], Response::HTTP_NOT_FOUND);
        }

        /** @var Utilisateur $user */
        $user = $this->getUser();

        if ($piece->getVendeur() !== $user) {
            return new JsonResponse(['error' => 'Accès refusé.'], Response::HTTP_FORBIDDEN);
        }

        return new JsonResponse([
            'id' => $piece->getId(),
            'titre' => $piece->getTitre(),
            'description' => $piece->getDescription(),
            'prix' => $piece->getPrix(),
            'etat' => $piece->getEtat(),
            'annee' => $piece->getAnnee(),
            'statut' => $piece->getStatut(),
            'marque' => $piece->getMarque() ? '/api/marques/' . $piece->getMarque()->getId() : '',
            'modele' => $piece->getModele() ? '/api/modeles/' . $piece->getModele()->getId() : '',
            'categorie' => $piece->getCategorie() ? '/api/categories/' . $piece->getCategorie()->getId() : '',
        ]);
    }

    /**
     * Modifier une pièce (seulement si on en est le propriétaire).
     */
    #[Route('/api/pieces/{id}/update', name: 'api_piece_update', methods: ['PUT'])]
    #[IsGranted('ROLE_USER')]
    public function update(int $id, Request $request, EntityManagerInterface $em): JsonResponse
    {
        $piece = $em->getRepository(Piece::class)->find($id);

        if (!$piece) {
            return new JsonResponse(['error' => 'Pièce introuvable.'], Response::HTTP_NOT_FOUND);
        }

        /** @var Utilisateur $user */
        $user = $this->getUser();

        // 🔒 SÉCURITÉ : On vérifie que l'utilisateur est bien le propriétaire
        if ($piece->getVendeur() !== $user) {
            return new JsonResponse(['error' => 'Tu n\'es pas le propriétaire de cette pièce.'], Response::HTTP_FORBIDDEN);
        }

        $data = json_decode($request->getContent(), true);

        // Mise à jour des champs si présents dans la requête
        if (isset($data['titre'])) $piece->setTitre($data['titre']);
        if (isset($data['description'])) $piece->setDescription($data['description']);
        if (isset($data['prix'])) $piece->setPrix((float) $data['prix']);
        if (isset($data['etat'])) $piece->setEtat($data['etat']);
        if (isset($data['annee'])) $piece->setAnnee((int) $data['annee']);
        if (isset($data['statut'])) $piece->setStatut($data['statut']);

        // Marque
        if (!empty($data['marque'])) {
            $marque = $em->getRepository(\App\Entity\Marque::class)->find($this->extractIdFromIri($data['marque']));
            if ($marque) $piece->setMarque($marque);
        }

        // Catégorie
        if (!empty($data['categorie'])) {
            $categorie = $em->getRepository(\App\Entity\Categorie::class)->find($this->extractIdFromIri($data['categorie']));
            if ($categorie) $piece->setCategorie($categorie);
        }

        // Modèle (optionnel)
        if (array_key_exists('modele', $data)) {
            if (empty($data['modele'])) {
                $piece->setModele(null);
            } else {
                $modele = $em->getRepository(\App\Entity\Modele::class)->find($this->extractIdFromIri($data['modele']));
                $piece->setModele($modele);
            }
        }

        $em->flush();

        return new JsonResponse(['message' => 'Pièce modifiée avec succès.'], Response::HTTP_OK);
    }

    /**
     * Supprimer une pièce (seulement si on en est le propriétaire).
     */
    #[Route('/api/pieces/{id}/delete', name: 'api_piece_delete', methods: ['DELETE'])]
    #[IsGranted('ROLE_USER')]
    public function delete(int $id, EntityManagerInterface $em): JsonResponse
    {
        $piece = $em->getRepository(Piece::class)->find($id);

        if (!$piece) {
            return new JsonResponse(['error' => 'Pièce introuvable.'], Response::HTTP_NOT_FOUND);
        }

        /** @var Utilisateur $user */
        $user = $this->getUser();

        // 🔒 SÉCURITÉ : On vérifie que l'utilisateur est bien le propriétaire
        if ($piece->getVendeur() !== $user) {
            return new JsonResponse(['error' => 'Tu n\'es pas le propriétaire de cette pièce.'], Response::HTTP_FORBIDDEN);
        }

        $em->remove($piece);
        $em->flush();

        return new JsonResponse(['message' => 'Pièce supprimée.'], Response::HTTP_OK);
    }

    /**
     * Utilitaire : extrait l'ID depuis une IRI API Platform (ex: "/api/marques/1" -> 1)
     */
    private function extractIdFromIri(?string $iri): ?int
    {
        if (empty($iri)) return null;
        $parts = explode('/', $iri);
        $id = end($parts);
        return is_numeric($id) ? (int) $id : null;
    }
}