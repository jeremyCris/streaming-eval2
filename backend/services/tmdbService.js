// backend/services/tmdbService.js
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMG_URL = "https://image.tmdb.org/t/p/w500";

async function buscarEnTmdb(query) {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey || !query || !query.trim()) {
    return { results: [], fallback: true };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);

  try {
    const url = `${TMDB_BASE_URL}/search/multi?api_key=${encodeURIComponent(
      apiKey
    )}&query=${encodeURIComponent(query.trim())}&language=es-ES`;

    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) {
      return { results: [], fallback: true };
    }

    const data = await res.json();
    const results = (data.results || [])
      .filter((item) => item.media_type === "movie" || item.media_type === "tv")
      .slice(0, 6)
      .map((item) => ({
        tmdb_id: item.id,
        titulo: (item.title || item.name || "").slice(0, 150),
        descripcion: item.overview || "",
        categoria: item.media_type === "tv" ? "Serie" : "Película",
        url_imagen: item.poster_path ? `${TMDB_IMG_URL}${item.poster_path}` : null,
        puntuacion: item.vote_average ? Number(item.vote_average.toFixed(1)) : null,
        anio: (item.release_date || item.first_air_date || "").slice(0, 4) || null,
      }));

    return { results, fallback: false };
  } catch (err) {
    console.warn("Fallo consultando TMDb, aplicando fallback:", err.message);
    return { results: [], fallback: true };
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = { buscarEnTmdb };