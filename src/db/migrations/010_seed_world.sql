-- Seed regions
INSERT INTO regions (id, name, climate, culture, dominant_power, narrative_tone) VALUES
('planicies_arvel', 'Planícies de Arvel', 'Temperado, invernos moderados, verões quentes e longos', 'Agrária, familiar, tradição oral forte', 'Pequenos lordes rurais, Guilda dos Artesãos Unidos', 'Começo de tudo. Familiar, lento, com a sensação de que o mundo grande existe mas ainda está longe.'),
('costa_maren', 'Costa de Maren', 'Úmido, ventos constantes, invernos chuvosos', 'Cosmopolita, pragmática, multilíngue, orientada para negócios', 'Irmandade do Estreito, famílias mercantes, Guilda das Especiarias', 'Movimento, oportunidade, perigo discreto. O mundo maior chegando em forma de barco.'),
('serra_duren', 'Serra de Duren', 'Frio, neve no inverno, verões curtos', 'Clânica, guerreira, desconfiada de estranhos', 'Clãs Duren (Clã Roth, Clã Vael, Clã Murn)', 'Duro, leal, isolado. O passado que o resto de Valdrim está esquecendo.'),
('vale_rio_maren', 'Vale do Rio Maren', 'Temperado úmido, cheias sazonais', 'Transitória, mista, muita circulação de pessoas', 'GMV, Igreja de Auren', 'Passagem, encontro, diversidade de tipos humanos. Lugar de quem está indo a algum lugar.'),
('territorio_korrath', 'Território de Korrath', 'Temperado clássico', 'Feudal organizada, nobreza ativa, cavalaria, corte', 'Coroa de Korrath, nobreza territorial, cavalaria real', 'Poder visível, hierarquia clara, oportunidade e armadilha em igual medida.')
ON CONFLICT (id) DO NOTHING;

-- Seed locations
INSERT INTO locations (id, name, region_id, type, population, description, connections) VALUES
('veldra', 'Veldra', 'planicies_arvel', 'agrarian_village', 400, 'Vila agrária. Local de início de todos os personagens.', '[{"locationId":"arvel","travelDays":2},{"locationId":"passo_korven","travelDays":4}]'),
('arvel', 'Arvel', 'planicies_arvel', 'larger_village', 1800, 'Vila maior, centro agrário regional.', '[{"locationId":"veldra","travelDays":2},{"locationId":"korrath_capital","travelDays":1},{"locationId":"maren_sul","travelDays":1}]'),
('porto_maren', 'Porto Maren', 'costa_maren', 'port_city', 12000, 'Cidade portuária, hub comercial principal.', '[{"locationId":"salcove","travelDays":1},{"locationId":"maren_sul","travelDays":1},{"locationId":"mercado_borda","travelDays":1}]'),
('salcove', 'Salcove', 'costa_maren', 'fishing_village', 900, 'Vila costeira de pescadores.', '[{"locationId":"porto_maren","travelDays":1}]'),
('cova_especiarias', 'Cova das Especiarias', 'costa_maren', 'trading_post', 300, 'Entreposto comercial da Guilda das Especiarias.', '[{"locationId":"porto_maren","travelDays":1},{"locationId":"arvel","travelDays":2}]'),
('durenfall', 'Durenfall', 'serra_duren', 'clan_village', 600, 'Aldeia clânica, sede do Clã Roth.', '[{"locationId":"passo_korven","travelDays":2}]'),
('passo_korven', 'Passo de Korven', 'serra_duren', 'checkpoint', 150, 'Posto de controle entre Serra e planícies.', '[{"locationId":"durenfall","travelDays":2},{"locationId":"arvel","travelDays":2},{"locationId":"grenn","travelDays":1}]'),
('maren_sul', 'Maren Sul', 'vale_rio_maren', 'river_city', 5000, 'Cidade fluvial, centro religioso e administrativo.', '[{"locationId":"porto_maren","travelDays":1},{"locationId":"arvel","travelDays":1},{"locationId":"korrath_capital","travelDays":2},{"locationId":"mosteiro_vel","travelDays":1}]'),
('aldeia_fenk', 'Aldeia de Fenk', 'vale_rio_maren', 'river_village', 350, 'Aldeia fluvial de barqueiros.', '[{"locationId":"maren_sul","travelDays":1},{"locationId":"arvel","travelDays":2}]'),
('mosteiro_vel', 'Mosteiro de Vel', 'vale_rio_maren', 'monastery', 80, 'Escola da Ordem dos Vorants.', '[{"locationId":"maren_sul","travelDays":1}]'),
('korrath_capital', 'Korrath Capital', 'territorio_korrath', 'capital_city', 18000, 'Capital do reino, maior cidade da região.', '[{"locationId":"arvel","travelDays":1},{"locationId":"maren_sul","travelDays":2},{"locationId":"grenn","travelDays":1},{"locationId":"sethr","travelDays":1},{"locationId":"convento_alleth","travelDays":1},{"locationId":"mercado_borda","travelDays":1}]'),
('grenn', 'Fortaleza de Grenn', 'territorio_korrath', 'fortress', 400, 'Guarnição de fronteira norte de Korrath.', '[{"locationId":"korrath_capital","travelDays":1},{"locationId":"passo_korven","travelDays":1}]'),
('sethr', 'Vila de Sethr', 'territorio_korrath', 'artisan_village', 1200, 'Vila artesanal especializada em metalurgia.', '[{"locationId":"korrath_capital","travelDays":1}]'),
('convento_alleth', 'Convento de Alleth', 'territorio_korrath', 'convent', 60, 'Convento e hospital rural da Igreja.', '[{"locationId":"korrath_capital","travelDays":1},{"locationId":"maren_sul","travelDays":2}]'),
('mercado_borda', 'Mercado de Borda', 'territorio_korrath', 'border_market', 500, 'Mercado de fronteira, zona cinza.', '[{"locationId":"korrath_capital","travelDays":1},{"locationId":"porto_maren","travelDays":1},{"locationId":"arvel","travelDays":2}]')
ON CONFLICT (id) DO NOTHING;

-- Seed world events
INSERT INTO world_events (id, name, description, region_id, location_ids, is_active) VALUES
('tensao_clans', 'Tensão entre Clã Roth e Clã Vael', 'Disputa por pasto alto na Serra.', 'serra_duren', '["durenfall"]', true),
('rota_especiarias_ameacada', 'Rota de Especiarias Ameaçada', 'Piratas no Estreito afetam preços.', 'costa_maren', '["porto_maren","cova_especiarias"]', true),
('doenca_colheitas', 'Doença nas Colheitas de Arvel', 'Escassez de grãos, preços sobem.', 'planicies_arvel', '["arvel","veldra"]', true),
('sucessao_korrath', 'Sucessão em Korrath', 'O rei não tem herdeiro claro.', 'territorio_korrath', '["korrath_capital"]', true),
('mestre_vorant_desaparece', 'Mestre Vorant de Vel Desaparece', 'Aprendizes sem orientação.', 'vale_rio_maren', '["mosteiro_vel"]', true),
('navio_encalha', 'Navio do Além-Estreito Encalha', 'Carga desconhecida começa a circular.', 'costa_maren', '["salcove"]', true),
('operacao_guarda_borda', 'Operação da Guarda no Mercado de Borda', 'Rede de atravessadores se fragmenta.', 'territorio_korrath', '["mercado_borda"]', true)
ON CONFLICT (id) DO NOTHING;
