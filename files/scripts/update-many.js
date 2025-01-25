db.items.updateMany({
    "first_name": {"$exists": true},
    "last_name": {"$exists": true},
    "name": {"$exists": false}
  },
  {
    "$set": {
      "name": { "$concat": ["$first_name", "-", "$last_name"] }
    }
  },
  { upsert: true}
)

// add a field
db.items.updateMany({
  },
  {
    "$set": {
      "createdBy": ObjectId('668a9c9e188894d66b2cf20c')
    }
  },
  { upsert: true, multi: true}
)

// field operations
