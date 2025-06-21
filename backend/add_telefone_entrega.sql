-- Adicionar campo telefone_paciente na tabela farol_entregas
ALTER TABLE farol_entregas 
ADD COLUMN telefone_paciente VARCHAR(20);

-- Comentário para documentar o campo
COMMENT ON COLUMN farol_entregas.telefone_paciente IS 'Telefone do paciente para contato durante entrega'; 