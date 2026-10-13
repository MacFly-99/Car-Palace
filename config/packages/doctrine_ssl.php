<?php

use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;

return static function (ContainerConfigurator $container): void {
    $ca = $_SERVER['DB_SSL_CA'] ?? $_ENV['DB_SSL_CA'] ?? getenv('DB_SSL_CA');

    if ($ca) {
        $container->extension('doctrine', [
            'dbal' => [
                'options' => [
                    \PDO::MYSQL_ATTR_SSL_CA => $ca,
                ],
            ],
        ]);
    }
};