// node --no-deprecation nut
const { mouse, Point } = require('@nut-tree-fork/nut-js')
  ,waitMs = 3000  
  ,magnitude = 1
  ,moveBack = true
  ,verbose = process.argv.includes('-v')

if (verbose) {
  console.log('🐿️  nut started with verbose logging')
  console.log(`⏱️  Moving mouse every ${waitMs}ms`)
  console.log(`📏 Movement magnitude: ${magnitude}px`)
  console.log(`🔄 Move back to original position: ${moveBack}`)
}

setInterval(async() => {
  const pos = await mouse.getPosition()
  if (verbose) console.log(`📍 Current position: (${pos.x}, ${pos.y})`)
  
  let newX = pos.x, newY = pos.y
  Math.random() < 0.5 ? newX += vector() : newY += vector()
  
  if (verbose) console.log(`➡️  Moving to: (${newX}, ${newY})`)
  await mouse.move(new Point(newX, newY))
  
  if (moveBack) {
    if (verbose) console.log(`⬅️  Moving back to: (${pos.x}, ${pos.y})`)
    await mouse.move(pos)
  }
}, waitMs)

function vector(){
  return (Math.random() < 0.5 ? -1 : 1) * magnitude
}
