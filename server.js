const express = require("express");
const app = express();
var cors = require("cors");
const port = 4000;
const fetch = require("node-fetch");

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb" }));

app.use(cors());

app.get("/api/items", async (req, res) => {
  fetch("https://api.mercadolibre.com/sites/MLA/search?q=" + req.query.q)
    .then((response) => response.json())
    .then((data) => {
      res.json({
        author: {
          name: "Daniel",
          lastname: "Molina",
        },
        categories: data.filters[0]?.values[0]?.path_from_root || [],
        items: data.results.slice(0, 4).map((product) => {
          return {
            id: product.id,
            title: product.title,
            price: {
              currency: product.currency_id,
              amount: product.price,
              //   decimals: product.installments.amount, NO ENCONTRADO EN LA API
            },
            state_name: product.address.state_name,
            picture: product.thumbnail,
            condition: product.condition,
            free_shipping: product.shipping.free_shipping,
          };
        }),
      }); // end res
    });
});

app.get("/api/items/:id", async (req, res) => {
  var itemData = new Promise((resolve) => {
    fetch("https://api.mercadolibre.com/items/" + req.params.id)
      .then((response) => response.json())
      .then((data) => {
        resolve(data);
      });
  });
  var itemDescription = new Promise((resolve) => {
    fetch(`https://api.mercadolibre.com/items/${req.params.id}/description`)
      .then((response) => response.json())
      .then((data) => {
        resolve(data);
      });
  });
  // ejecutamos los dos request al tiempo con Promise.all
  Promise.all([itemData, itemDescription]).then((values) => {
    let itemData = values[0];
    let itemDescription = values[1];
    res.json({
      author: {
        name: "Daniel",
        lastname: "Molina",
      },
      //   categories: itemData.filters[0]?.values[0]?.path_from_root || [],
      item: {
        id: itemData.id,
        title: itemData.title,
        price: {
          currency: itemData.currency_id,
          amount: itemData.price,
          //   decimals: itemData.installments.amount, NO ENCONTRADO EN LA API
        },
        picture: itemData.thumbnail,
        condition: itemData.condition,
        free_shipping: itemData.shipping?.free_shipping,
        sold_quantity: itemData.sold_quantity,
        description: itemDescription.plain_text,
      },
    }); // end res
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
