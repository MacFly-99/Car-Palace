<?php

namespace App\Controller;

use App\Entity\Avis;
use App\Entity\Commande;
use App\Entity\Piece;
use App\Entity\Utilisateur;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/admin')]
#[IsGranted('ROLE_ADMIN')]
class AdminController extends AbstractController
{
    #[Route('/debug-headers', name: 'api_debug_headers', methods: ['GET'])]
    public function debugHeaders(Request $request): JsonResponse
    {
        return new JsonResponse([
            'authorization' => $request->headers->get('Authorization'),
            'all_headers' => $request->headers->all(),
        ]);
    }

    // ============ DASHBOARD / STATS ============
    #[Route('/stats', name: 'api_admin_stats', methods: ['GET'])]
    public function stats(EntityManagerInterface $em): JsonResponse
    {
        $nbUsers = $em->getRepository(Utilisateur::class)->count([]);
        $nbPieces = $em->getRepository(Piece::class)->count([]);
        $nbCommandes = $em->getRepository(Commande::class)->count([]);
        $nbAvis = $em->getRepository(Avis::class)->count([]);

        // Chiffre d'affaires total (somme des totaux de commandes)
        $ca = $em->createQuery('SELECT SUM(c.total) FROM App\Entity\Commande c')->getSingleScalarResult() ?? 0;

        return new JsonResponse([
            'utilisateurs' => $nbUsers,
            'pieces' => $nbPieces,
            'commandes' => $nbCommandes,
            'avis' => $nbAvis,
            'chiffre_affaires' => round((float) $ca, 2),
        ]);
    }

    // ============ UTILISATEURS ============
    #[Route('/utilisateurs', name: 'api_admin_users', methods: ['GET'])]
    public function listeUtilisateurs(EntityManagerInterface $em): JsonResponse
    {
        $users = $em->getRepository(Utilisateur::class)->findAll();
        $data = [];
        foreach ($users as $u) {
            $data[] = [
                'id' => $u->getId(),
                'email' => $u->getEmail(),
                'nom' => $u->getNom(),
                'prenom' => $u->getPrenom(),
                'ville' => $u->getVille(),
                'role' => $u->getRole(),
                'dateInscription' => $u->getDateInscription()?->format('Y-m-d'),
            ];
        }
        return new JsonResponse($data);
    }

    #[Route('/utilisateurs/{id}/role', name: 'api_admin_user_role', methods: ['PUT'])]
    public function changerRole(int $id, Request $request, EntityManagerInterface $em): JsonResponse
    {
        $user = $em->getRepository(Utilisateur::class)->find($id);
        if (!$user) {
            return new JsonResponse(['error' => 'Utilisateur introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);
        if (!isset($data['role']) || !in_array($data['role'], ['ROLE_USER', 'ROLE_ADMIN'])) {
            return new JsonResponse(['error' => 'Rôle invalide.'], Response::HTTP_BAD_REQUEST);
        }

        // On empêche un admin de se retirer son propre rôle admin
        /** @var Utilisateur $currentUser */
        $currentUser = $this->getUser();
        if ($currentUser->getId() === $user->getId() && $data['role'] !== 'ROLE_ADMIN') {
            return new JsonResponse(['error' => 'Tu ne peux pas retirer ton propre rôle admin.'], Response::HTTP_FORBIDDEN);
        }

        $user->setRole($data['role']);
        $em->flush();

        return new JsonResponse(['message' => 'Rôle mis à jour.']);
    }

    #[Route('/utilisateurs/{id}', name: 'api_admin_user_delete', methods: ['DELETE'])]
    public function supprimerUtilisateur(int $id, EntityManagerInterface $em): JsonResponse
    {
        $user = $em->getRepository(Utilisateur::class)->find($id);
        if (!$user) {
            return new JsonResponse(['error' => 'Utilisateur introuvable.'], Response::HTTP_NOT_FOUND);
        }

        /** @var Utilisateur $currentUser */
        $currentUser = $this->getUser();
        if ($currentUser->getId() === $user->getId()) {
            return new JsonResponse(['error' => 'Tu ne peux pas te supprimer toi-même.'], Response::HTTP_FORBIDDEN);
        }

        // Suppression en cascade des dépendances
        // 1. Ses pièces (et leurs photos + avis)
        $pieces = $em->getRepository(Piece::class)->findBy(['vendeur' => $user]);
        foreach ($pieces as $piece) {
            foreach ($piece->getPhotos() as $photo) {
                $em->remove($photo);
            }
            $avis = $em->getRepository(Avis::class)->findBy(['piece' => $piece]);
            foreach ($avis as $a) {
                $em->remove($a);
            }
            $em->remove($piece);
        }

        // 2. Ses avis en tant qu'auteur
        $avisAuteur = $em->getRepository(Avis::class)->findBy(['auteur' => $user]);
        foreach ($avisAuteur as $a) {
            $em->remove($a);
        }

        // 3. Ses commandes (et lignes)
        $commandes = $em->getRepository(Commande::class)->findBy(['acheteur' => $user]);
        foreach ($commandes as $cmd) {
            foreach ($cmd->getLigneCommandes() as $ligne) {
                $em->remove($ligne);
            }
            $em->remove($cmd);
        }

        $em->remove($user);
        $em->flush();

        return new JsonResponse(['message' => 'Utilisateur supprimé.']);
    }

    // ============ PIÈCES ============
    #[Route('/pieces', name: 'api_admin_pieces', methods: ['GET'])]
    public function listePieces(EntityManagerInterface $em): JsonResponse
    {
        $pieces = $em->getRepository(Piece::class)->findAll();
        $data = [];
        foreach ($pieces as $p) {
            $data[] = [
                'id' => $p->getId(),
                'titre' => $p->getTitre(),
                'prix' => $p->getPrix(),
                'statut' => $p->getStatut(),
                'marque' => $p->getMarque()?->getNom(),
                'categorie' => $p->getCategorie()?->getNom(),
                'vendeurEmail' => $p->getVendeur()?->getEmail(),
            ];
        }
        return new JsonResponse($data);
    }

    #[Route('/pieces/{id}', name: 'api_admin_piece_delete', methods: ['DELETE'])]
    public function supprimerPiece(int $id, EntityManagerInterface $em): JsonResponse
    {
        $piece = $em->getRepository(Piece::class)->find($id);
        if (!$piece) {
            return new JsonResponse(['error' => 'Pièce introuvable.'], Response::HTTP_NOT_FOUND);
        }

        foreach ($piece->getPhotos() as $photo) {
            $em->remove($photo);
        }
        $avis = $em->getRepository(Avis::class)->findBy(['piece' => $piece]);
        foreach ($avis as $a) {
            $em->remove($a);
        }

        $em->remove($piece);
        $em->flush();

        return new JsonResponse(['message' => 'Pièce supprimée.']);
    }

    // ============ COMMANDES ============
    #[Route('/commandes', name: 'api_admin_commandes', methods: ['GET'])]
    public function listeCommandes(EntityManagerInterface $em): JsonResponse
    {
        $commandes = $em->getRepository(Commande::class)->findAll();
        $data = [];
        foreach ($commandes as $c) {
            $data[] = [
                'id' => $c->getId(),
                'date' => $c->getDateCommande()?->format('Y-m-d H:i'),
                'statut' => $c->getStatut(),
                'total' => $c->getTotal(),
                'acheteurEmail' => $c->getAcheteur()?->getEmail(),
            ];
        }
        return new JsonResponse($data);
    }

    // ============ AVIS ============
    #[Route('/avis', name: 'api_admin_avis', methods: ['GET'])]
    public function listeAvis(EntityManagerInterface $em): JsonResponse
    {
        $avis = $em->getRepository(Avis::class)->findAll();
        $data = [];
        foreach ($avis as $a) {
            $data[] = [
                'id' => $a->getId(),
                'note' => $a->getNote(),
                'titre' => $a->getTitre(),
                'auteurEmail' => $a->getAuteur()?->getEmail(),
                'pieceTitre' => $a->getPiece()?->getTitre(),
                'date' => $a->getDateAvis()?->format('Y-m-d'),
            ];
        }
        return new JsonResponse($data);
    }

    #[Route('/avis/{id}', name: 'api_admin_avis_delete', methods: ['DELETE'])]
    public function supprimerAvis(int $id, EntityManagerInterface $em): JsonResponse
    {
        $avis = $em->getRepository(Avis::class)->find($id);
        if (!$avis) {
            return new JsonResponse(['error' => 'Avis introuvable.'], Response::HTTP_NOT_FOUND);
        }
        $em->remove($avis);
        $em->flush();
        return new JsonResponse(['message' => 'Avis supprimé.']);
    }
}