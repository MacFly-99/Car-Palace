<?php

namespace App\Controller;

use App\Entity\Utilisateur;
use Doctrine\DBAL\Exception\UniqueConstraintViolationException;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\RateLimiter\RateLimiterFactoryInterface;
use Symfony\Component\Routing\Attribute\Route;

class RegistrationController extends AbstractController
{
    #[Route('/api/register', name: 'api_register', methods: ['POST'])]
    public function register(
        Request $request,
        UserPasswordHasherInterface $passwordHasher,
        EntityManagerInterface $entityManager,
        #[Autowire(service: 'limiter.api_register')]
        RateLimiterFactoryInterface $registerLimiter
    ): JsonResponse {
        // 0. Limitation : 10 tentatives par heure et par adresse IP
        $limiter = $registerLimiter->create($request->getClientIp() ?? 'inconnue');
        if (!$limiter->consume()->isAccepted()) {
            return $this->error(
                "Trop de tentatives d'inscription. Réessayez plus tard.",
                Response::HTTP_TOO_MANY_REQUESTS
            );
        }

        // 1. On récupère les données JSON envoyées par React
        $data = json_decode($request->getContent(), true);
        if (!is_array($data)) {
            return $this->error('Requête invalide.');
        }

        // 2. On n'accepte que des chaînes de caractères
        $email = is_string($data['email'] ?? null) ? mb_strtolower(trim($data['email'])) : '';
        $password = is_string($data['password'] ?? null) ? $data['password'] : '';
        $nom = is_string($data['nom'] ?? null) ? trim($data['nom']) : '';
        $prenom = is_string($data['prenom'] ?? null) ? trim($data['prenom']) : '';
        $adresse = is_string($data['adresse'] ?? null) ? trim($data['adresse']) : '';
        $ville = is_string($data['ville'] ?? null) ? trim($data['ville']) : '';

        // 3. Validation
        if ($email === '' || $password === '' || $nom === '' || $prenom === '') {
            return $this->error('Champs obligatoires manquants.');
        }
        if (mb_strlen($email) > 180 || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return $this->error('Adresse email invalide.');
        }
        if (mb_strlen($password) < 8 || mb_strlen($password) > 128) {
            return $this->error('Le mot de passe doit contenir entre 8 et 128 caractères.');
        }
        if (mb_strlen($nom) > 255 || mb_strlen($prenom) > 255 || mb_strlen($adresse) > 255 || mb_strlen($ville) > 255) {
            return $this->error('Un des champs est trop long (255 caractères maximum).');
        }

        // 4. On vérifie que l'email n'est pas déjà utilisé
        $existingUser = $entityManager->getRepository(Utilisateur::class)->findOneBy(['email' => $email]);
        if ($existingUser) {
            return $this->error('Cet email est déjà utilisé.', Response::HTTP_CONFLICT);
        }

        // 5. On crée le nouvel utilisateur
        $user = new Utilisateur();
        $user->setEmail($email);
        $user->setNom($nom);
        $user->setPrenom($prenom);
        $user->setAdresse($adresse !== '' ? $adresse : null);
        $user->setVille($ville !== '' ? $ville : null);
        $user->setRole('ROLE_USER'); // On force le rôle USER (sécurité)
        $user->setDateInscription(new \DateTime());

        // 6. On hash le mot de passe avec l'outil officiel de Symfony
        $user->setPassword($passwordHasher->hashPassword($user, $password));

        // 7. On sauvegarde (gère aussi deux inscriptions simultanées avec le même email)
        try {
            $entityManager->persist($user);
            $entityManager->flush();
        } catch (UniqueConstraintViolationException $e) {
            return $this->error('Cet email est déjà utilisé.', Response::HTTP_CONFLICT);
        }

        return new JsonResponse([
            'message' => 'Utilisateur créé avec succès.',
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
            ]
        ], Response::HTTP_CREATED);
    }

    private function error(string $message, int $status = Response::HTTP_BAD_REQUEST): JsonResponse
    {
        return new JsonResponse(['error' => $message], $status);
    }
}