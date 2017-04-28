import * as React from 'react';
interface ActionBarProps {
  title: string;
  subtitle: string;
}
class ActionBar extends React.Component<ActionBarProps, void> {
  render() {
    return (
      <header className="action-bar">
        <h1 className="txt-title-app-bar-title light">{this.props.title}</h1>
        <h2 className="txt-title-app-bar-subtitle light">{this.props.subtitle}</h2>
      </header>
    );
  }
}
export default ActionBar;
export {ActionBar};
