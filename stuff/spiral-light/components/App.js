window.App = (function () {
  'use strict'

  const { connect } = ReactRedux

  const imageURLs = ['images/horizontal.png', 'images/sphere.png', 'images/bands.png']

  const App = ({
    image,
    options,
    model,
    setImage,
    setOptions,
    setModel,
    observableOffset,
    observableColors
  }) => h('div', {
    style: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '20%',
      height: '100%',
      padding: 20,
      background: 'rgba(255, 255, 255, 0.8)'
    },
  }, [
    h('div', null, [
      h('h3', 'Image'),
      h('div', null, imageURLs.map(url => h('img', {
        src: url,
        onClick: event => setImage(event.target)
      }))),
      h(ImageUploader, { onChange: setImage })
    ]),
    h('div', null, [
      h('h3', 'Options'),
      h(OptionsForm, { data: options, onSubmit: setOptions })
    ]),
    h('div', null, [
      h('h3', 'Model'),
      h(ModelForm, { data: model, onSubmit: setModel })
    ]),
    h('div', null, [
      h('h3', 'Preview'),
      h(ImageColors, { image, observableOffset, observableColors })
    ])
  ])

  return connect(
    state => state,
    dispatch => ({
      setImage: data => dispatch({ type: 'SET_IMAGE', data }),
      setOptions: data => dispatch({ type: 'SET_OPTIONS', data }),
      setModel: data => dispatch({ type: 'SET_MODEL', data })
    })
  )(App)
})()