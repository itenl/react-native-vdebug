import React, { Component } from 'react';
import { Clipboard, ScrollView, View, Text, TouchableOpacity, Linking, Alert } from 'react-native';
import config from '../src/config';

export default class Info extends Component {
  constructor(props) {
    super(props);
    this.state = {
      appInfo: '',
      exteranlInfo: ''
    };
  }

  getScrollRef() {
    return this.scrollView;
  }

  componentDidMount() {
    let appInfo = '';
    let exteranlInfo = '';
    try {
      appInfo = JSON.stringify(config, null, 2);
      if (typeof this.props.info === 'object') exteranlInfo = JSON.stringify({ EXTERANLINFO: this.props.info }, null, 2);
    } catch (err) {
      console.log(err);
    }
    this.setState({
      appInfo,
      exteranlInfo
    });
  }

  render() {
    return (
      <ScrollView
        ref={ref => {
          this.scrollView = ref;
        }}
        style={{ flex: 1, padding: 5 }}
      >
        <TouchableOpacity
          style={{ borderBottomColor: 'black', borderBottomWidth: 1 }}
          onPress={() => {
            Linking.canOpenURL(config.APPINFO.repository)
              .then(supported => {
                if (supported) return Linking.openURL(config.APPINFO.repository);
              })
              .catch(err => console.log('An error occurred', err));
          }}
        >
          <Text style={{ color: 'black' }}>{this.state.appInfo}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            try {
              Clipboard.setString(this.state.exteranlInfo);
              Alert.alert('Info', 'Copy successfully', [{ text: 'OK' }]);
            } catch (error) {}
          }}
        >
          <Text style={{ color: 'black' }}>{this.state.exteranlInfo}</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }
}
