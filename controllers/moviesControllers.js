import client from "../db.js";

export async function getAllMovies(req, res) {
  const {limit, offset} = req.query;

  try {
    if (limit) {
      const { rows } = await client.query(`select * from movies ORDER BY cardinality(rating) DESC limit ${limit} offset ${offset}`);

      return res.json(rows);
      
    } else {
    const { rows } = await client.query(`select * from movies`);

    return res.json(rows);
    }
    
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getMovieById(req, res) {
  const { movieId } = req.params;

  try {
    const { rows } = await client.query(
          `select * from movies where id = ${movieId}`
        );

    if (!rows[0]) {
      res.status(404).json({ error: "Movie is not found" });
    } else {
      res.json(rows[0]);
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}
