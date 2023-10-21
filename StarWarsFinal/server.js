const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const https = require("https");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.engine("ejs", require("ejs").renderFile);


// Modifica la ruta principal para obtener todos los personajes de la API
app.get("/", (req, res) => {
  const charactersURL = "https://akabab.github.io/starwars-api/api/all.json";

  https.get(charactersURL, (response) => {
    console.log(response.statusCode);
    if (response.statusCode === 200) {
      let rawData = '';
      response.on("data", (chunk) => {
        rawData += chunk;
      });
      response.on("end", () => {
        try {
          const allCharacters = JSON.parse(rawData);

          // Define el número máximo de personajes por página
          const itemsPerPage = 10;
          // Obtiene la página actual del parámetro de consulta o establece la página 1 como predeterminada
          const currentPage = parseInt(req.query.page) || 1;
          // Calcula el índice de inicio y fin para los personajes en la página actual
          const startIndex = (currentPage - 1) * itemsPerPage;
          const endIndex = startIndex + itemsPerPage;
          // Obtiene los personajes para la página actual
          const characters = allCharacters.slice(startIndex, endIndex);
          // Calcula el número total de páginas
          const totalPages = Math.ceil(allCharacters.length / itemsPerPage);
          console.log(allCharacters);
          res.render("index", {
            characters: characters,
            currentPage: currentPage,
            totalPages: totalPages,
            allCharacters: allCharacters
          });
        } catch (error) {
          console.error(error.message);
          res.status(500).send("Error interno del servidor");
        }
      });
    } else {
      res.status(response.statusCode).send("Error al obtener datos de la API");
    }
  });
});




app.get("/character/:id", (req, res) => {
  const id = req.params.id;
  const selectedcharacter = `https://akabab.github.io/starwars-api/api/id/${id}.json`;

  https.get(selectedcharacter, (response) => {
    let rawData = '';

    response.on("data", (chunk) => {
      rawData += chunk;
    });

    response.on("end", () => {
      try {
        const characterData = JSON.parse(rawData);

        res.render("info", { character: characterData });
      } catch (error) {
        console.error(error.message);
        res.status(500).send("Error interno del servidor");
      }
    });
  }).on("error", (error) => {
    console.error(error.message);
    res.status(500).send("Error al obtener datos de la API");
  });
});


app.listen(3000, (err) => {
  console.log("Listening on port 3000");
});
