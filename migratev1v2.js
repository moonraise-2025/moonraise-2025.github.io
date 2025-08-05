// Read json from data.json to find all pair of id & slug
// Find {id}.png in /dhbc/images-v1 & move it to /dhbc/images-v2/{slug}.png
// Some id dont have file {id}.png in /dhbc/images-v1
// Also check if {slug}.png is in /dhbc/images-v2 & if it is, skip it

const fs = require('fs').promises;
const path = require('path');

async function migratev1v2() {
    try {
        const data = await fs.readFile('data.txt', 'utf8');
        const lines = data.split('\n').filter(line => line.trim());
        const json = lines.map(line => {
            const [id, slug] = line.split('\t');
            return { id, slug };
        });

        const notFound = [];
        const copied = [];
        const skipped = [];

        for (const item of json) {
            const id = item.id;
            const slug = item.slug;
            
            if (!id || !slug) continue;
            
            const sourcePath = path.join('./dhbc/images-v1', `${id}.png`);
            const targetPath = path.join('./dhbc/images-v2', `${slug}.png`);

            try {
                // Check if target already exists
                await fs.access(targetPath);
                skipped.push({ id, slug, reason: 'target exists' });
                continue;
            } catch {
                // Target doesn't exist, proceed
            }

            try {
                // Check if source exists and copy it
                const imageData = await fs.readFile(sourcePath);
                await fs.writeFile(targetPath, imageData);
                copied.push({ id, slug });
            } catch (error) {
                notFound.push({ id, slug, error: error.message });
            }
        }

        console.log('Migration completed!');
        console.log(`Copied: ${copied.length} files`);
        console.log(`Skipped: ${skipped.length} files (already exist)`);
        console.log(`Not found: ${notFound.length} files`);
        
        if (notFound.length > 0) {
            console.log('\nFiles not found:');
            notFound.forEach(item => console.log(`  ID: ${item.id}, Slug: ${item.slug}`));
        }
    } catch (error) {
        console.error('Error during migration:', error);
    }
}

migratev1v2();