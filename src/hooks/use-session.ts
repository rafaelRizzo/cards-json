// Sessão atual (reativa): re-renderiza quando entra ou sai.
import { useSyncExternalStore } from "react"
import { auth } from "@/lib/auth"

export const useSession = () => useSyncExternalStore(auth.subscribe, auth.getSnapshot)
