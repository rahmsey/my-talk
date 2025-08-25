import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getIO, getReceiverSocketId } from "../lib/socket.js";

// export const getUsersForSidebar = async (req,res) =>{
//    try {
//      const loggedINUserId = req.user._id;
//      const filteredUsers = await User.find ({_id: {$ne:loggedInUserId}}).select("-paasword");

//      res.status(200).json(filteredUsers);
//     } catch (error) {
//       console.error("Error in getUsersForSidebar:", error.message);
//       res.status(500).json({error: "Internal server error"});
//    } 
// };

// export const getUsersForSidebar = async (req, res) => {
//   try {
//     const loggedInUserId = req.user._id;

//     const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } })
//       .select("-password"); // ✅ correct spelling

//     res.status(200).json(filteredUsers);
//   } catch (error) {
//     console.error("Error in getUsersForSidebar:", error.message);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };


//    export const getUsersForSidebar = async (req, res) => {
//   try {
//     const loggedInUserId = req.user._id;

//     const user = await User.findById(loggedInUserId).select("-password");

//     res.status(200).json([user]); // wrap in array so frontend still receives a list
//   } catch (error) {
//     console.error("Error in getUsersForSidebar:", error.message);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

// export const getUsersForSidebar = async (req, res) => {
//   try {
//     const loggedInUserId = req.user._id;
//     const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

//     res.status(200).json(filteredUsers);
//   } catch (error) {
//     console.error("Error in getUsersForSidebar: ", error.message);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };



// 👇 add this function here
export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    // fetch all users except the logged-in one
    const users = await User.find({ _id: { $ne: loggedInUserId } })
      .select("-password");

    res.status(200).json(users);
  } catch (error) {
    console.error("Error in getUsersForSidebar:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};










export const getMessages = async(req,res) => {
    try {
       const {id: userToChatId} = req.params
       const myId = req.user._id; 
    
    
    
      
      const messages = await Message.find({
          $or: [
        {senderId:myId, receiverId:userToChatId},
        {senderId:userToChatId, receiverId:myId},
      ]
      })
    
      res.status(200).json(messages);
    } catch (error) {
     console.log("Error in getMessages controller", error.message);
     res.status(500).json({ message: "Internal Server Error" });

    }
};









// export const sendMessages = async (req,res) =>{
//     try {
//         const { text, image } = req.body;
//         const {id: receiverId} = req.params; 
//         const senderId = req.user._id;

//         let imageUrl;
//         if(image){
//             //upload base64  image to cloudinary
//             const uploadResponse = await cloudinary.uploader.upload(image);
//             imageUrl = uploadResponse.secure_url;
//         }

//         const newMessage = new Message({
//         senderId,
//         receiverId,
//         text,
//         image: imageUrl,

//        });
      
//        await newMessage.save();
     
//      //todo: realtime functionality goes here => sockect.io

//     res.status(201).json(newMessage)

//     } catch (error) {
//       console.log("Error in sendMessage controller: ", error.message);
//       res.status(500).json({ message: "Internal Server Error" });
//     }
// };


// export const sendMessages = async (req, res) => {
//   try {
//     const { text, image } = req.body;
//     const { id: receiverId } = req.params;

//     // Ensure the user is authenticated
//     if (!req.user || !req.user._id) {
//       return res.status(401).json({ message: "Unauthorized: No user found" });
//     }
//     const senderId = req.user._id;

//     // Validate: message must contain text or image
//     if (!text && !image) {
//       return res.status(400).json({ message: "Message must have text or image" });
//     }

//     // Upload image to Cloudinary if provided
//     let imageUrl;
//     if (image) {
//       try {
//         const uploadResponse = await cloudinary.uploader.upload(image);
//         imageUrl = uploadResponse.secure_url;
//       } catch (uploadError) {
//         console.error("Cloudinary upload failed:", uploadError.message);
//         return res.status(500).json({ message: "Image upload failed" });
//       }
//     }

//     // Create and save the message
//     const newMessage = new Message({
//       senderId,
//       receiverId,
//       text,
//       image: imageUrl,
//     });
//     await newMessage.save();

//     // Emit the new message in real-time via Socket.IO
//     try {
//       const io = getIO();
//       const receiverSocketId = getReceiverSocketId(receiverId);
//       if (receiverSocketId) {
//         io.to(receiverSocketId).emit("newMessage", newMessage);
//       }
//     } catch (ioError) {
//       console.error("Socket.IO emit failed:", ioError.message);
//       // Not fatal; the message is still saved
//     }

//     res.status(201).json(newMessage);
//   } catch (error) {
//     console.error("Error in sendMessages controller:", error.message);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };


    export const sendMessages = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;

    // Ensure the user is authenticated
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized: No user found" });
    }
    const senderId = req.user._id;

    // Validate: message must contain text or image
    if (!text && !image) {
      return res.status(400).json({ message: "Message must have text or image" });
    }

    // Upload image to Cloudinary if provided
    let imageUrl;
    if (image) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(image);
        imageUrl = uploadResponse.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary upload failed:", uploadError.message);
        return res.status(500).json({ message: "Image upload failed" });
      }
    }

    // Create and save the message
    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });
    await newMessage.save();

    // Emit the new message in real-time via Socket.IO
    try {
      const io = getIO();

      // send to receiver if online
      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", newMessage);
      }

      // ✅ also send back to the sender so they see it instantly
      const senderSocketId = getReceiverSocketId(senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit("newMessage", newMessage);
      }

    } catch (ioError) {
      console.error("Socket.IO emit failed:", ioError.message);
      // Not fatal; the message is still saved
    }

    // Respond to frontend
    res.status(201).json(newMessage);

  } catch (error) {
    console.error("Error in sendMessages controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



