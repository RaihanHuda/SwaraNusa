// The public build replaces this configuration; the local app keeps its API.
export const site = Object.freeze({ basePath: '', publicPreview: false });

export function siteUrl(path) {
  if (!site.basePath || !path.startsWith('/') || path.startsWith('//')) return path;
  if (path === site.basePath || path.startsWith(site.basePath + '/')) return path;
  return site.basePath + path;
}

export function routePath(path) {
  if (site.basePath && (path === site.basePath || path.startsWith(site.basePath + '/'))) {
    return path.slice(site.basePath.length) || '/';
  }
  return path;
}
