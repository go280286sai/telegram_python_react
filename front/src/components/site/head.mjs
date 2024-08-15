import React from "react";
import {Link} from "react-router-dom";
import {url_path, curr_url} from "../helps/getUrls.mjs";

export default class Head extends React.Component {
    constructor(props) {
        super(props);
        this.logout = this.logout.bind(this);
        this.token = localStorage.getItem("token");
        this.url = url_path;
        this.curr_url = curr_url;
    }

    async logout() {
        const response = await fetch(`${this.url}/logout/${this.token}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        })
        if (response.status === 200) {
            const data = await response.json();
            if (data[0].status === true) {
                window.location.href = this.curr_url;
            }
        } else {
            console.error('Failed to fetch messages:', response.statusText);
        }

    }
    render() {
    return (
        <div className={'container'}>
            <div className={'row'}>
                <div className={'menu'}>
                    <ul>
                        <li><Link to={'/telegram'}>Telegram </Link></li>
                        <li><Link to={'/clients'}>Clients </Link></li>
                        <li><Link to={'/posts'}>Posts </Link></li>
                        <li><Link to={'/settings'}>Settings</Link></li>
                        <li><Link to={'/about'}>About </Link></li>
                        <li><Link to={'/contact'}>Contact </Link></li>
                        <li><strong className="logout" onClick={this.logout}>Logout</strong></li>
                    </ul>
                </div>
            </div>
        </div>
    );}
}