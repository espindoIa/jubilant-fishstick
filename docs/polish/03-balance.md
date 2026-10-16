# Lote 3 — equilíbrio medido

Mudança no jogo: somente ATK da Armadura Titã,36→32. HP2400, MAG28, escudo8, Varek, ATB, dificuldades, custos de MP, ECO, EXP, preços e recompensas preservados. O problema medido foi a sequência sem recuperação Varek→Titã, não todos os encontros.

Simulador `tools/balance-sim.mjs`: avalia a classe Battle real, importa GameState/dados e executa ATB/dano/escudos/IA/técnicas/itens/Ressonância. Renderizador, áudio e esperas de animação são substituídos. RNG com300 sementes iguais por combinação; hashes de fonte/configuração nos JSONs. Construção de combatentes reproduz build sem WebGL: não há afirmação de paridade total com o navegador. `activeSeconds` mede tempo ativo de ATB e exclui animação/escolha; não é duração percebida.

26 formações×3 dificuldades×300 amostras =23.400 lutas antes e23.400 depois. Grupos iniciais e1/e2 do bosque L1; e3–e7 L2; e8 é exclusivo do cap2 e foi corrigido para trio L4 (a medição exploratória que o tratava como Lio L1 foi rejeitada). Caverna L4 e forte L6; chefes têm checkpoints explicitados. Cada encontro independente começa recuperado: isso não simula desgaste de toda a campanha.

Sequência final: L7+150EXP ao entrar em Varek, equipamento encontrado nos baús/queda garantida do Golem, sem Vínculos opcionais,6 poções/2 éteres/2 penas. HP/MP/status/inventário e EXP de Varek são carregados para Titã.

| Medida Titã | Calma antes→depois | Normal antes→depois | Desafio antes→depois |
|---|---:|---:|---:|
| Derrotas /300 |0→0|13→4|136→77|
| Dano recebido médio |338,80→277,42|666,79→548,49|1161,31→1064,98|
| Poções médias |1,20→0,89|3,01→2,44|4,93→4,65|
| Segundos ativos |15,08→14,42|22,62→21,40|33,33→33,29|

Contraprova: mesma cura/itens/ECO com primeira técnica ofensiva, sem seleção adaptativa por fraqueza, perde17/300 no Normal e201/300 no Desafio após ajuste. Isso ainda acerta algumas fraquezas por acaso; não é um modo “zero fraquezas”.

ECO: encontros comuns do forte começaram com30 e terminaram, no Normal, com médias40,85–51,46, sem Ressonância em todos eles. Ressonância e Repetir foram acessados por toque no lote2. MP e itens continuam relevantes: a sequência final custa129,88MP no Normal e148,96 no Desafio (uso de éter incluído). Não foram reduzidos custos com base em encontros recuperados artificialmente.

Exploração: cajado lunar, lança de guerra, astrolábio de prata, malha de aço e broche mudam o resultado; sem esses equipamentos a sequência era muito mais dura. Vínculos: +4%HP por conversa e25% na dupla correspondente. Equipar já mostra estatísticas atuais→previstas; conferido na captura de toque. Baús/Estilhaços dão equipamento/recursos e colar ao completar6; a correção da posição e da duplicação é do lote1.

Economia auditada: início60moedas; primeira passagem+chefes até Varek rende1777, baús de moeda300; poção30, éter150, pena220, pousada20 e cristais gratuitos. Não há demonstração de necessidade de alterar toda essa economia. Roteamento/decisões de compra e experiência humana continuam limites da simulação. Não há garantia estatística de vitória para toda pessoa, mas o Normal pode ser vencido nos níveis medidos sem treinar por respawns.

Reprodução:
```
N=300 node tools/balance-sim.mjs
N=300 ONLY=tita LEVEL=7 START_EXP=150 CHAIN=1 GEAR=chests node tools/balance-sim.mjs
N=300 ONLY=tita LEVEL=7 START_EXP=150 CHAIN=1 GEAR=chests NAIVE=1 node tools/balance-sim.mjs
```
