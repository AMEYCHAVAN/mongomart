/*
  Copyright (c) 2008 - 2016 MongoDB, Inc. <http://mongodb.com>

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/


var MongoClient = require('mongodb').MongoClient,
  assert = require('assert');


function ItemDAO(database) {
  "use strict";

  this.db = database;

  this.getCategories = function(callback) {
    "use strict";



    this.db.collection('item').aggregate(
      [{
        $group: {
          totalCollections: {
            $sum: 1
          },
          _id: {
            "_id": "$_id",
            "category": "$category"
          }

        }
      }, {
        $group: {
          _id: '$_id.category',
          num: {
            $sum: 1
          }
        }
      }, {
        $group: {
          _id: 1,
          totalCollections: {
            $sum: "$num"
          },
          category: {
            $push: {
              "_id": "$_id",
              "num": "$num"
            }
          }
        }
      }]

    ).toArray(function(err, result) {
      assert.equal(err, null);
      result = result.pop()

      var categories = result.category
      var totalCollections = result.totalCollections


      var category = {
        _id: "All",
        num: totalCollections
      };

      categories.push(category)


      callback(categories);


    });

  }


  this.getItems = function(category, page, itemsPerPage, callback) {
    "use strict";
    console.log("2this.getItems", category, page, itemsPerPage)

    /*
     * TODO-lab1B
     *
     * LAB #1B:
     * Create a query to select only the items that should be displayed for a particular
     * page. For example, on the first page, only the first itemsPerPage should be displayed.
     * Use limit() and skip() and the method parameters: page and itemsPerPage to identify
     * the appropriate products. Pass these items to the callback function.
     *
     * Do NOT sort items.
     *
     */

    var query = (category != "All") ? {
      category: category
    } : {}

    console.log("2this.getItems","resultquery", query)

    this.db.collection('item').find(query).limit(itemsPerPage).skip(page * itemsPerPage).toArray(function(err, result) {
      assert.equal(err, null);
      //   result = result.pop()
      console.log("2this.getItems","resultlength", result.length)
      var pageItems = result
      callback(pageItems);



    });



  }


  this.getNumItems = function(category, callback) {
    "use strict";

    var numItems = 0;
    console.log("3this.getNumItems1", category )
    var query = (category != "All") ? {
      category: category
    } : {}

    console.log("3this.getNumItems1","query",query)

       this.db.collection('item').find(query).toArray(function(err, result) {
         assert.equal(err, null);
        // result = result.pop()
         console.log("3this.getNumItems1","numItems",result.length)
         callback(result.length);
       });


  }


  this.searchItems = function(query, page, itemsPerPage, callback) {
    "use strict";
    console.log("\n\n4this.searchItems", query, page, itemsPerPage)
    // db.item.createIndex(
    //    {
    //      title: "text",
    //      description:text",
    //      slogan: "text"
    //    }
    //  )


     var query = { $text: { $search: query  } }

     console.log("4this.getItems","resultquery", query)

     this.db.collection('item').find(query).limit(itemsPerPage).skip(page * itemsPerPage).toArray(function(err, result) {
       assert.equal(err, null);
       console.log("4this.getItems","resultlength", result.length)
       var pageItems = result
       callback(pageItems);



     });
  }


  this.getNumSearchItems = function(query, callback) {
    "use strict";
    console.log("\n\n5this.getNumSearchItems", query)
    var query = { $text: { $search: query  } }
    var numItems = 0;

    this.db.collection('item').find(query).toArray(function(err, result) {
      assert.equal(err, null);
      console.log("5this.getNumSearchItems","numItems",result.length)
      callback(result.length);
    });



   }


  this.getItem = function(itemId, callback) {
    "use strict";
    console.log("\n\n6this.getNumSearchItems", itemId)
    var itemId = parseInt(itemId);

    var query = {"_id":itemId }

    console.log("6this.getNumSearchItems","resultquery", query)

    this.db.collection('item').find(query).toArray(function(err, result) {
      assert.equal(err, null);
      console.log("6this.getNumSearchItems","resultlength", result.length)
      var item = result[0]
      callback(item);
    });


  }


  this.getRelatedItems = function(callback) {
    "use strict";

    this.db.collection("item").find({})
      .limit(4)
      .toArray(function(err, relatedItems) {
        assert.equal(null, err);
        callback(relatedItems);
      });
  };


  this.addReview = function(itemId, comment, name, stars, callback) {
    "use strict";
   console.log("\n\n7this.addReview", itemId, comment, name, stars)

        var reviewDoc = {
         name: name,
         comment: comment,
         stars: stars,
         date: Date.now()
       }

   this.db.collection('item').updateOne({
    "_id": itemId
}, {
  "$push": {
        "reviews":reviewDoc
    }
  }
,function(err, result) {
     assert.equal(err, null);
     console.log("6this.getNumSearchItems","resultlength", result)
     var item = result
     callback(item);
   });

    console.log("7this.addReview",reviewDoc)

  }


  this.createDummyItem = function() {
    "use strict";

    var item = {
      _id: 1,
      title: "Gray Hooded Sweatshirt",
      description: "The top hooded sweatshirt we offer",
      slogan: "Made of 100% cotton",
      stars: 0,
      category: "Apparel",
      img_url: "/img/products/hoodie.jpg",
      price: 29.99,
      reviews: []
    };

    return item;
  }
}


module.exports.ItemDAO = ItemDAO;
