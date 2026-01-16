import api from "./axios";

const likeVideo = async (videoId) =>{
    return api.post(`/likes/toggle/v/${videoId}`)
}


const getLikedVideos = async () => api.get(`/likes/videos/`)

export { likeVideo, getLikedVideos };