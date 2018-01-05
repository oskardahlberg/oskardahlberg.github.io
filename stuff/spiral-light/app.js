'use strict'

const { Provider } = ReactRedux
const { createStore, applyMiddleware } = Redux

const imageController = new ImageController()

const setImage = () => next => action => {
  console.log('dispatch', action.type, action)

  if (action.type === 'SET_IMAGE')
    imageController.setImage(action.data)
  
  return next(action)
}

const store = createStore(appReducer, null, applyMiddleware(setImage))

const observableOffset = createObservable()
const observableColors = createObservable()

const renderer = new THREE.WebGLRenderer();
const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 10000)
camera.position.set(0, 40, 40)
camera.rotateX(-1)

scene.add(new THREE.AmbientLight(0x222222))
const light = new THREE.DirectionalLight(0x222222, 1)
light.position.set(0, -40, -40)
scene.add(light)

const model = new SpiralModel()
scene.add(model.object)

const controls = new THREE.OrbitControls(camera, document, renderer.domElement)

const update = () => {
  const state = store.getState()

  const timespan = Date.now() - state.start

  const offset = [
    state.options.xSpeed * timespan / 1000,
    state.options.ySpeed * timespan / 1000
  ]

  const colors = imageController.getColors(
    state.options.divisions,
    offset[0],
    offset[1]
  )

  observableOffset.invoke(offset)
  observableColors.invoke(colors)

  model.setGeometry(state.options.divisions, state.model)
  model.setColors(colors)

  renderer.render(scene, camera)

  requestAnimationFrame(update)
  //setTimeout(() => requestAnimationFrame(update), 200)
}

window.onload = () => {
  renderer.setSize(window.innerWidth, window.innerHeight)
  document.body.appendChild(renderer.domElement)

  store.dispatch({ type: 'SET_START', data: Date.now() })
  imageController.setImage(store.getState().image)

  ReactDOM.render(
    h(Provider, { store },
      h(App, { observableOffset, observableColors })
    ),
    document.getElementById('app')
  )

  update()
}