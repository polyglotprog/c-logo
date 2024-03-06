const XMLNS_SVG='http://www.w3.org/2000/svg'

window.addEventListener('load',
    () => drawLogo(200,
        /* foreground */ Color.fromHex(0xffffff),
        /* background */ Color.fromHex(0x0033ff)))

function drawLogo(size, foregroundColor, backgroundColor) {
  let svg = document.getElementById('logo')
  svg.setAttribute('width',  size)
  svg.setAttribute('height', size)

  let radius = size / 2
  let circle = new Circle([radius, radius], radius)
  let center = circle.center
  let points = circle.getEquidistantPoints(6, true)

  let [
    hexagon,
    rightTriangle,
    bottomQuadrilateral
  ] = createPolygons(center, points, foregroundColor, backgroundColor)

  let letterC = createLetterC(center, points, foregroundColor)

  svg.appendChild(hexagon)
  svg.appendChild(rightTriangle)
  svg.appendChild(bottomQuadrilateral)
  svg.appendChild(letterC)
}

// Letter C
function createLetterC(center, points, foregroundColor) {
  let bottomBottom = points[0].lerp(center, 1/3)
  let bottomTop = points[0].lerp(center, 2/3)

  let topBottom = points[5].lerp(center, 2/3)
  let topTop = points[5].lerp(center, 1/3)

  let innerRadius = center.distanceTo(topBottom)
  let outerRadius = center.distanceTo(topTop)

  return createPath([
    ['M', bottomBottom.x, bottomBottom.y],
    ['A', outerRadius, outerRadius, 0, 1, 1, topTop.x, topTop.y],
    ['L', topBottom.x, topBottom.y],
    ['A', innerRadius, innerRadius, 0, 1, 0, bottomTop.x, bottomTop.y],
    ['Z']
  ], {
    stroke: 'none',
    fill: foregroundColor.toHex(),
  })
}

// Hexagon, Triangle, Quadrilateral
function createPolygons(center, points, foregroundColor, backgroundColor) {
  // const white = Color.fromHex(0xffffff)
  const light = backgroundColor.lerp(foregroundColor, 0.2)
  const lighter = backgroundColor.lerp(foregroundColor, 0.4)

  const hexagon = createPolygon(points, {
    stroke: 'none',
    fill:   lighter.toHex(),
  })

  const p = points

  const rightTriangle = createPolygon([center, p[0], p[5]], {
    stroke: 'none',
    fill:   light.toHex(),
  })

  const bottomQuadrilateral = createPolygon([center, p[0], p[1], p[2]], {
    stroke: 'none',
    fill:   backgroundColor.toHex(),
  })

  return [hexagon, rightTriangle, bottomQuadrilateral]
}


/*
 * SVG Shapes
 */

function createPolygon(points, attributes) {
  let polygon = document.createElementNS(XMLNS_SVG, 'polygon')

  points = points
      .map(p => `${p.x} ${p.y}`)
      .join(' ')
  polygon.setAttributeNS(null, 'points', points)

  for (let [attribute, value] of Object.entries(attributes)) {
    polygon.setAttributeNS(null, attribute, value)
  }

  return polygon
}

function createPath(definition, attributes) {
  let path = document.createElementNS(XMLNS_SVG, 'path')

  let d = definition
      .map(a => a.join(' '))
      .join(' ')
  path.setAttributeNS(null, 'd', d)

  for (let [attribute, value] of Object.entries(attributes)) {
    path.setAttributeNS(null, attribute, value)
  }

  return path
}


/*
 * Maths: Color, Point, Circle
 */

class Color {
  static fromHex(value) {
    let r = (value & 0xff0000) >> 16
    let g = (value & 0x00ff00) >>  8
    let b = (value & 0x0000ff) >>  0

    return new Color(r, g, b)
  }

  constructor(r, g, b) {
    this.r = r
    this.g = g
    this.b = b
  }

  add(that) {
    return new Color(this.r + that.r, this.g + that.g, this.b + that.b)
  }

  scale(k) {
    return new Color(this.r * k, this.g * k, this.b * k)
  }

  lerp(that, t) {
    return this.scale(1 - t).add(that.scale(t))
  }

  toHex() {
    let r = Math.round(this.r).toString(16).padStart(2, '0')
    let g = Math.round(this.g).toString(16).padStart(2, '0')
    let b = Math.round(this.b).toString(16).padStart(2, '0')

    return '#' + r + g + b
  }
}

class Point {
  static fromPolarCoordinates(radius, angle) {
    return new Point(radius * Math.cos(angle), radius * Math.sin(angle))
  }

  constructor(x, y) {
    this.x = x
    this.y = y
  }

  add(that) {
    return new Point(this.x + that.x, this.y + that.y)
  }

  scale(k) {
    return new Point(this.x * k, this.y * k)
  }

  lerp(that, t) {
    return this.scale(1 - t).add(that.scale(t))
  }

  distanceTo(that) {
    let dx = this.x - that.x
    let dy = this.y - that.y
    return Math.sqrt(dx * dx + dy * dy)
  }
}

class Circle {
  constructor([x, y], radius) {
    this.center = new Point(x, y)
    this.radius = radius
  }

  getEquidistantPoints(n, offset = true) {
    let center = this.center
    let radius = this.radius

    let points = []
    for (let i = 0; i < n; i++) {
      let angle = (2 * i + offset) * Math.PI / n;
      let point = center.add(Point.fromPolarCoordinates(radius, angle))
      points.push(point)
    }

    return points
  }
}
