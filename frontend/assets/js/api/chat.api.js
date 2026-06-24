import { apiRequest } from "./client.js";

export const getConversations = () => apiRequest("/chat/conversations");
export const getMessages = (conversationId) =>
	apiRequest(`/chat/conversations/${encodeURIComponent(conversationId)}/messages`);
