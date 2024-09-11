import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;
const db= new pg.Client({
  user: "postgres",
  host: "localhost",
  password: "Jun23135",
  port: 5433,
  database: "permalist",
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let items = [
  { id: 1, title: "Buy milk" },
  { id: 2, title: "Finish homework" },
];

async function getCurrentItems(){
  const result = await db.query("SELECT * FROM items");
  items= result.rows;
  return items;
}


app.get("/", async (req, res) => {
  const currentItems= await getCurrentItems();
  res.render("index.ejs", {
    listTitle: "Today",
    listItems: currentItems,
  });
});

app.post("/add", async (req, res) => {
  const item = req.body.newItem.trim();
  if (!item) {
    const currentItems = await getCurrentItems(); // Get current items to render them again
    return res.render("index.ejs", {
      listTitle: "Today",
      listItems: currentItems,
      error: "Item cannot be empty.",
    });
  }

  try{
    await db.query("INSERT INTO items (title) VALUES($1)", [item]);
    res.redirect("/");
  } catch(error){
    console.log(error);
  }
  // items.push({ title: item });
});

app.post("/edit", async (req, res) => {
  const itemTitle= req.body.updatedItemTitle;
  const itemId= req.body.updatedItemId*1;
  await db.query("UPDATE items SET title=($1) WHERE id=($2)",[itemTitle, itemId]);
  //items.push({ title: itemTitle });
  res.redirect("/");

});

app.post("/delete", async (req, res) => {
  const itemTitle=req.body.deleteItemId*1;
  await db.query("DELETE FROM items WHERE id=($1)",[itemTitle]);
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
