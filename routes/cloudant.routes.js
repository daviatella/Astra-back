import CloudantDatabase from '../server.js'

export default (app) => {
  app.get("/api/health-check", (req, res) => {
    res.json({
      ok: true,
      message: "Up and running",
    });
  });

  app.delete("/api/categories/", (req, res) => {
    const db = new CloudantDatabase();
    const category = req.body.category;
    const userId = req.body.owner; 
  
    db.updateDocumentsByCategory(category, userId)
      .then((result) => {
        console.log("Category deleted successfully:", result);
        res.json({
          ok: true,
          message: "Category deleted successfully",
          data: result
        });
      })
      .catch((error) => {
        console.error("Error deleting category:", error);
        res.status(500).json({
          ok: false,
          message: "Error deleting category",
          error: error
        });
      });
  });

  app.post("/api/docs-by-owner", (req, res) => {
    const db = new CloudantDatabase();
    const owner = req.body.user;

    db.getDocumentsByOwner(owner)
      .then((documents) => {
        res.json({
          ok: true,
          message: "Documents retrieved successfully",
          data: documents
        });
      })
      .catch((error) => {
        console.error("Error getting documents by type:", error);
        res.status(500).json({
          ok: false,
          message: "Error retrieving documents",
          error: error
        });
      });
  });


  app.post("/api/docs", (req, res) => {
    const db = new CloudantDatabase();
    const document = req.body; 
    console.log('here1')
    db.insertDocument(document)
      .then((result) => {
        console.log("Document inserted successfully:", result);
        res.status(201).json({
          ok: true,
          message: "Document inserted successfully",
          data: result
        });
      })
      .catch((error) => {
        console.error("Error inserting document:", error);
        res.status(500).json({
          ok: false,
          message: "Error inserting document",
          error: error
        });
      });
  });

  app.put("/api/docs/:id", (req, res) => {
    const db = new CloudantDatabase();
    const id = req.params.id;
    console.log(id)
    const updatedFields = req.body;
    console.log('here1')
    db.updateDocument(id, updatedFields)
      .then((result) => {
        console.log("Document updated successfully:", result);
        res.json({
          ok: true,
          message: "Document updated successfully",
          data: result
        });
      })
      .catch((error) => {
        console.error("Error updating document:", error);
        res.status(500).json({
          ok: false,
          message: "Error updating document",
          error: error
        });
      });
  });

  app.post("/api/docs/updateWithTag/", (req, res) => {
    const db = new CloudantDatabase();
    const oldTag = req.body.oldTag;
    const newTag = req.body.newTagData;
    const owner = req.body.o.owner;

    db.bulkUpdateDocsWithTag(oldTag, newTag, owner)
      .then((result) => {
        console.log("Documents updated successfully:", result);
        res.json({
          ok: true,
          message: "Documents updated successfully",
          data: result
        });
      })
      .catch((error) => {
        console.error("Error updating documents:", error);
        res.status(500).json({
          ok: false,
          message: "Error updating documents",
          error: error
        });
      });
  });

  app.post("/api/docs/updateWithCat/", (req, res) => {
    const db = new CloudantDatabase();
    const oldCat = req.body.oldCat;
    const newCat = req.body.newCat;
    const owner = req.body.owner;
    const updateAll = Boolean(req.body.updateAll)

    db.bulkUpdateDocumentsOnCategoryUpdate(oldCat, newCat, owner, updateAll)
      .then((result) => {
        console.log("Documents updated successfully:", result);
        res.json({
          ok: true,
          message: "Documents updated successfully",
          data: result
        });
      })
      .catch((error) => {
        console.error("Error updating documents:", error);
        res.status(500).json({
          ok: false,
          message: "Error updating documents",
          error: error
        });
      });
  });

  app.post("/api/tags/delete", (req, res) => {
    const db = new CloudantDatabase();
    const tag = req.body.tag
    const owner = req.body.owner
    console.log(tag)

    db.bulkRemoveTag(owner, tag.name, tag.title)
      .then((result) => {
        console.log("Tag removed successfully:", result);
        res.json({
          ok: true,
          message: "Tag removed successfully",
          data: result
        });
      })
      .catch((error) => {
        console.error("Error removing tag:", error);
        res.status(500).json({
          ok: false,
          message: "Error removing tag",
          error: error
        });
      });
  });

  app.delete("/api/docs/:id", (req, res) => {
    const db = new CloudantDatabase();
    const id = req.params.id;
    const rev = req.query.rev; 

    db.deleteDocument(id, rev)
      .then((result) => {
        console.log("Document deleted successfully:", result);
        res.json({
          ok: true,
          message: "Document deleted successfully",
          data: result
        });
      })
      .catch((error) => {
        console.error("Error deleting document:", error);
        res.status(500).json({
          ok: false,
          message: "Error deleting document",
          error: error
        });
      });
  });

  

  app.post("/api/users/login", (req, res) => {
    const db = new CloudantDatabase();
    const { email, password } = req.body;
  
    db.getUserByEmailAndPassword(email, password)
      .then((user) => {
        if (user) {
          console.log("User found:", user);
          res.json({
            ok: true,
            message: "User found",
            data: user
          });
        } else {
          console.log("User not found");
          res.status(404).json({
            ok: false,
            message: "User not found"
          });
        }
      })
      .catch((error) => {
        console.error("Error getting user:", error);
        res.status(500).json({
          ok: false,
          message: "Error getting user",
          error: error
        });
      });
  });

  app.get("/api/users/:id", (req, res) => {
    const db = new CloudantDatabase();
    const id = req.params.id;

    db.getUserById(id)
      .then((user) => {
        console.log("User:", user);
        res.json({
          ok: true,
          message: "User retrieved successfully",
          data: user
        });
      })
      .catch((error) => {
        console.error("Error getting user:", error);
        res.status(500).json({
          ok: false,
          message: "Error retrieving user",
          error: error
        });
      });
  });

  // Create user route
  app.post("/api/users", (req, res) => {
    const db = new CloudantDatabase();
    const newUser = req.body;

    db.createUser(newUser)
      .then((result) => {
        console.log("User created successfully:", result);
        res.status(201).json({
          ok: true,
          message: "User created successfully",
          data: result
        });
      })
      .catch((error) => {
        console.error("Error creating user:", error);
        res.status(500).json({
          ok: false,
          message: "Error creating user",
          error: error
        });
      });
  });

  // Update user route
  app.put("/api/users/:id", (req, res) => {
    console.log("HERE")
    const db = new CloudantDatabase();
    const id = req.params.id;
    const updatedFields = req.body;
    console.log("HERE2")
    db.updateDocument(id, updatedFields)
      .then((result) => {
        console.log("User updated successfully:", result);
        res.json({
          ok: true,
          message: "User updated successfully",
          data: result
        });
      })
      .catch((error) => {
        console.error("Error updating user:", error);
        res.status(500).json({
          ok: false,
          message: "Error updating user",
          error: error
        });
      });
  });

  // Delete user route
  app.delete("/api/users/:id", (req, res) => {
    const db = new CloudantDatabase();
    const id = req.params.id;

    db.deleteUser(id)
      .then((result) => {
        console.log("User deleted successfully:", result);
        res.json({
          ok: true,
          message: "User deleted successfully",
          data: result
        });
      })
      .catch((error) => {
        console.error("Error deleting user:", error);
        res.status(500).json({
          ok: false,
          message: "Error deleting user",
          error: error
        });
      });
  });
};
