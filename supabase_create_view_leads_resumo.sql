-- ============================================================
-- View: leads_resumo
-- Retorna 1 linha por telefone com dados agregados de conversas.
-- Substitui a busca de todas as mensagens no CRM Leads, tornando
-- a consulta escalável independente do volume de mensagens.
-- ============================================================
-- Execute este SQL no Supabase: Dashboard → SQL Editor → New Query
-- ============================================================

CREATE OR REPLACE VIEW leads_resumo AS
WITH ultima AS (
  -- Última mensagem de cada telefone
  SELECT DISTINCT ON (telefone)
    telefone,
    mensagem   AS ultima_mensagem,
    created_at AS ultimo_contato
  FROM conversas
  ORDER BY telefone, created_at DESC, id DESC
),
primeira AS (
  -- Primeira mensagem de cada telefone
  SELECT DISTINCT ON (telefone)
    telefone,
    created_at AS primeiro_contato
  FROM conversas
  ORDER BY telefone, created_at ASC, id ASC
),
primeiro_vendedor_humano AS (
  -- Primeiro vendedor humano (ignora 'bot' e 'desconhecido')
  SELECT DISTINCT ON (telefone)
    telefone,
    vendedor
  FROM conversas
  WHERE vendedor IS NOT NULL
    AND LOWER(TRIM(COALESCE(vendedor, ''))) NOT IN ('bot', 'desconhecido', '')
  ORDER BY telefone, created_at ASC, id ASC
),
qualquer_vendedor AS (
  -- Fallback: qualquer vendedor (caso não haja humano)
  SELECT DISTINCT ON (telefone)
    telefone,
    vendedor
  FROM conversas
  WHERE vendedor IS NOT NULL AND TRIM(vendedor) != ''
  ORDER BY telefone, created_at ASC, id ASC
),
ultimo_tipo AS (
  -- Tipo mais recente e relevante (ignora 'desconhecido')
  SELECT DISTINCT ON (telefone)
    telefone,
    tipo
  FROM conversas
  WHERE tipo IS NOT NULL AND tipo <> 'desconhecido'
  ORDER BY telefone, created_at DESC, id DESC
),
stats AS (
  -- Contagens por telefone
  SELECT
    telefone,
    COUNT(*)                AS total_msgs,
    BOOL_OR(de = 'cliente') AS tem_msg_cliente,
    BOOL_OR(de = 'bot')     AS tem_msg_bot
  FROM conversas
  GROUP BY telefone
)
SELECT
  s.telefone,
  p.primeiro_contato,
  u.ultimo_contato,
  u.ultima_mensagem,
  COALESCE(pvh.vendedor, qv.vendedor, 'desconhecido') AS vendedor,
  COALESCE(ut.tipo, 'desconhecido')                   AS tipo,
  s.total_msgs,
  s.tem_msg_cliente,
  s.tem_msg_bot
FROM stats                         s
JOIN ultima                        u   ON u.telefone  = s.telefone
JOIN primeira                      p   ON p.telefone  = s.telefone
LEFT JOIN primeiro_vendedor_humano pvh ON pvh.telefone = s.telefone
LEFT JOIN qualquer_vendedor        qv  ON qv.telefone  = s.telefone
LEFT JOIN ultimo_tipo              ut  ON ut.telefone  = s.telefone;

-- Verificar se a view foi criada corretamente:
-- SELECT * FROM leads_resumo LIMIT 5;
