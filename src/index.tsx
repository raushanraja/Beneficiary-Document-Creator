/* @refresh reload */
import './index.css';
import { render } from 'solid-js/web';

import App from './App';

const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
  );
}

// Devtools stay out of the production bundle: the dynamic import is
// dropped entirely when `import.meta.env.DEV` compiles to false.
if (import.meta.env.DEV) {
  void import('solid-devtools');
}

render(() => <App />, root!);
