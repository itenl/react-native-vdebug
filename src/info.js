import React, { Component } from 'react';
import { Clipboard, ScrollView, View, Text } from 'react-native';
import config from '../src/config';

export default class Info extends Component {
  constructor(props) {
    super(props);
    this.state = {
      info: '',
      enabled: false
    };
  }

  verifyPassword() {
    Clipboard.getString().then(password => {
      const date = new Date();
      if (password == `${date.getFullYear()}${date.getMonth() + 1}${date.getDate()}|itenl`) {
        this.setState({
          enabled: true
        });
      }
    });
  }

  getScrollRef() {
    return this.scrollView;
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
    this.verifyPassword();
  }

  render() {
    return (
      <ScrollView
        ref={ref => {
          this.scrollView = ref;
        }}
        style={{ flex: 1, padding: 5 }}
      >
        <Text selectable={true} style={{ color: 'black' }}>
          {this.state.info}
        </Text>
        <View style={{ marginTop: 1000 }}>
          <Text style={!this.state.enabled && { opacity: 0.05 }}>{`
                                                .::::.
                                              .::::::::::.
                                            ::::::::::::
                                        ..:::::::::::::'
                                      ':::::::::::::'
                                        .:::::::::::
                                    '::::::::::::::..
                                    ..:::::::::::::::::.
                                    ::::::::::::::::::::
                                  ::::  :::::::::::'       .:::.
                                  ::::'   '::::::'       .::::::::.
                                .::::'     :::::     .:::::::':::::.
                              :.:::'      ::::::  .:::::::::' ':::::.
                              .::'        :::::.:::::::::'      ':::::.
                            .::'         ::::::::::::::'           ::::.
                        ...:::           ::::::::::::'                ::.
                          ':.            ':::::::::'                  :::::::::.
                                          '.:::::'                    ':'
        `}</Text>
          <Text style={{ color: 'black', textAlign: 'center', margin: 10 }}>Goddess bless you, there will never be BUG.</Text>
        </View>
      </ScrollView>
    );
  }
}
