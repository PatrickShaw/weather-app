import * as React from 'react';
interface ActionBarProps {
  title: string;
  subtitle: string;
}
class ActionBar extends React.Component<ActionBarProps, void> {
  render() {
    return (
      <header>
        <h1>{this.props.title}</h1>
        <h2>{this.props.subtitle}</h2>
      </header>
    );
  }
}
export default ActionBar;
export {ActionBar};
