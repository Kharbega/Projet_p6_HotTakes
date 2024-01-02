/*const thing = require('../models/thing');*/
const thing = require('../models/thing');
const Thing = require('../models/thing');
const fs = require('fs')

/*exports.createThing = (req, res, next) => {
    const thing = new Thing({
        userId: req.body.userId,
        name: req.body.name,
        manufacturer: req.body.manufacturer,
        description: req.body.description,
        mainPepper: req.body.mainPepper,
        imageUrl: req.body.imageUrl,
        heat: req.body.heat,
        likes: req.body.likes,
        dislikes: req.body.dislikes,
        usersLiked: req.body.usersLiked,
        usersDisliked: req.body.usersDisliked,
    });
    thing.save().then(
        () => {
            res.status(201).json({
                message: 'Post saved successfully!'
            });
        }
    ).catch(
        (error) => {
            res.status(400).json({
                error: error
            });
        }
    );
};
*/
exports.createThing = (req, res, next) => {
    // console.log(req.body.sauce)

    const thingObject = JSON.parse(req.body.sauce);
    delete thingObject._id;
    delete thingObject._userId;
    const thing = new Thing({
        ...thingObject,
        userId: req.auth.userId,
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: [],
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });

    thing.save()
        .then(() => { res.status(201).json({ message: 'Objet enregistré !' }) })
        .catch(error => {
            //console.log(error)
            { res.status(400).json({ error }) }
        })
};


exports.getOneThing = (req, res, next) => {
    Thing.findOne({
        _id: req.params.id
    }).then(
        (thing) => {
            res.status(200).json(thing);
        }
    ).catch(
        (error) => {
            res.status(404).json({
                error: error
            });
        }
    );
};

/*exports.modifyThing=(req, res, next) =>{
  const thing=newThing({
    _id: req.params.id,
    title: req.body.title,
    description: req.body.description,
    imageUrl: req.body.imageUrl,
    price: req.body.price,
    userId: req.body.userId
  });
  Thing.updateOne({ _id: req.params.id}, thing).then(
    () =>{
      res.status(201).json({
        message: 'Thing updated successfully!'
      });
    }
  ).catch(
    (error) =>{
      res.status(400).json({
        error: error
      });
    }
  );
};*/
exports.modifyThing = (req, res, next) => {
    const thingObject = req.file ? {
        ...JSON.parse(req.body.thing),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };

    delete thingObject._userId;
    Thing.findOne({ _id: req.params.id })
        .then((thing) => {
            if (thing.userId != req.auth.userId) {
                res.status(401).json({ message: 'Not authorized' });
            } else {
                Thing.updateOne({ _id: req.params.id }, { ...thingObject, _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Objet modifié!' }))
                    .catch(error => res.status(401).json({ error }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};



exports.getAllSauce = (req, res, next) => {
    Thing.find().then(
        (things) => {
            res.status(200).json(things);
        }
    ).catch(
        (error) => {
            res.status(400).json({
                error: error
            });
        }
    );
};

exports.deleteThing = (req, res, next) => {
    Thing.findOne({ _id: req.params.id })
        .then(thing => {
            if (thing.userId != req.auth.userId) {
                res.status(401).json({ message: 'Not authorized' });
            } else {
                const filename = thing.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Thing.deleteOne({ _id: req.params.id })
                        .then(() => { res.status(200).json({ message: 'Objet supprimé !' }) })
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch(error => {
            res.status(500).json({ error });
        });
};

exports.likePost = (req, res, next) => {


    const sauceId = req.params.id;
    const userId = req.body.userId;
    const like = req.body.like;
    //  Si like = 1,l'utilisateur aime (= like) la sauce//
    if (like === 1) {
        Thing.updateOne(
            { _id: sauceId },
            {
                $inc: { likes: like },
                $push: { usersLiked: userId },
            }
        )
            .then((thing) => res.status(200).json({ message: "L'utilisateur aime la sauce" }))
            .catch((error) => res.status(500).json({ error }));
    }

    // Si like = -1,l'utilisateur n'aime pas ( =dislike) la sauce.

    else if (like === -1) {
        Thing.updateOne(
            { _id: sauceId },
            {
                $inc: { dislikes: -1 * like },
                $push: { usersDisliked: userId },
            }
        )
            .then((thing) => res.status(200).json({ message: "l'utilisateur n'aime pas la sauce" }))
            .catch((error) => res.status(500).json({ error }));
    }
    // Si like = 0, l'utilisateur annule son like ou son dislike
    // ici il decide d'enlever son like 

    else
        if (like === 0) {
            Thing.findOne({ _id: sauceId })
                .then((thing) => {
                    if (thing.usersLiked.includes(userId)) {
                        Thing.updateOne(
                            { _id: sauceId },
                            { $pull: { usersLiked: userId }, $inc: { likes: -1 } }
                        )
                            .then((thing) => {
                                res.status(200).json({ message: "L'utilisateur n'aime plus la sauce" });
                            })
                            .catch((error) => res.status(500).json({ error }));
                        // Si like = 0, l'utilisateur annule son dislike 
                        // ici il decide d'enlever son dislike 
                    } else if (thing.usersDisliked.includes(userId)) {
                        Thing.updateOne(
                            { _id: sauceId },
                            {
                                $pull: { usersDisliked: userId },
                                $inc: { dislikes: -1 },
                            }
                        )
                            .then((thing) => {
                                res.status(200).json({ message: "L'utilisateur enleve son dislike de la sauce" });
                            })
                            .catch((error) => res.status(500).json({ error }));
                    }
                })
                .catch((error) => res.status(401).json({ error }));
        }
}

/*
    const sauceId = req.params.id;
    const userId = req.body.userId;
    let like = req.body.like;
 



    switch (like) {
        case 1:
            thing.updateOne(
                { _id: sauceId },
                {
                    $inc: { likes: like },
                    $addToSet: { usersLiked: userId },

                })
                .then(() => { res.status(201).json({ message: 'sauce aimee!' }) })
                .catch(error => {
                    console.log(error)
                    { res.status(500).json({ error }) }
                })
            break;

        case -1:
            thing.updateOne(
                { _id: sauceId },
                {
                    $inc: { dislikes: -1 * like },
                    $addToSet: { usersDisliked: userId },

                })
                .then(() => { res.status(201).json({ message: 'sauce non aime!' }) })
                .catch(error => {
                    console.log(error)
                    { res.status(500).json({ error }) }
                })
            break;
    }
}

/*
        case 0: if (Thing.findOne({ _id: sauceId })) {
        then((thing) => {
            if (thing.usersLiked.includes(userId)) {
                thing.updateOne(
                    { _id: sauceId },
                    {
      
                        $pull: { usersLiked: userId },
                        $inc: { likes: -1 },
      
      
                    }
                
                    .then((thing) => {
                        res.status(200).json({ message: "Sauce dépréciée" });
                    })
               
                    .catch((error) => res.status(500).json({ error }))
                    )} 
                // 3.2 user is changing his mind on his dislike
            } else 
             (thing.usersDisliked.includes(userId)) 
                thing.updateOne(
                    { _id: sauceId },
                    {
                        $pull: { usersDisLiked: userId },
      
                        $inc: { dislikes: -1 },
      
      
                    }
                )
                })
                .then(() => { res.status(201).json({ message: 'sauce non aime!' }) })

                .catch(error => {
                    console.log(error)
                    { res.status(500).json({ error }) }
                })
        
            }

}

/*
        case 0: (thing.updateOne(
                { _id: sauceId },
                {

                    $pull: { usersDisLiked: userId },

                    $inc: { dislikes: -1 },


                }

            ))
        }
            
            thing.updateOne(
                { _id: sauceId },
                {

                    $pull: { usersLiked: userId },

                    $inc: { likes: -1 },



                }
            )


                .then((thing) => {
                    res.status(201).json({ message: 'sauce ' })
                })

                .catch(error => {
                    console.log(error)
                    { res.status(500).json({ error }) }
                })
        
    
    // Si l'utilisateur) annule son like et donc qu'il est dans le tableau des personnes qui ont aimes la sauce //

}


/*  (Thing.findOne({ _id: sauceId }))
      .then((thing) => {
          if (usersLiked.includes(userId)) {
              thing.updateOne(
                  { _id: sauceId },
                  {

                      $pull: { usersLiked: userId },

                      $inc: { likes: -1 },


                  }
              )


                  .then((thing) => {
                      res.status(200).json({ message: "Sauce appréciée" });
                  })
                  .catch((error) => res.status(500).json({ error }));
          }
      })

      .catch((error) => res.status(401).json({ error }));

// *************************************
case 0: if (usersDisliked.includes(userId)) {
  thing.updateOne(
      { _id: sauceId },
      {
          $pull: { usersDisLiked: userId },

          $inc: { dislikes: -1 },


      }
  )
      .then((thing) => {
          res.status(200).json({ message: "Sauce appréciée" });
      })
      .catch((error) => res.status(500).json({ error }));
}




}
}








/*exports.likePost = (req, res, next) => {
const sauceId = req.params.id;
const userId = req.body.userId;
const like = req.body.like;
// 1. user likes a sauce for the first time (like === 1)
// pushing the userId to usersLiked array; incrementing likes
if (like === 1) {
thing.updateOne(
  { _id: sauceId },
  {
      $inc: { likes: like },
      $addToSet: { usersLiked: userId },

  }
)
  .then((thing) => res.status(200).json({ message: "Sauce appréciée" }))
  .catch((error) => res.status(500).json({ error }));
}

// 2. user DISlikes a sauce for the first time (like === -1)
// pushing the userId to usersLiked array; one less like.
else if (like === -1) {
thing.updateOne(
  { _id: sauceId },
  {
      $inc: { dislikes: -1 * like },
      $addToSet: { usersDisliked: userId },

  }
)
  .then((thing) => res.status(200).json({ message: "Sauce dépréciée" }))
  .catch((error) => res.status(500).json({ error }));
}
// 3. User changes his mind
// 3.1. user is taking back his like :
else {
Thing.findOne({ _id: sauceId })
  .then((thing) => {
      if (thing.usersLiked.includes(userId)) {
          thing.updateOne(
              { _id: sauceId },
              {

                  $pull: { usersLiked: userId },
                  $inc: { likes: -1 },


              }
          )
              .then((thing) => {
                  res.status(200).json({ message: "Sauce dépréciée" });
              })
              .catch((error) => res.status(500).json({ error }));
          // 3.2 user is changing his mind on his dislike
      } else if (thing.usersDisliked.includes(userId)) {
          thing.updateOne(
              { _id: sauceId },
              {
                  $pull: { usersDisLiked: userId },

                  $inc: { dislikes: -1 },


              }
          )
              .then((thing) => {
                  res.status(200).json({ message: "Sauce appréciée" });
              })
              .catch((error) => res.status(500).json({ error }));
      }
  })
  .catch((error) => res.status(401).json({ error }));
}
};





exports.likePost = async (req, res, next) => {

try {
await Thing.findByIdAndUpdate(
  req.params.id,

  { $addToSet: { usersLiked: req.body.userId } },
  { new: true },
  { likes: liked = sauce.likes + 1 },
  { likes: disliked = sauce.dislikes + 1 },

  { likes: req.body.like },



).then((data) =>
  res.status(200).send(data));


} catch (error) {
res.status(400).json(error);
}
}
*/
