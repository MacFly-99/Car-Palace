<?php

namespace App\Controller;

use App\Entity\Commande;
use App\Entity\LigneCommande;
use App\Entity\Piece;
use App\Entity\Utilisateur;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

class CommandeController extends AbstractController
{
    /**
     * Créer une nouvelle commande à partir du panier.
     */
    #[Route('/api/commandes/create', name: 'api_commande_create', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function create(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['items']) || !is_array($data['items']) || count($data['items']) === 0) {
            return new JsonResponse(['error' => 'Panier vide ou invalide.'], Response::HTTP_BAD_REQUEST);
        }

        /** @var Utilisateur $user */
        $user = $this->getUser();

        $commande = new Commande();
        $commande->setDateCommande(new \DateTime());
        $commande->setStatut('En attente');
        $commande->setAcheteur($user);
        $commande->setTotal(0);

        $total = 0;

        foreach ($data['items'] as $item) {
            if (!isset($item['pieceId']) || !isset($item['quantite'])) {
                continue;
            }

            $piece = $em->getRepository(Piece::class)->find($item['pieceId']);
            if (!$piece) {
                continue;
            }

            // Vérifier que l'utilisateur n'achète pas sa propre pièce
            if ($piece->getVendeur() === $user) {
                return new JsonResponse([
                    'error' => 'Tu ne peux pas acheter ta propre pièce : ' . $piece->getTitre()
                ], Response::HTTP_BAD_REQUEST);
            }

            $ligne = new LigneCommande();
            $ligne->setCommande($commande);
            $ligne->setPiece($piece);
            $ligne->setQuantite((int) $item['quantite']);
            $ligne->setPrixUnitaire($piece->getPrix());

            $total += (float) $piece->getPrix() * (int) $item['quantite'];

            $em->persist($ligne);

            // Marquer la pièce comme "Vendu"
            $piece->setStatut('Vendu');
        }

        $commande->setTotal($total);

        $em->persist($commande);
        $em->flush();

        return new JsonResponse([
            'message' => 'Commande validée avec succès.',
            'commandeId' => $commande->getId(),
            'total' => $total,
        ], Response::HTTP_CREATED);
    }

    /**
     * Récupérer les commandes de l'utilisateur connecté.
     */
    #[Route('/api/mes-commandes', name: 'api_mes_commandes', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function mesCommandes(EntityManagerInterface $em): JsonResponse
    {
        /** @var Utilisateur $user */
        $user = $this->getUser();

        $commandes = $em->getRepository(Commande::class)->findBy(
            ['acheteur' => $user],
            ['dateCommande' => 'DESC']
        );

        $data = [];
        foreach ($commandes as $cmd) {
            $lignes = [];
            foreach ($cmd->getLigneCommandes() as $ligne) {
                $lignes[] = [
                    'pieceId' => $ligne->getPiece()?->getId(),
                    'titre' => $ligne->getPiece()?->getTitre(),
                    'quantite' => $ligne->getQuantite(),
                    'prixUnitaire' => $ligne->getPrixUnitaire(),
                ];
            }

            $data[] = [
                'id' => $cmd->getId(),
                'date' => $cmd->getDateCommande()?->format('d/m/Y H:i'),
                'statut' => $cmd->getStatut(),
                'total' => $cmd->getTotal(),
                'lignes' => $lignes,
            ];
        }

        return new JsonResponse($data);
    }
}