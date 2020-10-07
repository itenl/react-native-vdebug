import React, { Component } from 'react';
import { FlatList, Text, StyleSheet, View } from 'react-native';
import event from './event';
import { debounce } from './tool';

let logStack = null;

class LogStack {
  constructor() {
    this.logs = [];
    this.maxLength = 200;
    this.listeners = [];
    this.notify = debounce(10, false, this.notify);
  }

  getLogs() {
    return this.logs;
  }

  addLog(method, data) {
    if (this.logs.length > this.maxLength) {
      this.logs.splice(this.logs.length - 1, 1);
    }
    const date = new Date();
    this.logs.splice(0, 0, {
      method,
      data: strLog(data),
      time: `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}:${date.getMilliseconds()}`,
      id: unixId()
    });
    this.notify();
  }

  clearLogs() {
    this.logs = [];
    this.notify();
  }

  notify() {
    this.listeners.forEach(callback => {
      callback();
    });
  }

  attach(callback) {
    this.listeners.push(callback);
  }
}

class Console extends Component {
  constructor(props) {
    super(props);
    this.name = 'Log';
    this.mountState = false;
    this.state = {
      logs: []
    };
    logStack.attach(() => {
      if (this.mountState) {
        const logs = logStack.getLogs();
        this.setState({
          logs
        });
      }
    });
  }

  componentDidMount() {
    this.mountState = true;
    this.setState({
      logs: logStack.getLogs()
    });
    // 类方法用bind会指向不同地址，导致off失败
    event.on('clear', this.clearLogs);
    event.on('addLog', this.addLog);
  }

  componentWillUnmount() {
    this.mountState = false;
    event.off('clear', this.clearLogs);
    event.off('addLog', this.addLog);
  }

  addLog = msg => {
    logStack.addLog('log', [msg]);
  };

  clearLogs = name => {
    if (name === this.name) {
      logStack.clearLogs();
    }
  };

  scrollToEnd = () => {
    this.flatList.scrollToEnd({ animated: true });
  };

  renderItem({ item }) {
    return (
      <View style={styles.logItem}>
        <Text style={styles.logItemTime}>{item.time}</Text>
        <Text style={[styles.logItemText, styles[item.method]]}>{item.data}</Text>
      </View>
    );
  }

  render() {
    return (
      <FlatList
        ref={ref => {
          this.flatList = ref;
        }}
        legacyImplementation
        // onLayout={() => this.flatList.scrollToEnd({ animated: true })}
        // initialNumToRender={20}
        showsVerticalScrollIndicator
        extraData={this.state}
        data={this.state.logs}
        renderItem={this.renderItem.bind(this)}
        ListEmptyComponent={() => <Text> Loading...</Text>}
        keyExtractor={item => item.id}
      />
    );
  }
}

const styles = StyleSheet.create({
  log: {
    color: '#000'
  },
  warn: {
    color: 'orange',
    backgroundColor: '#fffacd',
    borderColor: '#ffb930'
  },
  error: {
    color: '#dc143c',
    backgroundColor: '#ffe4e1',
    borderColor: '#f4a0ab'
  },
  logItem: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#eee'
  },
  logItemText: {
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  logItemTime: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center'
  }
});

function unixId() {
  return Math.round(Math.random() * 1000000).toString(16);
}

function strLog(logs) {
  const arr = logs.map(data => formatLog(data));
  return arr.join(' ');
}

function formatLog(obj) {
  if (obj === null || obj === undefined || typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean' || typeof obj === 'function') {
    return `"${String(obj)}"`;
  }
  if (obj instanceof Date) {
    return `Date(${obj.toISOString()})`;
  }
  if (Array.isArray(obj)) {
    return `Array(${obj.length})[${obj.map(elem => formatLog(elem))}]`;
  }
  if (obj.toString) {
    try {
      return `object(${JSON.stringify(obj, null, 2)})`;
    } catch (err) {
      return 'Invalid symbol';
    }
  }
  return 'unknown data';
}

function proxyConsole(console, stack) {
  const methods = ['log', 'warn', 'error', 'info'];
  methods.forEach(method => {
    const fn = console[method];
    console[method] = function (...args) {
      stack.addLog(method, args);
      fn.apply(console, args);
    };
  });
}

module.exports = (function () {
  if (!logStack) {
    logStack = new LogStack();
  }
  proxyConsole(global.console, logStack);
  return <Console />;
})();
