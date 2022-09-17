//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
// const ejs = require("ejs");
// const _ = require('lodash');
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB");

const ItemsSchema = {
  name: String
}

const Item = mongoose.model("Item",ItemsSchema);

const item1 = new Item({
  name: "welcome to your todo list"
});

const item2 = new Item({
  name: "Hit the + button to add the item"
});
const item3 = new Item({
  name: "<-- Hit this to delete the item"
});

const defaultitems = [item1,item2,item3];

const ListSchema = {
  name: String,
  items: [ItemsSchema]
};

const List = mongoose.model("List",ListSchema);



app.get("/", function(req, res) {

  
  Item.find({}, function(err, foundItems){
    console.log(foundItems.length)
    if(foundItems.length === 0){
      console.log("whu");
      Item.insertMany(defaultitems, function(err){
        if(err){
          console.log(err);
        }
        else{
          console.log("Success");
        }
      });
      res.redirect("/")
    }
    else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
  
    }

  });


});

app.get('/:custom_list_Name', (req, res) => {
  console.log(req.params.custom_list_Name)
  const customListName = (req.params.custom_list_Name);
  
  List.findOne({name:customListName}, function(err, foundList){
    if(!err){
      if(!foundList){
        // console.log("Does not ecist")
        const list = new List({
          name : customListName,
          items : defaultitems
        })  
        list.save()
        res.redirect("/"+customListName)
      }
      else{
        // console.log(SuccessFull)
        res.render("list",{listTitle: foundList.name, newListItems: foundList.items})

      }
    }
  })
  
});
app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listname = req.body.list;

  const item = new Item({
    name: itemName
  })

  if(listname==="Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listname}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listname);
    });
  }

});

app.post("/delete", function(req, res){

  const itemID = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(itemID, function(err){
      if (!err) {
        console.log("Successfully deleted checked item.");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: itemID}}}, function(err, foundList){
      if (!err){
        res.redirect("/" + listName);
      }
    });
  }

});

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
