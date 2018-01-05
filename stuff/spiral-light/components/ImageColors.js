window.ImageColors = (function () {

'use strict'

const createBorder = rgb => 
  '1px solid rgb(' + rgb.join(', ') + ')'

class ColorRuler extends React.Component {
  constructor(props) {
    super(props)

    this.state = { colors: [] }
    const update = colors => this.setState({ colors })
    this.listener = props.observableColors(update)
  }

  componentWillUnmount() {
    this.listener()
  }

  render() {
    const { image } = this.props
    const { colors } = this.state

    const width = (100 / (colors.length - 1)) + '%'
    const children = []

    for (let i = 0; i < colors.length - 1; i++) {
      children.push(h('div', { style: {
        boxSizing: 'border-box',
        float: 'left',
        width,
        height: '100%',
        borderLeft: createBorder(colors[i])
      }}))
    }

    return h('div', {
      style: {
        overflow: 'hidden',
        width: '100%',
        height: '20px',
        borderRight: colors.length ?
          createBorder(colors[colors.length - 1]) :
          ''
      }
    }, children)
  }
}

class ImageView extends React.Component {
  constructor(props) {
    super(props)

    this.state = { offset: [0 , 0] }
    const update = offset => this.setState({ offset })
    this.listener = props.observableOffset(update)
  }

  componentWillUnmount() {
    this.listener()
  }

  render() {
    const { image } = this.props
    const { offset } = this.state

    return h('div', {
      style: {
        width: image.width,
        height: image.height,
        backgroundRepeat: 'repeat',
        backgroundImage: 'url(' + image.src + ')',
        backgroundPositionX: -offset[0],
        backgroundPositionY: -offset[1]
      }
    })
  }
}

const ImageColors = ({ image, observableOffset, observableColors }) =>
  h('div', null,
    h('div', { style: { display: 'inline-block' } }, [
      h(ColorRuler, { image, observableColors }),
      h(ImageView, { image, observableOffset })
    ])
  )

return ImageColors

})()