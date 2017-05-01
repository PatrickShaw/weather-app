import './AppBar.scss';

import * as React from 'react';

interface ActionBarProps {
  title: string;
  subtitle: string;
}

class ActionBar extends React.Component<ActionBarProps, void> {
  public render(): JSX.Element {
    return (
      <header className="app-bar">
        <h1 className="txt-app-bar-title light">{this.props.title}</h1>
        <h2 className="txt-app-bar-subtitle light">{this.props.subtitle}</h2>
      </header>
    );
  }
}

export default ActionBar;
export {ActionBar};
