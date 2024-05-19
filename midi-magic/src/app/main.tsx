import { render } from 'preact';

import { App } from './App.tsx';
import './global.css';

render(
  <App />,
  document.getElementById( 'app' )!,
);
