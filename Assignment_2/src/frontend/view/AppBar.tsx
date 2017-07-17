import './AppBar.scss';

import * as React from 'react';

interface ActionBarProps {
  readonly title: string;
  readonly subtitle: string;
}
/**
 * The action bar for Full Lambda
 */
class ActionBar extends React.Component<ActionBarProps, {}> {
  public render(): JSX.Element {
    return (
      <header className='app-bar'>
        <h1 className='txt-app-bar-title light'>{this.props.title}</h1>
        <h2 className='txt-app-bar-subtitle light'>{this.props.subtitle}</h2>
      </header>
    );
  }
}

export default ActionBar;
export {ActionBar};
