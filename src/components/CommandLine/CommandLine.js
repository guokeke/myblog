import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './CommandLine.css';
import Line from '../Line/Line.js'; // eslint-disable-line import/no-named-as-default
import LastLine from '../Line/LastLine.js';
import appState from '../../core/state.js';
import BaseComponent from '../BaseComponent';


class CommandLine extends BaseComponent {

  constructor(props) {
    super(props);

    this.state = {
      historyCommands: [],
      currentCommand: [],
      hideLastLine: false,
      lastLoginTime: '...',
      lastLoginIp: '...',
      showLoginInfo: false,
    };
    this.internalState = [];
    for (const p in this.state) { // eslint-disable-line
      this.internalState.push(p);
    }
    this.stateListener = this.stateListener.bind(this);
    this.updateLimit = 0;
  }

  didUpdate() { // eslint-disable-line class-methods-use-this
    appState.trigger('toBottom');
  }

  stateListener(newState, stateName) {
    this.setState({
      [stateName]: newState,
    });
  }

  renderHeadInfo() {
    const { lastLoginIp, lastLoginTime, showLoginInfo } = this.state;
    if (!showLoginInfo) return null;
    return (
      <div>
        <Line text={'Welcome to my blog!'} />
        <Line text={'Type help for a list of commands.'} />
        <Line
          text={
            ('Last login'
              + ` ${new Date(Date.parse(lastLoginTime) + (3600 * 8000)).toUTCString()}`
              + ` from ${lastLoginIp}.`).replace('GMT', 'China Time')
            }
        />
        <Line text={' '} />
      </div>
    );
  }

  render() {
    const { historyCommands, hideLastLine } = this.state;
    return (
      <div className={s.commandLine} ref={(e) => { this.contentElement = e; }}>
        { this.renderHeadInfo() }
        {
          historyCommands.map((val, idx) =>
            (<Line {...val} key={idx.toString()} />))
        }
        <LastLine hide={hideLastLine} />
      </div>
    );
  }

}

export default withStyles(s)(CommandLine);
