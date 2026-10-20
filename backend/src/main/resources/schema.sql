CREATE TABLE IF NOT EXISTS crm_users (
    id BIGINT NOT NULL AUTO_INCREMENT,
    email VARCHAR(180) NOT NULL,
    password_hash VARCHAR(100) NOT NULL,
    display_name VARCHAR(120) NOT NULL,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    UNIQUE KEY uk_crm_users_email (email)
);

CREATE TABLE IF NOT EXISTS conversations (
    id BIGINT NOT NULL AUTO_INCREMENT,
    phone VARCHAR(30) NOT NULL,
    contact_name VARCHAR(120) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    assigned_user_id BIGINT NULL,
    last_message TEXT NULL,
    last_message_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    UNIQUE KEY uk_conversations_phone (phone),
    INDEX idx_conversations_status_updated (status, last_message_at),
    CONSTRAINT fk_conversations_user FOREIGN KEY (assigned_user_id) REFERENCES crm_users(id)
);

CREATE TABLE IF NOT EXISTS conversation_messages (
    id BIGINT NOT NULL AUTO_INCREMENT,
    conversation_id BIGINT NOT NULL,
    external_id VARCHAR(160) NULL,
    direction VARCHAR(10) NOT NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    UNIQUE KEY uk_messages_external_id (external_id),
    INDEX idx_messages_conversation_created (conversation_id, created_at),
    CONSTRAINT fk_messages_conversation FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);
