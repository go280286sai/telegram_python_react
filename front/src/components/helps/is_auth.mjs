import {url_path, curr_url} from "./getUrls.mjs";
export default async function is_auth() {
    try {

        const url = url_path;
        const cur_url = curr_url;
        const token = localStorage.getItem('token');
        const response = await fetch(`${url}/is_authorized/${token}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        });

        if (response.ok) {
            const data = await response.json();

            // Проверяем условия для перенаправления
            if (data[0].status === false || data[0].token !== token || !token) {
                window.location.href = cur_url;
            } else {
                console.error('Data is empty');
            }
        }
    } catch
        (error) {
        console.error('Error occurred during fetch:', error);
    }
}
