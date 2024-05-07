import Cloudant from "@cloudant/cloudant";

import "dotenv/config";

const username = process.env.CLOUDANT_USERNAME;
const apikey = process.env.CLOUDANT_APIKEY;
const url = process.env.CLOUDANT_URL;
const dbName = process.env.CLOUDANT_DB;

export default class CloudantDatabase {
  constructor() {
    this.db = new Cloudant({
      account: username,
      url: url,
      plugins: {
        iamauth: {
          iamApiKey: apikey,
        },
      },
    });

    this.db = this.db.use(dbName);
  }

  async getAllDocuments() {
    try {
      const result = await this.db.list({ include_docs: true });
      return result.rows.map((row) => row.doc);
    } catch (error) {
      console.error("Error getting documents:", error);
      throw error;
    }
  }

  async getDocumentsByOwner(o) {
    try {
      const query = {
        selector: {
          owner: {
            $eq: o,
          },
          type: {
            $in: ['doc', 'board']
          }
        },
      };
      const result = await this.db.find(query);
      return result.docs;
    } catch (error) {
      console.error("Error getting documents by owner:", error);
      throw error;
    }
  }

    async getDocumentsByOwner(o) {
    try {
      const query = {
        selector: {
          owner: {
            $eq: o,
          },
          type: {
            $in: ['doc', 'board', 'project']
          }
        },
      };
      const result = await this.db.find(query);
      return result.docs;
    } catch (error) {
      console.error("Error getting documents by owner:", error);
      throw error;
    }
  }

  async insertDocument(document) {
    try {
      console.log('here2')
      const result = await this.db.insert(document);
      return result;
    } catch (error) {
      console.error("Error inserting document:", error);
      throw error;
    }
  }

  async getDocumentById(id) {
    try {
      const document = await this.db.get(id);
      return document;
    } catch (error) {
      console.error("Error getting document by ID:", error);
      throw error;
    }
  }

  async updateDocument(id, updatedFields) {
    try {
      const document = await this.getDocumentById(id);
      const updatedDocument = { ...document, ...updatedFields };
      const result = await this.db.insert(updatedDocument);
      return result;
    } catch (error) {
      console.error("Error updating document:", error);
      throw error;
    }
  }

  async bulkUpdateDocsWithTag(oldTag, newTag, owner) {
    try {
      const query = {
        selector: {
          $and: [
            {
              tags: {
                $elemMatch: {
                  name: oldTag.name,
                  title: oldTag.title,
                },
              },
            },
            {
              owner: {
                $eq: owner,
              },
            },
          ],
        },
      };

      const result = await this.db.find(query);
      const documentsToUpdate = result.docs;

      const updatedDocuments = documentsToUpdate.map((doc) => {
        const updatedTags = doc.tags.map((tag) => {
          if (tag.name === oldTag.name && tag.title == oldTag.title) {
            tag.name = newTag.name;
            tag.title = newTag.title;
            tag.color = newTag.color;
            tag.icon = newTag.icon;
          }
          return tag;
        });
        return { ...doc, tags: updatedTags };
      });

      const bulkRequest = {
        docs: updatedDocuments,
      };

      const bulkResult = await this.db.bulk(bulkRequest);
      return bulkResult;
    } catch (error) {
      console.error("Error performing bulk update with tag:", error);
      throw error;
    }
  }

  async bulkUpdateDocumentsOnCategoryUpdate(oldCategory, newCategory, owner, updateAll) {
    try {
      const query = {
        selector: {
          $and: [
            {
              tags: {
                $elemMatch: {
                  title: oldCategory.title,
                },
              },
            },
            {
              owner: {
                $eq: owner,
              },
            },
          ],
        },
      };

      const result = await this.db.find(query);
      const documentsToUpdate = result.docs;

      const updatedDocuments = documentsToUpdate.map((doc) => {
        const updatedTags = doc.tags.map((tag) => {
          if (tag.title === oldCategory.title) {
            tag.title = newCategory.title;
            if(updateAll){
              tag.icon = newCategory.icon;
              tag.color = newCategory.color;
            }
          }
          return tag;
        });
        return { ...doc, tags: updatedTags };
      });

      const bulkRequest = {
        docs: updatedDocuments,
      };

      const bulkResult = await this.db.bulk(bulkRequest);
      return bulkResult;
    } catch (error) {
      console.error("Error performing bulk update on category change:", error);
      throw error;
    }
  }

  async updateDocumentsByCategory(categoryId, owner) {
    try {
      const query = {
        selector: {
          $and: [
            {
              tags: {
                $elemMatch: {
                  title: categoryId,
                },
              },
            },
            {
              owner: {
                $eq: owner,
              },
            },
          ],
        },
      };
  
      const result = await this.db.find(query);
      const documentsToUpdate = result.docs;
  
      const updatedDocuments = documentsToUpdate.map((doc) => {
        const updatedTags = doc.tags.filter(tag => tag.title !== categoryId);
        return { ...doc, tags: updatedTags };
      });
  
      const bulkRequest = {
        docs: updatedDocuments,
      };
      if(bulkRequest.docs){
        const bulkResult = await this.db.bulk(bulkRequest);
        console.log("Documents updated successfully:", bulkResult);
      } else {
        console.log('Nothing to update')
      }

      return { ok: true, message: "Documents updated successfully" };
    } catch (error) {
      console.error("Error updating documents by category:", error);
      throw error;
    }
  }

  async bulkRemoveTag(owner, tagName, title) {
    try {
      const query = {
        selector: {
          $and: [
            {
              tags: {
                $elemMatch: {
                  name: tagName,
                  title: title,
                },
              },
            },
            {
              owner: {
                $eq: owner,
              },
            },
          ],
        },
      };

      const result = await this.db.find(query);
      const documentsToUpdate = result.docs;

      const updatedDocuments = documentsToUpdate.map((doc) => {
        const updatedTags = doc.tags.filter(
          (tag) => !(tag.name === tagName && tag.title === title)
        );
        return { ...doc, tags: updatedTags };
      });

      const bulkRequest = {
        docs: updatedDocuments,
      };

      const bulkResult = await this.db.bulk(bulkRequest);
      return bulkResult;
    } catch (error) {
      console.error("Error performing bulk update:", error);
      throw error;
    }
  }

  async deleteDocument(id, rev) {
    try {
      const result = await this.db.destroy(id, rev);
      return result;
    } catch (error) {
      console.error("Error deleting document:", error);
      throw error;
    }
  }

  async getUserByEmailAndPassword(email, password) {
    try {
      const query = {
        selector: {
          email: email,
        },
      };
      const result = await this.db.find(query);
      console.log(result);

      // Iterate through the fetched users to find a match with the provided password
      const user = result.docs.find((user) => user.password === password);

      return user ? user : null;
    } catch (error) {
      console.error("Error getting user by email and password:", error);
      throw error;
    }
  }
}
