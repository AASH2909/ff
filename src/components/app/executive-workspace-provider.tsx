"use client";

import * as React from "react";
import {
  defaultExecutiveWorkspace,
  readExecutiveWorkspace,
  updateExecutiveWorkspace,
  writeExecutiveWorkspace,
  type ExecutiveWorkspace
} from "@/components/app/executive-workspace";

type ExecutiveWorkspaceContextValue = {
  workspace: ExecutiveWorkspace;
  updateWorkspace: (update: Partial<ExecutiveWorkspace>) => void;
};

const ExecutiveWorkspaceContext =
  React.createContext<ExecutiveWorkspaceContextValue | null>(null);

export function ExecutiveWorkspaceProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const [workspace, setWorkspace] = React.useState(defaultExecutiveWorkspace);

  React.useEffect(() => {
    setWorkspace(readExecutiveWorkspace(window.localStorage));
  }, []);

  const updateWorkspace = React.useCallback(
    (update: Partial<ExecutiveWorkspace>) => {
      setWorkspace((current) => {
        const next = updateExecutiveWorkspace(current, update);
        writeExecutiveWorkspace(window.localStorage, next);
        return next;
      });
    },
    []
  );

  const value = React.useMemo(
    () => ({ workspace, updateWorkspace }),
    [workspace, updateWorkspace]
  );

  return (
    <ExecutiveWorkspaceContext.Provider value={value}>
      {children}
    </ExecutiveWorkspaceContext.Provider>
  );
}

export function useExecutiveWorkspace() {
  const value = React.useContext(ExecutiveWorkspaceContext);
  if (!value) {
    throw new Error(
      "useExecutiveWorkspace must be used within ExecutiveWorkspaceProvider"
    );
  }
  return value;
}
