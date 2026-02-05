//socketInstance.js
let io = null;

export const initSocket = (ioInstance) => {
  io=ioInstance
}

export const getIo = ()=>{
  if(!io){
    throw new Error("Socket.io not initialized");
  }
  return io;
};

