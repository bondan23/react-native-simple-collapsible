/**
 * Collapsible.js
 * Collapsible component for react-native, written by javascript and created with love.
 * My Code Work ? I Don't know why. My Code Doesn't Work ? I Don't know why!
 * Have a Good One!
 *
 *
 * @license The Unlicense, http://unlicense.org/
 * @version 0.1
 * @author  Bondan Eko Prasetyo, https://github.com/bondan23/
 * @created 2017-08-16
 *
 *
 */

import React, { PureComponent } from 'react';
import {
 View,
 Text,
 StyleSheet,
 Animated,
 TouchableHighlight
} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Icon from 'react-native-vector-icons/SimpleLineIcons';

const DEFAULT_HEIGHT = 50;

class Collapsible extends PureComponent {
  constructor(props){
    super(props);

    if(props.singleCollapsible){
      this.animatedHeight = new Animated.Value(DEFAULT_HEIGHT);

      this.state = {
        toggled: false,
        height: DEFAULT_HEIGHT
      }
    }else{
      let toggled = [];
      let animated = [];

      _.find(props.list,(v,k)=>{
        if(v.dropdown){
          toggled = [
            ...toggled,
            {
              index:k,
              toggled:false,
            }
          ]

          animated = [
            ...animated,
            new Animated.Value(DEFAULT_HEIGHT)
          ]
        }
      });

      this.animatedHeight = animated;

      this.state = {
        toggled,
      }
    }

  }

  _onPressAnimated(index,count,value){
    const findIndex = _.findIndex(this.state.toggled,['index',index]);
    this.setState(prevState=>{
      return{
        toggled:[
          ...prevState.toggled.slice(0,findIndex),
          {
            ...prevState.toggled[findIndex],
            toggled:!prevState.toggled[findIndex].toggled
          },
          ...prevState.toggled.slice(findIndex+1)
        ]
      }
    },()=>{
      const toggled = this.state.toggled[findIndex].toggled;
      Animated.timing(
        this.animatedHeight[findIndex],
        {
          toValue: toggled ? (DEFAULT_HEIGHT*count)+DEFAULT_HEIGHT : DEFAULT_HEIGHT,
          duration: this.props.toggleSpeed
        }
      ).start()
    })

    if(typeof this.props.onPress !== 'undefined'){
      this.props.onPress(value)
    }
  }

  _onPressSingleAnimated(toggled){
    this.setState({
      toggled
    },()=>{
      Animated.timing(
        this.animatedHeight,
        {
          toValue: toggled ? this.state.height+DEFAULT_HEIGHT : DEFAULT_HEIGHT,
          duration: this.props.toggleSpeed
        }
      ).start()
    })
  }

  _nonDropDownPress(value){
    if(typeof this.props.onPress !== 'undefined'){
      this.props.onPress(value)
    }
  }

  _renderContent(list,height){
    return list.map((v,k)=>{
      if(v.dropdown){
        const findIndex = _.findIndex(this.state.toggled,['index',k]);
        const toggled = this.state.toggled[findIndex].toggled;
        return(
          <Animated.View key={k} style={{backgroundColor:'#FFFFFF',height:height(k),overflow:'hidden'}}>
            <TouchableHighlight onPress={() => this._onPressAnimated(k,v.child.length,v.value) } underlayColor={'#F5F5F5'} accessibilityLabel={v.value}>
              <View style={styles.parent}>
                <View>
                  <Text style={this.props.labelStyle}>
                    {v.label}
                  </Text>
                </View>
                <View style={{flex:1,alignItems:'flex-end'}}>
                  {
                    toggled ? <Icon name={'arrow-down'} size={14}/> : <Icon name={'arrow-up'} size={14}/>
                  }
                </View>
              </View>
            </TouchableHighlight>
            {/*child*/}
            <View style={{height:DEFAULT_HEIGHT*v.child.length}}>
              {
                v.child.map((value,key)=>{
                  return(
                    <TouchableHighlight key={key} onPress={this._nonDropDownPress.bind(this,value.value)} underlayColor={'#F5F5F5'} accessibilityLabel={value.value}>
                      <View style={styles.child}>
                        <Text style={this.props.labelStyle}>
                          {value.label}
                        </Text>
                      </View>
                    </TouchableHighlight>
                  )
                })
              }
            </View>
          </Animated.View>
        )
      }
      else{
        return(
          <TouchableHighlight key={k} onPress={this._nonDropDownPress.bind(this,v.value)} underlayColor={'#F5F5F5'} accessibilityLabel={v.value}>
            <View style={styles.nonColapisble}>
              <Text style={this.props.labelStyle}>
                {v.label}
              </Text>
            </View>
          </TouchableHighlight>
        )
      }
    })
  }

  _getSingleLayout({nativeEvent: { layout: {x, y, width, height}}}){
    this.setState({
      height
    })
  }

  render() {
    if(this.props.singleCollapsible){
      return (
        <Animated.View style={{backgroundColor:'#FFFFFF',height:this.animatedHeight,overflow:'hidden'}}>
          <TouchableHighlight onPress={() => this._onPressSingleAnimated(!this.state.toggled) } underlayColor={'#F5F5F5'} >
            <View style={[{height:DEFAULT_HEIGHT,alignItems:'center',marginHorizontal:10,flexDirection:'row'},this.props.singleStyle]}>
              <View>
                <Text style={this.props.labelStyle}>
                  {this.props.singleLabel}
                </Text>
              </View>
              <View style={{flex:1,alignItems:'flex-end'}}>
                {
                  this.state.toggled ? <Icon type={'ionicon'} name={'arrow-dropdown-up'} size={16}/> : <Icon type={'ionicon'} name={'arrow-dropdown-down'} size={16}/>
                }
              </View>
            </View>
          </TouchableHighlight>
          {/*child*/}
          <View onLayout={this._getSingleLayout.bind(this)}>
            {this.props.singleComponent()}
          </View>
        </Animated.View>
      )
    }
    else{
      const height = (collapseIndex) => {
        const findIndex = _.findIndex(this.state.toggled,['index',collapseIndex]);
        return this.animatedHeight[findIndex];
      }

      return (
        <Animated.ScrollView
          style={{ flex:1 , backgroundColor:'white', position:'relative' }}
          alwaysBounceVertical={false}
        >
          {
           this._renderContent(this.props.list,height)
          }
        </Animated.ScrollView>
      );
    }
  }
}

Collapsible.propTypes = {
  list:PropTypes.array,
  singleCollapsible:PropTypes.bool,
  singleComponent:PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.element,
  ]),
  singleLabel:PropTypes.string,
  toggleSpeed:PropTypes.number,
  labelStyle:PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
  ])
}

Collapsible.defaultProps = {
  list:[
    {
      label:'Hello World',
      dropdown:true,
      child:[
        {
          label:'CHILD 1',
          value:1
        },
        {
          label:'CHILD 2',
          value:2
        }
      ]
    },
    {
      label:'Hello World 2',
      value:3,
      dropdown:false
    }
  ],
  singleCollapsible:false,
  singleComponent:()=>(<Text>HelloWorld</Text>),
  singleLabel:'Test',
  toggleSpeed:500,
  labelStyle:{fontSize:14,color:'#000'},
  singleStyle:{}
}

const styles = StyleSheet.create({
 container: {
   flex: 1,
 },
 nonColapisble:{
   height:DEFAULT_HEIGHT,
   justifyContent:'center',
   marginLeft:10
 },
 parent:{
   height:DEFAULT_HEIGHT,
   alignItems:'center',
   marginHorizontal:10,
   flexDirection:'row'
 },
 child:{
   height:DEFAULT_HEIGHT,
   justifyContent:'center',
   marginLeft:20
 }
});

export default Collapsible;
