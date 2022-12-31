const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();
const _ = require("lodash");

//var items = []; // creating an array tostore the todo list items

app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine', 'ejs');//requiring ejs
app.use(express.static("public"));

mongoose.set("strictQuery", false);
mongoose.connect("mongodb+srv://anshumaan:killer%40123@cluster0.e6xjyi6.mongodb.net/todolistDB", {useNewUrlParser: true});


const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "ex2"
});

const item3 = new Item({
  name: "ex3"
});

const defaultItems = [item1,item2,item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List",listSchema);





app.get('/',function(req,res){

  /*var today = new Date();

  var options = {
    weekday: "long",
    day: "numeric",
    month: "long"
  };

  var day = today.toLocaleDateString("en-US", options);*/

  Item.find(function(err,foundItems){

    if(foundItems.length === 0){
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);
        }else{
          console.log("Succeddfully saved defaults items to DB.");
        }
      });

      res.redirect("/");
    }else{
      res.render("list",{listTitle: "Today",newListItems:foundItems});//render/show a file called list from views directory which have a a variable kindOfDay and value will be equal to the day
    }

  });
});

app.post("/delete", function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(!err){
        console.log("Successfully deleted checked item.");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name: listName}, {$pull: {items:{_id: checkedItemId}}}, function(err,foundList){
      if(!err){
        res.redirect("/" + listName);
      }
    });
  }

});

app.post("/", function(req,res){

  var itemName = req.body.newItem;
  const listName= req.body.list;

  const item = new Item({
    name: itemName
  });


  if(listName === "Today"){
    item.save();// pushing item in array item
    res.redirect("/");
  }else{
    List.findOne({name:listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }

});

app.get("/:customListName",function(req,res){

  const customListName= _.capitalize(req.params.customListName);

  List.findOne({name: customListName},function(err,foundList){
    if(!err){
      if(!foundList){

        const list = new List({
          name: customListName,
          items: defaultItems
        });

        list.save();
        res.redirect("/" + customListName);
      }else{
        res.render("list",{listTitle: foundList.name, newListItems:foundList.items});
      }
    }
  });

});

app.listen(process.env.PORT || 3000, function(){
    console.log("Server is running on port 3000");
});
