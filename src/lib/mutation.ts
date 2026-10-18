// Padrão de toast das mutations (loading -> success/error, nunca silencioso).
import { toast } from "sonner"

// `error` pode ser uma função quando a mensagem depende do motivo da falha (ex.: limite de fixados).
type ToastMessages = { loading: string; success: string; error: string | ((error: unknown) => string) }

// Devolve o resultado ou null em caso de erro: quem chama decide se fecha o dialog.
export const withToast = async <T>(run: () => Promise<T>, messages: ToastMessages): Promise<T | null> => {
    const id = toast.loading(messages.loading)
    try {
        const result = await run()
        toast.success(messages.success, { id })
        return result
    } catch (error) {
        console.error(error)
        toast.error(typeof messages.error === "function" ? messages.error(error) : messages.error, { id })
        return null
    }
}
