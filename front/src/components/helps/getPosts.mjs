import {url_path} from "./getUrls.mjs";
export default async function getApiPosts() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${url_path}/posts/${token}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (response.status === 200) {
            return await response.json();
        } else {
            console.error('Failed to fetch messages:', response.statusText);
            return false;
        }
    } catch (error) {
        console.error('Error fetching messages:', error);
        return false;
    }
}