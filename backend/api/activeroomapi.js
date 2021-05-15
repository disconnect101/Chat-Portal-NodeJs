function activeRoomsAPI(req, res, io) {
    const rooms = Object.keys(io.of("/groupchat").adapter.rooms);
    console.log(rooms);
    return res.json(rooms);
}

module.exports = {
    activeRoomsAPI,
};