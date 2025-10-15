// Check all image dimension in /dhbc/images-v2
// Make sure all image is 1024x1024
// Console.log what is not 1024x1024

const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');

function isPNG(buffer) {
    // PNG signature: 89 50 4E 47 0D 0A 1A 0A
    const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
    return buffer.length >= 8 && buffer.subarray(0, 8).equals(pngSignature);
}

function getPNGDimensions(buffer) {
    // Validate PNG signature and minimum size
    // if (!isPNG(buffer) || buffer.length < 24) {
    //     throw new Error('Invalid PNG file or file too small');
    // }
    
    // // Check IHDR chunk type at bytes 12-15
    // const ihdrType = buffer.subarray(12, 16).toString('ascii');
    // if (ihdrType !== 'IHDR') {
    //     throw new Error('Invalid PNG: IHDR chunk not found at expected position');
    // }
    
    // Read width and height (big-endian format for PNG)
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    
    return { width, height };
}

async function checkImageSize() {
    try {
        const files = await fs.readdir('./dhbc/images-v2');
        
        // Filter only PNG files
        const imageFiles = files.filter(file => 
            file.toLowerCase().endsWith('.png') && 
            !file.startsWith('.') &&
            file !== 'readme.md'
        );
        
        console.log(`Checking ${imageFiles.length} PNG files...`);
        
        const not1024x1024 = [];
        const errors = [];
        let validCount = 0;
        
        for (const image of imageFiles) {
            try {
                const imagePath = path.join('./dhbc/images-v2', image);
                const imageData = await fs.readFile(imagePath);
                
                const { width, height } = getPNGDimensions(imageData);
                
                if (width !== 1024 || height !== 1024) {
                    not1024x1024.push(`${image}: ${width}x${height}`);
                } else {
                    validCount++;
                }
            } catch (error) {
                errors.push(`${image}: ${error.message}`);
            }
        }
        
        // Output results
        if (not1024x1024.length > 0) {
            console.log(not1024x1024.join('\n'));
        }
        
        console.log(`Check completed! ${not1024x1024.length} images are not 1024x1024`);
        console.log(`Valid 1024x1024 images: ${validCount}`);
        
        if (errors.length > 0) {
            console.log(`Errors encountered: ${errors.length}`);
            errors.forEach(error => console.log(`  ${error}`));
        }
        
    } catch (error) {
        console.error('Error during image size check:', error);
    }
}

checkImageSize();

async function resizeImage(imagePath) {
    const imageData = await fs.readFile(imagePath);
    const { width, height } = getPNGDimensions(imageData);

    if (width !== 1024 || height !== 1024) {
        console.log(`${imagePath} is not 1024x1024: ${width}x${height}`);
    }

    // Resize image to 1024x1024
    const resizedImage = await sharp(imagePath).resize(1024, 1024).toFile(imagePath.replace('v2', 'v2/resized'));
    console.log(`${imagePath} resized to 1024x1024`);
}
