import * as React from 'react';
import './AppBar.scss';
interface ActionBarProps {
  title: string;
  subtitle: string;
}
class ActionBar extends React.Component<ActionBarProps, void> {
  render() {
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
