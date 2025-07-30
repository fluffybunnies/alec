// node --no-deprecation nut
const { mouse, Point } = require('@nut-tree-fork/nut-js')
  ,waitMs = 3000  
  ,magnitude = 1
  ,moveBack = true
setInterval(async() => {
  const pos = await mouse.getPosition()
  let newX = pos.x, newY = pos.y
  Math.random() < 0.5 ? newX += vector() : newY += vector()
  await mouse.move(new Point(newX, newY))
  moveBack && await mouse.move(pos)
}, waitMs)

function vector(){
  return (Math.random() < 0.5 ? -1 : 1) * magnitude
}
