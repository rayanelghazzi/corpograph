import {
  createContext,
  useContext,
  useCallback,
  useRef,
  useState,
  type ReactNode,
} from "react";

interface PatchHighlightCtx {
  paths: Set<string>;
  addPaths: (paths: string[]) => void;
}

const Ctx = createContext<PatchHighlightCtx>({
  paths: new Set(),
  addPaths: () => {},
});

const FLASH_DURATION_MS = 1800;

export function PatchHighlightProvider({ children }: { children: ReactNode }) {
  const [paths, setPaths] = useState<Set<string>>(new Set());
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const addPaths = useCallback((incoming: string[]) => {
    if (incoming.length === 0) return;

    setPaths(new Set(incoming));

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setPaths(new Set());
    }, FLASH_DURATION_MS);
  }, []);

  return <Ctx.Provider value={{ paths, addPaths }}>{children}</Ctx.Provider>;
}

export function usePatchHighlight() {
  return useContext(Ctx);
}

/**
 * Returns the flash animation class if `fieldPath` matches any patched path.
 * Matching: either is a prefix of the other (covers both exact and parent matches).
 */
export function useFlashClass(fieldPath: string): string {
  const { paths } = useContext(Ctx);
  if (paths.size === 0) return "";

  for (const p of paths) {
    if (p === fieldPath || p.startsWith(fieldPath) || fieldPath.startsWith(p)) {
      return "animate-patch-flash rounded";
    }
  }
  return "";
}
