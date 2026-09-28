<?php

namespace App\DataFixtures;

use App\Entity\Avis;
use App\Entity\Categorie;
use App\Entity\Commande;
use App\Entity\LigneCommande;
use App\Entity\Marque;
use App\Entity\Modele;
use App\Entity\Photo;
use App\Entity\Piece;
use App\Entity\Utilisateur;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Faker\Factory;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class AppFixtures extends Fixture
{
    private $passwordHasher;

    public function __construct(UserPasswordHasherInterface $passwordHasher)
    {
        $this->passwordHasher = $passwordHasher;
    }

    public function load(ObjectManager $manager): void
    {
        $faker = Factory::create('fr_FR');

        // ============ 1. UTILISATEURS ============
        $users = [];

        // Admin
        $admin = new Utilisateur();
        $admin->setEmail('admin@car-palace.fr');
        $admin->setNom('Admin');
        $admin->setPrenom('Super');
        $admin->setRole('ROLE_ADMIN');
        $admin->setVille('Paris');
        $admin->setAdresse('1 rue de la Paix');
        $admin->setDateInscription(new \DateTime());
        $admin->setPassword($this->passwordHasher->hashPassword($admin, 'password123'));
        $manager->persist($admin);
        $users[] = $admin;

        // Utilisateurs classiques
        for ($i = 0; $i < 5; $i++) {
            $user = new Utilisateur();
            $user->setEmail($faker->email());
            $user->setNom($faker->lastName());
            $user->setPrenom($faker->firstName());
            $user->setRole('ROLE_USER');
            $user->setVille($faker->city());
            $user->setAdresse($faker->streetAddress());
            $user->setDateInscription(new \DateTime());
            $user->setPassword($this->passwordHasher->hashPassword($user, 'password123'));
            $manager->persist($user);
            $users[] = $user;
        }

        // ============ 2. MARQUES ET MODÈLES ============
        $marquesData = [
            'Renault' => ['Clio', 'Megane'],
            'Peugeot' => ['208', '308'],
            'Ford' => ['Fiesta', 'Focus'],
            'Volkswagen' => ['Golf', 'Polo'],
            'Opel' => ['Corsa', 'Astra'],
            'Mercedes' => ['Classe A', 'Classe C'],
            'BMW' => ['Série 1', 'Série 3'],
            'Audi' => ['A3', 'A4'],
            'Porsche' => ['911', 'Cayman'],
            'Lamborghini' => ['Huracan', 'Aventador']
        ];

        $modeles = [];
        $marques = [];
        foreach ($marquesData as $nomMarque => $nomsModeles) {
            $marque = new Marque();
            $marque->setNom($nomMarque);
            $manager->persist($marque);
            $marques[] = $marque;

            foreach ($nomsModeles as $nomModele) {
                $modele = new Modele();
                $modele->setNom($nomModele);
                $modele->setMarque($marque);
                $manager->persist($modele);
                $modeles[] = $modele;
            }
        }

        // ============ 3. CATÉGORIES ============
        $categoriesData = ['Freinage', 'Moteur', 'Eclairage', 'Carrosserie'];
        $categories = [];
        foreach ($categoriesData as $nomCat) {
            $categorie = new Categorie();
            $categorie->setNom($nomCat);
            $manager->persist($categorie);
            $categories[] = $categorie;
        }

        // ============ 4. PIÈCES ============
        $pieces = [];
        for ($i = 0; $i < 30; $i++) {
            $piece = new Piece();
            $piece->setTitre($faker->sentence(3));
            $piece->setDescription($faker->paragraph(3));
            $piece->setPrix($faker->randomFloat(2, 20, 500));
            $piece->setEtat($faker->randomElement(['Neuf', 'Très bon état', 'Bon état', 'Usure normale']));
            $piece->setAnnee($faker->numberBetween(2000, 2023));
            $piece->setStatut($faker->randomElement(['Disponible', 'Disponible', 'Disponible', 'Vendu', 'Réservé']));
            $piece->setMarque($faker->randomElement($marques));
            $piece->setModele($faker->randomElement($modeles));
            $piece->setCategorie($faker->randomElement($categories));
            $piece->setVendeur($faker->randomElement($users));
            $manager->persist($piece);
            $pieces[] = $piece;

            // Photo pour chaque pièce
            $photo = new Photo();
            $photo->setUrl('https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&h=200&fit=crop');
            $photo->setPiece($piece);
            $manager->persist($photo);
        }

        // ============ 5. AVIS ============
        for ($i = 0; $i < 15; $i++) {
            $avis = new Avis();
            $avis->setNote($faker->numberBetween(1, 5));
            $avis->setTitre($faker->sentence(4));
            $avis->setDescription($faker->paragraph(2));
            $avis->setDateAvis(new \DateTime());
            $avis->setAuteur($faker->randomElement($users));
            $avis->setPiece($faker->randomElement($pieces));
            $manager->persist($avis);
        }

        // ============ 6. COMMANDES (5 commandes) ============
        $statuts = ['En attente', 'Expédiée', 'Livrée', 'Annulée'];
        
        for ($i = 0; $i < 5; $i++) {
            $commande = new Commande();
            $commande->setDateCommande(new \DateTime('-' . rand(1, 30) . ' days'));
            $commande->setStatut($faker->randomElement($statuts));
            $commande->setAcheteur($faker->randomElement($users));
            $commande->setTotal(0);
            $manager->persist($commande);

            // Ajout de 1 à 3 pièces aléatoires
            $total = 0;
            $nbPieces = rand(1, 3);
            for ($j = 0; $j < $nbPieces; $j++) {
                $piece = $faker->randomElement($pieces);
                $ligne = new LigneCommande();
                $ligne->setCommande($commande);
                $ligne->setPiece($piece);
                $ligne->setQuantite(rand(1, 2));
                $ligne->setPrixUnitaire($piece->getPrix());
                $manager->persist($ligne);
                $total += $piece->getPrix() * $ligne->getQuantite();
            }
            $commande->setTotal($total);
        }

        $manager->flush();
    }
}