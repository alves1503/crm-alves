package com.alvescrm.whatsapp;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class EvolutionInstanceBootstrap implements ApplicationRunner {

    private final EvolutionClient evolutionClient;

    public EvolutionInstanceBootstrap(EvolutionClient evolutionClient) {
        this.evolutionClient = evolutionClient;
    }

    @Override
    public void run(ApplicationArguments args) {
        evolutionClient.ensureInstance();
    }
}
