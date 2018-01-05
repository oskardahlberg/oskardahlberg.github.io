window.SpiralModel = (function () {

'use strict'

function createSpiralVertices ({ sides, turns, radius, length }) {
  const vertices = [];
  const turnLength = length / turns;
  
  for (let i = 0; i < turns; i++) {
    for (let j = 0; j < sides; j++) {
      const k = j / sides;
      const angle = k * 2 * Math.PI
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);
      const z = turnLength * (i + k);
      vertices.push([x, y, z]);
    }
  }
  
  return vertices;
}

return function SpiralModel () {
  let divisions = null
  let config = null
  let colors = null

  this.object = new THREE.Group()

  const lines = window.lines = new THREE.Group()
  this.object.add(lines)

  const addLines = () => {
    const vertices = createSpiralVertices(config)
    const geometry = new THREE.Geometry()
    vertices.forEach(v =>
      geometry.vertices.push(new THREE.Vector3(v[0], v[1], v[2]))
    )

    const turnLength = config.length / config.turns;
  
    for (let i = 0; i < divisions; i++) {
      const line = new THREE.Line(
        geometry,
        new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 3 })
      )
      line.position.z = ((i / divisions) * turnLength) - (config.length / 2)
      lines.add(line)
    }
  }

  let cylinder = null
  const addCylinder = () => {
    cylinder = new THREE.Mesh(
      new THREE.CylinderGeometry(
        config.radius * 0.9,
        config.radius * 0.9,
        config.length
      ),
      new THREE.MeshPhongMaterial({
        color: 0xffffcc
      })
    )
    cylinder.rotation.x = Math.PI / 2
    this.object.add(cylinder)
  }

  this.setGeometry = (newDivisions, newConfig) => {
    if (newDivisions === divisions && newConfig === config) return

    config = newConfig
    divisions = newDivisions

    if (cylinder) this.object.remove(cylinder)
    while (lines.children.length > 0) lines.remove(lines.children[0])

    addCylinder()
    addLines()
  }

  this.setColors = newColors => {
    if (newColors === colors) return
    colors = newColors
    lines.children.forEach((mesh, i) => {
      if (!colors[i]) return
      mesh.material.color.setRGB(colors[i][0] / 255, colors[i][1] / 255, colors[i][2] / 255)
      mesh.material.needsUpdate = true
    })
  }
}

})()