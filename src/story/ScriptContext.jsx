import { createContext, useContext, useMemo } from "react";
import { resolveScript } from "./scripts";
import { withStories } from "../ideas";

const ScriptContext = createContext(null);

// Makes one resolved script (its wording, demos and pacing) available to the whole walkthrough.
export function ScriptProvider({ id, children }) {
  const value = useMemo(() => {
    const script = resolveScript(id);
    return { ...script, ideas: withStories(script.reel) };
  }, [id]);
  return <ScriptContext.Provider value={value}>{children}</ScriptContext.Provider>;
}

export const useScript = () => useContext(ScriptContext);
