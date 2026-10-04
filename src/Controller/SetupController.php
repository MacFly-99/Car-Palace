<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Console\Application;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Console\Output\BufferedOutput;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\KernelInterface;
use Symfony\Component\Routing\Annotation\Route;

class SetupController extends AbstractController
{
    /**
     * Route temporaire pour initialiser la base de données en production.
     * ⚠️ À SUPPRIMER une fois les migrations passées.
     */
    #[Route('/setup-database-car-palace-xyz', name: 'setup_database', methods: ['GET'])]
    public function setup(KernelInterface $kernel): JsonResponse
    {
        $application = new Application($kernel);
        $application->setAutoExit(false);

        $output = new BufferedOutput();
        $results = [];

        // 1. Migrations
        $input = new ArrayInput([
            'command' => 'doctrine:migrations:migrate',
            '--no-interaction' => true,
        ]);
        $application->run($input, $output);
        $results['migrations'] = $output->fetch();

        // 2. Génération des clés JWT
        $input = new ArrayInput([
            'command' => 'lexik:jwt:generate-keypair',
            '--skip-if-exists' => true,
        ]);
        $application->run($input, $output);
        $results['jwt_keys'] = $output->fetch();

        // 3. Fixtures
        $input = new ArrayInput([
            'command' => 'doctrine:fixtures:load',
            '--no-interaction' => true,
        ]);
        $application->run($input, $output);
        $results['fixtures'] = $output->fetch();

        // 4. Cache clear
        $input = new ArrayInput([
            'command' => 'cache:clear',
            '--env' => 'prod',
        ]);
        $application->run($input, $output);
        $results['cache'] = $output->fetch();

        return new JsonResponse([
            'status' => 'success',
            'message' => 'Base de données initialisée. ⚠️ Supprime cette route immédiatement.',
            'results' => $results,
        ]);
    }
}