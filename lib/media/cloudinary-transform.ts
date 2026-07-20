// Cloudinary transformations are just URL segments — no separate processing call needed;
// the transformed image is generated (and cached) on first request.
export function withTransformation(url: string, transformation: string): string {
  return url.replace('/upload/', `/upload/${transformation}/`)
}

// e_background_removal caps input at 25 megapixels — a modern phone photo can easily exceed
// that (a ~41MP shot 400s outright). c_limit,w_4000,h_4000 downscales to fit within 4000x4000
// (16MP) first, only if larger — chained as its own step before the effect runs. f_png is
// required too — without it Cloudinary keeps the original (e.g. jpg) format, which can't
// represent transparency, so the "background removed" result would silently just not be.
export const BG_REMOVE_TRANSFORM = 'c_limit,w_4000,h_4000/e_background_removal,f_png'

export function withBackgroundRemoved(url: string): string {
  return withTransformation(url, BG_REMOVE_TRANSFORM)
}
