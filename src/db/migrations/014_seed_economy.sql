INSERT INTO resources (id, name, category, base_price, weight, description) VALUES
  ('trigo', 'Trigo', 'raw', 3.0, 2.0, 'Grão cultivado nos campos de Veldra'),
  ('madeira', 'Madeira', 'raw', 5.0, 4.0, 'Tábuas cortadas da Serra de Duren'),
  ('ferro', 'Ferro Bruto', 'raw', 12.0, 6.0, 'Minério extraído das minas de Korrath'),
  ('erva_curativa', 'Erva Curativa', 'raw', 8.0, 1.0, 'Plantas medicinais do Vale do Rio Maren'),
  ('couro', 'Couro Cru', 'raw', 7.0, 3.0, 'Pele curtida dos rebanhos locais'),
  ('argila', 'Argila', 'raw', 2.0, 5.0, 'Barro versátil das margens do rio'),
  ('pedra', 'Pedra Lavrada', 'raw', 4.0, 7.0, 'Blocos de pedra das pedreiras'),
  ('especiaria', 'Especiarias', 'raw', 25.0, 1.0, 'Raras especiarias da Cova das Especiarias'),
  ('cristal_vora', 'Cristal de Vora', 'raw', 40.0, 1.0, 'Cristais imbuídos de energia Vora'),
  ('sal', 'Sal Marinho', 'raw', 10.0, 3.0, 'Sal extraído das salinas da Costa de Maren'),
  ('pao', 'Pão', 'consumable', 4.0, 1.0, 'Pão fresco assado no forno comunitário'),
  ('cerveja', 'Cerveja', 'consumable', 6.0, 2.0, 'Cerveja encorpada dos tavernistas'),
  ('tecido', 'Tecido Fino', 'processed', 15.0, 2.0, 'Tecido fiado nos teares de Arvel'),
  ('ferramenta', 'Ferramentas', 'tool', 20.0, 5.0, 'Ferramentas forjadas na bigorna do artesão'),
  ('pocao_curativa', 'Poção Curativa', 'consumable', 18.0, 1.0, 'Poção que acelera a regeneração'),
  ('armadura_leve', 'Armadura Leve', 'weapon', 35.0, 8.0, 'Armadura de couro reforçada'),
  ('arma_simples', 'Arma Simples', 'weapon', 25.0, 5.0, 'Espada ou lança de qualidade mediana'),
  ('documento', 'Documento Oficial', 'processed', 30.0, 1.0, 'Documento selado pela guilda dos escribas'),
  ('mapa', 'Mapa da Região', 'processed', 22.0, 1.0, 'Mapa detalhado com rotas comerciais'),
  ('joia', 'Joia Artesanal', 'luxury', 60.0, 1.0, 'Joia ornamentada pelos ourives locais'),
  ('instrumento', 'Instrumento Musical', 'luxury', 45.0, 3.0, 'Alaúde ou flauta esculpida à mão'),
  ('livro', 'Livro Copiado', 'processed', 50.0, 2.0, 'Cópia iluminada de um manuscrito antigo'),
  ('runas', 'Pedra de Runas', 'magical', 55.0, 1.0, 'Pedra gravada com runas de proteção'),
  ('carne_seca', 'Carne Seca', 'consumable', 5.0, 2.0, 'Carne salgada e defumada'),
  ('queijo', 'Queijo Curado', 'consumable', 7.0, 2.0, 'Queijo envelhecido das fazendas de Veldra'),
  ('vela', 'Vela de Cera', 'consumable', 3.0, 1.0, 'Vela de cera de abelha para iluminação'),
  ('corda', 'Corda de Cânhamo', 'tool', 8.0, 3.0, 'Corda trançada resistente'),
  ('tonel', 'Tonel de Madeira', 'tool', 10.0, 6.0, 'Tonel para armazenar líquidos'),
  ('entorpecente', 'Óleo de Sonho', 'luxury', 35.0, 1.0, 'Óleo extraído de plantas raras, usado por poetas')
ON CONFLICT (id) DO NOTHING;

INSERT INTO inventories (character_id, gold, storage_capacity)
SELECT id, 50.0, 50.0 FROM characters
ON CONFLICT (character_id) DO NOTHING;

INSERT INTO market_prices (location_id, resource_id, current_price, base_price, volatility)
SELECT l.id, r.id,
  ROUND((r.base_price * (1 + (l.population::numeric - 500) / 10000) * (1 + (random() - 0.5) * 0.2))::numeric, 1),
  ROUND((r.base_price * (1 + (l.population::numeric - 500) / 10000))::numeric, 1),
  ROUND((0.05 + random() * 0.2)::numeric, 2)
FROM locations l, resources r
ON CONFLICT (location_id, resource_id) DO NOTHING;
