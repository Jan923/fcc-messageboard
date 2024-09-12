'use strict';

const boardModel = require('../models').board;
const threadModel = require('../models').thread;
const replyModel = require('../models').reply;

module.exports = function (app) {
  
  app.route('/api/threads/:board').post(async (req, res) => {
    const { text, delete_password } = req.body;
    let board = req.body.board;
    if (!board) {
      board = req.params.board
    }
    //console.log("post", req.body);
    const newThread = new threadModel({
      text: text,
      delete_password: delete_password,
      replies: []
    });
    //console.log("newThread", newThread);
    const boardData = await boardModel.findOne({ name: board });
      if (!boardData) {
        const newBoard = new boardModel({
          name: board,
          threads: []
        });
        //console.log("newBoard", newBoard);
        newBoard.threads.push(newThread);
        try{
          newBoard.save();
          res.json(newThread);
        } catch (err) {res.send('There was an error saving in post')}
      } else {
        boardData.threads.push(newThread);
        try {
          boardData.save();
          res.json(newThread);
        } catch (err) {res.send('There was an error saving in post')}
      }
    
    })
  .get(async (req, res) => {
    const board = req.params.board;
    const data = await boardModel.findOne({ name: board });
    if (!data) {
      console.log("No board with this name");
      res.json({ error: "No board with this name" });
    } else {
      //console.log("data", data);
      const sortedThreads = data.threads.sort((a, b) => b.bumped_on - a.bumped_on);
      if (sortedThreads.length > 10) {
        sortedThreads.slice(0, 10)
      };
      
      for (let i = 0; i < sortedThreads.length; i++) {
        sortedThreads[i].delete_password = undefined;
        sortedThreads[i].reported = undefined;
        sortedThreads[i].replies.sort((a, b) => b.created_on - a.created_on);
        sortedThreads[i].replies = sortedThreads[i].replies.slice(0, 3);
        sortedThreads[i].replies.map((reply) => {
          reply.delete_password = undefined;
          reply.reported = undefined;
        })
      };
      
      res.json(sortedThreads);
    }
  }).put(async (req, res) => {
    //console.log("put", req.body);
    const { thread_id } = req.body;
    const board = req.params.board;
    const boardData = await boardModel.findOne({ name: board });
    if (!boardData) {
      res.json("Board not found"); 
    } else {
      const date = new Date();
      //console.log("thread_id", thread_id);
      //console.log("boardData.threads", boardData.threads);
      let reportedThread = await boardData.threads.id(thread_id);
      //console.log("reportedThread", reportedThread);
      reportedThread.reported = true;
      //reportedThread.bumped_on = date;
      const updatedData = await boardData.save();
      //console.log(updatedData);
      res.send('reported');
    }
  }).delete(async (req, res) => {
    //console.log("delete", req.body);
    const { thread_id, delete_password } = req.body;
    const board = req.params.board;
    const boardData = await boardModel.findOne({ name: board });
    if (!boardData) {
      res.json("Board not found")
    } else {
      let threadToDelete = await boardData.threads.id(thread_id);
      //console.log("delete", threadToDelete.delete_password);
      //console.log(delete_password)
      if (threadToDelete.delete_password === delete_password) {
        threadToDelete.deleteOne({_id: thread_id});
      } else {
        res.send("incorrect password");
        return;
      }
      try {
        boardData.save();
        res.send("success");
      } catch (err) {
        res.send("Error saving")
      }

    }
  })

  app.route('/api/replies/:board').post(async (req, res) => {
    //console.log("thread", req.body);
    const { thread_id, text, delete_password } = req.body;
    const board = req.params.board;
    const newReply = new replyModel({
      text: text,
      delete_password: delete_password
    });
    const boardData = await boardModel.findOne({ name: board });
    if (!boardData) {
      res.json("Board not found");
    } else {
      const date = new Date();
      let threadToAddReply = boardData.threads.id(thread_id);
      //threadToAddReply.bumped_on = date;
      //console.log("threadToAddReply", threadToAddReply);
      threadToAddReply.replies.push(newReply);
      try {
        const updatedData = await boardData.save();
        res.json(updatedData)
      } catch (err) {res.json("Error saving")}
    }
  }).get(async (req, res) => {
    const board = req.params.board;
    const thread_id = req.query.thread_id;
    //console.log("thread_id", thread_id);
    const data = await boardModel.findOne({ name: board });
    if (!data) {
      console.log("No board with this name");
      res.json({ error: "No board with this name"});
    } else {
      //console.log("data", data);
      const thread = data.threads.id(req.query.thread_id);
      thread.reported = undefined;
      thread.delete_password = undefined;
      thread.replies.map((reply) => {
        reply.reported = undefined;
        reply.delete_password = undefined;
      });
      res.json(thread);
    }
  }).put(async (req, res) => {
    const { thread_id, reply_id } = req.body;
    const board = req.params.board;
    const data = await boardModel.findOne({ name: board });
    if (!data) {
      //console.log("No board with this name");
      res.json({error: "No board with this name"});
    } else {
      //console.log("data", data);
      let thread = await data.threads.id(thread_id);
      let reply = await thread.replies.id(reply_id);
      //console.log(reply);
      reply.reported = true;
      reply.bumped_on = new Date();
      try {
        const updatedData = await data.save();
        //console.log(updatedData);
        res.send("reported");
      } catch (err) {res.json("Error saving")}
      
    }
  })
  .delete(async (req, res) => {
    const { thread_id, reply_id, delete_password } = req.body;
    //console.log("delete reply", req.body);
    const board = req.params.board;
    const data = await boardModel.findOne({ name: board });
    if (!data) {
      console.log("No board with this name");
      res.json({error: "No board with this name"})
    } else {
      //console.log("data from delete", data);
        let thread = await data.threads.id(thread_id);
      //console.log(thread.replies.id(reply_id));
        let reply = await thread.replies.id(reply_id);
        //console.log("deleted reply", reply);
      if (reply.delete_password === delete_password) {
        reply.text = "[deleted]";
      } else {
        res.send("incorrect password");
        return;
      }
      try {
        const updatedData = await data.save();
        //console.log(updatedData);
        res.send("success");
      } catch (err) {res.send("Error saving")}
    }
  })

};
