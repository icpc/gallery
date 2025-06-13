// src/hooks/useHead.ts
import { useEffect } from "react";

export function useHead({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  useEffect(() => {
    // update document.title
    document.title = title;

    if (description) {
      let meta = document.querySelector<HTMLMetaElement>(
        "meta[name='description']",
      );
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("name", "description");
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", description);
    }
  }, [title, description]);
}
