(function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){
const {el} = require('redom')

const Preview = (layer, mappings) => {
  const canvas = el('canvas', {width: 1, height: 1})
  const container = el('div.Viewer', canvas)
  const ctx = canvas.getContext('2d')

  let mounted = null
  const render = () => {
    if (container.isConnected) mounted = true
    else if (mounted) return

    const width = mappings[layer.mapping].width
    const height = mappings[layer.mapping].height

    canvas.width = width
    canvas.height = height

    /*
    const sub = layer.buffer.subarray(0, width * height * 4)
    const data = new ImageData(sub, width, height)
    ctx.putImageData(data, 0, 0)
    */

    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        const c =
          'rgb('
          + layer.buffer[(i * width + j) * 4] + ', '
          + layer.buffer[(i * width + j) * 4 + 1] + ', '
          + layer.buffer[(i * width + j) * 4 + 2]
          + ')'

        ctx.fillStyle = c
        ctx.fillRect(j, i, 1, 1)
      }
    }

    requestAnimationFrame(render)
  }

  requestAnimationFrame(render)

  return container
}

const ComposerLayer = (
  layer,
  mappings,
  patterns,
  blends
) => {
  const mappingSelect = el('select',
    {onchange: () => layer.mapping = parseInt(mappingSelect.value)}, 
    mappings.map(({name}, i) =>
      el('option', {value: i, selected: i === layer.mapping}, name)
    )
  )
  const mappingField = el('div.mapping', [
    el('label', 'Mapping'),
    mappingSelect
  ])

  const patternSelect = el('select',
    {onchange: () => layer.pattern = parseInt(patternSelect.value)},
    patterns.map(({name}, i) =>
      el('option', {value: i, selected: i === layer.pattern}, name)
    )
  )
  const patternField = el('div.pattern', [
    el('label', 'Pattern'),
    patternSelect
  ])

  const blendSelect = el('select',
    {onchange: () => layer.blend = parseInt(blendSelect.value)},
    blends.map(({name}, i) =>
      el('option', {value: i, selected: i === layer.blend}, name)
    )
  )
  const blendField = el('div.blend', [
    el('label', 'Blend'),
    blendSelect
  ])

  const hueInput = el('input', {
    type: 'range',
    min: 0,
    max: 360,
    value: layer.hue,
    onchange: () => layer.hue = parseInt(hueInput.value)
  })
  const hueField = el('div.hue', [
    el('label', 'Hue'),
    hueInput
  ])

  const opacityInput = el('input', {
    type: 'range',
    min: 0,
    max: 100,
    value: Math.round(layer.opacity * 100),
    onchange: () => layer.opacity = parseInt(opacityInput.value) / 100
  })
  const opacityField = el('div.opacity', [
    el('label', 'Opacity'),
    opacityInput
  ])

  const speedXInput = el('input', {
    type: 'range',
    min: -40,
    max: 40,
    value: Math.round(layer.speedX * 10),
    onchange: () => layer.speedX = parseInt(speedXInput.value) / 10
  })
  const speedXField = el('div.hue', [
    el('label', {onclick: () => layer.speedX = 0}, 'Speed x'),
    speedXInput
  ])

  const speedYInput = el('input', {
    type: 'range',
    min: -40,
    max: 40,
    value: Math.round(layer.speedY * 10),
    onchange: () => layer.speedY = parseInt(speedYInput.value) / 10
  })
  const speedYField = el('div.hue', [
    el('label', {onclick: () => layer.speedY = 0}, 'Speed y'),
    speedYInput
  ])

  const fields = el('div.fields', [
    mappingField,
    patternField,
    blendField,
    hueField,
    opacityField,
    speedXField,
    speedYField
  ])

  const container = el('div.ComposerLayer', [
    fields,
    Preview(layer, mappings)
  ])

  return container
}

const Composer = (
  mappings,
  patterns,
  blends,
  layers,
  createLayer,
  onGenerate
) => {
  const layersContainer = el('div.layers',
    layers.map(layer => ComposerLayer(layer, mappings, patterns, blends))
  )
  const addLayer = () => {
    const layer = createLayer()
    layers.push(layer)

    const layerEl = ComposerLayer(layer, mappings, patterns, blends)
    layersContainer.appendChild(layerEl)
  }
  const removeLayer = () => {
    layers.splice(-1)
    layersContainer.removeChild(
      layersContainer.children[layersContainer.children.length - 1]
    )
  }

  const countInput = el('input', {
    type: 'number',
    min: 1,
    max: 10,
    value: layers.length,
    onchange: () => {
      const n = parseInt(countInput.value)
      while (layers.length < n) addLayer()
      while (layers.length > n) removeLayer()
    }
  })
  const countField = el('div.count', [
    el('label', 'Layers'),
    countInput
  ])

  const container = el('div.Composer', {}, [
    el('button', {type: 'button', onclick: onGenerate}, 'Generate'),
    countField,
    layersContainer
  ])

  return container
}

module.exports = Composer
},{"redom":10}],2:[function(require,module,exports){
const Mesh = require('../Mesh')
const {
  createRandomMesh,
  createPixels,
  listPixelCoordinates
} = require('./lib')

const MeshPixelMap = module.exports = options => {
  const {
    center = [0, 0],
    ratio = 0,
    radius = 1,
    sides = 3,
    bumps = 1,
    holeCount = 0,
    holeSize = 1,
    triangleSize = 30,
    pixelsPerSide = 4
  } = options

  const {mesh: preMesh, clipPolygon} = createRandomMesh(options)
  const mesh = Mesh(preMesh)
  const {
    pixels,
    facePixels,
    vertexFacePixels,
    edgeFacePixels
   } = createPixels(mesh, pixelsPerSide)
  const coords = listPixelCoordinates(pixels)

  return {
    mesh,
    pixels,
    facePixels,
    vertexFacePixels,
    edgeFacePixels,
    coords,
    clipPolygon
  }
}
},{"../Mesh":4,"./lib":3}],3:[function(require,module,exports){
const classifyPoint = require('robust-point-in-polygon')
const Mesh = require('../Mesh')
const {
  equilateralTriangleGrid,
  filterVertices,
  clipMeshByPolygon,
  findHoleVertices
} = require('../Mesh/utils')
const {randomPolygon} = require('../polygon')

const splitTriangle = (parts, length = 1) => {
  const radius = length / Math.sqrt(3)
  const height = length * Math.sqrt(3) / 2 - radius
  const center = [0, 0]
  const flat = []

  let prev = [-length / 2, height]
  for (let i = 0; i < parts; i++) {
    const t = ((i + 1) / parts) * Math.PI * 2 / 3 - Math.PI / 3
    const next = [Math.tan(t) * height, height]
    flat.push([prev, center, next])
    prev = next
  }

  const s = Math.sin(Math.PI * 2 / 3)
  const c = Math.cos(Math.PI * 2 / 3)

  const left = flat.map(ps => ps.map(p => [
    p[0] * c - p[1] * s,
    p[0] * s + p[1] * c
  ]))

  const right = flat.map(ps => ps.map(p => [
    -p[0] * c + p[1] * s,
    p[0] * s + p[1] * c
  ]))

  const result = left.concat(flat, right.reverse())

  return result
}

const pixelsFromTriangleFace = ([a, b, c], parts) => {
  const length = Math.hypot(b[0] - a[0], b[1] - a[1])

  const flipped =
    a[1] < (c[1] - Number.EPSILON) && b[1] < (c[1] - Number.EPSILON) ||
    b[1] < (a[1] - Number.EPSILON) && c[1] < (a[1] - Number.EPSILON) ||
    c[1] < (b[1] - Number.EPSILON) && a[1] < (b[1] - Number.EPSILON)

  const center = [
    (a[0] + b[0] + c[0]) / 3,
    (a[1] + b[1] + c[1]) / 3
  ]

  const polys = splitTriangle(parts, length)

  const adjusted = flipped ?
    polys.reverse().map(ps => ps.map(p => [-p[0], -p[1]])) :
    polys

  const result = adjusted.map(ps => ps.map(p => [
    center[0] + p[0],
    center[1] + p[1]
  ]))

  return result
}

const createRandomMesh = ({
  center = [0, 0],
  ratio = 0,
  radius = 1,
  sides = 3,
  bumps = 1,
  holeCount = 0,
  holeSize = 1,
  triangleSize = 30
}) => {
  const clipPolygon =
    randomPolygon(sides, bumps, radius, ratio)
      .map(([x, y]) => [
        x + center[0],
        y + center[1]
      ])

  const cols = Math.ceil(radius * 4 / triangleSize)
  const rows = Math.ceil((radius / ratio) * 4 / triangleSize)
  const grid = equilateralTriangleGrid(cols, rows, triangleSize)
  const clip = Mesh(clipMeshByPolygon(grid, clipPolygon, false))

  const adjacents = clip.vertexEdgeAdjacents

  const holes = Array(holeCount).fill().reduce(
    result => {
      const others = result.flatMap(is =>
        is.concat(is.flatMap(i => adjacents[i]))
      )

      let is = null
      let vs = []
      let invalid = true
      do {
        is = findHoleVertices(adjacents, holeSize)
        vs = is.concat(is.flatMap(i => adjacents[i]))
        invalid = vs.some(i => others.includes(i))
      }
      while (invalid)

      result.push(is)

      return result
    },
    []
  )

  const mesh = filterVertices(clip, (v, i) =>
    !holes.some(hole => hole.includes(i))
  )

  return {mesh, clipPolygon}
}
exports.createRandomMesh = createRandomMesh

const createPixels = ({vertices, faces, faceEdges, edges}, parts) => {
  const faceParts = 3 * parts

  const pixels = Array(faces.length * parts)
  const facePixels = Array(faces.length).fill().map(() => Array(parts))
  const vertexFacePixels = Array(vertices.length).fill().map(() => [])
  const edgeFacePixels = Array(edges.length).fill().map(() => [])

  for (let i = 0; i < faces.length; i++) {
    const face = faces[i]
    const facePolygon = Array(face.length)
    const indices = Array(faceParts).fill().map((_, i) => pixels.length + i)
    const edgeIndices = faceEdges[i]

    for (let j = 0; j < face.length; j++) {
      const k = face[j]
      facePolygon[j] = vertices[k]
      vertexFacePixels[k].push(...indices)
    }

    for (let j = 0; j < edgeIndices.length; j++) {
      const k = edgeIndices[j]
      edgeFacePixels[k].push(...indices)
    }

    const polygons = pixelsFromTriangleFace(facePolygon, parts)
    pixels.push(...polygons)
    facePixels[i] = indices
  }

  return {pixels, facePixels, vertexFacePixels, edgeFacePixels}
}
exports.createPixels = createPixels

const listPixelCoordinates = pixels =>
  pixels.map(ps => {
    const [x, y] = ps.reduce(
      ([x, y], [px, py]) => [x + px, y + py],
      [0, 0]
    )

    return [x / ps.length, y / ps.length]
  })
exports.listPixelCoordinates = listPixelCoordinates
},{"../Mesh":4,"../Mesh/utils":6,"../polygon":20,"robust-point-in-polygon":12}],4:[function(require,module,exports){
const {
  listEdges,
  listEdgeAngles,
  listVertexFaces,
  listVertexFaceAdjacents,
  listVertexEdges,
  listVertexEdgeAdjacents,
  listFaceCenters,
  listFaceVertexAdjacents,
  listFaceEdges,
  listFaceEdgeAdjacents,
  listEdgeVertexAdjacents,
  listEdgeFaces,
  listEdgeFaceAdjacents,
  listBoundaryVertices,
  listBoundaryFaces,
  listBoundaryEdges,
  colorGraph
} = require('./lib')

const Mesh = module.exports = ({vertices, faces}) => {
  const edges = listEdges(vertices, faces)
  const edgeAngles = listEdgeAngles(vertices, edges)

  const vertexFaces = listVertexFaces(vertices, faces)
  const vertexFaceAdjacents =
    listVertexFaceAdjacents(vertices, vertexFaces, faces)
  const {colorVertices: vertexFaceColors} = colorGraph(vertexFaceAdjacents)

  const vertexEdges = listVertexEdges(vertices, edges, edgeAngles)
  const vertexEdgeAdjacents = listVertexEdgeAdjacents(vertices, edges)
  const {colorVertices: vertexEdgeColors} = colorGraph(vertexEdgeAdjacents)

  const faceCenters = listFaceCenters(vertices, faces)

  const faceVertexAdjacents =
    listFaceVertexAdjacents(faces, faceCenters, vertexFaces)
  const {colorVertices: faceVertexColors} = colorGraph(faceVertexAdjacents)

  const edgeVertexAdjacents = listEdgeVertexAdjacents(edges, vertexEdges)
  const {colorVertices: edgeVertexColors} = colorGraph(edgeVertexAdjacents)

  const faceEdges = listFaceEdges(faces, vertexEdges)
  const edgeFaces = listEdgeFaces(edges, faceEdges)

  const faceEdgeAdjacents = listFaceEdgeAdjacents(faces, edgeFaces)
  const {colorVertices: faceEdgeColors} = colorGraph(faceEdgeAdjacents)

  const edgeFaceAdjacents = listEdgeFaceAdjacents(edges, faceEdges)
  const {colorVertices: edgeFaceColors} = colorGraph(edgeFaceAdjacents)

  const boundaryEdges = listBoundaryEdges(
    vertices, edges, edgeVertexAdjacents, edgeFaces
  )
  const boundaryVertices = listBoundaryVertices(edges, boundaryEdges)
  const boundaryFaces = listBoundaryFaces(vertexFaces, boundaryVertices)

  return {
    vertices,
    vertexFaces,
    vertexFaceAdjacents,
    vertexFaceColors,

    vertexEdges,
    vertexEdgeAdjacents,
    vertexEdgeColors,

    faces,
    faceCenters,
    faceVertexAdjacents,
    faceVertexColors,

    faceEdges,
    faceEdgeAdjacents,
    faceEdgeColors,

    edges,
    edgeVertexAdjacents,
    edgeVertexColors,

    edgeFaces,
    edgeFaceAdjacents,
    edgeFaceColors,

    boundaryVertices,
    boundaryFaces,
    boundaryEdges,

    vertexFaceColors,
    vertexEdgeColors
  }
}
},{"./lib":5}],5:[function(require,module,exports){
const classifyPoint = require('robust-point-in-polygon')

const edgeFromVertices = (vertexEdges, a, b) => {
  const aEdges = vertexEdges[a]
  const bEdges = vertexEdges[b]
  const result = aEdges.find(index => bEdges.includes(index))

  if (result == null)
    throw new Exception('Vertex a and b do not form an edge.')

  return result
}
exports.edgeFromVertices = edgeFromVertices

const facesFromVertexLoop = (vertexFaces, vertexLoop) => {
  const result = []

  for (let i = 0; i < vertexLoop.length; i++) {
    const prev = vertexLoop[(i - 1 + vertexLoop.length) % vertexLoop.length]
    const prevFaces = vertexFaces[prev]

    const item = vertexLoop[i]
    const itemFaces = vertexFaces[item]

    const next = vertexLoop[(i + 1) % vertexLoop.length]
    const nextFaces = vertexFaces[next]

    const head = []
    const body = []
    const tail = []

    for (let j = 0; j < itemFaces.length; j++) {
      const index = itemFaces[j]

      if (result.includes(index)) continue
    
      if (prevFaces.includes(index)) head.push(index)
      else if (nextFaces.includes(index)) tail.push(index)
      else body.push(index)
    }
    
    result.push(...head.reverse(), ...body.reverse(), ...tail.reverse())
  }

  /*
  for (let i = 0; i < vertexLoop.length; i++) {
    const prev = vertexLoop[(i - 1 + vertexLoop.length) % vertexLoop.length]
    const next = vertexLoop[(i + 1) % vertexLoop.length]

    const vertexIndex = vertexLoop[i]
    const vertexFaceIndices = vertexFaces[vertexIndex]

    const sorted = vertexFaceIndices
      .slice(0)
      
      .sort(
      (a, b) => {
        const aPrevConnected = vertexFaces[prev].includes(a)
        const bPrevConnected = vertexFaces[prev].includes(b)

        const aNextConnected = vertexFaces[next].includes(a)
        const bNextConnected = vertexFaces[next].includes(b)
        
        const current =
          vertexFaceIndices.indexOf(a) - vertexFaceIndices.indexOf(b)

        if (aPrevConnected && bPrevConnected)
          return bNextConnected ? -1 : (aNextConnected ? 1 : current)
        else if (aPrevConnected)
          return -1
        else if (bPrevConnected)
          return 1
        else if (aNextConnected && bNextConnected)
          return current
        else if (aNextConnected)
          return -1
        else if (bNextConnected)
          return 1
        else
          return current
      })

    for (let j = 0; j < sorted.length; j++) {
      const faceIndex = sorted[j]

      if (!result.includes(faceIndex)) result.push(faceIndex)
    }
  }*/

  return result
}
exports.facesFromVertexLoop = facesFromVertexLoop

const edgesFromVertexLoop = (vertexEdges, vertexLoop) => {
  const result = Array(vertexLoop.length)
  
  for (let i = 0; i < vertexLoop.length; i++) {
    const a = vertexLoop[i]
    const b = vertexLoop[(i + 1) % vertexLoop.length]

    result.push(edgeFromVertices(vertexEdges, a, b))
  }

  return result
}
exports.edgesFromVertexLoop = edgesFromVertexLoop

const vertexLoopFromEdges = (edges, edgeIndices) => {
  const first = edgeIndices[0]
  const result = edges[first].slice(0)

  for (let i = 1; i < edgeIndices.length; i++) {
    const index = edgeIndices[i]
    const [a, b] = edges[index]

    const first = result[0]
    const last = result[result.length - 1]

    if (first === a) result.unshift(b)
    else if (first === b) result.unshift(a)
    else if (last === a) result.push(b)
    else if (last === b) result.push(a)
    else
      throw new Exception('Edge indices are not in order.')
  }

  if (result[0] === result[result.length - 1])
    result.splice(0, 1)

  return result
}
exports.vertexLoopFromEdges = vertexLoopFromEdges

const listEdges = (vertices, faces) => {
  const map = []

  for (let i = 0; i < faces.length; i++) {
    const face = faces[i]

    for (let j = 0; j < face.length; j++) {
      const a = face[j]
      const b = face[(j + 1) % face.length]

      const min = Math.min(a, b)
      const max = Math.max(a, b)

      if (!map[min]) map[min] = []

      map[min][max] = true
    }
  }

  const result = []

  for (let i in map) {
    for (let j in map[i]) {
      result.push([parseInt(i), parseInt(j)])
    }
  }


  return result
}
exports.listEdges = listEdges

const listEdgeAngles = (vertices, edges) => {
  const result = Array(edges.length)

  for (let i = 0; i < edges.length; i++) {
    const [a, b] = edges[i]
    const [ax, ay] = vertices[a]
    const [bx, by] = vertices[b]

    result[i] = Math.atan2(by - ay, bx - ax)
  }

  return result
}
exports.listEdgeAngles = listEdgeAngles

exports.listVertexFaces = (vertices, faces) => {
  const faceAngles = Array(vertices.length).fill().map(() => [])

  for (let i = 0; i < faces.length; i++) {
    const face = faces[i]

    for (let j = 0; j < face.length; j++) {
      const prev = face[(j - 1 + face.length) % face.length]
      const prevVertex = vertices[prev]

      const item = face[j]
      const itemVertex = vertices[item]

      const next = face[(j + 1) % face.length]
      const nextVertex = vertices[next]

      const t = Math.atan2(
        ((prevVertex[1] + nextVertex[1]) / 2 - itemVertex[1]),
        ((prevVertex[0] + nextVertex[0]) / 2 - itemVertex[0])
      )

      faceAngles[item].push([i, t])
    }
  }

  const result = faceAngles.map(items =>
    items
      .sort(([a, aAngle], [b, bAngle]) => aAngle - bAngle)
      .map(([x]) => x)
  )

  return result
}

exports.listVertexFaceAdjacents = (vertices, vertexFaces, faces) => {
  const result = Array(vertices.length)

  for (let i = 0; i < vertexFaces.length; i++) {
    const indices = vertexFaces[i]
    const adjacents = []

    for (let j = 0; j < indices.length; j++) {
      const faceIndex = indices[j]
      const face = faces[faceIndex]

      for (let j = 0; j < face.length; j++) {
        const other = face[j]
        if (other !== i && !adjacents.includes(other))
          adjacents.push(other)
      }
    }

    result[i] = adjacents
  }

  return result
}

exports.listVertexEdges = (vertices, edges, edgeAngles) => {
  const indexAngles = Array(vertices.length).fill().map(() => [])

  for (let i = 0; i < edges.length; i++) {
    const [a, b] = edges[i]
    const angle = edgeAngles[i]

    indexAngles[a].push([i, angle])
    indexAngles[b].push([i, angle - Math.sign(angle) * Math.PI])
  }

  const result = indexAngles.map(items => 
    items
      .sort(([a, t], [b, u]) => t - u)
      .map(([index]) => index)
  )

  return result
}

exports.listVertexEdgeAdjacents = (vertices, edges) => {
  const adjacents = Array(vertices.length).fill().map(() => [])

  for (let i = 0; i < edges.length; i++) {
    const [a, b] = edges[i]

    adjacents[a].push(b)
    adjacents[b].push(a)
  }

  const result = adjacents.map((indices, i) => {
    const [x, y] = vertices[i]
    return indices.sort((a, b) => {
      const [ax, ay] = vertices[a]
      const [bx, by] = vertices[b]

      return Math.atan2(ay - y, ax - x) - Math.atan2(by - y, bx - x)
    })
  })

  return result
}

exports.listFaceCenters = (vertices, faces) => {
  const result = Array(faces.length)

  for (let i = 0; i < faces.length; i++) {
    const face = faces[i]

    let x = 0
    let y = 0

    for (let j = 0; j < face.length; j++) {
      const [vx, vy] = vertices[face[j]]
      x += vx
      y += vy
    }

    result[i] = [x / face.length, y / face.length]
  }

  return result
}

exports.listFaceVertexAdjacents = (faces, faceCenters, vertexFaces) => {
  const adjacents = Array(faces.length).fill().map(() => [])

  for (let i = 0; i < vertexFaces.length; i++) {
    const indices = vertexFaces[i]

    for (let j = 0; j < indices.length; j++) {
      const a = indices[j]

      for (let k = j + 1; k < indices.length; k++) {
        const b = indices[k]

        if (!adjacents[a].includes(b)) adjacents[a].push(b)
        if (!adjacents[b].includes(a)) adjacents[b].push(a)
      }
    }
  }

  const result = adjacents.map((indices, i) => {
    const [x, y] = faceCenters[i]

    return indices.sort((a, b) => {
      const [ax, ay] = faceCenters[a]
      const [bx, by] = faceCenters[b]

      return Math.atan2(ay - y, ax - x) - Math.atan2(by - y, bx - x)
    })
  })

  return result
}

exports.listFaceEdges = (faces, vertexEdges) => {
  const result = Array(faces.length).fill().map(() => [])

  for (let i = 0; i < faces.length; i++) {
    const face = faces[i]

    for (let j = 0; j < face.length; j++) {
      const a = face[j]
      const b = face[(j + 1) % face.length]

      result[i].push(edgeFromVertices(vertexEdges, a, b))
    }
  }

  return result
}

exports.listFaceEdgeAdjacents = (faces, edgeFaces) => {
  const result = Array(faces.length).fill().map(() => [])

  for (let i = 0; i < edgeFaces.length; i++) {
    const [a, b] = edgeFaces[i]

    if (a != null && b != null) {
      result[a].push(b)
      result[b].push(a)
    }
  }

  return result
}

exports.listEdgeVertexAdjacents = (edges, vertexEdges) => {
  const result = Array(edges.length).fill().map(() => [])

  for (let i = 0; i < vertexEdges.length; i++) {
    const indices = vertexEdges[i]

    for (let j = 0; j < indices.length; j++) {
      const a = indices[j]

      for (let k = j + 1; k < indices.length; k++) {
        const b = indices[k]

        if (!result[a].includes(b)) result[a].push(b)
        if (!result[b].includes(a)) result[b].push(a)
      }
    }
  }

  return result
}

exports.listEdgeFaces = (edges, faceEdges) => {
  const result = Array(edges.length).fill().map(() => [])

  for (let i = 0; i < faceEdges.length; i++) {
    const faceEdgeIndices = faceEdges[i]

    for (let j = 0; j < faceEdgeIndices.length; j++) {
      const index = faceEdgeIndices[j]

      result[index].push(i)
    }
  }

  return result
}

exports.listEdgeFaceAdjacents = (edges, faceEdges) => {
  const result = Array(edges.length).fill().map(() => [])

  for (let i = 0; i < faceEdges.length; i++) {
    const indices = faceEdges[i]

    for (let j = 0; j < indices.length; j++) {
      const a = indices[j]

      for (let k = j + 1; k < indices.length; k++) {
        const b = indices[k]

        if (!result[a].includes(b)) result[a].push(b)
        if (!result[b].includes(a)) result[b].push(a)
      }
    }
  }

  return result
}

const connectEdges = (edgeVertexAdjacents, edgeIndices) => {
  const lines = []

  for (let i = 0; i < edgeIndices.length; i++) {
    const index = edgeIndices[i]
    const adjacents = edgeVertexAdjacents[index]

    let connected = false

    for (let j = 0; j < lines.length; j++) {
      const line = lines[j]
      const first = line[0]
      const last = line[line.length - 1]

      if (adjacents.includes(first)) line.unshift(index)
      else if (adjacents.includes(last)) line.push(index)
      else continue

      connected = true
      break
    }

    if (!connected) lines.push([index])
  }
  
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i]
    const first = line[0]
    const last = line[line.length - 1]

    const firstAdjacents = edgeVertexAdjacents[first]
    const lastAdjacents = edgeVertexAdjacents[last]

    let connected = false

    for (let j = 0; j < i; j++) {
      const other = lines[j]
      const otherFirst = other[0]
      const otherLast = other[other.length - 1]

      if (firstAdjacents.includes(otherFirst))
        other.unshift(...line.reverse())
      else if (lastAdjacents.includes(otherFirst))
        other.unshift(...line)
      else if (firstAdjacents.includes(otherLast))
        other.push(...line)
      else if (lastAdjacents.includes(otherLast))
        other.push(...line.reverse())
      else
        continue

      connected = true
      break
    }

    if (connected) lines.splice(i, 1)
  }

  return lines
}
exports.connectEdges = connectEdges

exports.listBoundaryEdges = (
  vertices,
  edges,
  edgeVertexAdjacents,
  edgeFaces
) => {
  const edgeIndices = []
  for (let i = 0; i < edgeFaces.length; i++) {
    if (edgeFaces[i].length === 1) edgeIndices.push(i)
  }
  
  const loops = connectEdges(edgeVertexAdjacents, edgeIndices)

  let outer = loops.length === 1 ? loops[0].slice(1) : null
  const inner = []

  for (let i = 0; i < loops.length; i++) {
    const indices = loops[i]

    if (outer !== null) {
      inner.push(indices)
      continue
    }

    const aPolygon = vertexLoopFromEdges(edges, indices).map(i => vertices[i])
    const bLoop = loops[(i + 1) % loops.length]
    const bEdge = edges[bLoop[0]]
    const bPoint = vertices[bEdge[0]]

    if (classifyPoint(aPolygon, bPoint) === -1)
      outer = indices
    else
      inner.push(indices)
  }

  return {outer, inner}
}

exports.listBoundaryVertices = (edges, boundaryEdges) => ({
  outer: vertexLoopFromEdges(edges, boundaryEdges.outer),
  inner: boundaryEdges.inner.map(indices =>
    vertexLoopFromEdges(edges, indices)
  )
})

exports.listBoundaryFaces = (vertexFaces, boundaryVertices) => ({
  outer: facesFromVertexLoop(vertexFaces, boundaryVertices.outer),
  inner: boundaryVertices.inner.map(loop =>
    facesFromVertexLoop(vertexFaces, loop)
  )
})

const colorGraph = (adjacencyLists, nColors = 0) => {
  let count = nColors > 0 ? nColors : 1

  const vertexColors = Array(adjacencyLists.length)
  const colorVertices = Array(count).fill().map(() => [])

  for (let i = 0; i < adjacencyLists.length; i++) {
    const adjacents = adjacencyLists[i]
    let color = null

    for (let j = 0; j < count; j++) {
      let valid = true

      for (let k = 0; k < adjacents.length; k++) {
        const adjacentIndex = adjacents[k]
        const adjacentColor = vertexColors[adjacentIndex]
        
        if (j === adjacentColor) {
          valid = false
          break
        }
      }

      if (valid) {
        color = j
        break
      }
    }

    if (color == null) {
      if (nColors > 0) return null

      color = count
      colorVertices[color] = []
      count++
    }

    vertexColors[i] = color
    colorVertices[color].push(i)
  }

  return {count, vertexColors, colorVertices}
}
exports.colorGraph = colorGraph
},{"robust-point-in-polygon":12}],6:[function(require,module,exports){
const classifyPoint = require('robust-point-in-polygon')

const equilateralTriangleGrid = (cols, rows, length) => {
  const halfLength = length / 2
  const height = length * Math.cos(Math.PI / 6) 

  const vertices = Array(cols).fill().map((_, i) => [i * length, 0])
  const faces = []

  for (let i = 1; i < rows; i++) {
    const even = i % 2 === 0

    for (let j = 0; j < cols; j++) {
      const offsetX = even ? 0 : halfLength
      const p = [
        offsetX + j * length,
        i * height
      ]      
      const index = vertices.push(p) - 1

      if (j === 0) continue

      if (even) {
        faces.push(
          [
            index - cols - 1,
            index,
            index - 1
          ],
          [
            index - cols - 1,
            index - cols,
            index
          ]
        )
      }
      else {
        faces.push(
          [
            index - cols - 1,
            index - cols,
            index - 1
          ],
          [
            index - cols,
            index,
            index - 1
          ]
        )
      }
    }
  }

  return {vertices, faces}
}
exports.equilateralTriangleGrid = equilateralTriangleGrid

const filterVertices = (mesh, predicate) => {
  const vertices = []
  const indexMap = Array(mesh.vertices.length)

  for (let i = 0; i < mesh.vertices.length; i++) {
    const v = mesh.vertices[i]

    if (predicate(v, i)) {
      const index = vertices.push(v) - 1
      indexMap[i] = index
    }
  }

  const faces = []

  for (let i = 0; i < mesh.faces.length; i++) {
    const face = mesh.faces[i]
    const mapped = []

    for (let j = 0; j < face.length; j++) {
      const index = face[j]
      const newIndex = indexMap[index]
      if (newIndex == null) break

      mapped.push(newIndex)
    }

    if (mapped.length === face.length) faces.push(mapped)
  }

  return {vertices, faces}
}
exports.filterVertices = filterVertices

const clipMeshByPolygon = (mesh, ps, inside = false) =>
  filterVertices(
    mesh,
    inside ?
      (v => classifyPoint(ps, v) === 1) :
      (v => classifyPoint(ps, v) === -1)
  )

exports.clipMeshByPolygon = clipMeshByPolygon

const findHoleVertices = (vertexMap, count) => {
  const i = Math.round(Math.random() * (vertexMap.length - 1))
  
  if (vertexMap[i].length !== 6)
    return findHoleVertices(vertexMap, count)

  const findNext = (prev, n, result) => {
    if (n === 0) return result

    const neighbours = vertexMap[prev].slice(0).filter(j => !result.includes(j))

    while (neighbours.length > 0) {
      const j = Math.round(Math.random() * (neighbours.length - 1))
      const next = neighbours[j]
      const nextNeighbours = vertexMap[next].map(j => vertexMap[j])

      if (
        vertexMap[next].length === 6 &&
        nextNeighbours.every(is => is.length === 6)
      )
        return findNext(next, n - 1, result.concat([next]))
      else
        neighbours.splice(j, 1)
    }

    return findHoleVertices(vertexMap, count)
  }

  return findNext(i, count, [])
}
exports.findHoleVertices = findHoleVertices

},{"robust-point-in-polygon":12}],7:[function(require,module,exports){
const {el} = require('redom')

const style = {
  background: '#000',
  stroke: '#333'
}

const Viewer = (width, height, mesh, pixels, buffer) => {
  const canvas = el('canvas', {width, height})
  const context = canvas.getContext('2d')

  let mounted = null
  const render = () => {
    if (canvas.isConnected) mounted = true
    else if (mounted) return

    context.rect(0, 0, width, height)
    context.fillStyle = style.background
    context.fill()

    pixels.forEach((ps, i) => {
      context.beginPath()
      ps.forEach(([x, y]) => context.lineTo(x, y))
      context.closePath()

      context.fillStyle =
        'rgb('
        + buffer[i * 4] + ', '
        + buffer[i * 4 + 1] + ', '
        + buffer[i * 4 + 2]
        + ')'

      context.fill()
    })

    context.strokeStyle = style.stroke
    context.lineWidth = 2
    mesh.faces.forEach((indices, i) => {
      context.beginPath()
      indices
        .map(i => mesh.vertices[i])
        .forEach(([x, y]) => context.lineTo(x, y))
      context.closePath()
      context.stroke()
    })

    requestAnimationFrame(render)
  }
  requestAnimationFrame(render)

  return canvas
}
module.exports = Viewer
},{"redom":10}],8:[function(require,module,exports){
const makeLayers = (mesh, facePixels, edges = false, n = 0, u = 0) => {
  const first = edges ? 
    mesh.boundaryEdges.inner[u].flatMap(i => mesh.edgeFaces[i]) :
    mesh.boundaryFaces.inner[u]

  const meshAdjacents = edges ?
    mesh.faceEdgeAdjacents :
    mesh.faceVertexAdjacents

  const faceLayers = [first]
  const used = Array(mesh.faces.length)
  first.forEach(i => used[i] = true)

  const [x, y] = first
    .map(i => mesh.faceCenters[i])
    .reduce(
      ([x, y], [ax, ay]) => [x + ax, y + ay],
      [0, 0]
    )
    .map(n => n / first.length)

  let max = 0
  let prev = first
  while (n === 0 || faceLayers.length < n) {
    const adjacents = prev
      .flatMap(i => meshAdjacents[i])
      .filter(i => !used[i])

    if (adjacents.length === 0) break

    const unique = adjacents.filter((i, j) => adjacents.indexOf(i) === j)
    
    if (unique.length === 0) continue

    unique.forEach(i => used[i] = true)

    faceLayers.push(unique)
    max = Math.max(max, unique.length)
    prev = unique
  }

  const result = Array(faceLayers.length)

  for (let i = 0; i < faceLayers.length; i++) {
    const indices = faceLayers[i]
    const row = Array(max).fill().map(() => [])

    for (let j = 0; j < indices.length; j++) {
      const index = indices[j]
      const [ax, ay] = mesh.faceCenters[index]
      const t = Math.atan2(ay - y, ax - x)
      const k = (t + Math.PI) / (2 * Math.PI)
      const interpolated = Math.round(k * (max - 1))
      
      if (row[interpolated])
        row[interpolated].push(...facePixels[index])
      else
        row[interpolated] = facePixels[index].slice(0)
    }

    result[i] = row
  }

  return result
}
exports.makeLayers = makeLayers

const mergeLayers = (a, b) => {
  const big = a.length > b.length ? a : b
  const small = big === a ? b : a
  const used = []

  const result = []
  for (let i = 0; i < big.length; i++) {
    const b = big[i]
    const s = small[i]
    const max = Math.max(b ? b.length : 0, s ? s.length : 0)
    const row = Array(max).fill().map(() => [])

    for (let j = 0; b && j < b.length; j++) {
      const indices = b[j]
      const col = []

      for (let k = 0; k < indices.length; k++) {
        const index = indices[k]

        if (!used[index]) {
          col.push(index)
          used[index] = true
        }
      }

      const k = Math.round((j / (b.length - 1)) * (max - 1))
      row[k].push(...col)
    }
    
    for (let j = 0; s && j < s.length; j++) {
      const indices = s[j]
      const col = []

      for (let k = 0; k < indices.length; k++) {
        const index = indices[k]

        if (!used[index]) {
          col.push(index)
          used[index] = true
        }
      }

      const k = Math.round((1 - j / (s.length - 1)) * (max - 1))
      row[k].unshift(...col)
    }

    result.push(row)
  }

  return result
}
exports.mergeLayers = mergeLayers
},{}],9:[function(require,module,exports){
// based on http://www.kasperkamperman.com/blog/arduino/arduino-programming-hsb-to-rgb/
// which is based on http://www.codeproject.com/miscctrl/CPicker.asp
var TAU = Math.PI*2;
var round = Math.round;
var min = Math.min;
var max = Math.max;
var ceil = Math.ceil;
module.exports = hsv2rgb;

function set(r, g, b, out) {
  out[0] = round(r * 255);
  out[1] = round(g * 255);
  out[2] = round(b * 255);
}

function clamp(v, l, u) {
  return max(l, min(v, u));
}

function hsv2rgb(h, s, v, out) {
  out = out || [0, 0, 0];
  h = h % 360;
  s = clamp(s, 0, 1);
  v = clamp(v, 0, 1);

  // Grey
  if (!s) {
    out[0] = out[1] = out[2] = ceil(v * 255);
  } else {
    var b = ((1 - s) * v);
    var vb = v - b;
    var hm = h % 60;
    switch((h/60)|0) {
      case 0: set(v, vb * h / 60 + b, b, out); break;
      case 1: set(vb * (60 - hm) / 60 + b, v, b, out); break;
      case 2: set(b, v, vb * hm / 60 + b, out); break;
      case 3: set(b, vb * (60 - hm) / 60 + b, v, out); break;
      case 4: set(vb * hm / 60 + b, b, v, out); break;
      case 5: set(v, b, vb * (60 - hm) / 60 + b, out); break;
    }
  }
  return out;
}

},{}],10:[function(require,module,exports){
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.redom = {}));
}(this, function (exports) { 'use strict';

  function parseQuery (query) {
    var isId = false;
    var isClass = false;
    var tag = '';
    var id = '';
    var className = '';
    for (var i = 0; i < query.length; i++) {
      var char = query[i];
      if (char === '.') {
        isClass = true;
        isId = false;
        if (className.length > 0) {
          className += ' ';
        }
      }
      if (char === '#') {
        isId = true;
        isClass = false;
      }
      if (isId && !isClass && char !== '#') {
        id += char;
      }
      if (isClass && !isId && char !== '.') {
        className += char;
      }
      if (!isId && !isClass) {
        tag += char;
      }
    }

    return {
      tag: tag || 'div',
      id: id,
      className: className
    };
  }

  function createElement (query, ns) {
    var ref = parseQuery(query);
    var tag = ref.tag;
    var id = ref.id;
    var className = ref.className;
    var element = ns ? document.createElementNS(ns, tag) : document.createElement(tag);

    if (id) {
      element.id = id;
    }

    if (className) {
      if (ns) {
        element.setAttribute('class', className);
      } else {
        element.className = className;
      }
    }

    return element;
  }

  function unmount (parent, child) {
    var parentEl = getEl(parent);
    var childEl = getEl(child);

    if (child === childEl && childEl.__redom_view) {
      // try to look up the view if not provided
      child = childEl.__redom_view;
    }

    if (childEl.parentNode) {
      doUnmount(child, childEl, parentEl);

      parentEl.removeChild(childEl);
    }

    return child;
  }

  function doUnmount (child, childEl, parentEl) {
    var hooks = childEl.__redom_lifecycle;

    if (hooksAreEmpty(hooks)) {
      childEl.__redom_mounted = false;
      return;
    }

    var traverse = parentEl;

    if (childEl.__redom_mounted) {
      trigger(childEl, 'onunmount');
    }

    while (traverse) {
      var parentHooks = traverse.__redom_lifecycle || {};

      for (var hook in hooks) {
        if (parentHooks[hook]) {
          parentHooks[hook] -= hooks[hook];
        }
      }

      if (hooksAreEmpty(parentHooks)) {
        traverse.__redom_lifecycle = null;
      }

      traverse = traverse.parentNode;
    }
  }

  function hooksAreEmpty (hooks) {
    if (hooks == null) {
      return true;
    }
    for (var key in hooks) {
      if (hooks[key]) {
        return false;
      }
    }
    return true;
  }

  var hookNames = ['onmount', 'onremount', 'onunmount'];
  var shadowRootAvailable = typeof window !== 'undefined' && 'ShadowRoot' in window;

  function mount (parent, child, before, replace) {
    var parentEl = getEl(parent);
    var childEl = getEl(child);

    if (child === childEl && childEl.__redom_view) {
      // try to look up the view if not provided
      child = childEl.__redom_view;
    }

    if (child !== childEl) {
      childEl.__redom_view = child;
    }

    var wasMounted = childEl.__redom_mounted;
    var oldParent = childEl.parentNode;

    if (wasMounted && (oldParent !== parentEl)) {
      doUnmount(child, childEl, oldParent);
    }

    if (before != null) {
      if (replace) {
        parentEl.replaceChild(childEl, getEl(before));
      } else {
        parentEl.insertBefore(childEl, getEl(before));
      }
    } else {
      parentEl.appendChild(childEl);
    }

    doMount(child, childEl, parentEl, oldParent);

    return child;
  }

  function trigger (el, eventName) {
    if (eventName === 'onmount' || eventName === 'onremount') {
      el.__redom_mounted = true;
    } else if (eventName === 'onunmount') {
      el.__redom_mounted = false;
    }

    var hooks = el.__redom_lifecycle;

    if (!hooks) {
      return;
    }

    var view = el.__redom_view;
    var hookCount = 0;

    view && view[eventName] && view[eventName]();

    for (var hook in hooks) {
      if (hook) {
        hookCount++;
      }
    }

    if (hookCount) {
      var traverse = el.firstChild;

      while (traverse) {
        var next = traverse.nextSibling;

        trigger(traverse, eventName);

        traverse = next;
      }
    }
  }

  function doMount (child, childEl, parentEl, oldParent) {
    var hooks = childEl.__redom_lifecycle || (childEl.__redom_lifecycle = {});
    var remount = (parentEl === oldParent);
    var hooksFound = false;

    for (var i = 0, list = hookNames; i < list.length; i += 1) {
      var hookName = list[i];

      if (!remount) { // if already mounted, skip this phase
        if (child !== childEl) { // only Views can have lifecycle events
          if (hookName in child) {
            hooks[hookName] = (hooks[hookName] || 0) + 1;
          }
        }
      }
      if (hooks[hookName]) {
        hooksFound = true;
      }
    }

    if (!hooksFound) {
      childEl.__redom_mounted = true;
      return;
    }

    var traverse = parentEl;
    var triggered = false;

    if (remount || (traverse && traverse.__redom_mounted)) {
      trigger(childEl, remount ? 'onremount' : 'onmount');
      triggered = true;
    }

    while (traverse) {
      var parent = traverse.parentNode;
      var parentHooks = traverse.__redom_lifecycle || (traverse.__redom_lifecycle = {});

      for (var hook in hooks) {
        parentHooks[hook] = (parentHooks[hook] || 0) + hooks[hook];
      }

      if (triggered) {
        break;
      } else {
        if (traverse === document ||
          (shadowRootAvailable && (traverse instanceof window.ShadowRoot)) ||
          (parent && parent.__redom_mounted)
        ) {
          trigger(traverse, remount ? 'onremount' : 'onmount');
          triggered = true;
        }
        traverse = parent;
      }
    }
  }

  function setStyle (view, arg1, arg2) {
    var el = getEl(view);

    if (typeof arg1 === 'object') {
      for (var key in arg1) {
        setStyleValue(el, key, arg1[key]);
      }
    } else {
      setStyleValue(el, arg1, arg2);
    }
  }

  function setStyleValue (el, key, value) {
    if (value == null) {
      el.style[key] = '';
    } else {
      el.style[key] = value;
    }
  }

  /* global SVGElement */

  var xlinkns = 'http://www.w3.org/1999/xlink';

  function setAttr (view, arg1, arg2) {
    setAttrInternal(view, arg1, arg2);
  }

  function setAttrInternal (view, arg1, arg2, initial) {
    var el = getEl(view);

    var isObj = typeof arg1 === 'object';

    if (isObj) {
      for (var key in arg1) {
        setAttrInternal(el, key, arg1[key], initial);
      }
    } else {
      var isSVG = el instanceof SVGElement;
      var isFunc = typeof arg2 === 'function';

      if (arg1 === 'style' && typeof arg2 === 'object') {
        setStyle(el, arg2);
      } else if (isSVG && isFunc) {
        el[arg1] = arg2;
      } else if (arg1 === 'dataset') {
        setData(el, arg2);
      } else if (!isSVG && (arg1 in el || isFunc) && (arg1 !== 'list')) {
        el[arg1] = arg2;
      } else {
        if (isSVG && (arg1 === 'xlink')) {
          setXlink(el, arg2);
          return;
        }
        if (initial && arg1 === 'class') {
          arg2 = el.className + ' ' + arg2;
        }
        if (arg2 == null) {
          el.removeAttribute(arg1);
        } else {
          el.setAttribute(arg1, arg2);
        }
      }
    }
  }

  function setXlink (el, arg1, arg2) {
    if (typeof arg1 === 'object') {
      for (var key in arg1) {
        setXlink(el, key, arg1[key]);
      }
    } else {
      if (arg2 != null) {
        el.setAttributeNS(xlinkns, arg1, arg2);
      } else {
        el.removeAttributeNS(xlinkns, arg1, arg2);
      }
    }
  }

  function setData (el, arg1, arg2) {
    if (typeof arg1 === 'object') {
      for (var key in arg1) {
        setData(el, key, arg1[key]);
      }
    } else {
      if (arg2 != null) {
        el.dataset[arg1] = arg2;
      } else {
        delete el.dataset[arg1];
      }
    }
  }

  function text (str) {
    return document.createTextNode((str != null) ? str : '');
  }

  function parseArgumentsInternal (element, args, initial) {
    for (var i = 0, list = args; i < list.length; i += 1) {
      var arg = list[i];

      if (arg !== 0 && !arg) {
        continue;
      }

      var type = typeof arg;

      if (type === 'function') {
        arg(element);
      } else if (type === 'string' || type === 'number') {
        element.appendChild(text(arg));
      } else if (isNode(getEl(arg))) {
        mount(element, arg);
      } else if (arg.length) {
        parseArgumentsInternal(element, arg, initial);
      } else if (type === 'object') {
        setAttrInternal(element, arg, null, initial);
      }
    }
  }

  function ensureEl (parent) {
    return typeof parent === 'string' ? html(parent) : getEl(parent);
  }

  function getEl (parent) {
    return (parent.nodeType && parent) || (!parent.el && parent) || getEl(parent.el);
  }

  function isNode (arg) {
    return arg && arg.nodeType;
  }

  var htmlCache = {};

  function html (query) {
    var args = [], len = arguments.length - 1;
    while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

    var element;

    var type = typeof query;

    if (type === 'string') {
      element = memoizeHTML(query).cloneNode(false);
    } else if (isNode(query)) {
      element = query.cloneNode(false);
    } else if (type === 'function') {
      var Query = query;
      element = new (Function.prototype.bind.apply( Query, [ null ].concat( args) ));
    } else {
      throw new Error('At least one argument required');
    }

    parseArgumentsInternal(getEl(element), args, true);

    return element;
  }

  var el = html;
  var h = html;

  html.extend = function extendHtml (query) {
    var args = [], len = arguments.length - 1;
    while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

    var clone = memoizeHTML(query);

    return html.bind.apply(html, [ this, clone ].concat( args ));
  };

  function memoizeHTML (query) {
    return htmlCache[query] || (htmlCache[query] = createElement(query));
  }

  function setChildren (parent) {
    var children = [], len = arguments.length - 1;
    while ( len-- > 0 ) children[ len ] = arguments[ len + 1 ];

    var parentEl = getEl(parent);
    var current = traverse(parent, children, parentEl.firstChild);

    while (current) {
      var next = current.nextSibling;

      unmount(parent, current);

      current = next;
    }
  }

  function traverse (parent, children, _current) {
    var current = _current;

    var childEls = new Array(children.length);

    for (var i = 0; i < children.length; i++) {
      childEls[i] = children[i] && getEl(children[i]);
    }

    for (var i$1 = 0; i$1 < children.length; i$1++) {
      var child = children[i$1];

      if (!child) {
        continue;
      }

      var childEl = childEls[i$1];

      if (childEl === current) {
        current = current.nextSibling;
        continue;
      }

      if (isNode(childEl)) {
        var next = current && current.nextSibling;
        var exists = child.__redom_index != null;
        var replace = exists && next === childEls[i$1 + 1];

        mount(parent, child, current, replace);

        if (replace) {
          current = next;
        }

        continue;
      }

      if (child.length != null) {
        current = traverse(parent, child, current);
      }
    }

    return current;
  }

  function listPool (View, key, initData) {
    return new ListPool(View, key, initData);
  }

  var ListPool = function ListPool (View, key, initData) {
    this.View = View;
    this.initData = initData;
    this.oldLookup = {};
    this.lookup = {};
    this.oldViews = [];
    this.views = [];

    if (key != null) {
      this.key = typeof key === 'function' ? key : propKey(key);
    }
  };
  ListPool.prototype.update = function update (data, context) {
    var ref = this;
      var View = ref.View;
      var key = ref.key;
      var initData = ref.initData;
    var keySet = key != null;

    var oldLookup = this.lookup;
    var newLookup = {};

    var newViews = new Array(data.length);
    var oldViews = this.views;

    for (var i = 0; i < data.length; i++) {
      var item = data[i];
      var view = (void 0);

      if (keySet) {
        var id = key(item);

        view = oldLookup[id] || new View(initData, item, i, data);
        newLookup[id] = view;
        view.__redom_id = id;
      } else {
        view = oldViews[i] || new View(initData, item, i, data);
      }
      view.update && view.update(item, i, data, context);

      var el = getEl(view.el);

      el.__redom_view = view;
      newViews[i] = view;
    }

    this.oldViews = oldViews;
    this.views = newViews;

    this.oldLookup = oldLookup;
    this.lookup = newLookup;
  };

  function propKey (key) {
    return function (item) {
      return item[key];
    };
  }

  function list (parent, View, key, initData) {
    return new List(parent, View, key, initData);
  }

  var List = function List (parent, View, key, initData) {
    this.__redom_list = true;
    this.View = View;
    this.initData = initData;
    this.views = [];
    this.pool = new ListPool(View, key, initData);
    this.el = ensureEl(parent);
    this.keySet = key != null;
  };
  List.prototype.update = function update (data, context) {
      if ( data === void 0 ) data = [];

    var ref = this;
      var keySet = ref.keySet;
    var oldViews = this.views;

    this.pool.update(data, context);

    var ref$1 = this.pool;
      var views = ref$1.views;
      var lookup = ref$1.lookup;

    if (keySet) {
      for (var i = 0; i < oldViews.length; i++) {
        var oldView = oldViews[i];
        var id = oldView.__redom_id;

        if (lookup[id] == null) {
          oldView.__redom_index = null;
          unmount(this, oldView);
        }
      }
    }

    for (var i$1 = 0; i$1 < views.length; i$1++) {
      var view = views[i$1];

      view.__redom_index = i$1;
    }

    setChildren(this, views);

    if (keySet) {
      this.lookup = lookup;
    }
    this.views = views;
  };

  List.extend = function extendList (parent, View, key, initData) {
    return List.bind(List, parent, View, key, initData);
  };

  list.extend = List.extend;

  /* global Node */

  function place (View, initData) {
    return new Place(View, initData);
  }

  var Place = function Place (View, initData) {
    this.el = text('');
    this.visible = false;
    this.view = null;
    this._placeholder = this.el;

    if (View instanceof Node) {
      this._el = View;
    } else {
      this._View = View;
    }

    this._initData = initData;
  };
  Place.prototype.update = function update (visible, data) {
    var placeholder = this._placeholder;
    var parentNode = this.el.parentNode;

    if (visible) {
      if (!this.visible) {
        if (this._el) {
          mount(parentNode, this._el, placeholder);
          unmount(parentNode, placeholder);

          this.el = this._el;
          this.visible = visible;

          return;
        }
        var View = this._View;
        var view = new View(this._initData);

        this.el = getEl(view);
        this.view = view;

        mount(parentNode, view, placeholder);
        unmount(parentNode, placeholder);
      }
      this.view && this.view.update && this.view.update(data);
    } else {
      if (this.visible) {
        if (this._el) {
          mount(parentNode, placeholder, this._el);
          unmount(parentNode, this._el);

          this.el = placeholder;
          this.visible = visible;

          return;
        }
        mount(parentNode, placeholder, this.view);
        unmount(parentNode, this.view);

        this.el = placeholder;
        this.view = null;
      }
    }
    this.visible = visible;
  };

  function router (parent, Views, initData) {
    return new Router(parent, Views, initData);
  }

  var Router = function Router (parent, Views, initData) {
    this.el = ensureEl(parent);
    this.Views = Views;
    this.initData = initData;
  };
  Router.prototype.update = function update (route, data) {
    if (route !== this.route) {
      var Views = this.Views;
      var View = Views[route];

      this.route = route;
      this.view = View && new View(this.initData, data);

      setChildren(this.el, [ this.view ]);
    }
    this.view && this.view.update && this.view.update(data, route);
  };

  var ns = 'http://www.w3.org/2000/svg';

  var svgCache = {};

  function svg (query) {
    var args = [], len = arguments.length - 1;
    while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

    var element;

    var type = typeof query;

    if (type === 'string') {
      element = memoizeSVG(query).cloneNode(false);
    } else if (isNode(query)) {
      element = query.cloneNode(false);
    } else if (type === 'function') {
      var Query = query;
      element = new (Function.prototype.bind.apply( Query, [ null ].concat( args) ));
    } else {
      throw new Error('At least one argument required');
    }

    parseArgumentsInternal(getEl(element), args, true);

    return element;
  }

  var s = svg;

  svg.extend = function extendSvg (query) {
    var clone = memoizeSVG(query);

    return svg.bind(this, clone);
  };

  svg.ns = ns;

  function memoizeSVG (query) {
    return svgCache[query] || (svgCache[query] = createElement(query, ns));
  }

  exports.List = List;
  exports.ListPool = ListPool;
  exports.Place = Place;
  exports.Router = Router;
  exports.el = el;
  exports.h = h;
  exports.html = html;
  exports.list = list;
  exports.listPool = listPool;
  exports.mount = mount;
  exports.place = place;
  exports.router = router;
  exports.s = s;
  exports.setAttr = setAttr;
  exports.setChildren = setChildren;
  exports.setData = setData;
  exports.setStyle = setStyle;
  exports.setXlink = setXlink;
  exports.svg = svg;
  exports.text = text;
  exports.unmount = unmount;

  Object.defineProperty(exports, '__esModule', { value: true });

}));

},{}],11:[function(require,module,exports){
"use strict"

var twoProduct = require("two-product")
var robustSum = require("robust-sum")
var robustScale = require("robust-scale")
var robustSubtract = require("robust-subtract")

var NUM_EXPAND = 5

var EPSILON     = 1.1102230246251565e-16
var ERRBOUND3   = (3.0 + 16.0 * EPSILON) * EPSILON
var ERRBOUND4   = (7.0 + 56.0 * EPSILON) * EPSILON

function cofactor(m, c) {
  var result = new Array(m.length-1)
  for(var i=1; i<m.length; ++i) {
    var r = result[i-1] = new Array(m.length-1)
    for(var j=0,k=0; j<m.length; ++j) {
      if(j === c) {
        continue
      }
      r[k++] = m[i][j]
    }
  }
  return result
}

function matrix(n) {
  var result = new Array(n)
  for(var i=0; i<n; ++i) {
    result[i] = new Array(n)
    for(var j=0; j<n; ++j) {
      result[i][j] = ["m", j, "[", (n-i-1), "]"].join("")
    }
  }
  return result
}

function sign(n) {
  if(n & 1) {
    return "-"
  }
  return ""
}

function generateSum(expr) {
  if(expr.length === 1) {
    return expr[0]
  } else if(expr.length === 2) {
    return ["sum(", expr[0], ",", expr[1], ")"].join("")
  } else {
    var m = expr.length>>1
    return ["sum(", generateSum(expr.slice(0, m)), ",", generateSum(expr.slice(m)), ")"].join("")
  }
}

function determinant(m) {
  if(m.length === 2) {
    return [["sum(prod(", m[0][0], ",", m[1][1], "),prod(-", m[0][1], ",", m[1][0], "))"].join("")]
  } else {
    var expr = []
    for(var i=0; i<m.length; ++i) {
      expr.push(["scale(", generateSum(determinant(cofactor(m, i))), ",", sign(i), m[0][i], ")"].join(""))
    }
    return expr
  }
}

function orientation(n) {
  var pos = []
  var neg = []
  var m = matrix(n)
  var args = []
  for(var i=0; i<n; ++i) {
    if((i&1)===0) {
      pos.push.apply(pos, determinant(cofactor(m, i)))
    } else {
      neg.push.apply(neg, determinant(cofactor(m, i)))
    }
    args.push("m" + i)
  }
  var posExpr = generateSum(pos)
  var negExpr = generateSum(neg)
  var funcName = "orientation" + n + "Exact"
  var code = ["function ", funcName, "(", args.join(), "){var p=", posExpr, ",n=", negExpr, ",d=sub(p,n);\
return d[d.length-1];};return ", funcName].join("")
  var proc = new Function("sum", "prod", "scale", "sub", code)
  return proc(robustSum, twoProduct, robustScale, robustSubtract)
}

var orientation3Exact = orientation(3)
var orientation4Exact = orientation(4)

var CACHED = [
  function orientation0() { return 0 },
  function orientation1() { return 0 },
  function orientation2(a, b) { 
    return b[0] - a[0]
  },
  function orientation3(a, b, c) {
    var l = (a[1] - c[1]) * (b[0] - c[0])
    var r = (a[0] - c[0]) * (b[1] - c[1])
    var det = l - r
    var s
    if(l > 0) {
      if(r <= 0) {
        return det
      } else {
        s = l + r
      }
    } else if(l < 0) {
      if(r >= 0) {
        return det
      } else {
        s = -(l + r)
      }
    } else {
      return det
    }
    var tol = ERRBOUND3 * s
    if(det >= tol || det <= -tol) {
      return det
    }
    return orientation3Exact(a, b, c)
  },
  function orientation4(a,b,c,d) {
    var adx = a[0] - d[0]
    var bdx = b[0] - d[0]
    var cdx = c[0] - d[0]
    var ady = a[1] - d[1]
    var bdy = b[1] - d[1]
    var cdy = c[1] - d[1]
    var adz = a[2] - d[2]
    var bdz = b[2] - d[2]
    var cdz = c[2] - d[2]
    var bdxcdy = bdx * cdy
    var cdxbdy = cdx * bdy
    var cdxady = cdx * ady
    var adxcdy = adx * cdy
    var adxbdy = adx * bdy
    var bdxady = bdx * ady
    var det = adz * (bdxcdy - cdxbdy) 
            + bdz * (cdxady - adxcdy)
            + cdz * (adxbdy - bdxady)
    var permanent = (Math.abs(bdxcdy) + Math.abs(cdxbdy)) * Math.abs(adz)
                  + (Math.abs(cdxady) + Math.abs(adxcdy)) * Math.abs(bdz)
                  + (Math.abs(adxbdy) + Math.abs(bdxady)) * Math.abs(cdz)
    var tol = ERRBOUND4 * permanent
    if ((det > tol) || (-det > tol)) {
      return det
    }
    return orientation4Exact(a,b,c,d)
  }
]

function slowOrient(args) {
  var proc = CACHED[args.length]
  if(!proc) {
    proc = CACHED[args.length] = orientation(args.length)
  }
  return proc.apply(undefined, args)
}

function generateOrientationProc() {
  while(CACHED.length <= NUM_EXPAND) {
    CACHED.push(orientation(CACHED.length))
  }
  var args = []
  var procArgs = ["slow"]
  for(var i=0; i<=NUM_EXPAND; ++i) {
    args.push("a" + i)
    procArgs.push("o" + i)
  }
  var code = [
    "function getOrientation(", args.join(), "){switch(arguments.length){case 0:case 1:return 0;"
  ]
  for(var i=2; i<=NUM_EXPAND; ++i) {
    code.push("case ", i, ":return o", i, "(", args.slice(0, i).join(), ");")
  }
  code.push("}var s=new Array(arguments.length);for(var i=0;i<arguments.length;++i){s[i]=arguments[i]};return slow(s);}return getOrientation")
  procArgs.push(code.join(""))

  var proc = Function.apply(undefined, procArgs)
  module.exports = proc.apply(undefined, [slowOrient].concat(CACHED))
  for(var i=0; i<=NUM_EXPAND; ++i) {
    module.exports[i] = CACHED[i]
  }
}

generateOrientationProc()
},{"robust-scale":13,"robust-subtract":15,"robust-sum":16,"two-product":17}],12:[function(require,module,exports){
module.exports = robustPointInPolygon

var orient = require('robust-orientation')

function robustPointInPolygon(vs, point) {
  var x = point[0]
  var y = point[1]
  var n = vs.length
  var inside = 1
  var lim = n
  for(var i = 0, j = n-1; i<lim; j=i++) {
    var a = vs[i]
    var b = vs[j]
    var yi = a[1]
    var yj = b[1]
    if(yj < yi) {
      if(yj < y && y < yi) {
        var s = orient(a, b, point)
        if(s === 0) {
          return 0
        } else {
          inside ^= (0 < s)|0
        }
      } else if(y === yi) {
        var c = vs[(i+1)%n]
        var yk = c[1]
        if(yi < yk) {
          var s = orient(a, b, point)
          if(s === 0) {
            return 0
          } else {
            inside ^= (0 < s)|0
          }
        }
      }
    } else if(yi < yj) {
      if(yi < y && y < yj) {
        var s = orient(a, b, point)
        if(s === 0) {
          return 0
        } else {
          inside ^= (s < 0)|0
        }
      } else if(y === yi) {
        var c = vs[(i+1)%n]
        var yk = c[1]
        if(yk < yi) {
          var s = orient(a, b, point)
          if(s === 0) {
            return 0
          } else {
            inside ^= (s < 0)|0
          }
        }
      }
    } else if(y === yi) {
      var x0 = Math.min(a[0], b[0])
      var x1 = Math.max(a[0], b[0])
      if(i === 0) {
        while(j>0) {
          var k = (j+n-1)%n
          var p = vs[k]
          if(p[1] !== y) {
            break
          }
          var px = p[0]
          x0 = Math.min(x0, px)
          x1 = Math.max(x1, px)
          j = k
        }
        if(j === 0) {
          if(x0 <= x && x <= x1) {
            return 0
          }
          return 1 
        }
        lim = j+1
      }
      var y0 = vs[(j+n-1)%n][1]
      while(i+1<lim) {
        var p = vs[i+1]
        if(p[1] !== y) {
          break
        }
        var px = p[0]
        x0 = Math.min(x0, px)
        x1 = Math.max(x1, px)
        i += 1
      }
      if(x0 <= x && x <= x1) {
        return 0
      }
      var y1 = vs[(i+1)%n][1]
      if(x < x0 && (y0 < y !== y1 < y)) {
        inside ^= 1
      }
    }
  }
  return 2 * inside - 1
}
},{"robust-orientation":11}],13:[function(require,module,exports){
"use strict"

var twoProduct = require("two-product")
var twoSum = require("two-sum")

module.exports = scaleLinearExpansion

function scaleLinearExpansion(e, scale) {
  var n = e.length
  if(n === 1) {
    var ts = twoProduct(e[0], scale)
    if(ts[0]) {
      return ts
    }
    return [ ts[1] ]
  }
  var g = new Array(2 * n)
  var q = [0.1, 0.1]
  var t = [0.1, 0.1]
  var count = 0
  twoProduct(e[0], scale, q)
  if(q[0]) {
    g[count++] = q[0]
  }
  for(var i=1; i<n; ++i) {
    twoProduct(e[i], scale, t)
    var pq = q[1]
    twoSum(pq, t[0], q)
    if(q[0]) {
      g[count++] = q[0]
    }
    var a = t[1]
    var b = q[1]
    var x = a + b
    var bv = x - a
    var y = b - bv
    q[1] = x
    if(y) {
      g[count++] = y
    }
  }
  if(q[1]) {
    g[count++] = q[1]
  }
  if(count === 0) {
    g[count++] = 0.0
  }
  g.length = count
  return g
}
},{"two-product":17,"two-sum":18}],14:[function(require,module,exports){
"use strict"

module.exports = segmentsIntersect

var orient = require("robust-orientation")[3]

function checkCollinear(a0, a1, b0, b1) {

  for(var d=0; d<2; ++d) {
    var x0 = a0[d]
    var y0 = a1[d]
    var l0 = Math.min(x0, y0)
    var h0 = Math.max(x0, y0)    

    var x1 = b0[d]
    var y1 = b1[d]
    var l1 = Math.min(x1, y1)
    var h1 = Math.max(x1, y1)    

    if(h1 < l0 || h0 < l1) {
      return false
    }
  }

  return true
}

function segmentsIntersect(a0, a1, b0, b1) {
  var x0 = orient(a0, b0, b1)
  var y0 = orient(a1, b0, b1)
  if((x0 > 0 && y0 > 0) || (x0 < 0 && y0 < 0)) {
    return false
  }

  var x1 = orient(b0, a0, a1)
  var y1 = orient(b1, a0, a1)
  if((x1 > 0 && y1 > 0) || (x1 < 0 && y1 < 0)) {
    return false
  }

  //Check for degenerate collinear case
  if(x0 === 0 && y0 === 0 && x1 === 0 && y1 === 0) {
    return checkCollinear(a0, a1, b0, b1)
  }

  return true
}
},{"robust-orientation":11}],15:[function(require,module,exports){
"use strict"

module.exports = robustSubtract

//Easy case: Add two scalars
function scalarScalar(a, b) {
  var x = a + b
  var bv = x - a
  var av = x - bv
  var br = b - bv
  var ar = a - av
  var y = ar + br
  if(y) {
    return [y, x]
  }
  return [x]
}

function robustSubtract(e, f) {
  var ne = e.length|0
  var nf = f.length|0
  if(ne === 1 && nf === 1) {
    return scalarScalar(e[0], -f[0])
  }
  var n = ne + nf
  var g = new Array(n)
  var count = 0
  var eptr = 0
  var fptr = 0
  var abs = Math.abs
  var ei = e[eptr]
  var ea = abs(ei)
  var fi = -f[fptr]
  var fa = abs(fi)
  var a, b
  if(ea < fa) {
    b = ei
    eptr += 1
    if(eptr < ne) {
      ei = e[eptr]
      ea = abs(ei)
    }
  } else {
    b = fi
    fptr += 1
    if(fptr < nf) {
      fi = -f[fptr]
      fa = abs(fi)
    }
  }
  if((eptr < ne && ea < fa) || (fptr >= nf)) {
    a = ei
    eptr += 1
    if(eptr < ne) {
      ei = e[eptr]
      ea = abs(ei)
    }
  } else {
    a = fi
    fptr += 1
    if(fptr < nf) {
      fi = -f[fptr]
      fa = abs(fi)
    }
  }
  var x = a + b
  var bv = x - a
  var y = b - bv
  var q0 = y
  var q1 = x
  var _x, _bv, _av, _br, _ar
  while(eptr < ne && fptr < nf) {
    if(ea < fa) {
      a = ei
      eptr += 1
      if(eptr < ne) {
        ei = e[eptr]
        ea = abs(ei)
      }
    } else {
      a = fi
      fptr += 1
      if(fptr < nf) {
        fi = -f[fptr]
        fa = abs(fi)
      }
    }
    b = q0
    x = a + b
    bv = x - a
    y = b - bv
    if(y) {
      g[count++] = y
    }
    _x = q1 + x
    _bv = _x - q1
    _av = _x - _bv
    _br = x - _bv
    _ar = q1 - _av
    q0 = _ar + _br
    q1 = _x
  }
  while(eptr < ne) {
    a = ei
    b = q0
    x = a + b
    bv = x - a
    y = b - bv
    if(y) {
      g[count++] = y
    }
    _x = q1 + x
    _bv = _x - q1
    _av = _x - _bv
    _br = x - _bv
    _ar = q1 - _av
    q0 = _ar + _br
    q1 = _x
    eptr += 1
    if(eptr < ne) {
      ei = e[eptr]
    }
  }
  while(fptr < nf) {
    a = fi
    b = q0
    x = a + b
    bv = x - a
    y = b - bv
    if(y) {
      g[count++] = y
    } 
    _x = q1 + x
    _bv = _x - q1
    _av = _x - _bv
    _br = x - _bv
    _ar = q1 - _av
    q0 = _ar + _br
    q1 = _x
    fptr += 1
    if(fptr < nf) {
      fi = -f[fptr]
    }
  }
  if(q0) {
    g[count++] = q0
  }
  if(q1) {
    g[count++] = q1
  }
  if(!count) {
    g[count++] = 0.0  
  }
  g.length = count
  return g
}
},{}],16:[function(require,module,exports){
"use strict"

module.exports = linearExpansionSum

//Easy case: Add two scalars
function scalarScalar(a, b) {
  var x = a + b
  var bv = x - a
  var av = x - bv
  var br = b - bv
  var ar = a - av
  var y = ar + br
  if(y) {
    return [y, x]
  }
  return [x]
}

function linearExpansionSum(e, f) {
  var ne = e.length|0
  var nf = f.length|0
  if(ne === 1 && nf === 1) {
    return scalarScalar(e[0], f[0])
  }
  var n = ne + nf
  var g = new Array(n)
  var count = 0
  var eptr = 0
  var fptr = 0
  var abs = Math.abs
  var ei = e[eptr]
  var ea = abs(ei)
  var fi = f[fptr]
  var fa = abs(fi)
  var a, b
  if(ea < fa) {
    b = ei
    eptr += 1
    if(eptr < ne) {
      ei = e[eptr]
      ea = abs(ei)
    }
  } else {
    b = fi
    fptr += 1
    if(fptr < nf) {
      fi = f[fptr]
      fa = abs(fi)
    }
  }
  if((eptr < ne && ea < fa) || (fptr >= nf)) {
    a = ei
    eptr += 1
    if(eptr < ne) {
      ei = e[eptr]
      ea = abs(ei)
    }
  } else {
    a = fi
    fptr += 1
    if(fptr < nf) {
      fi = f[fptr]
      fa = abs(fi)
    }
  }
  var x = a + b
  var bv = x - a
  var y = b - bv
  var q0 = y
  var q1 = x
  var _x, _bv, _av, _br, _ar
  while(eptr < ne && fptr < nf) {
    if(ea < fa) {
      a = ei
      eptr += 1
      if(eptr < ne) {
        ei = e[eptr]
        ea = abs(ei)
      }
    } else {
      a = fi
      fptr += 1
      if(fptr < nf) {
        fi = f[fptr]
        fa = abs(fi)
      }
    }
    b = q0
    x = a + b
    bv = x - a
    y = b - bv
    if(y) {
      g[count++] = y
    }
    _x = q1 + x
    _bv = _x - q1
    _av = _x - _bv
    _br = x - _bv
    _ar = q1 - _av
    q0 = _ar + _br
    q1 = _x
  }
  while(eptr < ne) {
    a = ei
    b = q0
    x = a + b
    bv = x - a
    y = b - bv
    if(y) {
      g[count++] = y
    }
    _x = q1 + x
    _bv = _x - q1
    _av = _x - _bv
    _br = x - _bv
    _ar = q1 - _av
    q0 = _ar + _br
    q1 = _x
    eptr += 1
    if(eptr < ne) {
      ei = e[eptr]
    }
  }
  while(fptr < nf) {
    a = fi
    b = q0
    x = a + b
    bv = x - a
    y = b - bv
    if(y) {
      g[count++] = y
    } 
    _x = q1 + x
    _bv = _x - q1
    _av = _x - _bv
    _br = x - _bv
    _ar = q1 - _av
    q0 = _ar + _br
    q1 = _x
    fptr += 1
    if(fptr < nf) {
      fi = f[fptr]
    }
  }
  if(q0) {
    g[count++] = q0
  }
  if(q1) {
    g[count++] = q1
  }
  if(!count) {
    g[count++] = 0.0  
  }
  g.length = count
  return g
}
},{}],17:[function(require,module,exports){
"use strict"

module.exports = twoProduct

var SPLITTER = +(Math.pow(2, 27) + 1.0)

function twoProduct(a, b, result) {
  var x = a * b

  var c = SPLITTER * a
  var abig = c - a
  var ahi = c - abig
  var alo = a - ahi

  var d = SPLITTER * b
  var bbig = d - b
  var bhi = d - bbig
  var blo = b - bhi

  var err1 = x - (ahi * bhi)
  var err2 = err1 - (alo * bhi)
  var err3 = err2 - (ahi * blo)

  var y = alo * blo - err3

  if(result) {
    result[0] = y
    result[1] = x
    return result
  }

  return [ y, x ]
}
},{}],18:[function(require,module,exports){
"use strict"

module.exports = fastTwoSum

function fastTwoSum(a, b, result) {
	var x = a + b
	var bv = x - a
	var av = x - bv
	var br = b - bv
	var ar = a - av
	if(result) {
		result[0] = ar + br
		result[1] = x
		return result
	}
	return [ar+br, x]
}
},{}],19:[function(require,module,exports){
const {mount} = require('redom')
const hsv2rgb = require('hsv2rgb')

const MeshPixelMap = require('./MeshPixelMap')
const Composer = require('./Composer')
const Viewer = require('./Viewer')

const {makeLayers, mergeLayers} = require('./layers')

const patterns = [
  {
    name: 'Gradient X',
    fn: ({hue, speedX, speedY, buffer}, {width, height}, t) => {
      const startX = width + (Math.floor(speedX * t) % width)
      const startY = height + (Math.floor(speedY * t) % height)

      for (let i = 0; i < height; i++) {
        const y = (startY + i) % height

        for (let j = 0; j < width; j++) {
          const x = (startX + j) % width
          const k = j / (width - 1)

          const index = (y * width + x) * 4
          hsv2rgb(
            hue,
            1,//i % 2 ? 1 : 0,
            k,
            buffer.subarray(index, index + 3)
          )
        }
      }
    }
  },
  {
    name: 'Gradient Y',
    fn: ({hue, speedX, speedY, buffer}, {width, height}, t) => {
      const startX = width + (Math.floor(speedX * t) % width)
      const startY = height + (Math.floor(speedY * t) % height)

      for (let i = 0; i < height; i++) {
        const k = i / (height - 1)
        const y = (startY + i) % height

        for (let j = 0; j < width; j++) {
          const x = (startX + j) % width

          const index = (y * width + x) * 4
          hsv2rgb(
            hue,
            1,
            k,
            buffer.subarray(index, index + 3)
          )
        }
      }
    }
  },
  {
    name: 'Gradient XY',
    fn: ({hue, speedX, speedY, buffer}, {width, height}, t) => {
      const startX = width + (Math.floor(speedX * t) % width)
      const startY = height + (Math.floor(speedY * t) % height)

      for (let i = 0; i < height; i++) {
        const k = i / (height - 1)
        const y = (startY + i) % height

        for (let j = 0; j < width; j++) {
          const x = (startX + j) % width

          const index = (y * width + x) * 4
          hsv2rgb(
            hue + (j / (width - 1)) * 100,
            1,
            k,
            buffer.subarray(index, index + 3)
          )
        }
      }
    }
  }
]

const blends = [
  {name: 'Normal'}
]

const createLayer = () => {
  const buffer = new Uint8ClampedArray(100000)
  for (let i = 0; i < buffer.length; i++) {
    //buffer[i] = Math.round(Math.random() * 255)
  }

  return {
    mapping: 0,
    pattern: 0,
    blend: 0,
    hue: 0,
    opacity: 1,
    speedX: 1,
    speedY: 1,
    buffer
  }
}

const layers = window.layers = [createLayer()]
let composer = null
let viewer = null

const createMapping = (name, map) => {
  const width = map.reduce(
    (max, row) => Math.max(max, row.length),
    0
  )

  return {name, map, width, height: map.length}
}

const createAllMappings = ({mesh, facePixels}) => {
  const holeA = makeLayers(mesh, facePixels, false, 0, 0)
  const holeB = makeLayers(mesh, facePixels, false, 0, 1)

  const holes = mergeLayers(holeA, holeB)

  return [
    createMapping('Hole A', holeA),
    createMapping('Hole B', holeB),
    createMapping('Holes', holes)
  ]
}

const init = () => {
  if (composer) composer.parentNode.removeChild(composer)
  if (viewer) viewer.parentNode.removeChild(viewer)

  const width = document.getElementById('viewer').offsetWidth - 4 
  const height = document.getElementById('viewer').offsetHeight - 4

  const pixelMap = window.pixelMap = MeshPixelMap({
    center: [width / 2, height / 2],
    radius: width * 0.6,
    ratio: 1.5,
    sides: 30,
    bumps: 6,
    holeCount: 2,
    holeSize: 3,
    triangleSize: Math.floor(width / 22),
    pixelsPerSide: 3
  })

  const buffer = new Uint8ClampedArray(pixelMap.pixels.length * 4)
  const mappings = createAllMappings(pixelMap)

  let t = 0
  const render = () => {
    buffer.fill(0)

    for (let i = 0; i < layers.length; i++) {
      const layer = layers[i]
      const pattern = patterns[layer.pattern]
      const mapping = mappings[layer.mapping]
      const map = mappings[layer.mapping].map
      
      //layer.buffer.fill(0)
      pattern.fn(layer, mapping, t)

      for (let j = 0; j < map.length; j++) {
        const row = map[j]

        for (let k = 0; k < row.length; k++) {
          const col = row[k]

          const offset = (j * mapping.width + k) * 4
          const r = layer.buffer[offset]
          const g = layer.buffer[offset + 1]
          const b = layer.buffer[offset + 2]

          for (let m = 0; m < col.length; m++) {
            const index = col[m]
            buffer[index * 4] = r
            buffer[index * 4 + 1] = g
            buffer[index * 4 + 2] = b
          }
        }
      }
    }

    t++
    requestAnimationFrame(render)
  }

  requestAnimationFrame(render)

  composer = Composer(mappings, patterns, blends, layers, createLayer, init)
  viewer = Viewer(width, height, pixelMap.mesh, pixelMap.pixels, buffer)

  mount(document.getElementById('composer'), composer)
  mount(document.getElementById('viewer'), viewer)
}

init()

},{"./Composer":1,"./MeshPixelMap":2,"./Viewer":7,"./layers":8,"hsv2rgb":9,"redom":10}],20:[function(require,module,exports){
const classifyPoint = require('robust-point-in-polygon')
const segmentsIntersect = require('robust-segment-intersect')

const polygonInPolygon = (a, b) => {
  if (classifyPoint(b, a[0]) >= 0)
    return false;

  for (let i = 0; i < a.length; i++) {
    const a0 = a[i]
    const a1 = a[(i + 1) % a.length]

    for (let j = 0; j < b.length; j++) {
      const b0 = b[j]
      const b1 = b[(j + 1) % b.length]

      if (segmentsIntersect(a0, a1, b0, b1))
        return false;
    }
  }

  return true;
}
exports.polygonInPolygon = polygonInPolygon

const polygonsIntersect = (a, b) => {
  for (let i = 0; i < a.length; i++) {
    const a0 = a[i]
    const a1 = a[(i + 1) % a.length]

    for (let j = 0; j < b.length; j++) {
      const b0 = b[j]
      const b1 = b[(j + 1) % b.length]

      if (segmentsIntersect(a0, a1, b0, b1))
        return true;
    }
  }

  return false;
}
exports.polygonsIntersect = polygonsIntersect

const interp = (values, t) => {
  const f = (t * values.length) % values.length
  const i = Math.floor(f)
  const j = (i + 1) % values.length
  const k = f % 1

  return values[i] * (1 - k) + values[j] * k
}

const randomPolygon = (sides, bumps, radius, ratio = 1) => {
  const offsets = Array(bumps).fill().map((_, i) => Math.random())

  return Array(sides).fill().map((_, i) => {
    const k = i / sides
    const angle = k * 2 * Math.PI
    const rnd = 0.5 + 0.5 * interp(offsets, k)

    return [
      rnd * radius * Math.cos(angle),
      rnd * radius * Math.sin(angle) / ratio
    ]
  })
}
exports.randomPolygon = randomPolygon

const randomPointsInsidePolygon = (ps, holes, n) => {
  const [minX, maxX, minY, maxY] = ps.reduce(
    ([minX, maxX, minY, maxY], [x, y]) => [
      Math.min(minX, x),
      Math.max(maxX, x),
      Math.min(minY, y),
      Math.max(maxY, y)
    ],
    [
      Infinity,
      -Infinity,
      Infinity,
      -Infinity
    ]
  )

  const dx = maxX - minX
  const dy = maxY - minY

  const result = []

  while (result.length < n) {
    const p = [
      minX + Math.round(Math.random() * dx),
      minY + Math.round(Math.random() * dy)
    ]

    if (
      classifyPoint(ps, p) === -1 &&
      holes.every(hole => classifyPoint(hole, p) === 1)
    ) {
      result.push(p)
    }
  }

  return result
}
exports.randomPointsInsidePolygon = randomPointsInsidePolygon

const refinePolygon = (ps, maxEdge) => {
  const result = []

  for (let i = 0; i < ps.length; i++) {
    const a = ps[i]
    const b = ps[(i + 1) % ps.length]

    const x = b[0] - a[0]
    const y = b[1] - a[1]

    const length = Math.hypot(x, y)
    const parts = Math.ceil(length / maxEdge)

    result.push(a)

    for (let j = 1; j < parts; j++) {
      result.push([
        a[0] + x * (j / parts),
        a[1] + y * (j / parts)
      ])
    }
  }

  return result
}
exports.refinePolygon = refinePolygon
},{"robust-point-in-polygon":12,"robust-segment-intersect":14}]},{},[19]);
