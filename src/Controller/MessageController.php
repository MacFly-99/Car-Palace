<?php

namespace App\Controller;

use App\Document\Message;
use App\Entity\Utilisateur;
use Doctrine\ODM\MongoDB\DocumentManager;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

class MessageController extends AbstractController
{
    /**
     * Envoyer un message à un autre utilisateur à propos d'une pièce.
     */
    #[Route('/api/messages/send', name: 'api_message_send', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function send(Request $request, DocumentManager $dm): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['destinataireId']) || !isset($data['pieceId']) || !isset($data['contenu'])) {
            return new JsonResponse(['error' => 'Champs obligatoires manquants.'], Response::HTTP_BAD_REQUEST);
        }

        /** @var Utilisateur $user */
        $user = $this->getUser();

        // Empêcher de s'envoyer un message à soi-même
        if ($user->getId() === (int) $data['destinataireId']) {
            return new JsonResponse(['error' => 'Tu ne peux pas t\'envoyer un message à toi-même.'], Response::HTTP_BAD_REQUEST);
        }

        $message = new Message();
        $message->setExpediteurId($user->getId());
        $message->setDestinataireId((int) $data['destinataireId']);
        $message->setPieceId((int) $data['pieceId']);
        $message->setContenu($data['contenu']);
        $message->setDateEnvoi(new \DateTime());
        $message->setLu(false);

        $dm->persist($message);
        $dm->flush();

        return new JsonResponse([
            'message' => 'Message envoyé.',
            'id' => $message->getId(),
        ], Response::HTTP_CREATED);
    }

    /**
     * Récupérer les messages reçus par l'utilisateur connecté.
     */
    #[Route('/api/messages/recus', name: 'api_messages_recus', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function recus(DocumentManager $dm, EntityManagerInterface $em): JsonResponse
    {
        /** @var Utilisateur $user */
        $user = $this->getUser();

        $messages = $dm->getRepository(Message::class)->findBy(
            ['destinataireId' => $user->getId()],
            ['dateEnvoi' => 'DESC']
        );

        return new JsonResponse($this->serializeMessages($messages, $em, $user->getId()));
    }

    /**
     * Récupérer les messages envoyés par l'utilisateur connecté.
     */
    #[Route('/api/messages/envoyes', name: 'api_messages_envoyes', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function envoyes(DocumentManager $dm, EntityManagerInterface $em): JsonResponse
    {
        /** @var Utilisateur $user */
        $user = $this->getUser();

        $messages = $dm->getRepository(Message::class)->findBy(
            ['expediteurId' => $user->getId()],
            ['dateEnvoi' => 'DESC']
        );

        return new JsonResponse($this->serializeMessages($messages, $em, $user->getId()));
    }

    /**
     * Récupérer la conversation complète avec un autre utilisateur.
     */
    #[Route('/api/messages/conversation/{userId}', name: 'api_messages_conversation', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function conversation(int $userId, DocumentManager $dm, EntityManagerInterface $em): JsonResponse
    {
        /** @var Utilisateur $currentUser */
        $currentUser = $this->getUser();
        $currentId = $currentUser->getId();

        // On récupère tous les messages échangés entre les deux utilisateurs
        $qb = $dm->createQueryBuilder(Message::class);
        $qb->addOr(
            $qb->expr()->field('expediteurId')->equals($currentId)
                ->field('destinataireId')->equals($userId)
        );
        $qb->addOr(
            $qb->expr()->field('expediteurId')->equals($userId)
                ->field('destinataireId')->equals($currentId)
        );
        $qb->sort('dateEnvoi', 'ASC');

        $messages = $qb->getQuery()->execute();

        return new JsonResponse($this->serializeMessages($messages, $em, $currentId));
    }

    /**
     * Marquer un message comme lu.
     */
    #[Route('/api/messages/{id}/lu', name: 'api_message_mark_read', methods: ['PUT'])]
    #[IsGranted('ROLE_USER')]
    public function markAsRead(string $id, DocumentManager $dm): JsonResponse
    {
        $message = $dm->getRepository(Message::class)->find($id);

        if (!$message) {
            return new JsonResponse(['error' => 'Message introuvable.'], Response::HTTP_NOT_FOUND);
        }

        /** @var Utilisateur $user */
        $user = $this->getUser();

        // Seul le destinataire peut marquer comme lu
        if ($message->getDestinataireId() !== $user->getId()) {
            return new JsonResponse(['error' => 'Accès refusé.'], Response::HTTP_FORBIDDEN);
        }

        $message->setLu(true);
        $dm->flush();

        return new JsonResponse(['message' => 'Message marqué comme lu.']);
    }

    /**
     * Utilitaire : formater les messages pour l'API.
     */
    private function serializeMessages($messages, EntityManagerInterface $em, int $currentUserId): array
    {
        $data = [];
        foreach ($messages as $msg) {
            // Récupérer l'email des autres utilisateurs (SQL)
            $expediteur = $em->getRepository(Utilisateur::class)->find($msg->getExpediteurId());
            $destinataire = $em->getRepository(Utilisateur::class)->find($msg->getDestinataireId());

            $data[] = [
                'id' => $msg->getId(),
                'expediteurId' => $msg->getExpediteurId(),
                'expediteurEmail' => $expediteur?->getEmail(),
                'destinataireId' => $msg->getDestinataireId(),
                'destinataireEmail' => $destinataire?->getEmail(),
                'pieceId' => $msg->getPieceId(),
                'contenu' => $msg->getContenu(),
                'dateEnvoi' => $msg->getDateEnvoi()->format('Y-m-d H:i:s'),
                'lu' => $msg->isLu(),
                'isMine' => $msg->getExpediteurId() === $currentUserId,
            ];
        }
        return $data;
    }
}