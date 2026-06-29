import sharp from 'sharp'
import { readFileSync, writeFileSync, unlinkSync } from 'fs'
import { basename, dirname, join } from 'path'

const images = [
  { src: 'src/assets/logo-facarbon-dark.png',  dst: 'src/assets/logo-facarbon-dark.webp' },
  { src: 'src/assets/logo-facarbon-white.png', dst: 'src/assets/logo-facarbon-white.webp' },
]

for (const { src, dst } of images) {
  const srcPath = join(process.cwd(), src)
  const dstPath = join(process.cwd(), dst)
  const svgPath = dstPath.replace('.webp', '.svg')

  const info = await sharp(srcPath)
    .webp({ quality: 85 })
    .toFile(dstPath)

  const oldSize = readFileSync(srcPath).length
  console.log(`${src}: ${(oldSize / 1024).toFixed(1)}KB → ${(info.size / 1024).toFixed(1)}KB (WebP)`)

  // Keep PNG as fallback but also generate SVG alternative
  if (process.argv.includes('--delete-png')) {
    unlinkSync(srcPath)
    console.log(`  Deleted ${src}`)
  }
}
