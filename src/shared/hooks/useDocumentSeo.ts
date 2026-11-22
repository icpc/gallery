import { useEffect } from "react";

export interface DocumentSeoOptions {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  twitterCard?: string;
}

function upsertMetaTag(
  attrName: "name" | "property",
  attrValue: string,
  content: string,
): () => void {
  const selector = `meta[${attrName}="${attrValue}"]`;
  const existing = document.head.querySelector<HTMLMetaElement>(selector);
  if (existing) {
    const previous = existing.getAttribute("content");
    existing.setAttribute("content", content);
    return () => {
      if (previous === null) {
        existing.removeAttribute("content");
      } else {
        existing.setAttribute("content", previous);
      }
    };
  }

  const meta = document.createElement("meta");
  meta.setAttribute(attrName, attrValue);
  meta.setAttribute("content", content);
  document.head.appendChild(meta);
  return () => {
    meta.remove();
  };
}

/**
 * Lightweight native replacement for @unhead/react that updates document.title
 * and Open Graph / Twitter meta tags and restores previous values on unmount.
 */
export function useDocumentSeo(options: DocumentSeoOptions): void {
  const {
    title,
    description,
    ogTitle,
    ogDescription,
    ogImage,
    twitterTitle,
    twitterDescription,
    twitterImage,
    twitterCard,
  } = options;

  useEffect(() => {
    const cleanups: Array<() => void> = [];

    if (title !== undefined) {
      const previousTitle = document.title;
      document.title = title;
      cleanups.push(() => {
        document.title = previousTitle;
      });
    }

    const entries: Array<["name" | "property", string, string | undefined]> = [
      ["name", "description", description],
      ["property", "og:title", ogTitle],
      ["property", "og:description", ogDescription],
      ["property", "og:image", ogImage],
      ["name", "twitter:title", twitterTitle],
      ["name", "twitter:description", twitterDescription],
      ["name", "twitter:image", twitterImage],
      ["name", "twitter:card", twitterCard],
    ];

    for (const [attrName, attrValue, value] of entries) {
      if (value !== undefined) {
        cleanups.push(upsertMetaTag(attrName, attrValue, value));
      }
    }

    return () => {
      for (let i = cleanups.length - 1; i >= 0; i -= 1) {
        cleanups[i]?.();
      }
    };
  }, [
    title,
    description,
    ogTitle,
    ogDescription,
    ogImage,
    twitterTitle,
    twitterDescription,
    twitterImage,
    twitterCard,
  ]);
}
