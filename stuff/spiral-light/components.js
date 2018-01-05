class ImageUploader extends React.Component {
  constructor(props) {
    super(props)

    this.reader = new FileReader()
    this.reader.onload = event => {
      const image = new Image()
      image.onload = () => this.props.onChange(image)
      image.src = event.target.result
    }
  }

  render() {
    return h('label', [
      'Image:',
      h('input', {
        type: 'file',
        onChange: event =>
          this.reader.readAsDataURL(event.target.files[0])
      })
    ])
  }
}

const InputRow = ({ name, defaultValue }) =>
  h('div', null,
    h('label', [
      name + ':',
      h('input', { name, defaultValue })
    ])
  )

const OptionsForm = ({ divisions, xSpeed, ySpeed, onSubmit }) =>
  h('form', {
    onSubmit: event => {
      event.preventDefault()
      onSubmit({
        divisions: parseInt(event.target.elements.divisions.value),
        xSpeed: parseInt(event.target.elements.xSpeed.value),
        ySpeed: parseInt(event.target.elements.ySpeed.value)
      })
    }
  }, [
    h(InputRow, { name: 'divisions', defaultValue: data.divisions }),
    h(InputRow, { name: 'xSpeed', defaultValue: data.xSpeed }),
    h(InputRow, { name: 'ySpeed', defaultValue: data.ySpeed }),
    h('button', { type: 'submit' }, 'Update')
  ])

const ModelForm = ({ data, onSubmit }) =>
  h('form', {
    onSubmit: event => {
      event.preventDefault()
      onSubmit({
        sides: parseInt(event.target.elements.sides.value),
        turns: parseInt(event.target.elements.turns.value),
        radius: parseInt(event.target.elements.radius.value),
        height: parseInt(event.target.elements.height.value)
      })
    }
  }, [
    h(InputRow, { name: 'divisions', defaultValue: data.sides }),
    h(InputRow, { name: 'turns', defaultValue: data.turns }),
    h(InputRow, { name: 'radius', defaultValue: data.radius }),
    h(InputRow, { name: 'height', defaultValue: data.height }),
    h('button', { type: 'submit' }, 'Update')
  ])

const App = ({
  options,
  model,
  onOptions,
  onModel
}) => h('div', [
  h('h3', 'Options'),
  h(OptionsForm, { data: options, onSubmit: onOptions }),
  h('h3', 'Model'),
  h(OptionsForm, { data: model, onSubmit: onModel }),
])