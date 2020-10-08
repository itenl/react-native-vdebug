import React, { PureComponent } from 'react';
import { ScrollView, View, Text, TouchableOpacity, PanResponder, Animated, Dimensions, StyleSheet, TextInput, Keyboard, NativeModules, Platform, KeyboardAvoidingView } from 'react-native';
import event from './src/event';
import Network, { traceNetwork } from './src/network';
import Log, { traceLog } from './src/log';
import Info from './src/info';
const { width, height } = Dimensions.get('window');

let commandContext = global;

export const setExternalContext = externalContext => {
  if (externalContext) commandContext = externalContext;
};

// Log/network trace when Element is not initialized.
export const initTrace = () => {
  traceLog();
  traceNetwork();
};

class VDebug extends PureComponent {
  constructor(props) {
    super(props);
    initTrace();
    this.state = {
      commandValue: '',
      showPanel: false,
      currentPageIndex: 0,
      pan: new Animated.ValueXY(),
      scale: new Animated.Value(1),
      panels: [
        {
          title: 'Log',
          component: <Log />
        },
        {
          title: 'Network',
          component: <Network />
        },
        {
          title: 'Info',
          component: <Info info={this.props.info || {}} />
        }
      ]
    };
    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        this.state.pan.setOffset({
          x: this.state.pan.x._value,
          y: this.state.pan.y._value
        });
        this.state.pan.setValue({ x: 0, y: 0 });
        Animated.spring(this.state.scale, {
          useNativeDriver: true,
          toValue: 1.3,
          friction: 3
        }).start();
      },
      onPanResponderMove: Animated.event([null, { dx: this.state.pan.x, dy: this.state.pan.y }]),
      onPanResponderRelease: ({ nativeEvent }, gestureState) => {
        if (Math.abs(gestureState.dx) < 5 && Math.abs(gestureState.dy) < 5) this.togglePanel();
        setTimeout(() => {
          Animated.spring(this.state.scale, {
            useNativeDriver: true,
            toValue: 1,
            friction: 3
          }).start(() => {
            this.setState({
              top: nativeEvent.pageY
            });
          });
          this.state.pan.flattenOffset();
        }, 0);
      }
    });
  }

  componentDidMount() {
    this.state.pan.setValue({ x: 0, y: 0 });
  }

  togglePanel() {
    this.setState(state => ({
      showPanel: !state.showPanel
    }));
  }

  clearLogs() {
    const tabName = this.state.panels[this.state.currentPageIndex].title;
    event.trigger('clear', tabName);
  }

  showDev() {
    NativeModules?.DevMenu?.show();
  }

  reloadDev() {
    NativeModules?.DevMenu?.reload();
  }

  evalInContext(js, context) {
    return function (str) {
      let result = '';
      try {
        // eslint-disable-next-line no-eval
        result = eval(str);
      } catch (err) {
        result = 'Invalid input';
      }
      return event.trigger('addLog', result);
    }.call(context, `with(this) { ${js} } `);
  }

  execCommand() {
    if (!this.state.commandValue) return;
    this.evalInContext(this.state.commandValue, commandContext);
    Keyboard.dismiss();
  }

  clearCommand() {
    this.textInput.clear();
  }

  scrollToPage(index, animated = true) {
    this.scrollToCard(index, animated);
  }

  scrollToCard(cardIndex, animated = true) {
    if (cardIndex < 0) cardIndex = 0;
    else if (cardIndex >= this.cardCount) cardIndex = this.cardCount - 1;
    if (this.scrollView) {
      this.scrollView.scrollTo({ x: width * cardIndex, y: 0, animated: animated });
    }
  }

  renderPanelHeader() {
    return (
      <View style={styles.panelHeader}>
        {this.state.panels.map((item, index) => (
          <TouchableOpacity
            key={index.toString()}
            onPress={() => {
              this.scrollToPage(index);
              this.setState({ currentPageIndex: index });
            }}
            style={[styles.panelHeaderItem, index === this.state.currentPageIndex && styles.activeTab]}
          >
            <Text style={styles.panelHeaderItemText}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  renderCommandBar() {
    return (
      <View style={styles.commandBar}>
        <TextInput
          ref={ref => {
            this.textInput = ref;
          }}
          style={styles.commandBarInput}
          placeholderTextColor={'#000000a1'}
          placeholder="command..."
          onChangeText={text => this.setState({ commandValue: text })}
          value={this.state.commandValue}
        />
        <TouchableOpacity style={styles.commandBarBtn} onPress={this.clearCommand.bind(this)}>
          <Text>X</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.commandBarBtn} onPress={this.execCommand.bind(this)}>
          <Text>OK</Text>
        </TouchableOpacity>
      </View>
    );
  }

  renderPanelFooter() {
    return (
      <View style={styles.panelBottom}>
        <TouchableOpacity onPress={this.clearLogs.bind(this)} style={styles.panelBottomBtn}>
          <Text style={styles.panelBottomBtnText}>Clear</Text>
        </TouchableOpacity>
        {__DEV__ && Platform.OS == 'ios' && (
          <TouchableOpacity onPress={this.showDev.bind(this)} onLongPress={this.reloadDev.bind(this)} style={styles.panelBottomBtn}>
            <Text style={styles.panelBottomBtnText}>Dev</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={this.togglePanel.bind(this)} style={styles.panelBottomBtn}>
          <Text style={styles.panelBottomBtnText}>Hide</Text>
        </TouchableOpacity>
      </View>
    );
  }

  onScrollAnimationEnd({ nativeEvent }) {
    const currentPageIndex = Math.floor(nativeEvent.contentOffset.x / width);
    currentPageIndex != this.state.currentPageIndex &&
      this.setState({
        currentPageIndex: currentPageIndex
      });
  }

  renderPanel() {
    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.panel}>
        {this.renderPanelHeader()}
        <ScrollView
          onMomentumScrollEnd={this.onScrollAnimationEnd.bind(this)}
          ref={ref => {
            this.scrollView = ref;
          }}
          pagingEnabled={true}
          showsHorizontalScrollIndicator={false}
          horizontal={true}
          style={styles.panelContent}
        >
          {this.state.panels.map((item, index) => {
            return (
              <View key={index} style={{ width: width }}>
                {item.component}
              </View>
            );
          })}
        </ScrollView>
        {this.renderCommandBar()}
        {this.renderPanelFooter()}
      </KeyboardAvoidingView>
    );
  }

  renderHomeBtn() {
    const { pan, scale } = this.state;
    const [translateX, translateY] = [pan.x, pan.y];
    const btnStyle = { transform: [{ translateX }, { translateY }, { scale }] };

    return (
      <Animated.View {...this.panResponder.panHandlers} style={[styles.homeBtn, btnStyle]}>
        <Text style={styles.homeBtnText}>Debug</Text>
      </Animated.View>
    );
  }

  render() {
    return this.state.showPanel ? this.renderPanel() : this.renderHomeBtn();
  }
}

const styles = StyleSheet.create({
  activeTab: {
    backgroundColor: '#fff'
  },
  panel: {
    position: 'absolute',
    zIndex: 999999999,
    elevation: 999999999,
    backgroundColor: '#fff',
    width,
    height: (height / 3) * 2,
    bottom: 0,
    right: 0,
    flexDirection: 'column'
  },
  panelHeader: {
    width,
    backgroundColor: '#eee',
    flexDirection: 'row',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#d9d9d9'
  },
  panelHeaderItem: {
    flex: 1,
    height: 40,
    color: '#000',
    borderRightWidth: StyleSheet.hairlineWidth,
    borderColor: '#d9d9d9',
    justifyContent: 'center'
  },
  panelHeaderItemText: {
    textAlign: 'center'
  },
  panelContent: {
    width,
    flex: 0.9
  },
  panelBottom: {
    width,
    flex: 0.1,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#d9d9d9',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eee'
  },
  panelBottomBtn: {
    flex: 1,
    height: 40,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderColor: '#d9d9d9',
    justifyContent: 'center'
  },
  panelBottomBtnText: {
    color: '#000',
    fontSize: 14,
    textAlign: 'center'
  },
  panelEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  homeBtn: {
    width: 60,
    paddingVertical: 5,
    backgroundColor: '#04be02',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    zIndex: 999999999,
    bottom: height / 2,
    right: 0,
    shadowColor: 'rgb(18,34,74)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    elevation: 0.4
  },
  homeBtnText: {
    color: '#fff'
  },
  commandBar: {
    height: 40,
    flexDirection: 'row',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#d9d9d9'
  },
  commandBarInput: {
    flex: 1,
    paddingLeft: 10,
    backgroundColor: '#ffffff',
    color: '#000000'
  },
  commandBarBtn: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eee'
  }
});

export default VDebug;
