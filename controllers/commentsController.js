import client from "../db.js";

export async function getAllCommentsFromOneMovie(req, res) {
  const { movieId } = req.params;
  try {
    const { rows } = await client.query(
      `select * from moviecomments m where movieid = ${movieId} order by id`
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getCommentsByUser(req, res) {
  const { userEmail } = req.body;
  
  try {
    const { rows } = await client.query(
      `select * from moviecomments m where useremail = '${userEmail}'`
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}


export async function addNewComment(req, res) {
  const { movieId } = req.params;
  const { userEmail, rating, comment } = req.body;

  try {
    const { rows: existingMovie } = await client.query(
      `select * from movies where id = ${movieId}`
    );

    if (existingMovie[0]) {
      const { rows: comments } = await client.query(
        `insert into moviecomments (useremail, movieid, rating, comment)
        values('${userEmail}', ${movieId}, ${rating}, '${comment}') returning id, useremail, movieid, rating, time, comment`
      );

      if (comments[0]) {
        const { rows: movie } = await client.query(
          `update movies set rating = array_append(rating, ${rating}) where id = ${movieId}`
        );

        res.json(movie[0]);
      }
    } else {
      res.status(404).json({ error: "Movie not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function editComment(req, res) {
  const { movieId, commentId } = req.params;
  const { rating, comment } = req.body;

  try {
    const { rows: existingMovie } = await client.query(
      `select * from movies where id = ${movieId}`
    );

    const { rows: existingComment } = await client.query(
      `select * from moviecomments where id = ${commentId}`
    );

    if (existingMovie[0] && existingComment[0]) {

      let ratings = existingMovie[0].rating || [];
      const index = ratings.indexOf(existingComment[0].rating);
      if (index !== -1) {
        ratings.splice(index, 1);
      }
      const formattedArray = `{${ratings.join(',')}}`;
      
      
      const { rows: movieRatingRemoved } = await client.query(`update movies set rating = '${formattedArray}' where id = ${movieId}`)

      const { rows: movieRatingAdded } = await client.query(
        `update movies set rating = array_append(rating, ${rating}) where id = ${movieId}`
      );

      const { rows: updatedComment } = await client.query(
        `update moviecomments set rating = ${rating}, comment = '${comment}', time = NOW() where id = ${commentId}`
      );

        res.json(updatedComment[0], movieRatingRemoved[0], movieRatingAdded[0]);
      
    } else {
      res.status(404).json({ error: "Movie not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}


export async function deleteComment(req, res) {
  const { movieId, commentId } = req.params;

  try {
    const { rows: existingMovie } = await client.query(
      `select * from movies where id = ${movieId}`
    );

    const { rows: existingComment } = await client.query(
      `select * from moviecomments where id = ${commentId}`
    );

    if (existingMovie[0] && existingComment[0]) {
      

      let ratings = existingMovie[0].rating || [];
      const index = ratings.indexOf(existingComment[0].rating);
      if (index !== -1) {
        ratings.splice(index, 1);
      }
      const formattedArray = `{${ratings.join(',')}}`;
      
      
      const { rows: updatedMovie } = await client.query(`update movies set rating = '${formattedArray}' where id = ${movieId}`)
      
      const { rows: deletedComment } = await client.query(
        `delete from moviecomments where id=${commentId}`
      );

        res.json(updatedMovie[0], deletedComment[0]);
      
    } else {
      res.status(404).json({ error: "Movie or comment not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}



export async function addLike(req, res) {
  const { commentId } = req.params;
  const { userEmail } = req.body;

  
  try {


    const { rows: existingComment } = await client.query(
      `select * from moviecomments where id = $1`, [commentId]
    );

    if (existingComment[0]) {

      if(existingComment[0].likes.includes(userEmail)) {
        const { rows: unLikedComment } = await client.query(`UPDATE moviecomments SET likes = (CASE WHEN $2 = ANY(COALESCE(likes, '{}')) THEN array_remove(likes, $2)ELSE (SELECT ARRAY(SELECT DISTINCT unnest(COALESCE(likes, '{}') || ARRAY[$2])))END)WHERE id = $1`, [commentId, userEmail]);
      res.json(unLikedComment[0]);

      } else {
        const { rows: likedComment } = await client.query(
        `UPDATE moviecomments SET likes = (SELECT ARRAY(SELECT DISTINCT unnest(COALESCE(likes, '{}') || ARRAY[$2])))WHERE id = $1;`, [commentId, userEmail]
      );
      res.json(likedComment[0]);
      }
     
    } else  {
      return res.status(404).json({ error: "Comment not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error1" });
  }
}