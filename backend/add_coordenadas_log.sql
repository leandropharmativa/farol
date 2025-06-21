-- Adicionar colunas de coordenadas na tabela farol_farmacia_pedido_logs
ALTER TABLE farol_farmacia_pedido_logs 
ADD COLUMN latitude DECIMAL(10, 8),
ADD COLUMN longitude DECIMAL(11, 8),
ADD COLUMN accuracy DECIMAL(5, 2);

-- Comentários para documentar as colunas
COMMENT ON COLUMN farol_farmacia_pedido_logs.latitude IS 'Latitude da localização do usuário ao registrar a etapa';
COMMENT ON COLUMN farol_farmacia_pedido_logs.longitude IS 'Longitude da localização do usuário ao registrar a etapa';
COMMENT ON COLUMN farol_farmacia_pedido_logs.accuracy IS 'Precisão da localização em metros'; 