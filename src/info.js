import React, { Component } from 'react';
import { ScrollView, View, Text } from 'react-native';
import config from '../src/config';

export default class Info extends Component {
  constructor(props) {
    super(props);
    this.state = {
      info: ''
    };
  }

  componentDidMount() {
    let info = Object.assign(
      {
        APP_INFO: config.APPINFO
      },
      { EXTERNAL_INFO: this.props.info }
    );
    if (typeof info === 'object') {
      try {
        info = JSON.stringify(info, null, 2);
      } catch (err) {
        console.log(err);
      }
    }
    this.setState({
      info
    });
  }

  render() {
    return (
      <ScrollView style={{ flex: 1, padding: 5 }}>
        <Text style={{ color: 'black' }}>{this.state.info}</Text>
      </ScrollView>
    );
  }
}
