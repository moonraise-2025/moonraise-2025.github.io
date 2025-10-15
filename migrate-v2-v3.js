// migrate v2 to v3
// - png to jpg
// - New size: 512x512

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function migrateV2ToV3() {
  try {
    const v2Dir = path.join(__dirname, 'dhbc/images-v2');
    const v3Dir = path.join(__dirname, 'dhbc/images-v3');

    // Create v3 directory if it doesn't exist
    if (!fs.existsSync(v3Dir)) {
      fs.mkdirSync(v3Dir);
    }

    // Get all PNG files from v2
    const files = fs.readdirSync(v2Dir).filter(file => file.endsWith('.png'));

    for (const file of files) {
      const inputPath = path.join(v2Dir, file);
      const outputPath = path.join(v3Dir, file.replace('.png', '.jpg'));

      await sharp(inputPath)
        .resize(512, 512)
        .jpeg({ quality: 90 })
        .toFile(outputPath);

      console.log(`Converted ${file} to jpg and resized to 512x512`);
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

migrateV2ToV3();
