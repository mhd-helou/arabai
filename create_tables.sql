-- Create tables for ArabAI application
-- Execute this script in Google Cloud SQL (PostgreSQL)

-- 1. Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255),
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    is_email_verified BOOLEAN NOT NULL DEFAULT false,
    reset_password_token VARCHAR(255),
    reset_password_expire TIMESTAMP,
    provider_id VARCHAR(255),
    provider VARCHAR(20) NOT NULL DEFAULT 'email',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX idx_users_email ON users(email);

-- Add role constraint
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('user', 'admin'));

-- 2. Create conversations table
CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    provider VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_created_at ON conversations(created_at);

-- Add constraint to ensure valid provider
ALTER TABLE conversations ADD CONSTRAINT conversations_provider_check 
    CHECK (provider IN ('gemini', 'gpt', 'claude'));

-- 3. Create messages table
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    provider VARCHAR(50),
    tokens_used INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_conversation_created ON messages(conversation_id, created_at);

-- Add constraint to ensure valid role
ALTER TABLE messages ADD CONSTRAINT messages_role_check 
    CHECK (role IN ('user', 'assistant'));

-- Add constraint to ensure valid provider (nullable)
ALTER TABLE messages ADD CONSTRAINT messages_provider_check 
    CHECK (provider IS NULL OR provider IN ('gemini', 'gpt', 'claude'));