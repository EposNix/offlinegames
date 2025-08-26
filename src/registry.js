// Auto-discover game manifests and build registry
const manifestModules = import.meta.glob('./games/*/manifest.json', { eager: true, import: 'default' });
const thumbModules = import.meta.glob('./games/*/*.{png,jpg,jpeg,svg,gif}', { eager: true, import: 'default', query: '?url' });
const htmlModules = import.meta.glob('./games/*/index.html', { eager: true, import: 'default', query: '?url' });
const gameModules = import.meta.glob('./games/*/*.js');

function validate(manifest, path) {
  const required = ['id', 'name', 'version', 'entry', 'sandbox'];
  required.forEach((field) => {
    if (!(field in manifest)) {
      console.warn(`Manifest ${path} missing ${field}`);
    }
  });
  if (!['module', 'iframe'].includes(manifest.sandbox)) {
    console.warn(`Manifest ${path} has invalid sandbox`);
  }
}

export const registry = Object.entries(manifestModules)
  .map(([path, manifest]) => {
    validate(manifest, path);
    const dir = path.replace('/manifest.json', '');
    return {
      id: manifest.id,
      name: manifest.name,
      version: manifest.version,
      sandbox: manifest.sandbox,
      entry: manifest.entry,
      dir,
      tags: manifest.tags || [],
      thumbnailUrl: manifest.thumbnail && manifest.thumbnail.startsWith('data:') ? manifest.thumbnail : thumbModules[`${dir}/${manifest.thumbnail}`],
      load() {
        if (manifest.sandbox === 'module') {
          const loader = gameModules[`${dir}/${manifest.entry}`];
          return loader ? loader() : Promise.reject(new Error('Missing entry'));
        }
        return { iframeUrl: htmlModules[`${dir}/index.html`] };
      },
    };
  })
  .sort((a, b) => a.name.localeCompare(b.name));
