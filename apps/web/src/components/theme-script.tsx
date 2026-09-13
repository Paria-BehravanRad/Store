/** Prevent flash of wrong theme before hydration */
export function ThemeScript() {
  const code = `
(function(){
  try {
    var stored = localStorage.getItem('viraplaza.theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = stored === 'light' || stored === 'dark' ? stored : (prefersDark ? 'dark' : 'light');
    var root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    root.style.colorScheme = theme;
  } catch (e) {}
})();`;

  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
