import { useEffect, useId, useRef } from "react";
import { scopeCss } from "@/lib/custom-page";

/**
 * Renders admin-authored HTML/CSS/JS for a single custom page.
 * CSS is scoped to this container and JS runs only while this page is mounted.
 */
export function CustomPageRender({
  html,
  css,
  js,
}: {
  html?: string;
  css?: string;
  js?: string;
}) {
  const reactId = useId().replace(/[^a-zA-Z0-9]/g, "");
  const containerId = `custom-page-${reactId}`;
  const ref = useRef<HTMLDivElement>(null);
  const scoped = css ? scopeCss(css, `#${containerId}`) : "";

  useEffect(() => {
    const code = js?.trim();
    if (!code || !ref.current) return;
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.text = `(function(){try{var pageRoot=document.getElementById(${JSON.stringify(
      containerId,
    )});${code}\n}catch(e){console.error("Custom page script error:",e);}})();`;
    document.body.appendChild(script);
    return () => {
      script.remove();
    };
  }, [js, containerId]);

  return (
    <>
      {scoped ? <style dangerouslySetInnerHTML={{ __html: scoped }} /> : null}
      <div id={containerId} ref={ref} dangerouslySetInnerHTML={{ __html: html ?? "" }} />
    </>
  );
}
