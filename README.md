# Pizza Empire Tycoon 2.0

Jogo 3D de gerenciamento de pizzaria (React + Vite + Three.js / React Three Fiber).

## Instalação e execução
Requisitos: Node.js 20+.

```bash
npm install      # instalar
npm run dev      # executar (abra http://localhost:5173)
npm run build    # compilar para produção (pasta dist)
npm run preview  # testar a versão compilada
```

## Como jogar
- Clientes chegam, pedem no caixa, sentam, recebem a pizza, comem, pagam e saem.
- No início você (gerente) faz tudo; use **Ajudar na cozinha** para acelerar.
- Nível 2: contrate pizzaiolos, garçons e caixas (aba Equipe). Nível 3: entregadores (delivery).
- Loja: equipamentos de Cozinha, Máquinas, Salão, Conforto e Decoração — todos afetam o jogo e aparecem no cenário.
- Melhorias: forno, agilidade, marketing, receitas, ampliações (cozinha/varanda) e franquia (nível 5).
- Às 22h o dia fecha: salários e custos operacionais são descontados (veja Finanças).

## Controles
Arrastar: mover câmera · Botão direito: girar · Roda: zoom · WASD/setas: mover · Q/E: girar · Espaço: pausar · 1/2/3: velocidade · Clique em personagem: detalhes.

## Estrutura
- `src/systems` — store (economia/save), simulação, IA de clientes e funcionários, pedidos, pathfinding A*.
- `src/characters` — personagens modulares procedurais (rosto, cabelos, uniformes, animações).
- `src/game` — cenário 3D: restaurante, cidade, iluminação dia/noite, câmera.
- `src/components` — interface (barra superior, menus, barra inferior, modais).
- `src/data` — layout, loja, receitas, equipe, temas.

Todos os modelos e texturas são procedurais (gerados em código), sem assets externos.
O save da v1 é migrado automaticamente; o original está em `_backup_original/`.
