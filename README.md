CREATE TABLE seriais (
  id UUID PRIMARY KEY,
  codigo TEXT UNIQUE NOT NULL,
  nome_empresa TEXT NOT NULL,
  email_vinculado TEXT NOT NULL,
  validade_ate TIMESTAMP NOT NULL,
  ativo BOOLEAN DEFAULT true,
  usado_em TIMESTAMP,
  farmacia_id UUID
);
