import { THEME_STORAGE_KEY } from '../config';

const script = `(function(){try{var t=localStorage.getItem('${THEME_STORAGE_KEY}');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;var r=document.documentElement;r.classList.toggle('dark',d);r.style.colorScheme=d?'dark':'light';}catch(e){}})();`;

/** Aplica el tema guardado (o el del sistema) antes del primer pintado, evitando el parpadeo. */
export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
