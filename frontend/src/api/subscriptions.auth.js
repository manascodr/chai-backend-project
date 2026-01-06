import api from "./axios";

const toggleSubscription = (channelId) => api.post(`/subscriptions/c/${channelId}`);

export { toggleSubscription };