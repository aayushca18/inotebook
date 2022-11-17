const express = require('express');
const router =express.Router();
const fetchuser = require('../middleware/fetchuser');
const Notes = require('../models/Notes');
const { body, validationResult } = require('express-validator');



//Route 1: Get all notes: GET "/api/notes/fetchallnotes".  requires login

router.get('/fetchallnotes',fetchuser, async (req, res)=>{
    try {
        
    const notes = await Notes.find({user: req.user.id});
    res.json(notes)
        } 
    catch (error) {
        console.error(error.message);
      res.status(500).send("Internal Server Error");
        }
} )

//Route 2: Add a new note using: POST "/api/notes/addnote".  requires login

router.post('/addnote',fetchuser,[
    body('title', 'Please enter a valid Title').isLength({min:3}),
    body('description', 'Description is too short').isLength({min:5}),
], async (req, res)=>{
    try {
    
    const {title, description,tag} = req.body;
    // if there are errors, return bad request
    const errors = validationResult(req);
     if (!errors.isEmpty()) {
       return res.status(400).json({ errors: errors.array() });
     }
     const note = new Notes({
        title, description, tag, user: req.user.id
     })
    const savedNote = await note.save()
    res.json(savedNote);
} catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
}})


//Route 3: Update an existing note: PUT "/api/notes/updatenote".  requires login
router.put('/updatenote/:id',fetchuser, async (req, res)=>{
    try {
        const {title, description,tag} = req.body;
        //Create new notes obj
        const newNote = {};
        if(title){newNote.title = title};
        if(description){newNote.description = description};
        if(tag){newNote.tag = tag};

        // find the note which needs to be updated and update that note

        let note = await Notes.findById(req.params.id);
        if(!note){return res.status(404).send("Not Found");}
        if(note.user.toString() !== req.user.id){
            return res.status(401).send("Unauthorized");
        }
        note = await Notes.findByIdAndUpdate(req.params.id, {$set: newNote},{new:true});
        res.json(note)
        } 
    catch (error) {
        console.error(error.message);
      res.status(500).send("Internal Server Error");
        }
} )

//Route 4: Delete an existing note: Delete "/api/notes/updatenote".  requires login
router.delete('/deletenote/:id',fetchuser, async (req, res)=>{
    try {
        
        // find the note which needs to be deleted and delete that note

        let note = await Notes.findById(req.params.id);
        if(!note){return res.status(404).send("Not Found");}
        
        // allow deletion if the user owns this note
        if(note.user.toString() !== req.user.id){
            return res.status(401).send("Unauthorized");
        }
        note = await Notes.findByIdAndDelete(req.params.id);
        res.json("Note has been deleted")
        } 
    catch (error) {
        console.error(error.message);
      res.status(500).send("Internal Server Error");
        }
} )
module.exports = router