import './AppBar.css';

import * as React from 'react';

interface ActionBarProps {
  readonly title: string;
  readonly subtitle: string;
}
/**
 * The action bar for Full Lambda
 */
const ActionBar: React.SFC<ActionBarProps> = ({title, subtitle}: ActionBarProps) => (
  <header className='app-bar'>
    <h1 className='txt-app-bar-title light'>{title}</h1>
    <h2 className='txt-app-bar-subtitle light'>{subtitle}</h2>
  </header>
);

export default ActionBar;
export {ActionBar};
