import api from "./axios";

const likeVideo = async (videoId) =>{
    return api.post(`/likes/toggle/v/${videoId}`)
}
export { likeVideo };