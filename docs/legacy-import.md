# Testar a importação do app antigo

O app antigo guardava tudo no `localStorage`, chave `cards-storage`, no formato do zustand persist. Como o
`localStorage` é por **origem** (protocolo + domínio + porta), o jeito mais simples de simular é gravar essa chave
direto no navegador, na mesma origem do app novo (`http://localhost:5173`).

## 1. Gravar dados de teste

Abra o app em `http://localhost:5173` (pode estar na tela de login ou logado), abra o DevTools (F12) → Console e cole:

```js
const card = (title, content, icon = "FlameIcon", color = "red") => ({ id: Date.now() + Math.random(), title, content, icon, color })

const cards = [
    // entram normais
    card("Saudação inicial", "Olá, tudo bem? Meu nome é Rafael, falo da empresa X.", "PhoneIcon", "sky"),
    card("Contorno: preço alto", "Entendo! Posso te mostrar como o plano se paga.", "MessageCircleIcon", "green"),
    // entram ajustados
    card("Título com\nquebra de linha", "O título vira uma linha só."),
    card("Ícone e cor inexistentes", "Cai no padrão (FlameIcon, red).", "IconeQueNaoExiste", "rosa-choque"),
    { id: Date.now() + 1, title: "Sem cor nem ícone", content: "Campos ausentes viram o padrão." },
    // ficam de fora (e aparecem no aviso)
    card("T".repeat(81), "Título com 81 caracteres: acima do limite de 80."),
    card("Texto enorme", "x".repeat(5001)),
    card("", "Sem título."),
    // lixo que o app antigo nunca geraria: ignorado sem aviso
    null,
]

localStorage.setItem("cards-storage", JSON.stringify({ state: { cards }, version: 0 }))
console.log("Gravado:", cards.length, "itens")
```

Depois **recarregue a página**.

## 2. O que deve acontecer

Ao entrar na conta aparece o diálogo **"Importar seus cards antigos?"** dizendo que encontrou **8 cards** (o `null` não
conta). Ao importar:

| Card de teste | Resultado |
| --- | --- |
| Saudação inicial, Contorno: preço alto | Importados como estão |
| Título com quebra de linha | Importado como "Título com quebra de linha" |
| Ícone e cor inexistentes | Importado com ícone de chama e cor vermelha |
| Sem cor nem ícone | Importado com ícone de chama e cor vermelha |
| Título de 81 caracteres, texto de 5.001 caracteres, título vazio | **Não** importados; o aviso lista os títulos |

Resultado esperado: **5 importados** e **3 ignorados** (um aviso amarelo lista os 3 títulos que ficaram de fora).

## 3. Repetir o teste

- Aceitar o diálogo grava `cards-legacy-import:<id do usuário> = "done"`; "Agora não" grava `"dismissed"`.
  Para ver o diálogo de novo, apague essa chave no DevTools → Application → Local Storage.
  Para "dispensado", basta usar o item **Importar cards antigos** do menu da conta.
- Importar de novo **duplica** os cards (o app só acrescenta); apague os de teste pela lista antes de repetir.
- Para limpar os dados simulados: `localStorage.removeItem("cards-storage")`.

## 4. Testar com o app antigo de verdade

O `odd/` roda em outra porta, então o `localStorage` dele **não** é visível ao app novo. Duas formas:

1. **Mesma origem**: pare o app novo, rode o antigo na porta 5173 (`cd odd && pnpm install && pnpm dev -p 5173`), crie
   cards nele, pare e suba o app novo na mesma porta. O navegador reaproveita o `localStorage`.
2. **Arquivo**: no app antigo, menu → Exportar Cards, e no app novo use **Importar cards** no menu da conta. O arquivo
   antigo é aceito (é uma lista de `{ id, title, content, icon, color }`).
