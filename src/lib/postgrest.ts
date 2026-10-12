// Monta o filtro `or` de busca por trecho (ilike) com o texto do usuário escapado: nada do que ele digita vira sintaxe.
//   1) \ % _ viram literais do LIKE (senão "100%" ou "a_b" casariam com qualquer coisa);
//   2) o padrão vai entre aspas duplas, com \ e " escapados (vírgula e parênteses são sintaxe do `or`).
const escapeLike = (term: string) => term.replace(/[\\%_]/g, "\\$&")
const quote = (value: string) => `"${value.replace(/[\\"]/g, "\\$&")}"`

export const containsAnyOf = (columns: string[], term: string) => {
    const pattern = quote(`%${escapeLike(term)}%`)
    return columns.map((column) => `${column}.ilike.${pattern}`).join(",")
}
