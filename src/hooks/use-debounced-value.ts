// Devolve o valor só depois que ele parou de mudar por `delay` ms (evita uma consulta por tecla na busca).
import { useEffect, useState } from "react"

export const useDebouncedValue = <T>(value: T, delay = 300) => {
    const [debounced, setDebounced] = useState(value)

    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay)
        return () => clearTimeout(timer)
    }, [value, delay])

    return debounced
}
