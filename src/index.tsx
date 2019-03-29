import React, { Component, Fragment } from 'react'
import {
  Dimensions,
  StyleSheet,
  Animated,
  TouchableWithoutFeedback,
  View,
  Text,
  SafeAreaView,
} from 'react-native'
import Svg, { Defs, Circle, Rect, Mask } from 'react-native-svg'
const AnimatedCircle = Animated.createAnimatedComponent(Circle)

const { width, height } = Dimensions.get('window')
interface Step {
  label: string
  reference: any
}

interface Props {
  steps: Step[]
  backgroundColor: string
  radius: number
  justifyContent: 'flex-start' | 'flex-end'
}

interface State {
  index: number
  ready: boolean
  measurements: Position[]
}

export default class NewUserExperience extends Component<Props, State> {
  static defaultProps = {
    radius: 100,
    backgroundColor: '#444',
  }
  x = new Animated.Value(0)
  y = new Animated.Value(0)
  r = new Animated.Value(0)
  opacity = new Animated.Value(0)

  state = {
    index: -1,
    ready: false,
    measurements: [],
    justifyContent: 'flex-end',
  }

  componentDidMount() {
    const refs = this.props.steps.map((step) => step.reference)
    Promise.all(refs)
      .then((resolvedRefs) =>
        Promise.all(
          resolvedRefs.map((resolved) => {
            const ref = resolved.current || resolved
            return measure(ref)
          }),
        )
          .then((measurements) => {
            this.setState({ ready: true, measurements })
          })
          .then(this.nextStep)
          .catch((e) => console.warn(e)),
      )
      .catch((e) => console.warn(e))

    // this.y.addListener(({ value }) => {
    //   const justifyContent = value < 400 ? 'flex-end' : 'flex-start'
    //   this.setState({ justifyContent })
    // })
  }

  nextStep = async () => {
    const { x, y, opacity, r } = this
    const { index, measurements } = this.state
    if (index + 1 >= this.props.steps.length) {
      this.setState({ index: -1 })
    } else {
      const { x: stepX, height, width, y: stepY } = measurements[index + 1]

      const computed = this.computedRadius(height, width)
      this.setState({ index: index + 1 })
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 1000,
        }),
        Animated.parallel([
          Animated.timing(x, {
            toValue: stepX + width / 2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(y, {
            toValue: stepY + height / 2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(r, {
            toValue: computed,
            duration: 900,
            useNativeDriver: true,
          }),
        ]),

        Animated.timing(opacity, {
          toValue: 1,
          duration: 1000,
        }),
      ]).start()
    }
  }

  computedRadius = (objHeight: number, objWidth: number) =>
    Math.min(Math.hypot(objHeight, objWidth) / 2, width / 2)

  render() {
    const { index, ready, justifyContent } = this.state
    if (!ready || index === -1) {
      return null
    }

    const { x, y, r, opacity } = this
    const step = this.props.steps[index]

    const overlayAnimation = {
      transform: [{ translateX: x }, { translateY: y }, { scale: r }],
    }

    return (
      <Fragment>
        <Animated.View style={[styles.container]}>
          <Svg height={height} width={width}>
            <Defs>
              <Mask id='myMask' x='0' y='0' height={height} width={width}>
                <Rect height={height} width={width} fill='white' />
                <AnimatedCircle
                  cx={0}
                  cy={0}
                  r={1}
                  fill='black'
                  style={overlayAnimation}
                />
              </Mask>
            </Defs>

            <Rect
              x='0'
              y='0'
              width={width}
              height={height}
              fill='black'
              opacity='0.8'
              mask='url(#myMask)'
            />
          </Svg>
        </Animated.View>
        <Animated.View
          style={[styles.content, { justifyContent }, { opacity }]}
        >
          <SafeAreaView>
            <Text style={styles.label}>{step ? step.label : ''}</Text>
            <TouchableWithoutFeedback onPress={this.nextStep}>
              <View style={styles.button}>
                <Text style={styles.label}>Got it</Text>
              </View>
            </TouchableWithoutFeedback>
          </SafeAreaView>
        </Animated.View>
      </Fragment>
    )
  }
}

interface Position {
  x: number
  y: number
  width: number
  height: number
}

const measure = (ref: View | Text): Promise<Position> => {
  return new Promise((resolve) =>
    requestAnimationFrame(() =>
      ref.measureInWindow((x, y, width, height) =>
        resolve({
          x,
          y,
          width,
          height,
        }),
      ),
    ),
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: height,
  },
  content: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: 50,
  },
  button: {
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 5,
    padding: 5,
    marginVertical: 15,
  },
  label: {
    color: 'white',
    textAlign: 'center',
    fontSize: 24,
  },
})
