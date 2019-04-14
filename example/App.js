import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import NewUserExperience from 'react-native-new-user-experience'

export default class App extends React.Component {
  box1 = React.createRef()
  box2 = React.createRef()
  box3 = React.createRef()
  render() {
    return (
      <View style={styles.container}>
        <View
          ref={this.box1}
          style={[styles.box, { alignSelf: 'flex-start' }]}
        />
        <View
          ref={this.box2}
          style={[styles.box, { height: 100, width: 100, alignSelf: 'center' }]}
        />
        <View ref={this.box3} style={[styles.box, { alignSelf: 'flex-end' }]} />
        <NewUserExperience
          steps={[
            {
              label:
                'This is an avatar. You can see what your friends look like online',
              reference: this.box1,
            },
            {
              label:
                'This is an edit button. You can update the contact information for you friends and enemies.',
              reference: this.box2,
            },
            {
              label:
                'This is where you leave the notes. You can update the contact information for you friends and enemies.',
              reference: this.box3,
            },
          ]}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
  },
  box: {
    height: 50,
    width: 50,
    backgroundColor: 'tomato',
    margin: 20,
  },
})
