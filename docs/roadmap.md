# Roadmap e dívidas

Itens sugeridos, ainda **não** decididos. Ordem aproximada de valor/esforço. Marque como feito aqui ao entregar.

## Qualidade e confiança

- [ ] **Testes**: Vitest para `containsAnyOf`, `safeRedirect`, `cardFormSchema`, `cards-file`; Testing Library para
  `FieldFooter` e estados do dashboard (skeleton → lista → vazio). Hoje só existe `tsc` + Biome.
- [ ] **CI** (GitHub Actions): `pnpm install --frozen-lockfile`, `lint`, `typecheck`, `build` em PR.
- [ ] **README.md** de entrada do repositório (foi removido na migração) apontando para `docs/`.
- [ ] Verificação visual: nada foi conferido no navegador pelas últimas mudanças de loading e formulário.

## Experiência

- [ ] Atraso de ~150 ms no skeleton para respostas muito rápidas não piscarem.
- [ ] Atalho **Ctrl+K** (paleta) e copiar com um atalho no card selecionado.
- [ ] **Duplicar card** e **desfazer** após arquivar/apagar (toast com ação).
- [ ] Variáveis nos textos (`{{nome}}`) preenchidas na hora de copiar.
- [x] Fixar no topo (SQL `20261012153900_pin.sql` aplicado e front ligado); reforço opcional em `20261012154300_pin_hardening.sql`.
- [ ] Mais usados / recentes e tags (exigem mudança de schema).
- [ ] Foto do Google maior no topo do menu da conta.
- [ ] Remover animações em loop restantes (login e estado vazio) se quiser seguir à risca o padrão do `eco`.

## Banco e desempenho

- [ ] Índice `(user_id, created_at desc, id desc)` para a lista.
- [ ] Busca sem acento e com índice (`unaccent` + `pg_trgm`) se as contas passarem de alguns milhares de cards.
- [ ] Teto de cards por usuário (trigger opcional já escrito em `20261012153800_limits.sql`).
- [ ] Atualização otimista nas mutations de arquivar/apagar (hoje espera a invalidação).

## Pendências de execução (usuário)

- [ ] Confirmar que `20261012153600_sharing.sql`, `20261012153700_cron.sql` e `20261012153800_limits.sql` foram rodados, nessa ordem.
