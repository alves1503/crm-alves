ALTER TABLE conversations
ADD COLUMN ai_mode VARCHAR(20) NOT NULL DEFAULT 'AI';

CREATE TABLE service_catalog (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(140) NOT NULL,
    summary VARCHAR(300) NOT NULL,
    description TEXT NOT NULL,
    price_from DECIMAL(12, 2) NULL,
    price_to DECIMAL(12, 2) NULL,
    delivery_estimate VARCHAR(120) NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    INDEX idx_service_catalog_active (active, name)
);

CREATE TABLE leads (
    id BIGINT NOT NULL AUTO_INCREMENT,
    conversation_id BIGINT NULL,
    phone VARCHAR(30) NOT NULL,
    full_name VARCHAR(160) NULL,
    email VARCHAR(180) NULL,
    company VARCHAR(180) NULL,
    interest VARCHAR(500) NULL,
    notes TEXT NULL,
    stage VARCHAR(24) NOT NULL DEFAULT 'NEW',
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    UNIQUE KEY uk_leads_phone (phone),
    INDEX idx_leads_stage_updated (stage, updated_at),
    CONSTRAINT fk_leads_conversation FOREIGN KEY (conversation_id) REFERENCES conversations (id) ON DELETE SET NULL
);

CREATE TABLE meetings (
    id BIGINT NOT NULL AUTO_INCREMENT,
    lead_id BIGINT NOT NULL,
    conversation_id BIGINT NULL,
    starts_at TIMESTAMP(6) NOT NULL,
    duration_minutes SMALLINT NOT NULL DEFAULT 30,
    status VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED',
    notes VARCHAR(500) NULL,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    INDEX idx_meetings_start_status (starts_at, status),
    CONSTRAINT fk_meetings_lead FOREIGN KEY (lead_id) REFERENCES leads (id),
    CONSTRAINT fk_meetings_conversation FOREIGN KEY (conversation_id) REFERENCES conversations (id) ON DELETE SET NULL
);

CREATE TABLE ai_knowledge_sources (
    id BIGINT NOT NULL AUTO_INCREMENT,
    title VARCHAR(180) NOT NULL,
    content LONGTEXT NOT NULL,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    INDEX idx_knowledge_sources_updated (updated_at)
);

CREATE TABLE ai_knowledge_chunks (
    id BIGINT NOT NULL AUTO_INCREMENT,
    source_id BIGINT NOT NULL,
    chunk_index INT NOT NULL,
    content TEXT NOT NULL,
    embedding JSON NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_knowledge_source_chunk (source_id, chunk_index),
    CONSTRAINT fk_knowledge_chunk_source FOREIGN KEY (source_id) REFERENCES ai_knowledge_sources (id) ON DELETE CASCADE
);

CREATE TABLE ai_settings (
    setting_key VARCHAR(80) NOT NULL,
    setting_value LONGTEXT NOT NULL,
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (setting_key)
);

INSERT INTO
    service_catalog (
        name,
        summary,
        description,
        delivery_estimate
    )
VALUES (
        'Desenvolvimento de sistemas',
        'Sistemas web sob medida para processos e operacoes.',
        'Levantamento, desenvolvimento e evolucao de sistemas personalizados para o negocio.',
        'A definir apos levantamento'
    ),
    (
        'Automacao e integracoes',
        'Integracao de ferramentas e automacao de tarefas repetitivas.',
        'Automacao de processos e integracao entre sistemas, APIs e canais de atendimento.',
        'A definir apos levantamento'
    ),
    (
        'Consultoria em tecnologia',
        'Apoio para planejar arquitetura, produto e modernizacao.',
        'Diagnostico tecnico, desenho de solucao e planejamento de implementacao.',
        'Conforme escopo'
    );